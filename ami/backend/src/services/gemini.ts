import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';

const total = config.geminiKeys.length;

// Global arrays for tracking key usage
const keyCooldownUntil: number[] = new Array(total).fill(0); // 429 freeze-out
const keyLastUsedAt:    number[] = new Array(total).fill(0); // burst protection
const keyInUse:         boolean[] = new Array(total).fill(false);
const keyQuotaHits:     number[]  = new Array(total).fill(0); // diagnostic counter
const keyBlacklisted:   boolean[] = new Array(total).fill(false); // permanently banned (leaked/invalid)

const MIN_REUSE_MS    = 2_000;   // 2s between reuses of the same key
const QUOTA_FREEZE_MS = 65_000;  // freeze key for 65s on 429
const MAX_FULL_ROTATIONS = 3;    // give up after cycling through all keys this many times

let globalCursor = 0;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Reset all quota hit counters — called when a key succeeds, proving quota is available again */
function onKeySuccess(index: number): void {
  keyQuotaHits[index] = 0;
}

/** Check if every key has been exhausted too many times (global exhaustion) */
function isGloballyExhausted(): boolean {
  const now = Date.now();
  const allFrozen = keyCooldownUntil.every(t => t > now);
  const allHitHard = keyQuotaHits.every(h => h >= MAX_FULL_ROTATIONS);
  return allFrozen && allHitHard;
}

export function logKeyStatus(): void {
  const now = Date.now();
  const blacklistedCount = keyBlacklisted.filter(Boolean).length;
  console.log(`[Gemini] Global Key Pool status (${total} keys, ${blacklistedCount} blacklisted):`);
  for (let i = 0; i < total; i++) {
    const cooling = keyCooldownUntil[i] > now;
    const recentlyUsed = (keyLastUsedAt[i] + MIN_REUSE_MS) > now;
    const status = keyBlacklisted[i] ? '🚫 BLACKLISTED (leaked/invalid)'
      : cooling ? '❄️ frozen'
      : keyInUse[i] ? '🔄 in-use'
      : recentlyUsed ? '⏳ cooldown'
      : '✅ ready';
    console.log(`  Key ${i}: ${status}${keyQuotaHits[i] > 0 ? ` [${keyQuotaHits[i]} quota hits]` : ''}`);
  }
}

// Global acquire key: rotates through all keys
async function acquireKey(): Promise<{ client: GoogleGenerativeAI; index: number; release: () => void }> {
  const now = Date.now();

  // CIRCUIT BREAKER: if every key has been quota-hit multiple times and all are frozen, fail fast
  if (isGloballyExhausted()) {
    throw new Error(
      'ALL_KEYS_EXHAUSTED: All Gemini API keys have hit their rate limits. ' +
      'Please wait 1-2 minutes for quotas to reset, or add more API keys.'
    );
  }

  // Try to find first ready key
  for (let offset = 0; offset < total; offset++) {
    const i = (globalCursor + offset) % total;
    if (keyBlacklisted[i]) continue; // skip permanently banned keys
    const isFrozen = keyCooldownUntil[i] > now;
    const isTooRecent = (keyLastUsedAt[i] + MIN_REUSE_MS) > now;
    if (!keyInUse[i] && !isFrozen && !isTooRecent) {
      keyInUse[i] = true;
      keyLastUsedAt[i] = now;
      globalCursor = (i + 1) % total;
      return {
        client: new GoogleGenerativeAI(config.geminiKeys[i]),
        index: i,
        release: () => { keyInUse[i] = false; }
      };
    }
  }

  // All keys are busy or frozen: find soonest available (skipping deeply frozen)
  let soonestIdx = 0;
  let soonestTime = Infinity;
  for (let i = 0; i < total; i++) {
    if (keyCooldownUntil[i] > now + 30_000) continue; // skip deeply frozen
    const available = Math.max(keyCooldownUntil[i], keyLastUsedAt[i] + MIN_REUSE_MS);
    if (available < soonestTime) { soonestTime = available; soonestIdx = i; }
  }

  if (soonestTime === Infinity) {
    for (let i = 0; i < total; i++) {
      const available = Math.max(keyCooldownUntil[i], keyLastUsedAt[i] + MIN_REUSE_MS);
      if (available < soonestTime) { soonestTime = available; soonestIdx = i; }
    }
  }

  const waitMs = Math.max(0, soonestTime - Date.now());
  if (waitMs > 0) {
    console.warn(`[Gemini] All keys busy. Waiting ${Math.ceil(waitMs / 1000)}s for key ${soonestIdx}`);
    await sleep(waitMs + 100);
  }

  while (keyInUse[soonestIdx]) await sleep(200);

  keyInUse[soonestIdx] = true;
  keyLastUsedAt[soonestIdx] = Date.now();
  globalCursor = (soonestIdx + 1) % total;
  return {
    client: new GoogleGenerativeAI(config.geminiKeys[soonestIdx]),
    index: soonestIdx,
    release: () => { keyInUse[soonestIdx] = false; }
  };
}

// For external libraries (like Langchain), we just return a rotated key string
export async function getNextApiKey(): Promise<string> {
  const { index, release } = await acquireKey();
  release();
  return config.geminiKeys[index];
}

export function getChatKeyIndex(): number {
  return 0; // fallback for old code
}

export function getTestKeyIndex(): number {
  return 1; // fallback for old code
}

async function callWithKey(
  prompt: string,
  modelName: string,
  visionData?: { buffer: Buffer; mimeType: string },
  _retryCount = 0
): Promise<string> {
  // CIRCUIT BREAKER: max retries = 3 full rotations through all keys
  const maxRetries = total * MAX_FULL_ROTATIONS;
  if (_retryCount >= maxRetries) {
    console.error(`[Gemini] Exhausted ${maxRetries} retries across all ${total} keys. Giving up.`);
    throw new Error(
      'ALL_KEYS_EXHAUSTED: All Gemini API keys have hit their rate limits after ' +
      `${_retryCount} attempts. Please wait 1-2 minutes and try again.`
    );
  }

  const { client, index, release } = await acquireKey();

  // Define our model fallback chain with active, verified models
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-3.8-flash', 'gemini-flash-latest'];
  const modelChain = models.includes(modelName)
    ? [modelName, ...models.filter(m => m !== modelName)]
    : [modelName, ...models];

  // Try each model in our chain for this acquired key
  for (let m = 0; m < modelChain.length; m++) {
    const activeModel = modelChain[m];
    try {
      console.log(`[Gemini] Attempting Key ${index} with model ${activeModel} (attempt ${_retryCount + 1}/${maxRetries})...`);
      const model = client.getGenerativeModel({ model: activeModel });
      let response;
      if (visionData) {
        response = await model.generateContent([
          prompt,
          { inlineData: { data: visionData.buffer.toString('base64'), mimeType: visionData.mimeType } }
        ]);
      } else {
        response = await model.generateContent(prompt);
      }
      
      // Success! Release and return
      release();
      onKeySuccess(index);
      return response.response.text();
    } catch (err: any) {
      const errStr = String(err);
      const isQuota = err?.status === 429
        || errStr.includes('429')
        || errStr.includes('RESOURCE_EXHAUSTED');
      
      const isUnavailable = err?.status === 503
        || errStr.includes('503')
        || errStr.includes('Service Unavailable')
        || errStr.includes('high demand');

      const isNetworkError = errStr.includes('fetch failed')
        || errStr.includes('ENOTFOUND')
        || errStr.includes('ETIMEDOUT')
        || errStr.includes('timeout')
        || errStr.includes('socket hang up')
        || errStr.includes('ECONNRESET');

      // Leaked, revoked, or invalid API key — permanently blacklist this key and rotate
      const isLeakedOrInvalid = errStr.includes('reported as leaked')
        || errStr.includes('API key not valid')
        || errStr.includes('API_KEY_INVALID')
        || (errStr.includes('403') && errStr.includes('Forbidden'))
        || err?.status === 403;

      const isModelNotFound = err?.status === 404
        || errStr.includes('404')
        || errStr.includes('not found')
        || errStr.includes('no longer available');

      if (isQuota || isUnavailable) {
        console.warn(`[Gemini] Key ${index} hit ${isQuota ? '429 quota' : '503 high demand'} for model ${activeModel}. Trying next model in fallback chain...`);
        continue; // Try next model on the same key
      }

      if (isModelNotFound) {
        console.warn(`[Gemini] Model ${activeModel} not found or retired (404). Trying next model in fallback chain...`);
        continue;
      }

      if (isLeakedOrInvalid) {
        console.error(`[Gemini] Key ${index} is PERMANENTLY BLACKLISTED (leaked/invalid/revoked). Skipping this key forever and rotating.`);
        keyBlacklisted[index] = true;
        keyCooldownUntil[index] = Date.now() + 999_999_999; // freeze forever
        release();
        // Rotate to the next available key
        return callWithKey(prompt, modelName, visionData, _retryCount + 1);
      }

      if (isNetworkError) {
        console.warn(`[Gemini] Key ${index} encountered transient network error with model ${activeModel}: ${err.message || errStr}. Retrying with next key...`);
        break; // Break the model loop to rotate and try next key
      }

      // Permanent/unexpected error: release key and throw immediately (e.g. blocked content, bad request)
      console.error(`[Gemini] Key ${index} failed with permanent error:`, err.message || errStr);
      release();
      throw err;
    }
  }

  // If we got here, all models in the fallback chain returned a 429 or a network error occurred
  release();
  keyCooldownUntil[index] = Date.now() + QUOTA_FREEZE_MS;
  keyQuotaHits[index]++;
  console.warn(`[Gemini] Key ${index} exhausted. Frozen 65s. Rotating to next key...`);
  return callWithKey(prompt, modelName, visionData, _retryCount + 1);
}

export async function callGemini(prompt: string, modelName = 'gemini-2.5-flash'): Promise<string> {
  return callWithKey(prompt, modelName);
}

export async function callGeminiSlides(prompt: string, modelName = 'gemini-2.5-flash'): Promise<string> {
  return callWithKey(prompt, modelName);
}

export async function callGeminiForTest(prompt: string, modelName = 'gemini-2.5-flash'): Promise<string> {
  return callWithKey(prompt, modelName);
}

export async function callGeminiForChat(prompt: string, modelName = 'gemini-2.5-flash'): Promise<string> {
  return callWithKey(prompt, modelName);
}

function sanitizeJsonString(raw: string): string {
  let result = '';
  let inString = false;
  let escaped = false;
  
  for (let i = 0; i < raw.length; i++) {
    const char = raw[i];
    
    if (inString) {
      if (escaped) {
        result += char;
        escaped = false;
      } else if (char === '\\') {
        result += char;
        escaped = true;
      } else if (char === '"') {
        result += char;
        inString = false;
      } else if (char === '\n') {
        result += '\\n';
      } else if (char === '\r') {
        result += '\\r';
      } else if (char === '\t') {
        result += '\\t';
      } else {
        const code = char.charCodeAt(0);
        if (code < 32) {
          result += '\\u' + code.toString(16).padStart(4, '0');
        } else {
          result += char;
        }
      }
    } else {
      result += char;
      if (char === '"') {
        inString = true;
      }
    }
  }
  return result;
}

export async function callGeminiJSON<T = any>(prompt: string): Promise<T> {
  const fullPrompt = prompt + '\n\nRespond with valid JSON only. No markdown, no code blocks, no explanation.';
  const text = await callGemini(fullPrompt);
  const cleaned = text.trim()
    .replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim();
  const sanitized = sanitizeJsonString(cleaned);
  try {
    return JSON.parse(sanitized) as T;
  } catch (err: any) {
    console.error('[Gemini] JSON parsing failed even after sanitization. Raw: ', cleaned);
    throw err;
  }
}

export async function callGeminiSlidesJSON<T = any>(prompt: string): Promise<T> {
  const fullPrompt = prompt + '\n\nRespond with valid JSON only. No markdown, no code blocks, no explanation.';
  const text = await callGeminiSlides(fullPrompt);
  const cleaned = text.trim()
    .replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim();
  const sanitized = sanitizeJsonString(cleaned);
  try {
    return JSON.parse(sanitized) as T;
  } catch (err: any) {
    console.error('[Gemini Slides] JSON parsing failed even after sanitization. Raw: ', cleaned);
    throw err;
  }
}

export async function callGeminiTestJSON<T = any>(prompt: string): Promise<T> {
  const fullPrompt = prompt + '\n\nRespond with valid JSON only. No markdown, no code blocks, no explanation.';
  const text = await callGeminiForTest(fullPrompt);
  const cleaned = text.trim()
    .replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim();
  const sanitized = sanitizeJsonString(cleaned);
  try {
    return JSON.parse(sanitized) as T;
  } catch (err: any) {
    console.error('[Gemini Test] JSON parsing failed even after sanitization. Raw: ', cleaned);
    throw err;
  }
}

export async function callGeminiVision(prompt: string, imageBuffer: Buffer, mimeType: string): Promise<string> {
  return callWithKey(prompt, 'gemini-2.0-flash', { buffer: imageBuffer, mimeType });
}
