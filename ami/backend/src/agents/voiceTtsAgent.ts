import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { config } from '../config';

export interface TtsOptions {
  text: string;
  language?: string; // 'en-IN', 'hi-IN', 'hi-en', etc.
  voice?: string;    // 'Kaveri', 'Nalini', 'Deepak', 'Poorvi'
  speed?: number;    // 0.85, 1.0, 1.15
  model?: string;    // 'timbre-v2.5'
}

export interface TtsResult {
  audioBuffer: Buffer;
  contentType: string;
  cached: boolean;
  chunksCount: number;
}

const GNANI_BASE_URL = 'https://api.vachana.ai';

// Cache directories
const CACHE_DIR = path.join(process.cwd(), '.cache', 'tts');
if (!fs.existsSync(CACHE_DIR)) {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  } catch (err) {
    console.warn('[Gnani TTS] Failed to create cache directory:', err);
  }
}

// In-memory cache for ultra-fast lookup (max 100 items)
const memoryCache = new Map<string, Buffer>();

// Sleep helper
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Returns default voice matching the selected language on timbre-v2.5
 */
export function getDefaultVoice(language: string = 'en-IN'): string {
  switch (language) {
    case 'hi-IN':
      return 'Nalini';
    case 'hi-en':
      return 'Poorvi';
    case 'en-IN':
    default:
      return 'Kaveri';
  }
}

/**
 * Splits longer text into small 1-2 sentence chunks for optimal TTS synthesis and streaming
 */
export function splitTextIntoChunks(text: string, maxChunkLength = 180): string[] {
  if (!text || text.trim().length === 0) return [];

  // Clean extra spaces and markdown artifacts
  const clean = text
    .replace(/[*_#`~>]/g, '')
    .replace(/\[CHAPTER:[^\]]+\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Match sentence terminators (., ?, !, ।, \n)
  const sentences = clean.match(/[^.?!।\n]+[.?!।\n]+|[^.?!।\n]+$/g) || [clean];

  const chunks: string[] = [];
  let current = '';

  for (const s of sentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;

    if (current && (current.length + trimmed.length + 1) > maxChunkLength) {
      chunks.push(current.trim());
      current = trimmed;
    } else {
      current = current ? `${current} ${trimmed}` : trimmed;
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks;
}

/**
 * Synthesizes a single chunk with caching and error retry
 */
export async function synthesizeSingleChunk(
  text: string,
  language: string,
  voice: string,
  speed: number = 1.0,
  model = 'timbre-v2.5'
): Promise<{ buffer: Buffer; fromCache: boolean }> {
  const apiKey = config.gnaniApiKey;
  if (!apiKey) {
    throw new Error('GNANI_API_KEY is not configured in server environment');
  }

  // Generate SHA-256 cache key
  const cacheKey = crypto
    .createHash('sha256')
    .update(JSON.stringify({ text: text.trim(), language, voice, speed, model }))
    .digest('hex');

  // 1. Check memory cache
  if (memoryCache.has(cacheKey)) {
    return { buffer: memoryCache.get(cacheKey)!, fromCache: true };
  }

  // 2. Check disk cache
  const diskPath = path.join(CACHE_DIR, `${cacheKey}.mp3`);
  if (fs.existsSync(diskPath)) {
    try {
      const fileBuffer = fs.readFileSync(diskPath);
      if (memoryCache.size < 100) {
        memoryCache.set(cacheKey, fileBuffer);
      }
      return { buffer: fileBuffer, fromCache: true };
    } catch {
      // Proceed to API call if read fails
    }
  }

  // 3. Call Gnani Timbre API
  const maxRetries = 3;
  let lastError = '';

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(`${GNANI_BASE_URL}/api/v1/tts/inference`, {
        method: 'POST',
        headers: {
          'X-API-Key-ID': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          model,
          voice,
          language,
          speed,
          audio_config: { container: 'mp3' },
        }),
      });

      if (res.status === 429) {
        console.warn(`[Gnani TTS] Rate limited (429). Attempt ${attempt}/${maxRetries}. Retrying in ${attempt * 1000}ms...`);
        if (attempt < maxRetries) {
          await sleep(attempt * 1000);
          continue;
        }
        throw new Error('Gnani TTS rate limit exceeded (429). Please try again shortly.');
      }

      if (res.status === 401) {
        throw new Error('Gnani API Authentication Failed (401): Bad or missing API key.');
      }
      if (res.status === 402) {
        throw new Error('Gnani API Credits Exhausted (402): Account out of credits.');
      }
      if (res.status === 403) {
        throw new Error('Gnani API Forbidden (403): Key lacks required TTS permissions.');
      }

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gnani TTS failed (${res.status} ${res.statusText}): ${errText}`);
      }

      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Save to memory and disk cache
      if (memoryCache.size < 100) {
        memoryCache.set(cacheKey, buffer);
      }
      try {
        fs.writeFileSync(diskPath, buffer);
      } catch (err) {
        console.warn('[Gnani TTS] Failed to write disk cache:', err);
      }

      return { buffer, fromCache: false };
    } catch (err: any) {
      lastError = err.message || String(err);
      if (attempt === maxRetries || err.message.includes('401') || err.message.includes('402') || err.message.includes('403')) {
        break;
      }
      await sleep(attempt * 1000);
    }
  }

  throw new Error(`Gnani TTS Agent Error: ${lastError}`);
}

/**
 * TTS Agent (Gnani Timbre v2.5)
 * Splits full text into sentence chunks, synthesizes each with caching,
 * concatenates MP3 audio into one binary buffer, and returns the stream.
 */
export async function synthesizeText(options: TtsOptions): Promise<TtsResult> {
  const {
    text,
    language = 'en-IN',
    voice = getDefaultVoice(language),
    speed = 1.0,
    model = 'timbre-v2.5',
  } = options;

  if (!text || text.trim().length === 0) {
    throw new Error('Text is required for TTS synthesis');
  }

  const chunks = splitTextIntoChunks(text);
  if (chunks.length === 0) {
    throw new Error('No synthesizable text found');
  }

  const buffers: Buffer[] = [];
  let allFromCache = true;

  // Process chunks sequentially or in mini-batches to respect rate limits
  for (const chunk of chunks) {
    const { buffer, fromCache } = await synthesizeSingleChunk(chunk, language, voice, speed, model);
    if (!fromCache) allFromCache = false;
    buffers.push(buffer);
  }

  // Concatenate MP3 frames
  const combinedBuffer = Buffer.concat(buffers);

  return {
    audioBuffer: combinedBuffer,
    contentType: 'audio/mpeg',
    cached: allFromCache,
    chunksCount: chunks.length,
  };
}
