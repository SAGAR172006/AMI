const BASE = (import.meta.env.VITE_API_URL ?? '') + '/api';

const TOKEN_KEY = 'ami_token';
const getToken = () => localStorage.getItem(TOKEN_KEY) || null;

// Audio blob cache to prevent redundant synthesis calls
const clientAudioCache = new Map();

export const voiceApi = {
  /**
   * Health check Gnani Voice backend
   */
  verify: async () => {
    const res = await fetch(`${BASE}/voice/verify`);
    if (!res.ok) throw new Error('Gnani voice service verification failed');
    return res.json();
  },

  /**
   * STT: Transcribes audio blob using Gnani Prisma v3.0
   */
  transcribe: async (audioBlob, languageCode = 'indic-auto') => {
    const token = getToken();
    const formData = new FormData();
    const filename = audioBlob.type === 'audio/wav' ? 'answer.wav' : 'answer.wav';
    formData.append('audio_file', audioBlob, filename);
    formData.append('language_code', languageCode);

    const res = await fetch(`${BASE}/voice/stt`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Speech-to-text failed.');
    }
    return data; // { transcript, model, detected_language_code }
  },

  /**
   * TTS: Synthesizes text using Gnani Timbre v2.5
   * Uses client-side audio cache for zero redundant network calls
   */
  synthesize: async (text, language = 'en-IN', voice, speed = 1.0) => {
    const cacheKey = `${text}_${language}_${voice || 'default'}_${speed}`;
    if (clientAudioCache.has(cacheKey)) {
      return clientAudioCache.get(cacheKey);
    }

    const token = getToken();
    const res = await fetch(`${BASE}/voice/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ text, language, voice, speed }),
    });

    if (!res.ok) {
      let errMessage = 'Speech synthesis failed.';
      try {
        const errJson = await res.json();
        errMessage = errJson.error || errMessage;
      } catch {}
      throw new Error(errMessage);
    }

    const blob = await res.blob();
    const audioUrl = URL.createObjectURL(blob);
    clientAudioCache.set(cacheKey, audioUrl);
    return audioUrl;
  },

  /**
   * Translates content between Indic/English
   */
  translate: async (text, targetLang, sourceLang = 'en-IN', context = 'lesson') => {
    const token = getToken();
    const res = await fetch(`${BASE}/voice/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ text, targetLang, sourceLang, context }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Translation failed');
    return data.translatedText;
  },

  /**
   * Evaluates confirmed answer, returns step marking and spoken feedback
   */
  evaluateAnswer: async (params) => {
    const token = getToken();
    const res = await fetch(`${BASE}/voice/evaluate-answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Evaluation failed');
    return data;
  },

  /**
   * Narrates lesson section directly
   */
  narrateSection: async (text, userLanguage = 'en-IN', speed = 1.0) => {
    const token = getToken();
    const res = await fetch(`${BASE}/voice/narrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ text, userLanguage, speed }),
    });

    if (!res.ok) throw new Error('Lesson narration failed');
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  },
};
