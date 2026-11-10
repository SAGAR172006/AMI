import { Router, Request, Response } from 'express';
import { VoiceOrchestrator } from '../agents/voiceOrchestrator';
import { synthesizeText, getDefaultVoice } from '../agents/voiceTtsAgent';
import { translateText } from '../agents/voiceTranslatorAgent';
import { config } from '../config';

export const voiceRouter = Router();

/**
 * Health check & verification endpoint
 * Performs a lightweight TTS synthesis to confirm GNANI_API_KEY validity
 */
voiceRouter.get('/verify', async (_req: Request, res: Response) => {
  try {
    if (!config.gnaniApiKey) {
      return res.status(400).json({
        status: 'error',
        message: 'GNANI_API_KEY is not configured on the server.',
      });
    }

    const testTts = await synthesizeText({
      text: 'AMI Voice is active.',
      language: 'en-IN',
      voice: 'Kaveri',
      speed: 1.0,
    });

    res.json({
      status: 'ok',
      message: 'Gnani AI credentials verified successfully.',
      bytes: testTts.audioBuffer.byteLength,
      cached: testTts.cached,
    });
  } catch (err: any) {
    console.error('[Voice Router] Verify error:', err.message);
    res.status(500).json({
      status: 'error',
      message: err.message || 'Gnani API key verification failed.',
    });
  }
});

/**
 * Speech-to-Text (STT) endpoint via Gnani Prisma v3.0
 * Supports multipart file upload (via express-fileupload) or JSON audioBase64
 */
voiceRouter.post('/stt', async (req: Request, res: Response) => {
  try {
    let audioBuffer: Buffer | null = null;
    let filename = 'recording.wav';
    let mimeType = 'audio/wav';
    const languageCode = (req.body?.language_code || req.body?.language || 'indic-auto').trim();

    // 1. Check for multipart file upload
    if (req.files) {
      const file = (req.files.audio_file || req.files.audio || req.files.file) as any;
      if (file) {
        audioBuffer = file.data;
        filename = file.name || filename;
        mimeType = file.mimetype || mimeType;
      }
    }

    // 2. Check for base64 fallback in body
    if (!audioBuffer && req.body?.audioBase64) {
      audioBuffer = Buffer.from(req.body.audioBase64, 'base64');
      if (req.body.mimeType) mimeType = req.body.mimeType;
      if (req.body.filename) filename = req.body.filename;
    }

    if (!audioBuffer || audioBuffer.length === 0) {
      return res.status(400).json({
        error: 'No audio data received. Provide a file in multipart "audio_file" or "audioBase64" in JSON.',
      });
    }

    const sttResult = await VoiceOrchestrator.transcribe(
      audioBuffer,
      filename,
      mimeType,
      languageCode
    );

    res.json({
      success: true,
      transcript: sttResult.transcript,
      model: sttResult.model,
      detected_language_code: sttResult.detected_language_code,
    });
  } catch (err: any) {
    console.error('[Voice Router] STT error:', err.message);
    res.status(500).json({
      error: err.message || 'Speech-to-text processing failed.',
    });
  }
});

/**
 * Text-to-Speech (TTS) endpoint via Gnani Timbre v2.5
 * Synthesizes text with sentence-level caching. Returns binary audio/mpeg or JSON base64.
 */
voiceRouter.post('/tts', async (req: Request, res: Response) => {
  try {
    const { text, language = 'en-IN', voice, speed = 1.0, format = 'binary' } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text parameter is required.' });
    }

    const selectedVoice = voice || getDefaultVoice(language);
    const result = await synthesizeText({
      text,
      language,
      voice: selectedVoice,
      speed: Number(speed) || 1.0,
    });

    if (format === 'json') {
      return res.json({
        audioBase64: result.audioBuffer.toString('base64'),
        contentType: result.contentType,
        cached: result.cached,
        chunksCount: result.chunksCount,
      });
    }

    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Length', result.audioBuffer.byteLength);
    res.setHeader('X-AMI-Voice-Cached', result.cached ? 'true' : 'false');
    res.setHeader('X-AMI-Voice-Chunks', result.chunksCount.toString());
    res.send(result.audioBuffer);
  } catch (err: any) {
    console.error('[Voice Router] TTS error:', err.message);
    res.status(500).json({
      error: err.message || 'Text-to-speech synthesis failed.',
    });
  }
});

/**
 * Translation endpoint (via Gemini LLM)
 */
voiceRouter.post('/translate', async (req: Request, res: Response) => {
  try {
    const { text, sourceLang = 'en-IN', targetLang, context = 'lesson' } = req.body;

    if (!text || !targetLang) {
      return res.status(400).json({ error: 'text and targetLang are required.' });
    }

    const translatedText = await translateText({
      text,
      sourceLang,
      targetLang,
      context,
    });

    res.json({ translatedText });
  } catch (err: any) {
    console.error('[Voice Router] Translate error:', err.message);
    res.status(500).json({
      error: err.message || 'Translation failed.',
    });
  }
});

/**
 * Mock Test Voice Answer & Evaluation Pipeline:
 * 1. Confirmed student answer in userLanguage
 * 2. Translates to test language (preserving technical terms)
 * 3. Evaluates with step-marking logic
 * 4. Translates step feedback back to userLanguage
 * 5. Synthesizes feedback audio with Gnani Timbre
 */
voiceRouter.post('/evaluate-answer', async (req: Request, res: Response) => {
  try {
    const {
      question,
      confirmedAnswer,
      userLanguage = 'en-IN',
      testLanguage = 'en-IN',
      speed = 1.0,
    } = req.body;

    if (!question || confirmedAnswer === undefined) {
      return res.status(400).json({ error: 'question and confirmedAnswer are required.' });
    }

    const result = await VoiceOrchestrator.evaluateAnswer({
      question,
      confirmedAnswer,
      userLanguage,
      testLanguage,
      speed: Number(speed) || 1.0,
    });

    res.json({
      success: true,
      evaluation: result.evaluation,
      translatedAnswer: result.translatedAnswer,
      translatedFeedback: result.translatedFeedback,
      spokenAudioBase64: result.spokenAudioBase64,
      language: result.language,
      voice: result.voice,
    });
  } catch (err: any) {
    console.error('[Voice Router] Evaluate-answer error:', err.message);
    res.status(500).json({
      error: err.message || 'Voice answer evaluation pipeline failed.',
    });
  }
});

/**
 * Full Lesson Section Narration:
 * Translates section text into user's language and synthesizes via Gnani Timbre
 */
voiceRouter.post('/narrate', async (req: Request, res: Response) => {
  try {
    const { text, userLanguage = 'en-IN', speed = 1.0 } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for narration.' });
    }

    const narration = await VoiceOrchestrator.narrateSection({
      text,
      userLanguage,
      speed: Number(speed) || 1.0,
    });

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', narration.audioBuffer.byteLength);
    res.setHeader('X-AMI-Voice-Lang', narration.language);
    res.setHeader('X-AMI-Voice-Actor', narration.voice);
    res.send(narration.audioBuffer);
  } catch (err: any) {
    console.error('[Voice Router] Narrate error:', err.message);
    res.status(500).json({
      error: err.message || 'Lesson narration synthesis failed.',
    });
  }
});
