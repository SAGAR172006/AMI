import { useState, useRef, useEffect } from 'react';
import { AudioRecorder } from '../../services/audioRecorder';
import { voiceApi } from '../../services/voiceApi';
import { Ico } from '../ui/Icons';

export default function VoiceAnswerInput({
  value = '',
  onChange,
  languageCode = 'en-IN',
  placeholder = 'Type your answer or click the microphone to speak...',
  rows = 4,
  disabled = false,
  questionId,
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [voiceNotice, setVoiceNotice] = useState(null); // { type: 'success' | 'warn' | 'error', text }
  const [detectedLang, setDetectedLang] = useState(null);

  const recorderRef = useRef(null);

  useEffect(() => {
    return () => {
      if (recorderRef.current) {
        recorderRef.current.cancel();
      }
    };
  }, []);

  const startRecording = async () => {
    if (disabled || isTranscribing) return;
    setVoiceNotice(null);
    setElapsed(0);

    try {
      recorderRef.current = new AudioRecorder();
      await recorderRef.current.start({
        onTick: (sec) => setElapsed(sec),
        onSilence: () => {
          // Auto-stop after prolonged silence
          stopRecording();
        },
      });
      setIsRecording(true);
    } catch (err) {
      console.warn('[VoiceAnswerInput] Recording failed to start:', err.message);
      setVoiceNotice({
        type: 'warn',
        text: `${err.message} You can type your answer directly.`,
      });
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!recorderRef.current || !isRecording) return;
    setIsRecording(false);
    setIsTranscribing(true);

    try {
      const { blob, duration } = await recorderRef.current.stop();
      if (duration < 0.8 || blob.size < 500) {
        setVoiceNotice({
          type: 'warn',
          text: 'Audio was too short. Speak a little longer or type your answer.',
        });
        setIsTranscribing(false);
        return;
      }

      setVoiceNotice({
        type: 'info',
        text: 'Transcribing via Gnani Prisma v3.0...',
      });

      const sttResult = await voiceApi.transcribe(blob, languageCode);
      const newTranscript = (sttResult.transcript || '').trim();

      if (!newTranscript) {
        setVoiceNotice({
          type: 'warn',
          text: 'No speech was detected. Please check your mic or type below.',
        });
      } else {
        // Append or replace in the answer box
        const updated = value && value.trim() ? `${value.trim()}\n${newTranscript}` : newTranscript;
        onChange(updated);
        setDetectedLang(sttResult.detected_language_code);
        setVoiceNotice({
          type: 'success',
          text: `✓ Transcribed via Gnani Prisma (${sttResult.detected_language_code || languageCode}). You can edit before submitting.`,
        });
      }
    } catch (err) {
      console.error('[VoiceAnswerInput] Transcription error:', err);
      setVoiceNotice({
        type: 'error',
        text: `Voice transcription failed (${err.message}). Switched to manual typing.`,
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
      {/* Textarea container */}
      <div style={{ position: 'relative', width: '100%' }}>
        <textarea
          rows={rows}
          value={value}
          disabled={disabled || isTranscribing}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '12px 14px',
            paddingBottom: 44, // Extra space at bottom for voice controls
            borderRadius: 'var(--r-md)',
            border: isRecording ? '2px solid var(--peach-500)' : '1px solid var(--ink-200)',
            background: 'var(--paper)',
            color: 'var(--ink-900)',
            fontSize: 14,
            fontFamily: 'inherit',
            lineHeight: 1.6,
            resize: 'vertical',
            transition: 'border 0.2s ease, box-shadow 0.2s ease',
            boxShadow: isRecording ? '0 0 0 3px rgba(255, 148, 102, 0.2)' : 'none',
          }}
        />

        {/* Floating Voice Action Bar at bottom-right of textarea */}
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            left: 8,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pointerEvents: 'none',
          }}
        >
          {/* Status badge */}
          <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            {isRecording && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: 'rgba(226, 106, 92, 0.12)',
                  color: 'var(--error)',
                  fontSize: 12,
                  fontWeight: 700,
                  animation: 'pulse 1.5s infinite',
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--error)',
                    display: 'inline-block',
                  }}
                />
                Recording {formatTime(elapsed)} · Speak now
              </span>
            )}

            {isTranscribing && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: 'var(--lav-50)',
                  color: 'var(--lav-600)',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  style={{ animation: 'spin-slow 1s linear infinite' }}
                >
                  <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                </svg>
                Transcribing (Gnani Prisma)...
              </span>
            )}
          </div>

          {/* Record / Stop Button */}
          <div style={{ pointerEvents: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              onClick={toggleRecording}
              disabled={disabled || isTranscribing}
              className="pill"
              style={{
                padding: '6px 14px',
                fontSize: 12.5,
                fontWeight: 600,
                borderRadius: 999,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                border: isRecording ? '1.5px solid var(--error)' : '1.5px solid var(--peach-300)',
                background: isRecording ? 'var(--error)' : 'var(--peach-50)',
                color: isRecording ? '#ffffff' : 'var(--peach-600)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s ease',
              }}
              title={isRecording ? 'Click to stop recording' : 'Click to answer with voice (Gnani Prisma)'}
            >
              {isRecording ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                  </svg>
                  Stop Recording
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" x2="12" y1="19" y2="22" />
                  </svg>
                  Speak Answer
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Voice notification or instruction notice */}
      {voiceNotice && (
        <div
          style={{
            fontSize: 12,
            padding: '6px 10px',
            borderRadius: 'var(--r-sm)',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            background:
              voiceNotice.type === 'success'
                ? 'rgba(79, 176, 122, 0.08)'
                : voiceNotice.type === 'warn'
                ? 'rgba(255, 148, 102, 0.1)'
                : voiceNotice.type === 'info'
                ? 'var(--lav-50)'
                : 'rgba(226, 106, 92, 0.08)',
            color:
              voiceNotice.type === 'success'
                ? 'var(--success)'
                : voiceNotice.type === 'warn'
                ? 'var(--peach-600)'
                : voiceNotice.type === 'info'
                ? 'var(--lav-600)'
                : 'var(--error)',
            borderLeft: `3px solid ${
              voiceNotice.type === 'success'
                ? 'var(--success)'
                : voiceNotice.type === 'warn'
                ? 'var(--peach-400)'
                : voiceNotice.type === 'info'
                ? 'var(--lav-400)'
                : 'var(--error)'
            }`,
          }}
        >
          <span>{voiceNotice.text}</span>
          <button
            type="button"
            onClick={() => setVoiceNotice(null)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              color: 'inherit',
              padding: 0,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
