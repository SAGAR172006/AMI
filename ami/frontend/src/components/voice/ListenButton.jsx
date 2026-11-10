import { useState, useRef, useEffect } from 'react';
import { voiceApi } from '../../services/voiceApi';
import { SUPPORTED_VOICE_LANGUAGES } from './LanguagePicker';

export default function ListenButton({
  text,
  language = 'en-IN',
  label = 'Listen',
  compact = false,
  style = {},
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleToggle = async (e) => {
    e.stopPropagation();

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    if (!text || text.trim().length === 0) return;

    setIsLoading(true);
    try {
      const langObj = SUPPORTED_VOICE_LANGUAGES.find((l) => l.code === language) || SUPPORTED_VOICE_LANGUAGES[0];
      let textToSpeak = text;
      if (language && language !== 'en-IN') {
        try {
          textToSpeak = await voiceApi.translate(text, language, 'en-IN', 'lesson');
        } catch (e) {
          console.warn('[ListenButton] Translation fallback:', e);
        }
      }
      const audioUrl = await voiceApi.synthesize(textToSpeak, language, langObj.voice);

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
      };
      audio.onerror = () => {
        setIsPlaying(false);
        setIsLoading(false);
      };

      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.warn('[ListenButton] Synthesis failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isLoading}
      className="pill"
      style={{
        padding: compact ? '3px 8px' : '5px 12px',
        fontSize: compact ? 11.5 : 12.5,
        fontWeight: 600,
        borderRadius: 999,
        border: '1px solid var(--peach-300)',
        background: isPlaying ? 'var(--peach-500)' : 'var(--peach-50)',
        color: isPlaying ? '#ffffff' : 'var(--peach-600)',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 0.15s ease',
        ...style,
      }}
      title={`Listen with Gnani Timbre (${language})`}
    >
      {isLoading ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: 'spin-slow 1s linear infinite' }}>
          <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
        </svg>
      ) : isPlaying ? (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
          <rect x="5" y="4" width="4" height="16" rx="1" />
          <rect x="15" y="4" width="4" height="16" rx="1" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      )}
      <span>{isPlaying ? 'Pause' : label}</span>
    </button>
  );
}
