import { useState, useEffect } from 'react'
import { Ico } from '../components/ui/Icons.jsx'

export default function LoadingPage({ topic, fromUpload, onGenerate, onDone, onBack, onGoLogin }) {
  const phases = fromUpload ? [
    { text: 'Reading your file…', sub: 'Extracting text and figures from your media' },
    { text: 'Removing fluff and extracting core concepts…', sub: 'Identifying what actually matters' },
    { text: 'Transforming and personalizing your study material…', sub: 'Tuned just for you' },
    { text: 'Generating audio, images, and mindmaps…', sub: 'The 5 pillars are coming online' },
  ] : [
    { text: 'Scouring the internet for the best resources…', sub: 'Searching textbooks, papers, and trusted sources' },
    { text: 'Removing fluff and extracting core concepts…', sub: 'Identifying what actually matters' },
    { text: 'Transforming and personalizing your study material…', sub: 'Tuned for a high schooler who likes music' },
    { text: 'Generating audio, images, and mindmaps…', sub: 'The 5 pillars are coming online' },
  ]

  const [phase, setPhase] = useState(0)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)

  useEffect(() => {
    const phaseDur = 1700
    const total = phaseDur * phases.length
    const start = Date.now()
    const tick = setInterval(() => {
      const elapsed = Date.now() - start
      const p = Math.min(1, elapsed / total)
      setProgress(p)
      const idx = Math.min(phases.length - 1, Math.floor(elapsed / phaseDur))
      setPhase(idx)
      // don't auto-complete
    }, 60)

    const run = async () => {
      try {
        const result = await onGenerate()
        clearInterval(tick)
        setProgress(1)
        setPhase(phases.length - 1)
        setTimeout(() => onDone(result), 400)
      } catch (err) {
        clearInterval(tick)
        setError(err.message || 'Generation failed')
      }
    }
    
    run()

    return () => clearInterval(tick)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const current = phases[phase]
  const labels = ['Search', 'Extract', 'Personalize', 'Generate']
  const isAuthError = error && (error.toLowerCase().includes('token') || error.toLowerCase().includes('auth') || error.toLowerCase().includes('login'))

  if (error) {
    return (
      <div className="fade-in" style={{ minHeight: '100vh', background: 'var(--cream)', display: 'grid', placeItems: 'center', padding: '40px 24px', position: 'relative' }}>
        <div style={{ maxWidth: 460, width: '100%', background: 'var(--paper)', borderRadius: 'var(--r-xl)', padding: 32, boxShadow: 'var(--shadow-lg)', textAlign: 'center', border: '1.5px solid var(--peach-200)', animation: 'fade-up 0.3s ease' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--peach-50)', color: 'var(--peach-500)', display: 'grid', placeItems: 'center', margin: '0 auto 16px', fontSize: 24 }}>
            {isAuthError ? '🔐' : '⚠️'}
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px', color: 'var(--ink-900)' }}>
            {isAuthError ? 'Sign In Required' : 'Generation Error'}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--ink-600)', lineHeight: 1.5, margin: '0 0 24px' }}>
            {isAuthError
              ? `To generate personalized AI modules for "${topic}", please create a free account or sign in. Your progress will be saved automatically.`
              : error}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {isAuthError && onGoLogin && (
              <button className="pill pill-primary" onClick={onGoLogin} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                Sign in or Sign up to Continue
              </button>
            )}
            {onBack && (
              <button className="pill pill-ghost" onClick={onBack} style={{ width: '100%', justifyContent: 'center', padding: '10px' }}>
                Go Back
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in" style={{ minHeight: '100vh', background: 'var(--cream)', display: 'grid', placeItems: 'center', padding: '40px 24px', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 40%, rgba(230,230,250,0.6), transparent 60%)', pointerEvents: 'none' }}/>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, maxWidth: 520, textAlign: 'center' }}>

        {/* Animated orb */}
        <div style={{ position: 'relative', width: 200, height: 200 }}>
          <div style={{ position: 'absolute', inset: 30, display: 'grid', placeItems: 'center' }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, var(--lav-100), var(--lav-200))', display: 'grid', placeItems: 'center', color: 'var(--lav-500)', animation: 'pulse-glow 2.4s ease-in-out infinite' }}>
              <Ico.Sparkle style={{ width: 44, height: 44 }}/>
            </div>
            <div style={{ position: 'absolute', inset: -10, borderRadius: '50%', border: '1.5px dashed var(--lav-200)', animation: 'spin-slow 14s linear infinite', opacity: 0.6 }}/>
            <div style={{ position: 'absolute', inset: -22, borderRadius: '50%', border: '1.5px solid var(--peach-200)', animation: 'spin-slow 22s linear infinite reverse', opacity: 0.4 }}/>
            <div style={{ position: 'absolute', inset: -34, borderRadius: '50%', border: '1.5px solid var(--lav-200)', animation: 'spin-slow 30s linear infinite', opacity: 0.25 }}/>
          </div>
          {/* Orbiting particles */}
          {[...Array(8)].map((_, i) => (
            <span key={i} style={{ position: 'absolute', left: '50%', top: '50%', width: 6, height: 6, borderRadius: '50%', background: 'var(--lav-400)', marginLeft: -3, marginTop: -3, animation: 'orbit 4s linear infinite', animationDelay: `${i * -0.5}s`, opacity: 0.7 }}/>
          ))}
        </div>

        <style>{`
          @keyframes orbit {
            from { transform: rotate(0deg) translateX(80px) rotate(0deg) scale(0.8); }
            50% { transform: rotate(180deg) translateX(80px) rotate(-180deg) scale(1.1); }
            to { transform: rotate(360deg) translateX(80px) rotate(-360deg) scale(0.8); }
          }
        `}</style>

        {/* Text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minHeight: 110 }}>
          <span className="muted" style={{ fontSize: 13 }}>{fromUpload ? 'From your file' : `Searching: "${topic}"`}</span>
          <h2 key={current.text} className="fade-up" style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: 700, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.15 }}>{current.text}</h2>
          <p key={current.sub} className="muted fade-up" style={{ fontSize: 14, margin: 0 }}>{current.sub}</p>
        </div>

        {/* Progress bar */}
        <div style={{ width: 240, height: 4, background: 'var(--ink-100)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--lav-400), var(--peach-400))', borderRadius: 999, width: `${progress * 100}%`, transition: 'width 0.2s linear' }}/>
        </div>

        {/* Step checklist */}
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
          {phases.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: i < phase ? 'var(--success)' : i === phase ? 'var(--lav-500)' : 'var(--ink-300)', transition: 'color 0.4s ease' }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', border: '1.5px solid currentColor', display: 'grid', placeItems: 'center', background: i < phase ? 'var(--success)' : 'transparent', borderColor: i < phase ? 'var(--success)' : 'currentColor', color: i < phase ? 'white' : 'currentColor' }}>
                {i < phase ? <Ico.Check/> : i === phase ? <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'currentColor', animation: 'pulse-glow 1.4s ease-in-out infinite' }}/> : null}
              </span>
              <span>{labels[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
