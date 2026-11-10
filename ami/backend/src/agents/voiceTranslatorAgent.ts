import { callGemini } from '../services/gemini';

export interface TranslateOptions {
  text: string;
  sourceLang?: string;
  targetLang: string;
  context?: 'answer' | 'feedback' | 'lesson' | 'question';
}

const LANGUAGE_NAMES: Record<string, string> = {
  'en-IN': 'Indian English',
  'hi-IN': 'Hindi',
  'hi-en': 'Hinglish (Hindi written with English words and natural code-mixing)',
  'ta-IN': 'Tamil',
  'te-IN': 'Telugu',
  'kn-IN': 'Kannada',
  'ml-IN': 'Malayalam',
  'mr-IN': 'Marathi',
  'pa-IN': 'Punjabi',
  'bn-IN': 'Bengali',
  'gu-IN': 'Gujarati',
};

/**
 * Translator Agent (LLM Layer)
 * Handles bidirectional translation between user's spoken language and the lesson/test language.
 * Preserves code-mixed expressions, technical terms, equations, and proper nouns.
 */
export async function translateText(options: TranslateOptions): Promise<string> {
  const { text, sourceLang = 'en-IN', targetLang, context = 'lesson' } = options;

  if (!text || text.trim().length === 0) return '';
  if (sourceLang === targetLang) return text;
  if (!targetLang) return text;

  const targetLangName = LANGUAGE_NAMES[targetLang] || targetLang;
  const sourceLangName = LANGUAGE_NAMES[sourceLang] || sourceLang;

  let systemPrompt = '';

  if (context === 'answer') {
    // Direction 1: Spoken user answer -> Test/Grading language (usually English)
    systemPrompt = `You are the Translator Agent for AMI (Autonomous Learning Orchestrator).
A student spoke their answer in ${sourceLangName}.
Translate this answer into ${targetLangName} so that an academic step-marking evaluator can grade it accurately.

STRICT CRITERIA:
1. Preserve the student's exact meaning, logical deductions, and intent.
2. DO NOT translate or alter proper nouns, technical terminology, mathematical symbols, or scientific formulas (e.g., keep "mitochondria", "Newton's laws", "O(N log N)", "ATP" intact).
3. If the input is code-mixed (Hinglish/Tanglish/etc.), resolve the semantic meaning cleanly into ${targetLangName} without altering technical nouns.
4. Output ONLY the translated answer text. Do NOT add conversational banter, explanations, or quotes.

Student Answer:
${text}`;
  } else {
    // Direction 2: Lesson text / Question / Feedback -> Student's preferred language for TTS narration
    const isHinglish = targetLang === 'hi-en';
    systemPrompt = `You are the Voice Translator Agent for AMI.
Translate the following educational ${context} from ${sourceLangName} into natural, student-friendly ${targetLangName} for text-to-speech narration.

STRICT CRITERIA:
1. Translate into natural conversational ${targetLangName}.${isHinglish ? ' For Hinglish, use natural Romanized Hindi-English mix as spoken by college students in India.' : ''}
2. PRESERVE all technical terms, proper nouns, acronyms, and equations in their standard recognized form (e.g., "Photosynthesis", "Chloroplast", "Gradient Descent", "Step 1").
3. Ensure the phrasing flows smoothly when spoken aloud by a speech synthesis narrator.
4. Output ONLY the translated text. Do NOT add markdown, bullet labels, commentary, or quotes.

Original Content:
${text}`;
  }

  try {
    const translated = await callGemini(systemPrompt);
    return translated.trim().replace(/^["']|["']$/g, '');
  } catch (err: any) {
    console.error(`[Voice Translator Agent] Translation failed from ${sourceLang} to ${targetLang}:`, err.message || err);
    // On translation failure, fall back to original text so voice never blocks
    return text;
  }
}
