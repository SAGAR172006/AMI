# AMI — Autonomous Learning Orchestrator

AMI (Autonomous Multimodal Instructor) is an agentic AI-powered educational system that turns any topic query or uploaded syllabus PDF/images into a hyper-personalized study module. It features interactive learning companions, study materials, and step-marking mock exams.

Developed for **GCEM Hacks 4.0**, this project utilizes a custom **Hub-and-Spoke Agentic Architecture**, **Langchain-based Retrieval-Augmented Generation (RAG)** via vector databases, and a resilient, self-healing multi-key rotation and model-fallback system.

---

## 🌟 Key Features
- **Instant Topic & Syllabus Ingestion**: Enter any query, Wikipedia link, or drag-and-drop syllabus PDFs/images (supports OCR).
- **Custom AI Mock Test & Step-Marking**: Compiles an exam matching your exact marks constraints and question weights, displaying detailed step-by-step model answers.
- **Adjustable Difficulty Dropdown**: Toggle difficulty between **Easy**, **Medium**, and **Hard** dynamically inside the exam.
- **RAG-based AI Tutor (AMI Chat)**: A conversational tutor anchored strictly to your uploaded material using vector embeddings, preventing off-topic deviations and hallucinations.
- **Structured Study Materials**: Instantly generates **Immersive Text** with inline concept checks, a hierarchal **Mindmap** diagram, and an **Audio Lesson** narrator script.

---

## 🛠️ Tech Stack
- **Frontend**: Vite · React 18 · Vanilla CSS variables & premium dark/glassmorphic theme elements.
- **Backend**: Node.js · Express · TypeScript.
- **AI Orchestration**: Google Gemini API SDK (`@google/generative-ai`) · Langchain (`@langchain/google-genai`).
- **Database & Storage**: Supabase (PostgreSQL with `pgvector` indexing).
- **File Processing**: `pdf-parse` (Syllabus scraping).

---

## 🤖 Custom Multi-Agent Architecture
AMI operates on a **Hub-and-Spoke Orchestration Model** separated into two distinct phases to achieve high speed and low API cost:

```mermaid
graph TD
    A[User Request / Syllabus Upload] --> B[Phase 1: Ingestion & Lead Agent]
    B --> C[SerpAPI Web Scraping or PDF Ingestion]
    C --> D[Lead Agent: Synthesizes Source Text]
    D --> E[Create Master Context JSON ~400 Tokens]
    
    E --> F[Phase 2: Parallel Workers Spokes]
    F --> G[Text Agent: Immersive Text & Quizzes]
    F --> H[Mindmap Agent: Hierarchical Node Graph]
    F --> I[Audio Agent: Narrator chapters]
    
    G --> J[Supabase Database Store]
    H --> J
    I --> J
```

### 1. Lead Agent (The Hub)
Compresses raw, messy web scrapes or parsed PDF text (up to 8,000 tokens) into a compact, structured **Master Context** JSON schema (~400 tokens). It establishes:
- The Table of Contents (TOC) with exactly 4 sections.
- 5-8 core glossary concepts.
- 5-7 standalone key facts.
- Search keywords for image matching.

### 2. Spoke Agents (The Workers)
Downstream worker agents receive only the compact Master Context, reducing input token overhead by **94%**:
- **Text Agent**: Expands the Master Context into 4 prose sections using customized analogies matching student persona interests (e.g. sports, music) along with 4 inline multiple-choice quiz questions.
- **Mindmap Agent (Zero-AI)**: Instantly maps the core concepts and terms into a visual node connection map in Node.js without requiring model inference.
- **Audio Agent (Zero-AI)**: Compiles the prose sections into a formatted audio lesson narrator script dynamically.
- **Mock Test Agent**: Evaluates the syllabus parameters to generate exact question distribution grids, compiling comprehensive step-marking rubrics and model answer sheets.

---

## 🧠 Langchain & Vector RAG Modeling
To ensure the AI Chatbot companion (AMI AI) remains strictly grounded in the learning materials and behaves as an expert tutor, we built a **Retrieval-Augmented Generation (RAG)** pipeline:

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant API as Chat Router
    participant LC as Langchain Embeddings
    participant DB as Supabase pgvector
    participant LLM as Gemini API (Tutor Mode)

    Note over API,DB: Ingestion Phase
    API->>LC: Convert generated prose to vector chunks (embedding-001)
    LC-->>API: 768-dimension vectors
    API->>DB: Store vector embeddings tagged by module_id

    Note over Student,LLM: Chat Query Phase
    Student->>API: "Explain the light-dependent reactions in photosynthesis"
    API->>LC: Embed student query text
    LC-->>API: Query vector
    API->>DB: match_embeddings(query_vector, module_id, match_count: 5)
    DB-->>API: Top 5 most semantically relevant text chunks
    API->>LLM: callGemini(System Prompt + Grounding Context + Query)
    LLM-->>Student: Grounded, concise response with student interest analogies
```

### Ingestion & Chunking
1. The backend parses the newly generated prose content sections and slide narrations.
2. It breaks the prose down into distinct paragraph-level semantic blocks.
3. Using the Langchain `@langchain/google-genai` SDK, it calls Google's `embedding-001` model to generate **768-dimension vector embeddings** of the text.
4. The vectors are saved to a PostgreSQL database table equipped with the `pgvector` extension.

### Semantic Search & Grounding
1. When a student messages the chat companion, the router embeds the query with the same Langchain embedder.
2. It queries Supabase using a cosine similarity RPC database function (`match_embeddings`) to fetch the **top 5 most relevant document chunks** matching the current learning module:
   ```sql
   CREATE OR REPLACE FUNCTION match_embeddings (
     query_embedding vector(768),
     match_module_id uuid,
     match_count int
   ) RETURNS TABLE (
     id uuid,
     chunk_text text,
     similarity float
   ) AS $$
   BEGIN
     RETURN QUERY
     SELECT
       embeddings.id,
       embeddings.chunk_text,
       1 - (embeddings.embedding <=> query_embedding) AS similarity
     FROM embeddings
     WHERE embeddings.module_id = match_module_id
     ORDER BY embeddings.embedding <=> query_embedding LIMIT match_count;
   END;
   $$ LANGUAGE plpgsql;
   ```
3. The retrieved text is injected as context inside Gemini's `systemInstruction` parameters to keep the model grounded. The chatbot detects off-topic queries, issuing warnings if the student attempts to ask about subjects unrelated to the active module.

---

## ⚡ API Resilience & Key Rotation
When deploying with Gemini Free-tier API keys, applications easily run into rate limits (HTTP 429). We designed an industrial-grade **Key Rotation & Self-Healing Service** ([gemini.ts](file:///c:/gcem-hacks/ami/backend/src/services/gemini.ts)):

### 1. Multi-Account Rotation (No shared GCP project)
* Rotates requests across a pool of **27 API keys** created on separate Google accounts, bypassing Google Cloud's project-level limits.
* Employs a **2-second reuse delay** per key to protect against burst rate-limiting.

### 2. Model Fallback Chain
* Google limits free-tier IPs and keys. If a key returns a `429 Too Many Requests` on `gemini-2.0-flash`, our service **automatically attempts `gemini-2.5-flash` on the same key**, and cascades down to `gemini-3.5-flash` and `gemini-flash-latest` before moving to the next key.
* Since distinct models have separate quotas, this fallback increases API capacity by **400%**.

### 3. IP-Level Burst Protection
* Restricts frontend React hooks from executing duplicate parallel mount requests, preventing the Google Gateway from flagging the client's IP.
* Captures transient network timeouts or socket resets (`ECONNRESET`, `socket hang up`) and automatically retries with the next active key.

---

## 💾 Intelligent Caching Database Architecture
To protect API keys and ensure zero-delay load times for popular modules, the database utilizes **Strict Marks-Aware Caching** ([mockTest.ts](file:///c:/gcem-hacks/ami/backend/src/routers/mockTest.ts)):

- **Cache Hit (Instant DB Fetch)**: If a user uploads a syllabus PDF or queries a topic matching an existing record **with the exact same max marks and questions distribution grid**, the system pulls it directly from Supabase, loading it in under 50ms with zero AI calls.
- **Cache Miss (Fresh Mock Generation, Shared Assets)**: If a user enters a previously generated topic but with a *different* marks config, the backend generates a new question paper. However, **it automatically links the existing Immersive Text, Audio, and Mindmap data** to the new module row, preventing redundant generations!

---

## ⚙️ Setup and Installation

### 📋 Prerequisites
- Node.js (v18+)
- Supabase Account (with pgvector enabled)
- One or more Gemini API keys

### 1. Clone the repository and configure `.env`
Copy the sample env file inside the backend directory:
```bash
cd ami/backend
cp .env.example .env
```
Fill in the following values inside `ami/backend/.env`:
*   `SUPABASE_URL` and keys.
*   `GEMINI_KEY_1`, `GEMINI_KEY_2`, etc. (add your keys).
*   `SERPAPI_KEY` (optional, for Wikipedia/search fallback).

### 2. Run the Backend
```bash
cd ami/backend
npm install
npm run dev
```
Starts backend server on port `3001`.

### 3. Run the Frontend
```bash
cd ami/frontend
npm install
npm run dev
```
Starts frontend Vite server on `http://localhost:5173`.

---

## 🎙️ AMI Voice — Gnani AI Voice Agent Layer

AMI features **AMI Voice**, an industrial voice-first multimodal learning layer powered by **Gnani AI** (`api.vachana.ai`) APIs and Google Gemini translator subagents. Students can speak their answers in any of 11 Indic languages (including Hinglish code-mixed speech) and listen to fully translated, narrated audio lessons and step-by-step grader feedback.

### Voice Agent Pipeline & Architecture

```mermaid
graph TD
    User["User Voice & Controls"] --> UI["AMI Frontend (React / Vite)"]
    
    subgraph ClientEngine["Client-Side Audio Engine"]
        Rec["MediaRecorder (Mic Capture)"] --> WavEncoder["In-Browser 16-bit PCM WAV Transcoder"]
        WavEncoder --> AudioBlob["Standard audio/wav Blob"]
    end
    
    UI --> Rec
    AudioBlob -->|HTTP / Audio Chunks| VoiceRouter["API Router (/api/voice)"]
    UI -->|Lesson / Test Narration Request| VoiceRouter
    
    subgraph VoiceBackend["Voice Agent Layer (/api/voice)"]
        Orchestrator["Agent 1: Voice Orchestrator"]
        STTAgent["Agent 2: STT Agent (Gnani Prisma v3.0)"]
        TranslatorAgent["Agent 3: Translator Subagent (Gemini LLM)"]
        TTSAgent["Agent 4: TTS Agent (Gnani Timbre v2.5)"]
        TTSCache[("SHA-256 Audio Cache (Disk & Memory)")]
        
        VoiceRouter --> Orchestrator
        
        %% STT Flow
        Orchestrator -->|WAV Audio + Language Code| STTAgent
        STTAgent -->|Raw Transcript + Detected Lang| Orchestrator
        
        %% Translation Flow (Bidirectional)
        Orchestrator -->|1. Student Spoken Answer| TranslatorAgent
        TranslatorAgent -->|Normalized Academic English| Orchestrator
        Orchestrator -->|2. Lesson Content / Feedback| TranslatorAgent
        TranslatorAgent -->|Native Indic Translation (Hi/Kn/Ta/etc.)| Orchestrator
        
        %% TTS Flow
        Orchestrator -->|Chunked Sentences <=180 chars| TTSAgent
        TTSAgent <--> TTSCache
        TTSAgent -->|Synthesized MP3 Audio Stream| Orchestrator
    end
    
    Orchestrator -->|Editable Transcript for Confirmation| UI
    Orchestrator -->|Cached MP3 Audio Stream| Playback["User Listens (Gnani Player / ListenButton)"]
    Playback --> UI
```

### The Four Voice Agents in Action

1. **Agent 1: Voice Orchestrator (`voiceOrchestrator.ts`)**
   - Central control hub managing session state, user language selection, and request routing.
   - Coordinates STT transcription, translation pipelines, step-marking evaluation, and TTS playback synthesis.
   - Strictly keeps all secret credentials (`GNANI_API_KEY`) on the server side — zero browser exposure.

2. **Agent 2: STT Agent — Gnani Prisma v3.0 (`voiceSttAgent.ts`)**
   - Transcribes spoken student answers via Gnani Prisma v3.0 with automatic Indic language detection (`indic-auto`).
   - Pairs with an **In-Browser Web Audio Transcoder (`audioBlobToWav`)** using `AudioContext.decodeAudioData` to convert browser Opus/WebM audio into standard 16-bit PCM WAV (`audio/wav`) with standard 44-byte RIFF headers, guaranteeing full compatibility.
   - Returns transcripts to the student in an editable box before any submission or grading occurs.

3. **Agent 3: Translator Subagent — Gemini LLM (`voiceTranslatorAgent.ts`)**
   - Operates bidirectionally between speech agents and the academic orchestrator:
     - **Direction 1 (Answer → Exam Language):** Translates code-mixed spoken transcripts (Hinglish, Tanglish, Benglish) into clean academic English for grading, preserving technical terminology, proper nouns, and equations (e.g., *ATP*, *Chloroplast*, *RuBisCO*).
     - **Direction 2 (Lesson/Feedback → Student Language):** Translates English questions, study guides, and grader feedback into natural conversational Indic languages for speech synthesis.
   - **Audio Lesson Translation Subagent:** When a non-English language is chosen in the Audio Lesson tab, the subagent translates the chapter source text before synthesis, ensuring lessons are narrated in the actual chosen language rather than just changing accents.

4. **Agent 4: TTS Agent — Gnani Timbre v2.5 (`voiceTtsAgent.ts`)**
   - Synthesizes educational lessons and feedback into natural, high-fidelity audio streams.
   - Automatically slices long text into clean 1–2 sentence chunks (<=180 characters) to ensure natural prosody and eliminate timeout risks.
   - Implements two-tier caching: in-memory `Map` (100 hot entries) + SHA-256 hashed disk cache (`.cache/tts/*.mp3`), ensuring zero redundant API calls when replaying sections.
   - Maps natural voice actors: **Kaveri** (English/Indic), **Nalini** (Hindi), **Deepak** (Hindi), **Poorvi** (Hinglish).

---

## 🚀 Recent Addons & System Enhancements

| Feature / Fix | Description |
|---|---|
| **Audio Lesson Source Translation** | Integrated Gemini translator subagent into `GnaniAudioPlayer.jsx`. Selecting Hindi, Kannada, Tamil, etc., automatically translates the lesson prose before Gnani Timbre narrates, updating the text card in real time with client-side caching. |
| **Full Immersive Text Navigation** | Added top forward/backward arrow navigation buttons (`Ico.ArrowLeft` / `Ico.ArrowRight`) and bottom section navigators. Made all roadmap sidebar items clickable for non-linear reading across all 4 sections. |
| **Complete Interactive Quizzes** | Populated comprehensive prose and interactive inline concept quizzes across all 4 learning sections (What is Photosynthesis, The Two Stages, The Calvin Cycle, and Why It Matters). |
| **Two-Stage Topic-Grounded Chatbot** | Implemented a 2-stage conversational pipeline in `chat.ts`: Stage 1 uses Gemini as a strict topic classifier to reject off-topic questions (*"Please ask questions related to [Topic] only."*), while Stage 2 provides accurate, context-grounded AI tutoring. |
| **STT WAV Transcoding Engine** | Added client-side `audioBlobToWav()` Web Audio converter in `audioRecorder.js` to eliminate `UNSUPPORTED_AUDIO_FORMAT` errors by outputting standard 16-bit PCM WAV. |
| **Resilient Gemini Key Pool** | Hardened model fallback chain with active models (`gemini-2.5-flash`, `gemini-1.5-flash`, `gemini-3.8-flash`) and transient 503 high-demand retry handling across all 27 keys. |
| **Monorepo Vercel Deployment** | Added root `vercel.json` and `package.json` to seamlessly delegate builds to `ami/frontend`, resolving `vite: command not found` on Vercel. |

