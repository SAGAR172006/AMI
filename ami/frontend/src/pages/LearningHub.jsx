import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Ico } from '../components/ui/Icons.jsx'
import { TopBar } from '../components/layout/TopBar.jsx'
import { PHOTO_CONTENT } from '../data/content.js'
import { api } from '../services/api.js'
import MockTestPillar from '../components/MockTestPillar.jsx'
import LanguagePicker, { getSavedVoiceLanguage } from '../components/voice/LanguagePicker.jsx'
import VoiceAnswerInput from '../components/voice/VoiceAnswerInput.jsx'
import ListenButton from '../components/voice/ListenButton.jsx'
import GnaniAudioPlayer from '../components/voice/GnaniAudioPlayer.jsx'

// ── Tab bar ──────────────────────────────────────────────────────────────────

function PillarTabs({ active, onChange, pillars }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${pillars.length}, 1fr)`, gap: 4, padding: '12px 16px', borderBottom: '1px solid var(--ink-100)', overflowX: 'auto' }}>
      {pillars.map(p => {
        const Icon = Ico[p.icon]
        const isActive = active === p.id
        return (
          <button key={p.id} onClick={() => onChange(p.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 12px', borderRadius: 999, fontSize: 12.5, fontWeight: isActive ? 600 : 500, color: isActive ? 'var(--ink-900)' : 'var(--ink-500)', border: `1.5px solid ${isActive ? p.color : 'transparent'}`, background: isActive ? 'var(--paper)' : 'transparent', transition: 'all 0.4s var(--ease-organic)', cursor: 'pointer' }}>
            <span style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', background: isActive ? `color-mix(in srgb, ${p.color} 14%, transparent)` : 'var(--cream-deep)', borderRadius: 10, color: p.color }}>
              <Icon style={{ width: 18, height: 18 }}/>
            </span>
            <span>{p.label}</span>
          </button>
        )
      })}
    </div>
  )
}

// ── PILLAR 1: Source ─────────────────────────────────────────────────────────
function SourcePillar({ source }) {
  const src = source || PHOTO_CONTENT.source
  const title = src.sourceTitle || src.title || 'Source material'
  const excerpt = src.sourceExcerpt || src.excerpt || ''
  const url = src.sourceUrl || null
  return (
    <div style={{ padding: '32px 48px 48px', maxWidth: 820, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="subject-chip"><Ico.Pdf style={{ width: 14, height: 14 }}/> Source</span>
        <span className="muted" style={{ fontSize: 13 }}>{title}</span>
        {url && <a href={url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--lav-500)', marginLeft: 'auto' }}>View source ↗</a>}
      </div>
      <p className="muted" style={{ fontSize: 14, marginTop: 16, marginBottom: 24 }}>Raw text gathered from the source — before AMI restructured it into your learning module.</p>
      <pre style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, lineHeight: 1.75, color: 'var(--ink-700)', whiteSpace: 'pre-wrap', wordWrap: 'break-word', background: 'var(--cream-deep)', padding: 24, borderRadius: 'var(--r-md)', borderLeft: '3px solid var(--peach-300)', margin: 0 }}>
        {excerpt}
      </pre>
    </div>
  )
}

// ── PILLAR 2: Immersive Text ──────────────────────────────────────────────────
function InlineQuiz({ q }) {
  const [pick, setPick] = useState(null)
  const [showHint, setShowHint] = useState(false)
  const correct = q.choices.find(c => c.correct)
  return (
    <div style={{ margin: '28px 0', padding: 22, background: 'var(--lav-50)', borderRadius: 'var(--r-md)', border: '1px solid var(--lav-100)' }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 15, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 14 }}>
        <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--lav-200)', color: 'var(--lav-500)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Ico.Hint/></span>
        <span dangerouslySetInnerHTML={{ __html: q.question.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }}/>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {q.choices.map(c => {
          const isPicked = pick === c.id
          const state = pick == null ? '' : isPicked ? (c.correct ? 'right' : 'wrong') : (c.correct ? 'right' : '')
          return (
            <button key={c.id} onClick={() => pick == null && setPick(c.id)} disabled={pick != null} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: state === 'right' ? 'rgba(79,176,122,0.08)' : state === 'wrong' ? 'rgba(226,106,92,0.08)' : 'var(--paper)', border: `1.5px solid ${state === 'right' ? 'var(--success)' : state === 'wrong' ? 'var(--error)' : 'transparent'}`, borderRadius: 999, fontSize: 14, color: 'var(--ink-700)', textAlign: 'left', cursor: pick != null ? 'default' : 'pointer', transition: 'all 0.3s var(--ease-organic)' }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: state === 'right' ? 'var(--success)' : state === 'wrong' ? 'var(--error)' : 'var(--cream-deep)', color: state ? 'white' : 'var(--ink-500)', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{c.id.toUpperCase()}</span>
              <span>{c.text}</span>
              {state === 'right' && <span style={{ marginLeft: 'auto', color: 'var(--success)' }}><Ico.Check/></span>}
              {state === 'wrong' && <span style={{ marginLeft: 'auto', color: 'var(--error)' }}><Ico.Close/></span>}
            </button>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 14, alignItems: 'center' }}>
        {pick == null ? (
          <button onClick={() => setShowHint(s => !s)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: 'var(--ink-500)', cursor: 'pointer' }}>
            <Ico.Hint/> {showHint ? 'Hide hint' : 'Show hint'}
          </button>
        ) : (
          <span style={{ fontSize: 13, fontWeight: 600, color: correct.id === pick ? 'var(--success)' : 'var(--error)' }}>
            {correct.id === pick ? '✓ Nice — that\'s right.' : `Not quite. The right answer is ${correct.id.toUpperCase()}.`}
          </span>
        )}
      </div>
      {showHint && <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--paper)', borderRadius: 'var(--r-md)', fontSize: 13, color: 'var(--ink-700)', borderLeft: '3px solid var(--lav-300)' }}>{q.hint}</div>}
    </div>
  )
}

function LeafCellDiagram() {
  return (
    <div style={{ background: 'var(--cream-deep)', borderRadius: 'var(--r-md)', padding: 16, margin: '16px 0', border: '1px solid var(--ink-100)' }}>
      <svg viewBox="0 0 400 200" style={{ width: '100%', height: 'auto' }}>
        <defs><radialGradient id="leafG" cx="0.5" cy="0.5"><stop offset="0" stopColor="#8FCB94"/><stop offset="1" stopColor="#5BA85F"/></radialGradient></defs>
        <ellipse cx="100" cy="100" rx="80" ry="60" fill="url(#leafG)" opacity="0.85"/>
        <ellipse cx="80" cy="90" rx="14" ry="20" fill="#3E7E42" opacity="0.8"/>
        <ellipse cx="120" cy="110" rx="14" ry="20" fill="#3E7E42" opacity="0.7"/>
        <text x="100" y="180" textAnchor="middle" fontSize="11" fill="#2D2D2D" fontWeight="600">Leaf cell</text>
        <path d="M 200 100 Q 240 80 280 100" stroke="#FFB085" strokeWidth="2.5" fill="none" markerEnd="url(#arr)"/>
        <defs><marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#FFB085"/></marker></defs>
        <ellipse cx="320" cy="100" rx="55" ry="40" fill="#7AAB7E" stroke="#3E7E42" strokeWidth="2"/>
        {[0,1,2,3].map(i => <ellipse key={i} cx={300 + i*10} cy={90 + (i%2)*16} rx="6" ry="3" fill="#3E7E42"/>)}
        <text x="320" y="180" textAnchor="middle" fontSize="11" fill="#2D2D2D" fontWeight="600">Chloroplast</text>
      </svg>
    </div>
  )
}

function CalvinDiagram() {
  return (
    <div style={{ background: 'var(--cream-deep)', borderRadius: 'var(--r-md)', padding: 16, margin: '16px 0', border: '1px solid var(--ink-100)' }}>
      <h4 style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 15, fontWeight: 700 }}>The Calvin Cycle</h4>
      <svg viewBox="0 0 360 220" style={{ width: '100%', height: 'auto' }}>
        <circle cx="180" cy="110" r="68" fill="none" stroke="#FFB085" strokeWidth="2" strokeDasharray="4 4"/>
        <g><circle cx="180" cy="42" r="26" fill="#FFCBA4"/><text x="180" y="40" textAnchor="middle" fontSize="10" fontWeight="700" fill="#1A1A1A">Fixation</text><text x="180" y="52" textAnchor="middle" fontSize="8" fill="#5A5A5A">CO₂ + RuBP</text></g>
        <g><circle cx="248" cy="148" r="26" fill="#E6E6FA"/><text x="248" y="146" textAnchor="middle" fontSize="10" fontWeight="700" fill="#1A1A1A">Reduction</text><text x="248" y="158" textAnchor="middle" fontSize="8" fill="#5A5A5A">ATP + NADPH</text></g>
        <g><circle cx="112" cy="148" r="26" fill="#A8D4A4"/><text x="112" y="146" textAnchor="middle" fontSize="10" fontWeight="700" fill="#1A1A1A">Regen.</text><text x="112" y="158" textAnchor="middle" fontSize="8" fill="#5A5A5A">RuBP rebuilt</text></g>
        <text x="40" y="50" fontSize="11" fontWeight="700" fill="#5A5A5A">CO₂</text>
        <path d="M 60 48 Q 110 30 154 36" stroke="#5A5A5A" strokeWidth="1.5" fill="none" markerEnd="url(#arr2)"/>
        <text x="290" y="210" fontSize="11" fontWeight="700" fill="#3E7E42">G3P → glucose</text>
        <defs>
          <marker id="arr2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#5A5A5A"/></marker>
        </defs>
      </svg>
    </div>
  )
}

// ── Completion Toast ──────────────────────────────────────────────────────────
function CompletionToast({ onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4200)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className="fade-up" style={{
      position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)',
      zIndex: 300,
      background: 'linear-gradient(135deg, var(--success), #2eab6e)',
      color: 'white',
      padding: '16px 28px',
      borderRadius: 999,
      boxShadow: '0 8px 32px rgba(79,176,122,0.35)',
      display: 'flex', alignItems: 'center', gap: 14,
      fontSize: 15, fontWeight: 700,
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: 22 }}>🏆</span>
      <span>Topic complete! You've mastered this module.</span>
    </div>
  )
}

// ── Roadmap sidebar ───────────────────────────────────────────────────────────
function RoadmapSidebar({ sections, sectionStatus, currentSection, onSelectSection }) {
  const total = sections.length
  const doneCount = sectionStatus.filter(s => s === 'done').length
  const pct = total > 0 ? (doneCount / total) * 100 : 0

  return (
    <aside style={{ position: 'sticky', top: 24, alignSelf: 'start', display: 'flex', flexDirection: 'column', gap: 0, minWidth: 200 }}>
      {/* Overall bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
          <span>Progress</span>
          <span>{Math.round(pct)}%</span>
        </div>
        <div style={{ height: 6, background: 'var(--ink-100)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, var(--peach-300), var(--success))', borderRadius: 999, transition: 'width 0.6s var(--ease-organic)' }}/>
        </div>
      </div>

      {/* Vertical roadmap */}
      <div style={{ position: 'relative', paddingLeft: 20 }}>
        {/* Vertical track line */}
        <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 2, background: 'var(--ink-100)', borderRadius: 999 }}/>
        {/* Filled portion */}
        <div style={{ position: 'absolute', left: 7, top: 8, width: 2, height: `${pct}%`, background: 'linear-gradient(to bottom, var(--peach-300), var(--success))', borderRadius: 999, transition: 'height 0.6s var(--ease-organic)' }}/>

        {sections.map((t, i) => {
          const status = sectionStatus[i] // 'done' | 'current' | 'locked'
          const isCurrent = i === currentSection
          const isDone = status === 'done'
          return (
            <div
              key={t.id || i}
              onClick={() => onSelectSection?.(i)}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                marginBottom: i < sections.length - 1 ? 20 : 0,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              title={`Jump to ${t.title}`}
            >
              {/* Node dot */}
              <div style={{
                position: 'absolute', left: -20, top: 3,
                width: 16, height: 16, borderRadius: '50%',
                background: isDone ? 'var(--success)' : isCurrent ? 'var(--peach-400)' : 'var(--paper)',
                border: `2px solid ${isDone ? 'var(--success)' : isCurrent ? 'var(--peach-400)' : 'var(--ink-200)'}`,
                display: 'grid', placeItems: 'center', color: 'white',
                boxShadow: isCurrent ? '0 0 0 4px rgba(255,148,102,0.2)' : 'none',
                transition: 'all 0.4s var(--ease-organic)',
                zIndex: 1,
              }}>
                {isDone && <Ico.Check style={{ width: 9, height: 9 }}/>}
                {isCurrent && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'white', animation: 'pulse-glow 1.4s ease-in-out infinite', display: 'block' }}/>}
              </div>
              {/* Label */}
              <div style={{
                fontSize: 12.5,
                lineHeight: 1.35,
                color: isCurrent ? 'var(--ink-900)' : isDone ? 'var(--success)' : 'var(--ink-600)',
                fontWeight: isCurrent || isDone ? 600 : 500,
                padding: '3px 10px',
                borderRadius: 999,
                background: isCurrent ? 'var(--peach-50)' : 'transparent',
                transition: 'all 0.2s',
              }}>
                {t.title}
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}

// ── Interactive InlineQuiz that reports result up ─────────────────────────────
function InlineQuizTracked({ q, onCorrect, onWrong, resetKey }) {
  const [pick, setPick] = useState(null)
  const correct = q.choices.find(c => c.correct)
  const [showHint, setShowHint] = useState(false)

  // When parent resets all quizzes, resetKey changes → clear local state
  useEffect(() => {
    setPick(null)
    setShowHint(false)
  }, [resetKey])

  const handlePick = (id) => {
    if (pick != null) return
    setPick(id)
    if (id === correct.id) onCorrect?.()
    else onWrong?.()
  }

  return (
    <div style={{ margin: '28px 0', padding: 22, background: 'var(--lav-50)', borderRadius: 'var(--r-md)', border: '1px solid var(--lav-100)' }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 15, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 14 }}>
        <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--lav-200)', color: 'var(--lav-500)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Ico.Hint/></span>
        <span dangerouslySetInnerHTML={{ __html: q.question.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }}/>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {q.choices.map(c => {
          const isPicked = pick === c.id
          const state = pick == null ? '' : isPicked ? (c.correct ? 'right' : 'wrong') : (c.correct ? 'right' : '')
          return (
            <button key={c.id} onClick={() => handlePick(c.id)} disabled={pick != null} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: state === 'right' ? 'rgba(79,176,122,0.08)' : state === 'wrong' ? 'rgba(226,106,92,0.08)' : 'var(--paper)', border: `1.5px solid ${state === 'right' ? 'var(--success)' : state === 'wrong' ? 'var(--error)' : 'transparent'}`, borderRadius: 999, fontSize: 14, color: 'var(--ink-700)', textAlign: 'left', cursor: pick != null ? 'default' : 'pointer', transition: 'all 0.3s var(--ease-organic)' }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: state === 'right' ? 'var(--success)' : state === 'wrong' ? 'var(--error)' : 'var(--cream-deep)', color: state ? 'white' : 'var(--ink-500)', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{c.id.toUpperCase()}</span>
              <span>{c.text}</span>
              {state === 'right' && <span style={{ marginLeft: 'auto', color: 'var(--success)' }}><Ico.Check/></span>}
              {state === 'wrong' && <span style={{ marginLeft: 'auto', color: 'var(--error)' }}><Ico.Close/></span>}
            </button>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 14, alignItems: 'center' }}>
        {pick == null ? (
          <button onClick={() => setShowHint(s => !s)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: 'var(--ink-500)', cursor: 'pointer' }}>
            <Ico.Hint/> {showHint ? 'Hide hint' : 'Show hint'}
          </button>
        ) : (
          <span style={{ fontSize: 13, fontWeight: 600, color: correct.id === pick ? 'var(--success)' : 'var(--error)' }}>
            {correct.id === pick ? '✓ That\'s right!' : `Not quite. Correct answer: ${correct.id.toUpperCase()}.`}
          </span>
        )}
      </div>
      {showHint && <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--paper)', borderRadius: 'var(--r-md)', fontSize: 13, color: 'var(--ink-700)', borderLeft: '3px solid var(--lav-300)' }}>{q.hint}</div>}
    </div>
  )
}

function ImmersivePillar({ textContent, moduleId }) {
  const c = textContent || PHOTO_CONTENT
  const tocSections = c.toc || []
  const total = tocSections.length

  if (total === 0) {
    return (
      <div style={{ padding: '80px 48px', textAlign: 'center', color: 'var(--ink-600)' }}>
        <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 8 }}>Study Guide Generating...</p>
        <p style={{ fontSize: 13.5, opacity: 0.8, maxWidth: 460, margin: '0 auto' }}>
          We are currently preparing the interactive text materials for your custom syllabus. Check back here in a few moments, or explore your custom questions in the <strong>Mock Test</strong> tab!
        </p>
      </div>
    );
  }

  // Find first undone section for initial render (demo starts at s3, custom starts at s1)
  const initialSectionIdx = tocSections.findIndex(s => !s.done);
  const [currentSection, setCurrentSection] = useState(initialSectionIdx >= 0 ? initialSectionIdx : 0)

  // Track quiz results per section: null | 'correct' | 'wrong'
  const [quizResults, setQuizResults] = useState(() => Array(total).fill(null))
  const [showToast, setShowToast] = useState(false)
  // Flag set when a wrong answer is given — shows the reset banner
  const [hasFailed, setHasFailed] = useState(false)
  // Bumped on every reset to signal InlineQuizTracked to clear its local state
  const [quizResetKey, setQuizResetKey] = useState(0)

  // Determine section status for roadmap
  const sectionStatus = tocSections.map((_, i) => {
    if (i < currentSection) return 'done'
    if (i === currentSection) return 'current'
    return 'locked'
  })

  // Check if topic is complete
  const isComplete = currentSection >= total

  const handleCorrect = () => {
    setHasFailed(false)
    const next = currentSection + 1
    setCurrentSection(next)
    setQuizResults(prev => { const r = [...prev]; r[currentSection] = 'correct'; return r })
    if (next >= total) {
      setTimeout(() => setShowToast(true), 400)
    }
  }

  const handleWrong = () => {
    // Just flag the failure — let the user see what went wrong before resetting
    setQuizResults(prev => { const r = [...prev]; r[currentSection] = 'wrong'; return r })
    setHasFailed(true)
  }

  const handleReset = () => {
    setQuizResults(Array(total).fill(null))
    const freshIdx = tocSections.findIndex(s => !s.done);
    setCurrentSection(freshIdx >= 0 ? freshIdx : 0)
    setHasFailed(false)
    setQuizResetKey(k => k + 1) // signals every InlineQuizTracked to clear its pick
  }

  const renderProse = (body) => body.split('\n\n').map((p, i) => (
    <p key={i} style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--ink-700)', margin: '12px 0' }} dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }}/>
  ))

  const currentLabel = tocSections[currentSection]?.title || 'Complete'

  return (
    <>
      {showToast && <CompletionToast onClose={() => setShowToast(false)}/>}
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 32, padding: '28px 36px 48px', maxWidth: 1100, margin: '0 auto' }}>
        <RoadmapSidebar
          sections={tocSections}
          sectionStatus={sectionStatus}
          currentSection={Math.min(currentSection, total - 1)}
          onSelectSection={(idx) => {
            setCurrentSection(idx);
            setHasFailed(false);
          }}
        />
        <article>
          {isComplete ? (
            <div className="fade-in" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🏆</div>
              <h2 className="h2" style={{ marginBottom: 8 }}>Section complete!</h2>
              <p className="muted" style={{ fontSize: 16, marginBottom: 24 }}>You've worked through all sections of {c.title}. Explore the other learning formats above.</p>
              <button className="pill pill-primary" onClick={handleReset}>
                <Ico.ArrowLeft/> Start over
              </button>
            </div>
          ) : (
            <>
              {/* Section Header with forward/backward navigation */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <button
                  className="icon-btn"
                  onClick={() => currentSection > 0 && setCurrentSection(s => s - 1)}
                  disabled={currentSection === 0}
                  style={{ opacity: currentSection === 0 ? 0.3 : 1, cursor: currentSection === 0 ? 'not-allowed' : 'pointer' }}
                  title="Previous Section"
                >
                  <Ico.ArrowLeft/>
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="muted" style={{ fontSize: 13, fontWeight: 600 }}>Section {currentSection + 1} of {total}</span>
                  <span style={{ fontSize: 11, background: 'var(--peach-50)', color: 'var(--peach-600)', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
                    {tocSections[currentSection]?.title}
                  </span>
                </div>
                <button
                  className="icon-btn"
                  onClick={() => currentSection < total - 1 && setCurrentSection(s => s + 1)}
                  disabled={currentSection >= total - 1}
                  style={{ opacity: currentSection >= total - 1 ? 0.3 : 1, cursor: currentSection >= total - 1 ? 'not-allowed' : 'pointer' }}
                  title="Next Section"
                >
                  <Ico.ArrowRight/>
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <h2 className="h2" style={{ margin: 0 }}>{currentLabel}</h2>
                <ListenButton
                  text={
                    currentLabel + '. ' +
                    c.sections
                      .filter(s => {
                        const activeTocId = tocSections[currentSection]?.id;
                        if (!activeTocId) return true;
                        if (s.id?.startsWith(activeTocId)) return true;
                        const match = s.id?.match(/^[pq](\d+)/);
                        if (match && parseInt(match[1], 10) === currentSection + 1) return true;
                        return false;
                      })
                      .map(s => s.body || s.heading || '')
                      .join('. ')
                  }
                  label="Listen Section"
                  compact
                />
              </div>

              {c.sections.map(s => {
                const activeTocId = tocSections[currentSection]?.id;

                // Show objectives block only on the first section (Section 1)
                if (s.kind === 'objectives') {
                  if (currentSection !== 0) return null;
                  return (
                    <div key={s.id} style={{ background: 'var(--cream-deep)', borderRadius: 'var(--r-md)', padding: '18px 22px', borderLeft: '3px solid var(--peach-300)', marginBottom: 24 }}>
                      <h3 className="h3" style={{ marginBottom: 8 }}>{s.heading}</h3>
                      <p className="muted" style={{ fontSize: 14, marginTop: 0 }}>By the end of this section, you should be able to:</p>
                      <ul style={{ margin: '8px 0 0', paddingLeft: 20, fontSize: 14, lineHeight: 1.7, color: 'var(--ink-700)' }}>{s.items.map((it, i) => <li key={i}>{it}</li>)}</ul>
                    </div>
                  );
                }

                // Filter out sections that do not belong to the current active TOC section
                const matchesId = activeTocId && s.id?.startsWith(activeTocId);
                const numMatch = s.id?.match(/^[pq](\d+)/);
                const matchesNum = numMatch && (parseInt(numMatch[1], 10) === currentSection + 1);

                if (!matchesId && !matchesNum && activeTocId) return null;

                if (s.kind === 'prose') return (
                  <section key={s.id} style={{ marginBottom: 24 }}>
                    {s.heading && <h3 className="h3" style={{ marginTop: 16 }}>{s.heading}</h3>}
                    {renderProse(s.body)}
                  </section>
                )
                if (s.kind === 'inline-quiz') return (
                  <InlineQuizTracked
                    key={s.id}
                    q={s}
                    onCorrect={handleCorrect}
                    onWrong={handleWrong}
                    resetKey={quizResetKey}
                  />
                )
                return null
              })}

              {/* ── Wrong-answer reset banner ── */}
              {hasFailed ? (
                <div className="fade-in" style={{ marginTop: 24, padding: '18px 20px', background: 'rgba(226,106,92,0.06)', borderRadius: 'var(--r-md)', border: '1.5px solid var(--error)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 20, lineHeight: 1 }}>😬</span>
                    <div>
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--ink-900)' }}>Not quite right.</p>
                      <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--ink-600)', lineHeight: 1.5 }}>
                        Review the section above, then try the quiz again or explore other sections using the navigation arrows.
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={handleReset}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 999, background: 'var(--error)', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'opacity 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      ↺ Retry quiz
                    </button>
                    {currentSection < total - 1 && (
                      <button
                        onClick={() => { setHasFailed(false); setCurrentSection(s => s + 1); }}
                        className="pill"
                        style={{ padding: '8px 16px', fontSize: 13.5, fontWeight: 600 }}
                      >
                        Skip to next section →
                      </button>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Bottom Section Navigator Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--ink-100)', flexWrap: 'wrap', gap: 12 }}>
                <button
                  type="button"
                  className="pill"
                  onClick={() => currentSection > 0 && setCurrentSection(s => s - 1)}
                  disabled={currentSection === 0}
                  style={{
                    padding: '8px 16px',
                    fontSize: 13,
                    fontWeight: 600,
                    opacity: currentSection === 0 ? 0.35 : 1,
                    cursor: currentSection === 0 ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Ico.ArrowLeft style={{ width: 14, height: 14 }}/> Previous Section
                </button>

                {currentSection < total - 1 ? (
                  <button
                    type="button"
                    className="pill pill-primary"
                    onClick={() => {
                      setHasFailed(false);
                      setCurrentSection(s => s + 1);
                    }}
                    style={{
                      padding: '8px 20px',
                      fontSize: 13.5,
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    Next Section: {tocSections[currentSection + 1]?.title} <Ico.ArrowRight style={{ width: 14, height: 14 }}/>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="pill pill-primary"
                    onClick={() => setShowToast(true)}
                    style={{
                      padding: '8px 20px',
                      fontSize: 13.5,
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    🏆 Topic Mastered!
                  </button>
                )}
              </div>
            </>
          )}
        </article>
      </div>
    </>
  )
}

// ── PILLAR 3: Slides ─────────────────────────────────────────────────────────
function SlideRender({ slide }) {
  if (slide.kind === 'cover') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', alignItems: 'flex-start', justifyContent: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, var(--peach-200), var(--peach-300))', display: 'grid', placeItems: 'center', color: 'white', marginBottom: 16 }}>
        <Ico.Leaf style={{ width: 28, height: 28 }}/>
      </div>
      <h1 style={{ fontSize: 56, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--peach-500)', margin: 0 }}>{slide.title}</h1>
      <p style={{ fontSize: 22, color: 'var(--ink-700)', fontWeight: 500, margin: 0 }}>{slide.subtitle}</p>
    </div>
  )
  if (slide.kind === 'equation') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
      <h2 className="h2" style={{ color: 'var(--peach-500)' }}>{slide.title}</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 'clamp(22px,3vw,36px)', fontWeight: 700, color: 'var(--ink-900)', alignItems: 'center', marginTop: 24, letterSpacing: '-0.02em' }}>
        <span>6 CO<sub>2</sub></span><span style={{ color: 'var(--ink-300)' }}>+</span>
        <span>6 H<sub>2</sub>O</span><span style={{ color: 'var(--ink-300)' }}>+</span>
        <span style={{ color: 'var(--peach-500)' }}>☀ light</span><span style={{ color: 'var(--peach-500)' }}>→</span>
        <span style={{ color: 'var(--success)' }}>C<sub>6</sub>H<sub>12</sub>O<sub>6</sub></span><span style={{ color: 'var(--ink-300)' }}>+</span>
        <span>6 O<sub>2</sub></span>
      </div>
    </div>
  )
  if (slide.kind === 'split') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
      <h2 className="h2">{slide.title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
        {[{ label: 'Stage 1', title: 'Light Reactions', body: 'Capture sunlight in the thylakoid; produce ATP + NADPH + O₂.', color: 'var(--peach-300)' }, { label: 'Stage 2', title: 'Calvin Cycle', body: 'Use ATP + NADPH in the stroma to fix CO₂ into glucose.', color: 'var(--lav-300)' }].map(card => (
          <div key={card.label} style={{ padding: 20, background: 'var(--paper)', borderRadius: 'var(--r-md)', border: `1.5px solid ${card.color}`, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span className="subject-chip">{card.label}</span>
            <h3 className="h3" style={{ marginTop: 8 }}>{card.title}</h3>
            <p className="muted" style={{ fontSize: 14, margin: 0 }}>{card.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
  if (slide.kind === 'stat') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ fontSize: 'clamp(80px,14vw,160px)', fontWeight: 800, letterSpacing: '-0.05em', color: 'var(--peach-500)', lineHeight: 0.9 }}>
        ~120<span style={{ fontSize: '0.4em', color: 'var(--ink-700)', marginLeft: 8 }}>Gt</span>
      </div>
      <p style={{ fontSize: 20, fontWeight: 600, maxWidth: 520, letterSpacing: '-0.015em', margin: '8px 0' }}>Carbon removed from the atmosphere by photosynthetic life every year.</p>
    </div>
  )
  return null
}

function SlidesPillar({ slides }) {
  const allSlides = (slides && slides.length > 0) ? slides : PHOTO_CONTENT.slides
  const [idx, setIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  useEffect(() => {
    if (!playing) return
    const t = setTimeout(() => { if (idx < allSlides.length - 1) setIdx(idx + 1); else setPlaying(false) }, 4000)
    return () => clearTimeout(t)
  }, [playing, idx])
  const currentSlide = allSlides[idx] || allSlides[0]
  return (
    <div style={{ padding: '28px 36px 40px', maxWidth: 960, margin: '0 auto' }}>
      <div>
        <div key={idx} style={{ aspectRatio: '16/9', background: 'linear-gradient(135deg, var(--cream), var(--peach-50))', borderRadius: 'var(--r-lg)', border: '1px solid var(--ink-100)', padding: '48px 56px', overflow: 'hidden', animation: 'slide-in-right 0.6s var(--ease-organic)', position: 'relative' }}>
          {/* Background image if available */}
          {currentSlide.imageUrl && currentSlide.kind !== 'cover' && (
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${currentSlide.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.08, borderRadius: 'var(--r-lg)' }}/>
          )}
          <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
            <SlideRender slide={currentSlide}/>
          </div>
        </div>
        {/* Narration bar */}
        {currentSlide.narration && (
          <div style={{ marginTop: 12, padding: '10px 16px', background: 'var(--lav-50)', borderRadius: 'var(--r-md)', fontSize: 13, color: 'var(--ink-700)', border: '1px solid var(--lav-100)', display: 'flex', gap: 8, alignItems: 'center' }}>
            <Ico.Audio style={{ color: 'var(--lav-500)', width: 14, height: 14, flexShrink: 0 }}/>
            <span>{currentSlide.narration}</span>
          </div>
        )}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 12 }}>
          {allSlides.map((_, i) => <button key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? 24 : 8, height: 8, borderRadius: 999, background: i === idx ? 'var(--peach-400)' : 'var(--ink-200)', transition: 'all 0.3s var(--ease-organic)', cursor: 'pointer' }}/>)}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'var(--paper)', borderRadius: 999, marginTop: 16, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--ink-100)' }}>
        <button onClick={() => setPlaying(p => !p)} style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--ink-900)', color: 'var(--cream)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
          {playing ? <Ico.Pause/> : <Ico.Play/>}
        </button>
        <span style={{ fontSize: 12, color: 'var(--ink-500)', minWidth: 32 }}>{idx + 1} / {allSlides.length}</span>
        <div style={{ flex: 1, height: 4, background: 'var(--ink-100)', borderRadius: 999, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: '0 auto 0 0', width: `${((idx + 1) / allSlides.length) * 100}%`, background: 'linear-gradient(90deg, var(--peach-300), var(--peach-400))', borderRadius: 999, transition: 'width 0.5s var(--ease-organic)' }}/>
        </div>
        <button className="icon-btn" onClick={() => setIdx(Math.max(0, idx - 1))}><Ico.ArrowLeft/></button>
        <button className="icon-btn" onClick={() => setIdx(Math.min(allSlides.length - 1, idx + 1))}><Ico.ArrowRight/></button>
      </div>
    </div>
  )
}

// ── PILLAR 4: Audio (Powered by Gnani Timbre v2.5 Voice Agent) ───────────────
function AudioPillar({ audioContent, user }) {
  const [voiceLang, setVoiceLang] = useState(getSavedVoiceLanguage)

  const title = audioContent?.title || 'Audio Lesson'
  const script = audioContent?.script || ''
  const rawChapters = audioContent?.chapters || []

  const chapters = useMemo(() => {
    if (rawChapters.length > 0 && rawChapters[0].text) {
      return rawChapters
    }
    if (!script) {
      return [{ title: title || 'Lesson Overview', text: 'Welcome to this audio lesson powered by Gnani Timbre.' }]
    }
    const parts = script.split(/\[CHAPTER:\s*(.+?)\]/g)
    const segs = []
    for (let i = 1; i < parts.length; i += 2) {
      segs.push({ title: parts[i].trim(), text: (parts[i + 1] || '').replace(/\s+/g, ' ').trim() })
    }
    return segs.length > 0 ? segs : [{ title: title || 'Audio Lesson', text: script.replace(/\[CHAPTER:[^\]]+\]/g, ' ').trim() }]
  }, [script, rawChapters, title])

  return (
    <div style={{ padding: '28px 36px 48px', maxWidth: 760, margin: '0 auto' }}>
      <GnaniAudioPlayer
        title={title}
        chapters={chapters}
        selectedLanguage={voiceLang}
        onLanguageChange={setVoiceLang}
        user={user}
      />
    </div>
  )
}

// ── PILLAR 5: Mindmap (fluid animated redesign) ───────────────────────────────
const MINDMAP_STYLE = `
  @keyframes mmNodeIn {
    0%   { opacity: 0; transform: translate(var(--nx), var(--ny)) scale(0.4); }
    60%  { transform: translate(var(--nx), var(--ny)) scale(1.08); }
    100% { opacity: 1; transform: translate(var(--nx), var(--ny)) scale(1); }
  }
  @keyframes mmEdgeDraw {
    from { stroke-dashoffset: var(--edge-len); }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes mmRootPulse {
    0%, 100% { box-shadow: 0 0 0 0px rgba(255,148,102,0.35), var(--shadow-lg); }
    50%      { box-shadow: 0 0 0 10px rgba(255,148,102,0), var(--shadow-lg); }
  }
  .mm-node { animation: mmNodeIn 0.55s cubic-bezier(0.34,1.56,0.64,1) both; }
  .mm-root { animation: mmNodeIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both, mmRootPulse 2.4s ease-in-out 0.6s infinite; }
  .mm-edge { animation: mmEdgeDraw 0.6s ease-out both; }
  .mm-node:hover { filter: brightness(1.08); transform: translate(var(--nx), var(--ny)) scale(1.08) !important; transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), filter 0.2s; z-index: 10; }
`

// Palette: one colour per branch from root
const BRANCH_PALETTE = [
  { bg: '#FFE4D6', border: '#FF9466', text: '#C45A1E' },
  { bg: '#E8E4FF', border: '#8C8AD6', text: '#5248A8' },
  { bg: '#D6F0E2', border: '#5BAE7E', text: '#2E7A52' },
  { bg: '#FFF0D6', border: '#D4A044', text: '#8A6010' },
  { bg: '#D6EEFF', border: '#5A9ECC', text: '#1A5E8A' },
  { bg: '#FFD6F0', border: '#CC5A9E', text: '#8A1A5E' },
]

function getBranchColor(node, allNodes) {
  if (!node || node.id === 'root') return { bg: '#FF9466', border: '#FF9466', text: 'white' }
  // Walk up to find the direct child of root
  let cur = node
  while (cur.parent && cur.parent !== 'root') {
    const parent = allNodes.find(n => n.id === cur.parent)
    if (!parent) break
    cur = parent
  }
  // Hash the branch id to a palette index
  const idx = Math.abs(cur.id.split('').reduce((acc, c) => acc * 31 + c.charCodeAt(0), 0)) % BRANCH_PALETTE.length
  return BRANCH_PALETTE[idx]
}

function getPathLength(x1, y1, x2, y2) {
  // approximate cubic bezier length
  const cx = x1 + (x2 - x1) * 0.5
  return Math.sqrt((x2-x1)**2 + (y2-y1)**2) * 1.2
}

function MindmapPillar({ mindmap }) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [collapsed, setCollapsed] = useState({})
  const [active, setActive] = useState('root')
  const [hoveredBranch, setHoveredBranch] = useState(null)
  const dragRef = useRef(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60)
    return () => clearTimeout(t)
  }, [])

  // Support both flat array (new) and old {root, nodes} format
  const allNodes = useMemo(() => {
    if (Array.isArray(mindmap)) return mindmap
    if (mindmap) return [mindmap.root, ...(mindmap.nodes || [])]
    return [PHOTO_CONTENT.mindmap.root, ...PHOTO_CONTENT.mindmap.nodes]
  }, [mindmap])

  const visible = useMemo(() => allNodes.filter(n => {
    let p = n.parent
    while (p) {
      if (collapsed[p]) return false
      const pn = allNodes.find(x => x.id === p)
      p = pn?.parent
    }
    return true
  }), [allNodes, collapsed])

  // Find which root-branch a node belongs to
  const getBranch = useCallback((nodeId) => {
    let cur = allNodes.find(n => n.id === nodeId)
    while (cur && cur.parent && cur.parent !== 'root') {
      cur = allNodes.find(n => n.id === cur.parent)
    }
    return cur?.id
  }, [allNodes])

  const isInHoveredBranch = (nodeId) => {
    if (!hoveredBranch) return false
    let cur = allNodes.find(n => n.id === nodeId)
    while (cur) {
      if (cur.id === hoveredBranch) return true
      if (!cur.parent) break
      cur = allNodes.find(n => n.id === cur.parent)
    }
    return false
  }

  const onMouseDown = (e) => { dragRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y } }
  const onMouseMove = (e) => {
    if (!dragRef.current) return
    setPan({ x: dragRef.current.panX + (e.clientX - dragRef.current.x), y: dragRef.current.panY + (e.clientY - dragRef.current.y) })
  }
  const onMouseUp = () => { dragRef.current = null }
  const hasChildren = (id) => allNodes.some(n => n.parent === id)

  // Assign stagger delay per node based on depth
  const nodeDepth = useCallback((nodeId) => {
    let depth = 0; let cur = allNodes.find(n => n.id === nodeId)
    while (cur?.parent) { depth++; cur = allNodes.find(n => n.id === cur.parent) }
    return depth
  }, [allNodes])

  return (
    <>
      <style>{MINDMAP_STYLE}</style>
      <div
        style={{ height: 660, position: 'relative', overflow: 'hidden', cursor: dragRef.current ? 'grabbing' : 'grab', userSelect: 'none', background: 'var(--cream)' }}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
      >
        {/* Dot-grid background */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, var(--ink-150, #ddd) 1px, transparent 1px)', backgroundSize: '28px 28px', opacity: 0.45, pointerEvents: 'none' }}/>

        {/* Canvas */}
        <div style={{ position: 'absolute', left: 0, top: 0, transform: `translate(calc(50% + ${pan.x}px), calc(50% + ${pan.y}px)) scale(${zoom})`, transformOrigin: '0 0' }}>

          {/* SVG edges */}
          <svg style={{ position: 'absolute', left: -700, top: -500, pointerEvents: 'none', overflow: 'visible' }} width="1400" height="1000" viewBox="-700 -500 1400 1000">
            {mounted && visible.filter(n => n.parent).map((n, i) => {
              const parent = allNodes.find(p => p.id === n.parent)
              if (!parent || !visible.includes(parent)) return null
              const dx = n.x - parent.x
              const cx = parent.x + dx * 0.5
              const isActive = active === n.id || active === n.parent
              const isHovered = isInHoveredBranch(n.id)
              const col = getBranchColor(n, allNodes)
              const pathLen = getPathLength(parent.x, parent.y, n.x, n.y)
              const depth = nodeDepth(n.id)
              const delay = (depth * 0.12 + i * 0.03).toFixed(2)
              return (
                <path
                  key={n.id}
                  className="mm-edge"
                  d={`M ${parent.x} ${parent.y} C ${cx} ${parent.y}, ${cx} ${n.y}, ${n.x} ${n.y}`}
                  stroke={isActive || isHovered ? col.border : 'var(--ink-150, #ddd)'}
                  strokeWidth={isActive ? 2.5 : isHovered ? 2 : 1.5}
                  fill="none"
                  opacity={isActive || isHovered ? 1 : 0.55}
                  style={{
                    '--edge-len': pathLen,
                    strokeDasharray: pathLen,
                    animationDelay: delay + 's',
                    transition: 'stroke 0.3s, stroke-width 0.3s, opacity 0.3s',
                  }}
                />
              )
            })}
          </svg>

          {/* Nodes */}
          {mounted && visible.map((n, i) => {
            const isRoot = n.id === 'root'
            const col = getBranchColor(n, allNodes)
            const isActive = active === n.id
            const isHovered = isInHoveredBranch(n.id)
            const depth = nodeDepth(n.id)
            const delay = (depth * 0.12 + i * 0.03).toFixed(2)
            const branch = getBranch(n.id)
            return (
              <div
                key={n.id}
                className={isRoot ? 'mm-root' : 'mm-node'}
                onClick={(e) => { e.stopPropagation(); setActive(n.id) }}
                onMouseEnter={() => !isRoot && setHoveredBranch(branch)}
                onMouseLeave={() => setHoveredBranch(null)}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  '--nx': n.x + 'px',
                  '--ny': n.y + 'px',
                  transform: `translate(${n.x}px, ${n.y}px)`,
                  padding: isRoot ? '14px 26px' : depth >= 2 ? '6px 12px' : '9px 17px',
                  background: isRoot
                    ? 'linear-gradient(135deg, var(--peach-300), var(--peach-400))'
                    : isActive ? col.border : col.bg,
                  border: isRoot ? 'none' : `2px solid ${col.border}`,
                  borderRadius: 999,
                  fontSize: isRoot ? 15 : depth >= 2 ? 11.5 : 13,
                  fontWeight: isRoot ? 800 : 600,
                  color: isRoot ? 'white' : isActive ? 'white' : col.text,
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: isActive
                    ? `0 0 0 4px ${col.border}33, 0 4px 16px ${col.border}44`
                    : isHovered
                    ? `0 0 0 2px ${col.border}44, 0 2px 8px ${col.border}22`
                    : '0 1px 4px rgba(0,0,0,0.08)',
                  translate: '-50% -50%',
                  cursor: 'pointer',
                  zIndex: isRoot ? 5 : isActive ? 4 : 1,
                  animationDelay: delay + 's',
                  transition: 'background 0.25s, color 0.25s, box-shadow 0.25s',
                }}
              >
                {isRoot && <span style={{ fontSize: 16, marginRight: 2 }}>🧠</span>}
                <span>{n.label}</span>
                {hasChildren(n.id) && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setCollapsed(c => ({ ...c, [n.id]: !c[n.id] })) }}
                    style={{ width: 16, height: 16, borderRadius: '50%', background: isRoot ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.7)', color: isActive ? col.border : col.text, display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 10, flexShrink: 0, border: 'none' }}
                  >
                    {collapsed[n.id] ? '+' : '−'}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Zoom controls */}
        <div style={{ position: 'absolute', left: 20, bottom: 20, display: 'flex', flexDirection: 'column', gap: 6, zIndex: 10 }}>
          <button className="icon-btn" onClick={() => setZoom(z => Math.min(2.5, z + 0.2))} title="Zoom in"><Ico.Plus/></button>
          <button className="icon-btn" onClick={() => setZoom(z => Math.max(0.3, z - 0.2))} title="Zoom out"><Ico.Minus/></button>
          <button className="icon-btn" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }} title="Reset view"><Ico.Sparkle/></button>
        </div>

        {/* Legend */}
        <div style={{ position: 'absolute', right: 20, bottom: 20, fontSize: 12, color: 'var(--ink-400)', padding: '7px 14px', background: 'var(--paper)', borderRadius: 999, boxShadow: 'var(--shadow-sm)', display: 'flex', gap: 8, alignItems: 'center' }}>
          <Ico.Mind style={{ color: 'var(--lav-500)', width: 13, height: 13 }}/> Drag to pan · hover to highlight · click to focus
        </div>
      </div>
    </>
  )
}

// ── PILLAR 6: Test Knowledge ──────────────────────────────────────────────────
const SCORE_RUBRIC = [
  { min: 90, label: 'Mastered', color: 'var(--success)', emoji: '🏆' },
  { min: 70, label: 'Almost there', color: 'var(--lav-500)', emoji: '💡' },
  { min: 50, label: 'Keep going', color: 'var(--peach-500)', emoji: '📖' },
  { min: 0,  label: 'Needs review', color: 'var(--error)', emoji: '🔄' },
]

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
}

function TestKnowledgePillar({ topic = 'Custom Syllabus', moduleId = null, sourceExcerpt = '', liveModule = null, user = null }) {
  const [voiceLang, setVoiceLang] = useState(getSavedVoiceLanguage)
  const questions = useMemo(() => {
    const rawTest = liveModule?.mock_test
    if (!rawTest) return []
    const activeDifficulty = (rawTest.activeDifficulty || 'easy').toLowerCase()
    const paper = rawTest[activeDifficulty] || rawTest
    return paper.questions || []
  }, [liveModule])
  const textareaRef = useRef(null)

  // Fisher-Yates shuffle, stable across renders
  const shuffledQuestions = useMemo(() => {
    const arr = [...questions]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }, [questions])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [step, setStep] = useState('prompt') // 'prompt' | 'submitted' | 'scored' | 'error'
  const [evaluationResult, setEvaluationResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [timeTaken, setTimeTaken] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const timerRef = useRef(null)
  // Accumulate results for final summary
  const [results, setResults] = useState([])

  const currentQuestion = shuffledQuestions[currentIndex] || null
  const isFinished = currentIndex >= shuffledQuestions.length && shuffledQuestions.length > 0

  // Timer interval
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => setTimeTaken(p => p + 1), 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [timerActive])

  const stopTimer = () => {
    setTimerActive(false)
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }

  const handleTyping = (val) => {
    setAnswer(val)
    if (val.length > 0 && !timerActive && step === 'prompt') {
      setTimerActive(true)
    }
  }

  const handleSubmit = async () => {
    if (!currentQuestion) return
    stopTimer()
    setStep('submitted')
    try {
      const result = await api.evaluateMockTestSingle({
        moduleId,
        questionId: currentQuestion.id,
        userAnswer: answer,
        timeTaken
      })
      setEvaluationResult(result)
      setResults(prev => [...prev, { question: currentQuestion, result, timeTaken }])
      setStep('scored')
    } catch (err) {
      setErrorMsg(err.message || 'Evaluation failed. Please try again.')
      setStep('error')
    }
  }

  const handleNext = () => {
    setCurrentIndex(i => i + 1)
    setAnswer('')
    setStep('prompt')
    setEvaluationResult(null)
    setErrorMsg('')
    setTimeTaken(0)
    setTimerActive(false)
    if (textareaRef.current) textareaRef.current.focus()
  }

  const handleRetake = () => {
    setCurrentIndex(0)
    setAnswer('')
    setStep('prompt')
    setEvaluationResult(null)
    setErrorMsg('')
    setTimeTaken(0)
    setTimerActive(false)
    setResults([])
  }

  if (questions.length === 0) {
    return (
      <div style={{ padding: '80px 48px', textAlign: 'center', color: 'var(--ink-600)' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--lav-50)', display: 'grid', placeItems: 'center', margin: '0 auto 20px', color: 'var(--lav-500)' }}>
          <Ico.Target style={{ width: 32, height: 32 }}/>
        </div>
        <h3 style={{ fontWeight: 700, margin: '0 0 8px', color: 'var(--ink-900)' }}>No Exam Questions Found</h3>
        <p className="muted" style={{ fontSize: 14, maxWidth: 440, margin: '0 auto' }}>
          Please go to the <strong>Mock Test</strong> tab and upload a syllabus PDF or enter a topic to generate your custom question paper first.
        </p>
      </div>
    )
  }

  // ── Final Summary View ──
  if (isFinished) {
    const totalMarksEarned = results.reduce((s, r) => s + (r.result?.finalScore ?? r.result?.baseScore ?? 0), 0)
    const totalMarksPossible = results.reduce((s, r) => s + (r.question?.marks ?? 0), 0)
    const avgMarks = totalMarksPossible > 0 ? Math.round((totalMarksEarned / totalMarksPossible) * 100) : 0
    const avgTime = results.length > 0 ? Math.round(results.reduce((s, r) => s + r.timeTaken, 0) / results.length) : 0
    const rubric = SCORE_RUBRIC.find(r => avgMarks >= r.min) || SCORE_RUBRIC[SCORE_RUBRIC.length - 1]

    return (
      <div style={{ padding: '36px 48px 64px', maxWidth: 760, margin: '0 auto' }} className="fade-in">
        {/* Summary header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>{rubric.emoji}</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--ink-900)', margin: '0 0 6px' }}>Test Complete!</h2>
          <p className="muted" style={{ fontSize: 15 }}>Here's how you performed on {topic}</p>
        </div>

        {/* Stats cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          <div style={{ background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 'var(--r-lg)', padding: '20px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: rubric.color }}>{avgMarks}%</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-500)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Score</div>
          </div>
          <div style={{ background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 'var(--r-lg)', padding: '20px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--lav-500)' }}>{formatTime(avgTime)}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-500)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Time</div>
          </div>
          <div style={{ background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 'var(--r-lg)', padding: '20px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--peach-500)' }}>{totalMarksEarned.toFixed(1)}<span style={{ fontSize: 16, color: 'var(--ink-400)' }}>/{totalMarksPossible}</span></div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-500)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Marks</div>
          </div>
        </div>

        {/* Per-question breakdown */}
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-800)', marginBottom: 12 }}>Question Breakdown</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
          {results.map((r, idx) => {
            const pct = r.question.marks > 0 ? Math.round(((r.result?.finalScore ?? r.result?.baseScore ?? 0) / r.question.marks) * 100) : 0
            const qRubric = SCORE_RUBRIC.find(rb => pct >= rb.min) || SCORE_RUBRIC[SCORE_RUBRIC.length - 1]
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'var(--cream-deep)', borderRadius: 'var(--r-md)', border: '1px solid var(--ink-100)' }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--lav-200)', color: 'var(--lav-600)', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{idx + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.question.question}</div>
                </div>
                <span style={{ fontSize: 12, color: 'var(--ink-400)', whiteSpace: 'nowrap' }}>⏱ {formatTime(r.timeTaken)}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: qRubric.color, whiteSpace: 'nowrap' }}>
                  {(r.result?.finalScore ?? r.result?.baseScore ?? 0).toFixed(1)}/{r.question.marks}
                </span>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button className="pill pill-primary" onClick={handleRetake} style={{ padding: '12px 28px', fontSize: 15 }}>
            <Ico.ArrowLeft/> Retake Test
          </button>
        </div>
      </div>
    )
  }

  // ── Per-question rubric for scored state ──
  const scoredPct = evaluationResult ? Math.round(((evaluationResult.finalScore ?? evaluationResult.baseScore ?? 0) / (currentQuestion?.marks || 1)) * 100) : 0
  const rubricEntry = SCORE_RUBRIC.find(r => scoredPct >= r.min) || SCORE_RUBRIC[SCORE_RUBRIC.length - 1]

  return (
    <div style={{ padding: '36px 48px 64px', maxWidth: 760, margin: '0 auto' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--peach-50)', display: 'grid', placeItems: 'center', color: 'var(--peach-500)' }}>
          <Ico.Target style={{ width: 20, height: 20 }}/>
        </div>
        <div style={{ flex: 1 }}>
          <span className="eyebrow" style={{ color: 'var(--lav-500)' }}>Question {currentIndex + 1} of {shuffledQuestions.length}</span>
          <h2 className="h2" style={{ margin: 0 }}>{topic}</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {(timerActive || timeTaken > 0) && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 999, background: 'var(--lav-50)', color: 'var(--lav-500)', fontSize: 14, fontWeight: 700, border: '1px solid var(--lav-200)', fontVariantNumeric: 'tabular-nums', transition: 'all 0.3s var(--ease-organic)', animation: timerActive ? 'pulse-glow 2s ease-in-out infinite' : 'none' }}>
              ⏱ {formatTime(timeTaken)}
            </span>
          )}
          {step === 'scored' && (
            <span style={{ padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, background: `color-mix(in srgb, ${rubricEntry.color} 12%, transparent)`, color: rubricEntry.color, border: `1px solid color-mix(in srgb, ${rubricEntry.color} 25%, transparent)` }}>
              {rubricEntry.emoji} {rubricEntry.label}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ height: 4, background: 'var(--ink-100)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${((currentIndex) / shuffledQuestions.length) * 100}%`, background: 'linear-gradient(90deg, var(--lav-300), var(--lav-500))', borderRadius: 999, transition: 'width 0.6s var(--ease-organic)' }}/>
        </div>
      </div>

      {/* Question card */}
      <div style={{ background: 'var(--paper)', borderRadius: 'var(--r-lg)', border: '1px solid var(--ink-100)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', background: 'linear-gradient(135deg, var(--lav-50), var(--cream))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 260 }}>
            <span style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--lav-200)', color: 'var(--lav-600)', display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 800, flexShrink: 0 }}>Q</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-900)' }}>
              {currentQuestion?.question}
              {currentQuestion?.difficultyRating && (
                <span style={{ display: 'inline-flex', gap: 2, alignItems: 'center', marginLeft: 12 }} title={`Difficulty: ${currentQuestion.difficultyRating} / 5 stars`}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} style={{ color: i < currentQuestion.difficultyRating ? '#FFD700' : 'var(--ink-200)', fontSize: 13 }}>
                      {i < currentQuestion.difficultyRating ? '★' : '☆'}
                    </span>
                  ))}
                </span>
              )}
            </span>
            <ListenButton text={currentQuestion?.question} language={voiceLang} label="Listen" compact />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LanguagePicker currentLang={voiceLang} onChange={setVoiceLang} user={user} compact />
            <span className="subject-chip">{currentQuestion?.marks}M</span>
          </div>
        </div>

        {/* Answer area */}
        <div style={{ padding: '20px 24px' }}>
          <VoiceAnswerInput
            value={answer}
            onChange={handleTyping}
            languageCode={voiceLang}
            placeholder="Click Speak Answer to record in your chosen language, or type directly... Timer starts as you respond."
            rows={6}
            disabled={step !== 'prompt'}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--ink-400)' }}>{answer.length} characters</span>
            {step === 'prompt' && (
              <button className="pill pill-primary" onClick={handleSubmit} disabled={answer.trim().length < 5} style={{ opacity: answer.trim().length < 5 ? 0.5 : 1 }}>
                <Ico.Sparkle/> Submit Answer
              </button>
            )}
          </div>
        </div>

        {/* Submitting state */}
        {step === 'submitted' && (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid var(--lav-300)', borderTopColor: 'var(--lav-500)', animation: 'spin-slow 0.9s linear infinite', margin: '0 auto 12px' }}/>
            <p style={{ fontSize: 14, color: 'var(--ink-600)', fontWeight: 500 }}>AMI is evaluating your answer...</p>
          </div>
        )}

        {/* Error state */}
        {step === 'error' && (
          <div style={{ padding: '20px 24px', background: 'rgba(226,106,92,0.06)', borderTop: '1px solid rgba(226,106,92,0.2)' }}>
            <p style={{ fontSize: 14, color: 'var(--error)', fontWeight: 600, margin: '0 0 8px' }}>⚠ Evaluation Error</p>
            <p style={{ fontSize: 13, color: 'var(--ink-600)', margin: 0 }}>{errorMsg}</p>
            <button className="pill pill-ghost" onClick={() => { setStep('prompt'); setErrorMsg(''); }} style={{ marginTop: 12 }}>
              <Ico.ArrowLeft/> Try Again
            </button>
          </div>
        )}

        {/* Scored state */}
        {step === 'scored' && evaluationResult && (
          <div style={{ padding: '20px 24px', borderTop: '1px solid var(--ink-100)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Score bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: rubricEntry.color, lineHeight: 1 }}>
                {(evaluationResult.finalScore ?? evaluationResult.baseScore ?? 0).toFixed(1)}<span style={{ fontSize: 16, color: 'var(--ink-400)', fontWeight: 500 }}>/{currentQuestion?.marks}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ height: 8, background: 'var(--ink-100)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${scoredPct}%`, background: `linear-gradient(90deg, ${rubricEntry.color}, color-mix(in srgb, ${rubricEntry.color} 70%, white))`, borderRadius: 999, transition: 'width 0.8s var(--ease-organic)' }}/>
                </div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-500)' }}>⏱ {formatTime(timeTaken)}</span>
            </div>

            {/* Feedback */}
            {evaluationResult.feedback && (
              <div style={{ padding: '14px 18px', background: 'var(--cream-deep)', borderRadius: 'var(--r-md)', borderLeft: `3px solid ${rubricEntry.color}`, fontSize: 14, color: 'var(--ink-700)', lineHeight: 1.65, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div>
                  <strong style={{ color: 'var(--ink-900)' }}>Feedback:</strong> {evaluationResult.feedback}
                </div>
                <ListenButton text={evaluationResult.feedback} language={voiceLang} label="Listen Feedback" compact />
              </div>
            )}

            {/* Step grades */}
            {evaluationResult.stepGrades && evaluationResult.stepGrades.length > 0 && (
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Step Breakdown</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {evaluationResult.stepGrades.map((sg, idx) => (
                    <div key={idx} style={{ padding: '12px 16px', background: 'var(--cream)', borderRadius: 'var(--r-md)', border: '1px solid var(--ink-100)', borderLeft: '4px solid var(--lav-400)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <strong style={{ fontSize: 13, color: 'var(--ink-800)' }}>Step {idx + 1}: {sg.step}</strong>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--lav-600)', background: 'var(--lav-50)', padding: '2px 8px', borderRadius: 4 }}>
                          {sg.marksObtained}M awarded
                        </span>
                      </div>
                      <p style={{ fontSize: 12.5, color: 'var(--ink-600)', margin: 0 }}>{sg.feedback}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next button */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="pill pill-primary" onClick={handleNext} style={{ padding: '10px 22px', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                {currentIndex + 1 < shuffledQuestions.length ? 'Next Question →' : 'View Summary →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Floating AI Chatbot ────────────────────────────────────────────────────────
const BOT_INTROS = [
  "Hi! I'm AMI. Ask me anything about this topic.",
  "Got a question? I'm locked in on this module — ask away.",
]

function AIChatbot({ topic, moduleId }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: `Hi! I'm AMI. I'm here to help you understand **${topic}**. Ask me anything — definitions, examples, or how concepts connect.` }
  ])
  const [input, setInput] = useState('')
  const [strikes, setStrikes] = useState(0)
  const [thinking, setThinking] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
      setTimeout(() => inputRef.current?.focus(), 120)
    }
  }, [open, messages])

  // Simple off-topic detection: check if message mentions topic keywords
  const isOffTopic = (text) => {
    // If not in demo mode / not Photosynthesis, bypass client-side off-topic blocking
    if (topic !== 'Photosynthesis' && topic !== 'Photosynthesis & the Carbon Cycle') {
      return false
    }
    const lower = text.toLowerCase()
    const topicWords = topic.toLowerCase().split(/\s+/)
    const relatedWords = ['what', 'how', 'why', 'explain', 'define', 'example', 'difference', 'process', 'step', 'stage', 'where', 'which', 'when', 'molecule', 'cell', 'plant', 'light', 'energy', 'reaction', 'glucose', 'oxygen', 'carbon', 'atp', 'chloro', 'exam', 'quiz', 'question']
    const hasTopicWord = topicWords.some(w => lower.includes(w))
    const hasRelated = relatedWords.some(w => lower.includes(w))
    return !hasTopicWord && !hasRelated && text.length > 12
  }

  // Fallback offline responses if network drops
  const getOfflineBotResponse = (userMsg) => {
    const lower = userMsg.toLowerCase()
    const topicLower = (topic || 'Photosynthesis').toLowerCase()

    // Off-topic check
    if (lower.includes('linked list') || lower.includes('algorithm') || lower.includes('sorting') || lower.includes('quicksort') || lower.includes('binary tree') || lower.includes('python') || lower.includes('javascript') || lower.includes('sql') || lower.includes('database')) {
      return `Please ask questions related to ${topic} only.`
    }

    if (lower.includes('chlorophyll') || lower.includes('green')) return 'Chlorophyll is the pigment inside chloroplasts that absorbs light — mainly red and blue wavelengths — and converts it into chemical energy. That\'s why leaves look green: chlorophyll reflects green light back to your eyes.'
    if (lower.includes('atp')) return 'ATP (adenosine triphosphate) is the energy currency of the cell. In photosynthesis, the light reactions generate ATP using sunlight, and the Calvin cycle spends that ATP to build glucose.'
    if (lower.includes('calvin') || lower.includes('cycle')) return 'The Calvin Cycle happens in the stroma of the chloroplast. It uses CO₂, ATP, and NADPH to build glucose through a 3-step cycle: fixation → reduction → regeneration of RuBP.'
    if (lower.includes('oxygen') || lower.includes('o2')) return 'Oxygen is a byproduct of the light-dependent reactions. Water molecules (H₂O) are split in a process called photolysis — the oxygen released is what we breathe!'
    if (lower.includes('where') || lower.includes('chloroplast')) return 'Photosynthesis happens inside the chloroplast. Light reactions occur on the thylakoid membranes; the Calvin Cycle runs in the stroma.'
    if (lower.includes('why') || lower.includes('important')) return 'Photosynthesis is the foundation of almost all food chains on Earth. It converts solar energy into chemical energy (glucose), which fuels nearly all living things — including us.'
    if (lower.includes('glucose') || lower.includes('sugar')) return 'Glucose (C₆H₁₂O₆) is the main output of photosynthesis. Plants use it for energy and as a building block for cellulose, starch, and other organic molecules.'
    return `In ${topic}, autotrophic plants capture solar radiation using chlorophyll inside chloroplasts, converting carbon dioxide and water into glucose and oxygen (6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂).`
  }

  const sendMessage = () => {
    const text = input.trim()
    if (!text || thinking) return

    setMessages(prev => [...prev, { role: 'user', text }])
    setInput('')
    setThinking(true)

    const historyPayload = messages
      .filter(m => !m.isWarning)
      .map(m => ({ role: m.role === 'user' ? 'user' : 'bot', content: m.text }));

    const targetModuleId = moduleId || 'demo-photosynthesis';

    api.chat(targetModuleId, text, historyPayload, topic)
      .then(res => {
        setMessages(prev => [
          ...prev,
          { role: 'bot', text: res.reply, isWarning: res.isOffTopic }
        ])
        setThinking(false)
      })
      .catch(err => {
        console.warn('[AIChatbot] RAG chat network fallback:', err.message);
        setMessages(prev => [...prev, { role: 'bot', text: getOfflineBotResponse(text) }])
        setThinking(false)
      });
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 200,
          width: 56, height: 56, borderRadius: '50%',
          background: open ? 'var(--ink-900)' : 'linear-gradient(135deg, var(--lav-400), var(--peach-400))',
          color: 'white', border: 'none', cursor: 'pointer',
          display: 'grid', placeItems: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.18), 0 2px 8px rgba(140,138,214,0.25)',
          transition: 'all 0.3s var(--ease-organic)',
          transform: open ? 'rotate(45deg) scale(0.9)' : 'scale(1)',
        }}
        title={open ? 'Close AMI' : 'Ask AMI'}
      >
        {open ? <Ico.Close style={{ width: 22, height: 22 }}/> : <Ico.Sparkle style={{ width: 22, height: 22 }}/>}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fade-in"
          style={{
            position: 'fixed', bottom: 96, right: 28, zIndex: 199,
            width: 'min(380px, calc(100vw - 40px))',
            maxHeight: '60vh',
            background: 'var(--paper)',
            borderRadius: 'var(--r-xl)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.14), 0 2px 12px rgba(0,0,0,0.06)',
            border: '1px solid rgba(45,30,15,0.06)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fade-up 0.25s var(--ease-organic)',
          }}
        >
          {/* Header */}
          <div style={{ padding: '14px 18px', background: 'linear-gradient(135deg, var(--lav-100), var(--peach-50))', borderBottom: '1px solid var(--ink-100)', display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--lav-300), var(--peach-300))', display: 'grid', placeItems: 'center', color: 'white', flexShrink: 0 }}>
              <Ico.Sparkle style={{ width: 18, height: 18 }}/>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink-900)' }}>AMI Tutor</div>
              <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>Scoped to: {topic}</div>
            </div>
            {strikes > 0 && (
              <div style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, color: 'var(--error)', background: 'rgba(226,106,92,0.1)', padding: '3px 8px', borderRadius: 999 }}>
                {strikes}/2 warnings
              </div>
            )}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '82%',
                  padding: '10px 14px',
                  borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: m.role === 'user' ? 'linear-gradient(135deg, var(--lav-400), var(--peach-400))' : m.isWarning ? 'rgba(226,106,92,0.08)' : 'var(--cream-deep)',
                  color: m.role === 'user' ? 'white' : m.isWarning ? 'var(--error)' : 'var(--ink-800)',
                  fontSize: 13.5,
                  lineHeight: 1.55,
                  border: m.isWarning ? '1px solid rgba(226,106,92,0.25)' : 'none',
                }}
                  dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }}
                />
              </div>
            ))}
            {thinking && (
              <div style={{ display: 'flex', gap: 5, padding: '10px 14px', background: 'var(--cream-deep)', borderRadius: '18px 18px 18px 4px', width: 'fit-content' }}>
                {[0,1,2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--lav-400)', animation: 'pulse-glow 1.4s ease-in-out infinite', animationDelay: `${i * 0.2}s`, display: 'block' }}/>)}
              </div>
            )}
            <div ref={messagesEndRef}/>
          </div>

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid var(--ink-100)', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={`Ask about ${topic}…`}
              rows={1}
              style={{
                flex: 1, resize: 'none', border: '1.5px solid var(--ink-100)', borderRadius: 12, padding: '9px 12px', fontSize: 13.5, fontFamily: 'inherit', color: 'var(--ink-900)', background: 'var(--cream)', outline: 'none', lineHeight: 1.5, maxHeight: 100, transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--lav-300)'}
              onBlur={e => e.target.style.borderColor = 'var(--ink-100)'}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || thinking}
              style={{ width: 36, height: 36, borderRadius: '50%', background: input.trim() ? 'linear-gradient(135deg, var(--lav-400), var(--peach-400))' : 'var(--ink-100)', color: input.trim() ? 'white' : 'var(--ink-400)', border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed', display: 'grid', placeItems: 'center', flexShrink: 0, transition: 'all 0.2s', }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}

// ── Generating Placeholder ────────────────────────────────────────────────────
function GeneratingPlaceholder({ mediaType }) {
  return (
    <div style={{ padding: '80px 48px', textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', border: '3px solid var(--peach-300)', borderTopColor: 'var(--peach-500)', animation: 'spin-slow 0.9s linear infinite', margin: '0 auto 20px' }}/>
      <h3 style={{ fontWeight: 700, marginBottom: 8, fontSize: 20 }}>Generating your {mediaType}…</h3>
      <p className="muted" style={{ fontSize: 14, maxWidth: 400, margin: '0 auto 24px' }}>
        This takes a moment. While you wait, explore <strong>Immersive Text</strong>, <strong>Quizzes</strong>, and <strong>Test Knowledge</strong> — they're ready now.
      </p>
      <div style={{ display: 'inline-flex', gap: 6, padding: '8px 16px', background: 'var(--peach-50)', borderRadius: 999, fontSize: 12, color: 'var(--peach-500)', fontWeight: 600, border: '1px solid var(--peach-100)' }}>
        <span style={{ animation: 'pulse-glow 1.4s ease-in-out infinite', display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--peach-400)', alignSelf: 'center' }}/>
        AMI is working in the background
      </div>
    </div>
  )
}

// ── Learning Hub ──────────────────────────────────────────────────────────────
export default function LearningHub({ module, initialTab, persona, onChangePersona, onAccountSettings, onLogout, onBack, dark, onToggleDark, user }) {
  // Live module state — updates as background generation completes
  const [liveModule, setLiveModule] = useState(module)
  const [moduleStatus, setModuleStatus] = useState(module?.status || 'complete')
  const isMockTestFirst = module?.mode === 'mocktest_first' || liveModule?.mode === 'mocktest_first' || module?.topic === 'Custom Syllabus Exam'
  const [tab, setTab] = useState(initialTab || (isMockTestFirst ? 'mocktest' : 'text'))

  useEffect(() => {
    if (initialTab) setTab(initialTab)
  }, [initialTab])

  // ── DYNAMIC LOCAL STUDY MATERIAL GENERATION (Client-side, No API keys) ─────
  const localTextContent = useMemo(() => {
    const rawTest = liveModule?.mock_test
    if (!rawTest) return null
    
    const diffKey = (rawTest.activeDifficulty || 'medium').toLowerCase()
    const paper = rawTest[diffKey] || rawTest
    const questions = paper.questions || []
    if (questions.length === 0) return null

    const sections = [
      {
        id: 'obj',
        kind: 'objectives',
        heading: 'Learning Objectives',
        items: rawTest.pointers || [
          "Understand the core architecture and principles.",
          "Analyze key hardware integrations and configurations.",
          "Compare memory, processing and peripheral execution."
        ]
      }
    ];

    questions.forEach((q, idx) => {
      // 1. Prose section for the concept
      sections.push({
        id: `s${idx + 1}-prose`,
        kind: 'prose',
        heading: `${idx + 1}. Concept: ${q.question.replace(/\?$/, '')}`,
        body: q.suggestedAnswer || "Examine the core details and step-by-step marking rubrics to verify standard execution."
      });

      // 2. Interactive Multiple Choice Quiz built purely locally!
      const correctStep = q.stepMarking && q.stepMarking[0] ? q.stepMarking[0].step : "Identify the correct formula and principles";
      sections.push({
        id: `s${idx + 1}-quiz`,
        kind: 'inline-quiz',
        question: `What is a primary rubric step for: "${q.question}"?`,
        hint: `Think about what must be verified in the grading instructions.`,
        choices: [
          { id: 'a', text: correctStep, correct: true },
          { id: 'b', text: "Ignore all architectural constraints and formulas.", correct: false },
          { id: 'c', text: "Rely purely on manual guesswork without logical steps.", correct: false },
          { id: 'd', text: "Apply generic, unrelated answers to the question.", correct: false }
        ].sort(() => Math.random() - 0.5)
      });
    });

    return {
      title: liveModule.title || liveModule.topic || 'Custom Syllabus Exam',
      subtitle: `Dynamic Client-Side Study Guide`,
      toc: sections
        .filter(s => s.kind === 'prose')
        .map((s, i) => ({ id: `s${i + 1}`, title: s.heading.replace(/^\d+\.\s+Concept:\s+/, ''), done: false, current: i === 0 })),
      sections
    };
  }, [liveModule]);

  const localMindmap = useMemo(() => {
    const rawTest = liveModule?.mock_test
    if (!rawTest) return []
    
    const pointers = rawTest.pointers || []
    if (pointers.length === 0) return []

    const nodes = [
      { id: 'root', parent: null, label: liveModule.topic || 'Topic', x: 0, y: 0, type: 'root' }
    ];

    const N = pointers.length;
    pointers.forEach((pointer, i) => {
      const angle = (i * 2 * Math.PI) / N;
      const radius = 240;
      const x = Math.round(radius * Math.cos(angle));
      const y = Math.round(radius * Math.sin(angle));
      const nodeId = `node_${i}`;
      
      nodes.push({
        id: nodeId,
        parent: 'root',
        label: pointer.length > 30 ? pointer.substring(0, 30) + '...' : pointer,
        x,
        y,
        type: 'concept'
      });

      // Add 2 detail child subnodes for visual depth
      const subAngle1 = angle - 0.12;
      const subAngle2 = angle + 0.12;
      const subRadius = radius + 115;
      
      nodes.push({
        id: `${nodeId}_sub1`,
        parent: nodeId,
        label: "Evaluation Guide",
        x: Math.round(subRadius * Math.cos(subAngle1)),
        y: Math.round(subRadius * Math.sin(subAngle1)),
        type: 'fact'
      });

      nodes.push({
        id: `${nodeId}_sub2`,
        parent: nodeId,
        label: "Detailed Rubric",
        x: Math.round(subRadius * Math.cos(subAngle2)),
        y: Math.round(subRadius * Math.sin(subAngle2)),
        type: 'fact'
      });
    });

    return nodes;
  }, [liveModule]);

  const localAudioContent = useMemo(() => {
    const rawTest = liveModule?.mock_test
    if (!rawTest) return null
    
    const pointers = rawTest.pointers || []
    const diffKey = (rawTest.activeDifficulty || 'medium').toLowerCase()
    const paper = rawTest[diffKey] || rawTest
    const questions = paper.questions || []
    
    const chapters = [];
    let scriptText = '';
    
    pointers.forEach((pointer, idx) => {
      const matchingQ = questions.find(q => q.stepMarking && q.stepMarking.some(sm => sm.step === pointer));
      const explanation = matchingQ 
        ? `Let's discuss this concept: ${pointer}. ${matchingQ.suggestedAnswer}` 
        : `Let's study: ${pointer}. This concept focuses on understanding the core theoretical principles and marking rubrics.`;
        
      const chapterTitle = pointer.length > 40 ? pointer.substring(0, 40) + '...' : pointer;
      chapters.push({ title: chapterTitle, text: explanation });
      scriptText += `[CHAPTER: ${chapterTitle}] \n ${explanation} \n\n`;
    });

    if (chapters.length === 0) {
      chapters.push({ title: "Introduction", text: "Welcome to your custom syllabus study guide." });
      scriptText = "[CHAPTER: Introduction] \n Welcome to your custom syllabus study guide.";
    }

    return {
      title: liveModule.topic || 'Custom Syllabus Exam',
      script: scriptText,
      chapters
    };
  }, [liveModule]);

  const activePillars = useMemo(() => {
    const list = [
      { id: 'source', label: 'Source', icon: 'Pdf', color: 'var(--ink-700)' },
      { id: 'text', label: 'Immersive Text', icon: 'Book', color: 'var(--peach-500)' },
      { id: 'audio', label: 'Audio Lesson', icon: 'Audio', color: 'var(--success)' },
      { id: 'mind', label: 'Mindmap', icon: 'Mind', color: 'var(--info)' },
      { id: 'mocktest', label: 'Mock Test', icon: 'Target', color: 'var(--lav-500)' },
      { id: 'test', label: 'Test Knowledge', icon: 'Target', color: 'var(--peach-500)' },
    ];
    if (isMockTestFirst) {
      const mockItem = list.find(p => p.id === 'mocktest');
      if (!liveModule?.mock_test) {
        return [mockItem];
      }
      const others = list.filter(p => p.id !== 'mocktest');
      return [mockItem, ...others];
    }
    return list;
  }, [isMockTestFirst, liveModule?.mock_test]);

  // Poll for module status every 5s until complete
  useEffect(() => {
    if (!module?.id) return
    if (moduleStatus === 'complete' || moduleStatus === 'error') return

    const interval = setInterval(async () => {
      try {
        const data = await api.getModuleStatus(module.id)
        setModuleStatus(data.status)
        if (data.status === 'complete') {
          // Merge all Phase 2 data into liveModule (text, mindmap, audio)
          setLiveModule(prev => ({
            ...prev,
            status: 'complete',
            textContent: (data.textContent && data.textContent.sections?.length > 0)
              ? data.textContent
              : prev?.textContent || null,
            slides: [],
            mindmap: data.mindmap || prev?.mindmap || [],
            audio: data.audio || prev?.audio || { title: '', script: '', chapters: [] },
            mock_test: data.mock_test || prev?.mock_test || null
          }))
          clearInterval(interval)
        }
      } catch (e) {
        // Silently ignore poll errors
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [module?.id, moduleStatus])

  // textContent is ready once it has actual sections (Phase 2 filled them in or generated locally)
  const hasTextContent = liveModule?.textContent?.sections?.length > 0 || localTextContent !== null
  const isDemoMode = liveModule?.topic === 'Photosynthesis' || module?.topic === 'Photosynthesis' || (!liveModule?.topic && !module?.topic)
  
  const c = (isMockTestFirst && !liveModule?.mock_test)
    ? { title: liveModule?.topic || 'Custom Syllabus Exam', subtitle: 'Upload a syllabus PDF to generate your exam & study materials', sections: [] }
    : (liveModule?.textContent?.sections?.length > 0 ? liveModule.textContent : (localTextContent || (isDemoMode ? PHOTO_CONTENT : { title: liveModule?.topic || 'Custom Syllabus Exam', subtitle: 'Detailed study guide for this module', sections: [], toc: [] })))

  const headerTitle = liveModule?.title || liveModule?.topic || module?.topic || 'Custom Syllabus Exam'
  const headerSubtitle = (isMockTestFirst && !liveModule?.mock_test)
    ? 'Upload a syllabus PDF to generate your exam & study materials'
    : (liveModule?.textContent?.subtitle || liveModule?.mock_test?.instructions || 'Interactive study guide and mock test')

  const moduleId = liveModule?.id || null
  const sourceExcerpt = liveModule?.source?.sourceExcerpt || liveModule?.source?.excerpt || ''

  const isGenerating = moduleStatus === 'generating'
  const hasSlides = liveModule?.slides?.length > 0
  const hasMindmap = liveModule?.mindmap?.length > 0 || localMindmap.length > 0
  const hasAudio = liveModule?.audio?.chapters?.length > 0 || localAudioContent !== null

  return (
    <div style={{ paddingBottom: 64 }} className="fade-in">
      <TopBar persona={persona} onChangePersona={onChangePersona} onAccountSettings={onAccountSettings} onLogout={onLogout} dark={dark} onToggleDark={onToggleDark} user={user}/>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px 16px', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
        <button className="link-btn" onClick={onBack}><Ico.ArrowLeft/> All modules</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: 'clamp(28px,3.4vw,40px)', fontWeight: 700, letterSpacing: '-0.025em', margin: 0 }}>{headerTitle}</h2>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              background: 'var(--peach-50)',
              color: 'var(--peach-600)',
              border: '1px solid var(--peach-200)',
            }}
            title="AMI Voice enabled: speak your answers and listen to every lesson powered by Gnani Prisma & Timbre"
          >
            🎙️ AMI Voice
          </span>
          {isGenerating && (
            <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center', padding: '4px 12px', background: 'var(--peach-50)', borderRadius: 999, fontSize: 12, color: 'var(--peach-500)', fontWeight: 600, border: '1px solid var(--peach-100)', flexShrink: 0 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--peach-400)', animation: 'pulse-glow 1.4s ease-in-out infinite', display: 'block' }}/>
              Generating media…
            </div>
          )}
        </div>
        <p className="muted" style={{ fontSize: 14, margin: 0 }}>{headerSubtitle}</p>
      </div>
      <div style={{ maxWidth: 1100, margin: '24px auto 0', background: 'var(--paper)', borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow-md)', border: '1px solid rgba(45,30,15,0.04)', overflow: 'hidden' }}>
        <PillarTabs active={tab} onChange={setTab} pillars={activePillars}/>
        <div key={tab} style={{ animation: 'slide-in-right 0.5s var(--ease-organic)' }}>
          {tab === 'source' && <SourcePillar source={liveModule?.source}/>}
          {tab === 'text' && (isGenerating && !hasTextContent
            ? <GeneratingPlaceholder mediaType="Immersive Text"/>
            : <ImmersivePillar textContent={c} moduleId={moduleId}/>
          )}
          {tab === 'audio' && (isGenerating || !hasAudio
            ? <GeneratingPlaceholder mediaType="Audio Lesson"/>
            : <AudioPillar audioContent={liveModule?.audio?.chapters?.length > 0 ? liveModule.audio : localAudioContent} user={user}/>
          )}
          {tab === 'mind' && (isGenerating || !hasMindmap
            ? <GeneratingPlaceholder mediaType="Mindmap"/>
            : <MindmapPillar mindmap={liveModule?.mindmap?.length > 0 ? liveModule.mindmap : localMindmap}/>
          )}
          {tab === 'mocktest' && (
            <MockTestPillar 
              moduleId={moduleId} 
              liveModule={liveModule} 
              user={user}
              onUpdateMockTest={async (mockTest) => {
                if (mockTest && mockTest.moduleId) {
                  try {
                    const fullMod = await api.getModule(mockTest.moduleId)
                    setLiveModule({
                      ...fullMod,
                      topic: fullMod.topic || mockTest.topic,
                      title: fullMod.title || mockTest.title || fullMod.topic || mockTest.topic,
                      source: fullMod.source || mockTest.source
                    })
                    setModuleStatus('complete')
                  } catch (err) {
                    console.error('Failed to load full module after mock test generation:', err)
                    setLiveModule(prev => ({
                      ...prev,
                      id: mockTest.moduleId,
                      topic: mockTest.topic || prev.topic,
                      title: mockTest.title || prev.title,
                      source: mockTest.source || prev.source,
                      mock_test: mockTest
                    }))
                  }
                } else {
                  setLiveModule(prev => ({
                    ...prev,
                    topic: mockTest?.topic || prev.topic,
                    title: mockTest?.title || prev.title,
                    source: mockTest?.source || prev.source,
                    mock_test: mockTest
                  }))
                }
              }}
            />
          )}
          {tab === 'test' && <TestKnowledgePillar topic={c.title} moduleId={moduleId} sourceExcerpt={sourceExcerpt} liveModule={liveModule} user={user}/>}
        </div>
      </div>

      {/* Floating chatbot — visible on all tabs except when mock test is first and no syllabus uploaded yet */}
      {!(isMockTestFirst && !liveModule?.mock_test) && <AIChatbot topic={c.title} moduleId={moduleId}/>}
    </div>
  )
}