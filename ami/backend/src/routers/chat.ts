import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { supabase } from '../services/supabase';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';
import { getNextApiKey, callGemini } from '../services/gemini';
import { DEMO_MODULES } from './demo';

export const chatRouter = Router();

// /embed/:moduleId requires auth
chatRouter.post('/embed/:moduleId', requireAuth, async (req, res) => {
  try {
    const { moduleId } = req.params;

    // 1. Fetch the module from Supabase
    const { data: moduleData, error } = await supabase
      .from('modules')
      .select('*')
      .eq('id', moduleId)
      .eq('user_id', req.user!.id)
      .single();

    if (error || !moduleData) return res.status(404).json({ error: 'Module not found' });

    // 2. Split textContent into chunks
    const chunks: { text: string; source: string }[] = [];

    const textContent = moduleData.text_content;
    const slides = moduleData.slides;

    if (textContent && textContent.sections) {
      for (const section of textContent.sections) {
        if (section.kind === 'prose' && section.body) {
          chunks.push({ text: section.body, source: 'text' });
        } else if (section.kind === 'inline-quiz') {
          const quizText = `Question: ${section.question}\nHint: ${section.hint}\nChoices: ${section.choices?.map((c: any) => c.text).join(', ')}`;
          chunks.push({ text: quizText, source: 'text' });
        }
      }
    }

    if (slides) {
      for (const slide of slides) {
        if (slide.narration) {
          chunks.push({ text: `Slide Narration (${slide.title}): ${slide.narration}`, source: 'slides' });
        }
      }
    }

    // 3. Generate embeddings — use dynamic rotated key
    const apiKey = await getNextApiKey();
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: apiKey,
      modelName: 'embedding-001',
    });

    let chunksEmbedded = 0;

    for (const chunk of chunks) {
      const vector = await embeddings.embedQuery(chunk.text);

      // 4. Insert into Supabase embeddings table
      const { error: insertError } = await supabase.from('embeddings').insert({
        module_id: moduleId,
        chunk_text: chunk.text,
        embedding: vector,
        metadata: { source: chunk.source },
      });

      if (insertError) {
        console.error('Error inserting embedding:', insertError);
      } else {
        chunksEmbedded++;
      }
    }

    // 5. Return success
    res.json({ success: true, chunksEmbedded });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Main RAG & Topic-Verified Chat Endpoint
 * Supports both demo modules and user modules.
 * Step 1: Validates that question belongs to the topic.
 *         If off-topic: prompts the user to ask questions related to that topic only.
 * Step 2: Generates an accurate, context-grounded answer using Gemini LLM.
 */
chatRouter.post('/', async (req, res) => {
  try {
    const { moduleId, message, history, topic: reqTopic } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    // Optional user authentication check
    let userId: string | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) userId = user.id;
      } catch {}
    }

    let topic = (reqTopic || 'Photosynthesis').trim();
    let contextText = '';
    let personaGrade = 'a student';
    let personaInterest = 'practical science';

    // 1. Fetch module context: Demo module vs Supabase module
    if (moduleId && (moduleId === 'demo-photosynthesis' || moduleId.startsWith('demo-'))) {
      const demo = DEMO_MODULES[moduleId] || DEMO_MODULES['demo-photosynthesis'];
      if (demo) {
        topic = demo.topic || topic;
        contextText = demo.source?.sourceExcerpt || 'Photosynthesis converts sunlight, carbon dioxide, and water into glucose and oxygen in chloroplasts.';
      }
    } else if (moduleId && userId) {
      const { data: moduleData } = await supabase
        .from('modules')
        .select('*')
        .eq('id', moduleId)
        .eq('user_id', userId)
        .single();

      if (moduleData) {
        topic = moduleData.topic || topic;
        personaGrade = moduleData.persona?.grade || personaGrade;
        personaInterest = moduleData.persona?.interest || personaInterest;

        // Try Supabase vector search if available
        try {
          const apiKey = await getNextApiKey();
          const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey,
            modelName: 'embedding-001',
          });
          const messageEmbedding = await embeddings.embedQuery(message);
          const { data: matchedChunks } = await supabase.rpc('match_embeddings', {
            query_embedding: messageEmbedding,
            match_module_id: moduleId,
            match_count: 5,
          });
          if (matchedChunks && matchedChunks.length > 0) {
            contextText = matchedChunks.map((c: any) => c.chunk_text).join('\n\n');
          }
        } catch (embedErr: any) {
          console.warn('[ChatRouter] Vector search match fallback:', embedErr.message);
        }
      }
    }

    // 2. STAGE 1: Strict Topic Relevance Verification
    const relevancePrompt = `You are a strict academic topic classifier for the AMI learning mentor.
Current Study Topic: "${topic}"
Student Question: "${message}"

Task:
Determine whether the student's question is relevant to "${topic}" or its scientific/academic principles (e.g. biology, plant science, chloroplasts, Calvin cycle, cellular respiration, solar energy, carbon cycle, biochemistry).
If the question is about an unrelated subject (for example: "what is linked list", "how to write quicksort", "who won the cricket world cup", "how to bake a cake", "tell me a joke about dogs"), answer UNRELATED.
If the question is related to "${topic}" or asks for clarification, definitions, or mechanisms of "${topic}", answer RELATED.

Respond with ONLY one word: "RELATED" or "UNRELATED".`;

    let isRelated = true;
    try {
      const relResponse = await callGemini(relevancePrompt);
      const cleanRel = relResponse.trim().toUpperCase();
      if (cleanRel.includes('UNRELATED')) {
        isRelated = false;
      }
    } catch (err: any) {
      console.warn('[ChatRouter] Topic classifier check failed, applying rule-based validation:', err.message);
      const lower = message.toLowerCase();
      const topicLower = topic.toLowerCase();
      if (topicLower.includes('photo') && (lower.includes('linked list') || lower.includes('algorithm') || lower.includes('quicksort') || lower.includes('binary tree') || lower.includes('react') || lower.includes('sql'))) {
        isRelated = false;
      }
    }

    // If the question is not related to the topic, tell user to ask questions related to the topic only
    if (!isRelated) {
      return res.json({
        reply: `Please ask questions related to ${topic} only.`,
        isOffTopic: true,
      });
    }

    // 3. STAGE 2: Answer Question accurately using Gemini LLM
    const systemPrompt = `You are AMI, an AI tutor. You are tutoring a student on the topic: ${topic}.
Relevant study context:
${contextText || `Topic: ${topic}. Answer accurately, clearly, and concisely based on current scientific knowledge.`}

Guidelines:
- Explain clearly, accurately, and encouragingly.
- Appropriate for ${personaGrade}.
- Keep answers concise and direct (2 to 4 sentences).
- If relevant, connect to the chemical equation or cellular structures.`;

    const recentHistory = (history || []).slice(-6).map((m: any) => `${m.role === 'user' ? 'Student' : 'AMI'}: ${m.content}`).join('\n');
    const prompt = `${systemPrompt}\n\nRecent Conversation:\n${recentHistory}\n\nStudent: ${message}\nAMI:`;

    const answer = await callGemini(prompt);

    res.json({
      reply: answer.trim(),
      isOffTopic: false,
    });
  } catch (err: any) {
    console.error('[Chat] Error:', err.message);
    res.status(500).json({ error: err.message || 'Chat service encountered an error' });
  }
});
