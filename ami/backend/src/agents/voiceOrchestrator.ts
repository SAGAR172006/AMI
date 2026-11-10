import { transcribeAudio, SttResult } from './voiceSttAgent';
import { synthesizeText, getDefaultVoice, TtsResult } from './voiceTtsAgent';
import { translateText } from './voiceTranslatorAgent';
import { evaluateMockTestAnswers, MockTestQuestion } from './mockTestAgent';

export interface SpokenAnswerContext {
  question: MockTestQuestion;
  confirmedAnswer: string;
  userLanguage: string;   // e.g. 'hi-IN', 'hi-en', 'ta-IN'
  testLanguage?: string;  // e.g. 'en-IN'
  speed?: number;
}

export interface VoiceFeedbackResult {
  evaluation: any;
  translatedAnswer?: string;
  translatedFeedback: string;
  spokenAudioBase64: string;
  language: string;
  voice: string;
}

export interface VoiceLessonNarrationOptions {
  text: string;
  userLanguage: string;
  speed?: number;
}

/**
 * Agent 1: Main Orchestrator Agent
 * Owns the voice session, routes work to STT, Translator, and TTS agents,
 * and assembles the final multimodal responses.
 */
export class VoiceOrchestrator {
  /**
   * Process raw audio from client through STT Agent
   */
  static async transcribe(
    audioBuffer: Buffer,
    filename = 'recording.wav',
    mimeType = 'audio/wav',
    userLanguage = 'indic-auto'
  ): Promise<SttResult> {
    return transcribeAudio({
      audioBuffer,
      filename,
      mimeType,
      languageCode: userLanguage,
    });
  }

  /**
   * Evaluate a student's answer:
   * 1. Translate answer into test language (preserving code-mixed technical terms)
   * 2. Grade answer with step-marking breakdown
   * 3. Translate evaluation feedback back to user's selected language
   * 4. Synthesize spoken feedback with Gnani Timbre TTS
   */
  static async evaluateAnswer(context: SpokenAnswerContext): Promise<VoiceFeedbackResult> {
    const {
      question,
      confirmedAnswer,
      userLanguage = 'en-IN',
      testLanguage = 'en-IN',
      speed = 1.0,
    } = context;

    // Step 1: Translate confirmed answer to test language if needed
    let answerForGrading = confirmedAnswer;
    let translatedAnswer: string | undefined = undefined;

    if (userLanguage !== testLanguage && userLanguage !== 'en-IN') {
      answerForGrading = await translateText({
        text: confirmedAnswer,
        sourceLang: userLanguage,
        targetLang: testLanguage,
        context: 'answer',
      });
      translatedAnswer = answerForGrading;
    }

    // Step 2: Academic step-marking evaluation using AMI's grading logic
    const evalResult = await evaluateMockTestAnswers([question], {
      [question.id]: answerForGrading,
    });
    const evaluation = evalResult.evaluations[question.id];

    // Formulate concise feedback summary for the student
    const obtained = evaluation?.marksObtained || 0;
    const maxMarks = question.marks || 1;
    const stepFeedbacks = evaluation?.stepGrades?.map((sg: any) => sg.feedback).filter(Boolean).join('. ') || '';
    const baseSummary = `You scored ${obtained} out of ${maxMarks} marks. ${stepFeedbacks}`;

    // Step 3: Translate feedback back to the user's selected language
    let translatedFeedback = baseSummary;
    if (userLanguage !== 'en-IN') {
      translatedFeedback = await translateText({
        text: baseSummary,
        sourceLang: 'en-IN',
        targetLang: userLanguage,
        context: 'feedback',
      });
    }

    // Step 4: Synthesize spoken feedback with Gnani Timbre
    const voice = getDefaultVoice(userLanguage);
    let spokenAudioBase64 = '';

    try {
      const ttsResult = await synthesizeText({
        text: translatedFeedback,
        language: userLanguage,
        voice,
        speed,
      });
      spokenAudioBase64 = ttsResult.audioBuffer.toString('base64');
    } catch (ttsErr: any) {
      console.warn('[Voice Orchestrator] TTS feedback synthesis failed, falling back to text only:', ttsErr.message);
    }

    return {
      evaluation,
      translatedAnswer,
      translatedFeedback,
      spokenAudioBase64,
      language: userLanguage,
      voice,
    };
  }

  /**
   * Narrate a lesson section:
   * 1. Translate section to user's language if needed
   * 2. Synthesize using Gnani Timbre with sentence-level caching
   */
  static async narrateSection(options: VoiceLessonNarrationOptions): Promise<{
    audioBuffer: Buffer;
    translatedText: string;
    language: string;
    voice: string;
  }> {
    const { text, userLanguage = 'en-IN', speed = 1.0 } = options;

    let narratedText = text;
    if (userLanguage !== 'en-IN') {
      narratedText = await translateText({
        text,
        sourceLang: 'en-IN',
        targetLang: userLanguage,
        context: 'lesson',
      });
    }

    const voice = getDefaultVoice(userLanguage);
    const ttsResult = await synthesizeText({
      text: narratedText,
      language: userLanguage,
      voice,
      speed,
    });

    return {
      audioBuffer: ttsResult.audioBuffer,
      translatedText: narratedText,
      language: userLanguage,
      voice,
    };
  }
}
