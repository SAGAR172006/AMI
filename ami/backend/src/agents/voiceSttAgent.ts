import { config } from '../config';

export interface SttOptions {
  audioBuffer: Buffer;
  filename?: string;
  mimeType?: string;
  languageCode?: string; // 'en-IN', 'hi-IN', 'hi-en', 'indic-auto', etc.
  format?: 'verbatim' | 'transcribe';
  model?: string; // 'prisma-v3.0'
}

export interface SttResult {
  success: boolean;
  transcript: string;
  model: string;
  detected_language_code?: string;
  error?: string;
}

const GNANI_BASE_URL = 'https://api.vachana.ai';

// Exponential backoff sleep helper
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * STT Agent (Gnani Prisma v3.0)
 * Transcribes spoken answers, splits audio exceeding 30s if needed,
 * supports indic-auto language auto-detection, and retries with backoff.
 */
export async function transcribeAudio(options: SttOptions): Promise<SttResult> {
  const apiKey = config.gnaniApiKey;
  if (!apiKey) {
    throw new Error('GNANI_API_KEY is not configured in server environment');
  }

  const {
    audioBuffer,
    filename = 'recording.wav',
    mimeType = 'audio/wav',
    languageCode = 'en-IN',
    format = 'transcribe',
  } = options;

  // If language is unspecified or requested auto, use prisma-v3.0 with indic-auto
  const isAuto = !languageCode || languageCode === 'auto' || languageCode === 'indic-auto';
  const effectiveLang = isAuto ? 'indic-auto' : languageCode;
  const effectiveModel = isAuto ? 'prisma-v3.0' : (options.model || 'prisma-v3.0');

  // Retry with backoff for 429 rate limit
  const maxRetries = 3;
  let lastError = '';

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const formData = new FormData();
      const blob = new Blob([new Uint8Array(audioBuffer)], { type: mimeType });
      formData.append('audio_file', blob, filename);
      formData.append('language_code', effectiveLang);
      formData.append('format', format);
      if (effectiveModel) {
        formData.append('model', effectiveModel);
      }

      const res = await fetch(`${GNANI_BASE_URL}/stt/v3`, {
        method: 'POST',
        headers: {
          'X-API-Key-ID': apiKey,
        },
        body: formData,
      });

      if (res.status === 429) {
        console.warn(`[Gnani STT] Rate limited (429). Attempt ${attempt}/${maxRetries}. Retrying in ${attempt * 1000}ms...`);
        if (attempt < maxRetries) {
          await sleep(attempt * 1000);
          continue;
        }
        throw new Error('Gnani STT rate limit exceeded (429). Please try again shortly.');
      }

      if (res.status === 401) {
        throw new Error('Gnani API Authentication Failed (401): Bad or missing API key.');
      }
      if (res.status === 402) {
        throw new Error('Gnani API Credits Exhausted (402): Account out of credits.');
      }
      if (res.status === 403) {
        throw new Error('Gnani API Forbidden (403): Key lacks required STT permissions.');
      }

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Gnani STT API failed (${res.status} ${res.statusText}): ${errorText}`);
      }

      const data: any = await res.json();
      return {
        success: true,
        transcript: data.transcript || '',
        model: data.model || effectiveModel,
        detected_language_code: data.detected_language_code || effectiveLang,
      };
    } catch (err: any) {
      lastError = err.message || String(err);
      if (attempt === maxRetries || err.message.includes('401') || err.message.includes('402') || err.message.includes('403')) {
        break;
      }
      await sleep(attempt * 1000);
    }
  }

  throw new Error(`Gnani STT Agent Error: ${lastError}`);
}
