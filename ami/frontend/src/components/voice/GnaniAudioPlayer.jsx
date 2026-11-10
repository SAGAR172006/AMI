import { useState, useEffect, useRef, useMemo } from 'react';
import { voiceApi } from '../../services/voiceApi';
import LanguagePicker, { SUPPORTED_VOICE_LANGUAGES } from './LanguagePicker';
import { Ico } from '../ui/Icons';

export default function GnaniAudioPlayer({
  chapters = [],
  title = 'Audio Lesson',
  selectedLanguage = 'en-IN',
  onLanguageChange,
  user,
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [speed, setSpeed] = useState(1.0);
  const [autoplay, setAutoplay] = useState(true);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);
  const [displayedText, setDisplayedText] = useState('');

  const audioRef = useRef(null);
  const translationCacheRef = useRef(new Map());
  const activeChapter = chapters[currentIdx] || { title: 'Lesson Overview', text: '' };

  const currentLangObj = useMemo(
    () => SUPPORTED_VOICE_LANGUAGES.find((l) => l.code === selectedLanguage) || SUPPORTED_VOICE_LANGUAGES[0],
    [selectedLanguage]
  );

  // Initialize and tear down Audio object
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    audio.ontimeupdate = () => {
      if (audio.duration) {
        setCurrentTime(audio.currentTime);
        setDuration(audio.duration);
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.onended = () => {
      setIsPlaying(false);
      setProgress(100);
      if (autoplay && currentIdx + 1 < chapters.length) {
        setCurrentIdx((prev) => prev + 1);
      }
    };

    audio.onerror = (e) => {
      console.warn('[GnaniAudioPlayer] Audio playback error:', e);
      setIsPlaying(false);
      setIsLoading(false);
      setError('Audio playback error. Click play to retry.');
    };

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [chapters.length, autoplay, currentIdx]);

  // Sync playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  // Load and optionally play chapter audio when index or language changes
  const loadAudioForChapter = async (idx, shouldPlay = false) => {
    const chapter = chapters[idx];
    if (!chapter || !chapter.text) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsLoading(true);
    setError(null);

    try {
      let textToSynthesize = chapter.text;

      // When a non-English language is selected, translate the source text first!
      if (selectedLanguage && selectedLanguage !== 'en-IN') {
        const cacheKey = `${idx}_${selectedLanguage}`;
        if (translationCacheRef.current.has(cacheKey)) {
          textToSynthesize = translationCacheRef.current.get(cacheKey);
          setDisplayedText(textToSynthesize);
        } else {
          setStatusMessage(`Translating lesson to ${currentLangObj.label}...`);
          try {
            textToSynthesize = await voiceApi.translate(
              chapter.text,
              selectedLanguage,
              'en-IN',
              'lesson'
            );
            translationCacheRef.current.set(cacheKey, textToSynthesize);
            setDisplayedText(textToSynthesize);
          } catch (trErr) {
            console.warn('[GnaniAudioPlayer] Translation subagent error, continuing with original text:', trErr);
            textToSynthesize = chapter.text;
            setDisplayedText(chapter.text);
          }
        }
      } else {
        setDisplayedText(chapter.text);
      }

      setStatusMessage(`Synthesizing speech (${currentLangObj.voice})...`);
      // Voice mapping
      const voice = currentLangObj.voice;
      const audioUrl = await voiceApi.synthesize(textToSynthesize, selectedLanguage, voice, speed);

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.playbackRate = speed;
        audioRef.current.load();

        if (shouldPlay) {
          await audioRef.current.play();
          setIsPlaying(true);
        }
      }
    } catch (err) {
      console.error('[GnaniAudioPlayer] Synthesis error:', err);
      setError(err.message || 'Speech synthesis failed. Please try again.');
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  // Re-load when chapter index or language changes if already playing
  useEffect(() => {
    if (chapters.length > 0) {
      loadAudioForChapter(currentIdx, isPlaying);
    }
  }, [currentIdx, selectedLanguage]);

  const handlePlayToggle = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current.src || error) {
        await loadAudioForChapter(currentIdx, true);
      } else {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (err) {
          await loadAudioForChapter(currentIdx, true);
        }
      }
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < chapters.length) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    audioRef.current.currentTime = pct * duration;
    setProgress(pct * 100);
  };

  const formatSecs = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      style={{
        background: 'var(--paper)',
        borderRadius: 'var(--r-xl)',
        border: '1.5px solid var(--peach-200)',
        boxShadow: 'var(--shadow-lg)',
        padding: '28px 32px',
        maxWidth: 720,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      {/* Header bar: title & language selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--peach-500)',
                background: 'var(--peach-50)',
                padding: '3px 8px',
                borderRadius: 999,
              }}
            >
              AMI Voice Lesson
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--ink-400)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              ⚡ Powered by Gnani Timbre
            </span>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--ink-900)' }}>{title}</h2>
        </div>

        <LanguagePicker
          currentLang={selectedLanguage}
          onChange={onLanguageChange}
          user={user}
        />
      </div>

      {/* Active Chapter Card with Waveform */}
      <div
        style={{
          background: 'var(--cream)',
          borderRadius: 'var(--r-lg)',
          padding: '20px 24px',
          border: '1px solid var(--ink-100)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--lav-500)' }}>
              Section {currentIdx + 1} of {chapters.length || 1}
            </span>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '2px 0 0', color: 'var(--ink-900)' }}>
              {activeChapter.title || 'Overview'}
            </h3>
          </div>

          {/* Equalizer animation when playing */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 20 }}>
            {[14, 22, 10, 18, 24, 12].map((h, i) => (
              <span
                key={i}
                style={{
                  width: 3,
                  height: isPlaying ? `${h}px` : '4px',
                  background: isPlaying ? 'var(--peach-500)' : 'var(--ink-200)',
                  borderRadius: 2,
                  transition: 'height 0.2s ease',
                  animation: isPlaying ? `audio-bounce ${0.6 + i * 0.15}s ease-in-out infinite alternate` : 'none',
                }}
              />
            ))}
          </div>
        </div>

        {/* Text excerpt preview */}
        {(displayedText || activeChapter.text) && (
          <p
            style={{
              fontSize: 13.5,
              color: 'var(--ink-700)',
              lineHeight: 1.6,
              margin: 0,
              maxHeight: 72,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {displayedText || activeChapter.text}
          </p>
        )}

        {/* Translation / Loading status */}
        {isLoading && statusMessage && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--peach-600)', fontWeight: 600 }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--peach-500)', animation: 'pulse-glow 1.2s infinite' }} />
            {statusMessage}
          </div>
        )}

        {/* Progress Bar scrubber */}
        <div style={{ marginTop: 6 }}>
          <div
            onClick={handleSeek}
            style={{
              width: '100%',
              height: 6,
              borderRadius: 3,
              background: 'var(--ink-200)',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--peach-400), var(--peach-500))',
                borderRadius: 3,
                transition: 'width 0.1s linear',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-400)', marginTop: 4 }}>
            <span>{formatSecs(currentTime)}</span>
            <span>{formatSecs(duration)}</span>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ padding: '8px 14px', background: 'rgba(226,106,92,0.1)', color: 'var(--error)', fontSize: 12.5, borderRadius: 'var(--r-sm)', fontWeight: 500 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Primary Player Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        {/* Playback speed buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-400)', marginRight: 4 }}>Speed:</span>
          {[0.85, 1.0, 1.15].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
              className="pill"
              style={{
                padding: '4px 8px',
                fontSize: 11.5,
                fontWeight: 700,
                borderRadius: 6,
                border: '1px solid',
                borderColor: speed === s ? 'var(--peach-500)' : 'var(--ink-200)',
                background: speed === s ? 'var(--peach-50)' : 'transparent',
                color: speed === s ? 'var(--peach-600)' : 'var(--ink-600)',
                cursor: 'pointer',
              }}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Center transport controls: Prev, Play/Pause, Next */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIdx === 0}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '1px solid var(--ink-200)',
              background: 'var(--paper)',
              color: currentIdx === 0 ? 'var(--ink-300)' : 'var(--ink-700)',
              display: 'grid',
              placeItems: 'center',
              cursor: currentIdx === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Previous Section"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="19 20 9 12 19 4 19 20" />
              <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2.5" />
            </svg>
          </button>

          <button
            type="button"
            onClick={handlePlayToggle}
            disabled={isLoading}
            style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              border: 'none',
              background: 'linear-gradient(135deg, var(--peach-400), var(--peach-500))',
              color: '#ffffff',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(255, 148, 102, 0.4)',
              transition: 'transform 0.15s ease',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            title={isPlaying ? 'Pause' : 'Play (Gnani Timbre)'}
          >
            {isLoading ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: 'spin-slow 1s linear infinite' }}>
                <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
              </svg>
            ) : isPlaying ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 3 }}>
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={currentIdx + 1 >= chapters.length}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '1px solid var(--ink-200)',
              background: 'var(--paper)',
              color: currentIdx + 1 >= chapters.length ? 'var(--ink-300)' : 'var(--ink-700)',
              display: 'grid',
              placeItems: 'center',
              cursor: currentIdx + 1 >= chapters.length ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Next Section"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 4 15 12 5 20 5 4" />
              <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2.5" />
            </svg>
          </button>
        </div>

        {/* Autoplay switch */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-600)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={autoplay}
            onChange={(e) => setAutoplay(e.target.checked)}
            style={{ accentColor: 'var(--peach-500)', cursor: 'pointer' }}
          />
          Autoplay next
        </label>
      </div>

      {/* Footer Branding line */}
      <div style={{ borderTop: '1px solid var(--ink-100)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, color: 'var(--ink-400)' }}>
        <span>Speaker Actor: {currentLangObj.voice} ({currentLangObj.label})</span>
        <span>Narrated by Gnani Timbre</span>
      </div>
    </div>
  );
}
