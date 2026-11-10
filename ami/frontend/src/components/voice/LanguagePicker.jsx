import { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';

export const SUPPORTED_VOICE_LANGUAGES = [
  { code: 'en-IN', label: 'English', native: 'English', voice: 'Kaveri' },
  { code: 'hi-IN', label: 'Hindi', native: 'हिंदी', voice: 'Nalini' },
  { code: 'hi-en', label: 'Hinglish', native: 'Hinglish', voice: 'Poorvi' },
  { code: 'ta-IN', label: 'Tamil', native: 'தமிழ்', voice: 'Kaveri' },
  { code: 'te-IN', label: 'Telugu', native: 'తెలుగు', voice: 'Kaveri' },
  { code: 'kn-IN', label: 'Kannada', native: 'ಕನ್ನಡ', voice: 'Kaveri' },
  { code: 'ml-IN', label: 'Malayalam', native: 'മലയാളം', voice: 'Kaveri' },
  { code: 'mr-IN', label: 'Marathi', native: 'मराठी', voice: 'Nalini' },
  { code: 'pa-IN', label: 'Punjabi', native: 'ਪੰਜਾਬੀ', voice: 'Kaveri' },
  { code: 'bn-IN', label: 'Bengali', native: 'বাংলা', voice: 'Kaveri' },
  { code: 'gu-IN', label: 'Gujarati', native: 'ગુજરાતી', voice: 'Kaveri' },
];

export const getSavedVoiceLanguage = () => {
  if (typeof window === 'undefined') return 'en-IN';
  return localStorage.getItem('ami_voice_lang') || 'en-IN';
};

export default function LanguagePicker({ currentLang, onChange, user, compact = false, label = 'Voice Language' }) {
  const [open, setOpen] = useState(false);
  const selectedLangCode = currentLang || getSavedVoiceLanguage();
  const dropdownRef = useRef(null);

  const activeLang = SUPPORTED_VOICE_LANGUAGES.find((l) => l.code === selectedLangCode) || SUPPORTED_VOICE_LANGUAGES[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelect = async (code) => {
    localStorage.setItem('ami_voice_lang', code);
    if (onChange) onChange(code);
    setOpen(false);

    // Persist to user profile in Supabase if logged in
    if (user) {
      try {
        await api.updateMe({ preferred_language: code });
      } catch (err) {
        // Non-blocking update
        console.warn('[LanguagePicker] Profile sync failed, kept in localStorage:', err);
      }
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="pill"
        style={{
          padding: compact ? '4px 10px' : '6px 14px',
          fontSize: compact ? 12 : 13,
          background: 'var(--paper)',
          border: '1.5px solid var(--peach-200)',
          borderRadius: 999,
          color: 'var(--ink-800)',
          cursor: 'pointer',
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          boxShadow: 'var(--shadow-sm)',
          transition: 'all 0.2s ease',
        }}
        title={`AMI Voice Language: ${activeLang.label} (${activeLang.native})`}
      >
        <span style={{ color: 'var(--peach-500)', display: 'inline-flex', alignItems: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        </span>
        <span>
          {activeLang.label} <span style={{ opacity: 0.65, fontWeight: 400 }}>({activeLang.native})</span>
        </span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            background: 'var(--paper)',
            border: '1px solid var(--ink-100)',
            borderRadius: 'var(--r-md)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 100,
            padding: '6px 4px',
            minWidth: 200,
            maxHeight: 280,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <div style={{ padding: '4px 10px 6px', fontSize: 11, fontWeight: 700, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--ink-100)' }}>
            Select Voice Language
          </div>
          {SUPPORTED_VOICE_LANGUAGES.map((lang) => {
            const isSelected = lang.code === selectedLangCode;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang.code)}
                style={{
                  padding: '7px 12px',
                  fontSize: 12.5,
                  border: 'none',
                  background: isSelected ? 'var(--peach-50)' : 'transparent',
                  color: isSelected ? 'var(--peach-500)' : 'var(--ink-800)',
                  fontWeight: isSelected ? 700 : 500,
                  textAlign: 'left',
                  borderRadius: 'var(--r-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'var(--cream)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span>{lang.label}</span>
                <span style={{ fontSize: 11, color: isSelected ? 'var(--peach-500)' : 'var(--ink-400)', fontWeight: 400 }}>
                  {lang.native}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
