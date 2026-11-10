import { useState, useEffect } from 'react'
import { api, setToken, clearToken, getToken } from './services/api.js'
import { Ico } from './components/ui/Icons.jsx'
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import QuickLearningPage from './pages/QuickLearningPage.jsx'
import LoadingPage from './pages/LoadingPage.jsx'
import LearningHub from './pages/LearningHub.jsx'

// ── Persona Modal ─────────────────────────────────────────────────────────────
function PersonaModal({ persona, onSave, onClose }) {
  const [draft, setDraft] = useState(persona)
  const grades = ['Middle schooler', 'High schooler', 'College freshman', 'Lifelong learner']
  const interests = [
    { label: 'cycling', icon: <Ico.Bike/> },
    { label: 'music', icon: <Ico.Music/> },
    { label: 'soccer', icon: <Ico.Soccer/> },
    { label: 'photography', icon: <Ico.Camera/> },
  ]
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(26,26,26,0.5)', backdropFilter: 'blur(6px)', display: 'grid', placeItems: 'center', padding: 24, animation: 'fade-in 0.2s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 'min(560px,100%)', background: 'var(--paper)', borderRadius: 'var(--r-xl)', padding: 36, boxShadow: 'var(--shadow-lg)', position: 'relative', animation: 'fade-up 0.3s var(--ease-organic)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 18, right: 18, width: 32, height: 32, borderRadius: '50%', background: 'var(--cream-deep)', color: 'var(--ink-700)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Ico.Close/></button>
        <span className="eyebrow">Personalize</span>
        <h2 className="h2" style={{ margin: '6px 0 4px' }}>How should AMI teach you?</h2>
        <p className="muted" style={{ fontSize: 14, marginBottom: 24 }}>Analogies, examples and difficulty adapt to your choices.</p>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Reading level</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {grades.map(g => <button key={g} onClick={() => setDraft({ ...draft, grade: g })} style={{ padding: '10px 16px', borderRadius: 999, background: draft.grade === g ? 'var(--peach-50)' : 'var(--cream-deep)', border: `1.5px solid ${draft.grade === g ? 'var(--peach-300)' : 'transparent'}`, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease' }}>{g}</button>)}
          </div>
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Interest <span className="muted" style={{ fontWeight: 400 }}>· shapes analogies & examples</span></div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {interests.map(i => <button key={i.label} onClick={() => setDraft({ ...draft, interest: i.label, iconNode: i.icon })} style={{ padding: '10px 16px', borderRadius: 999, background: draft.interest === i.label ? 'var(--peach-50)' : 'var(--cream-deep)', border: `1.5px solid ${draft.interest === i.label ? 'var(--peach-300)' : 'transparent'}`, fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all 0.2s ease' }}><span style={{ color: 'var(--peach-500)' }}>{i.icon}</span>{i.label}</button>)}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="pill pill-ghost" onClick={onClose}>Cancel</button>
          <button className="pill pill-primary" onClick={() => onSave(draft)}><Ico.Check/> Save</button>
        </div>
      </div>
    </div>
  )
}

// ── Account Settings Modal ────────────────────────────────────────────────────
function AccountSettingsModal({ user, onSave, onDeleteAccount, onClose }) {
  const [name, setName] = useState(user?.name || '')
  const [age, setAge] = useState(user?.age || '')
  const [qualification, setQualification] = useState(user?.qualification || '')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const qualifications = ['Middle School', 'High School', 'Undergraduate', 'Postgraduate', 'Professional', 'Lifelong Learner']
  const inputStyle = { width: '100%', height: 44, padding: '0 14px', border: '1.5px solid var(--ink-100)', borderRadius: 'var(--r-md)', background: 'var(--cream)', fontSize: 14, color: 'var(--ink-900)', outline: 'none', fontFamily: 'inherit' }
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(26,26,26,0.5)', backdropFilter: 'blur(6px)', display: 'grid', placeItems: 'center', padding: 24, animation: 'fade-in 0.2s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 'min(520px,100%)', background: 'var(--paper)', borderRadius: 'var(--r-xl)', padding: 36, boxShadow: 'var(--shadow-lg)', position: 'relative', animation: 'fade-up 0.3s var(--ease-organic)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 18, right: 18, width: 32, height: 32, borderRadius: '50%', background: 'var(--cream-deep)', color: 'var(--ink-700)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Ico.Close/></button>
        <span className="eyebrow">Account</span>
        <h2 className="h2" style={{ margin: '6px 0 24px' }}>Account settings</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Full name</label>
            <input style={inputStyle} placeholder="Alex Liu" value={name} onChange={e => setName(e.target.value)}/>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Email</label>
            <input style={{ ...inputStyle, background: 'var(--cream-deep)', color: 'var(--ink-300)' }} value={user?.email || ''} disabled/>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Age</label>
              <input style={inputStyle} type="number" min="8" max="100" placeholder="17" value={age} onChange={e => setAge(e.target.value)}/>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Qualification</label>
              <select style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }} value={qualification} onChange={e => setQualification(e.target.value)}>
                <option value="">Select…</option>
                {qualifications.map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24, marginBottom: 32 }}>
          <button className="pill pill-ghost" onClick={onClose}>Cancel</button>
          <button className="pill pill-primary" onClick={() => { onSave({ name, age, qualification }); onClose() }}><Ico.Check/> Save changes</button>
        </div>

        <div style={{ borderTop: '1px solid var(--ink-100)', paddingTop: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--error)', marginBottom: 8 }}>Danger zone</p>
          <p className="muted" style={{ fontSize: 13, marginBottom: 14 }}>Permanently delete your account and all learning data. This cannot be undone.</p>
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)} style={{ padding: '10px 20px', borderRadius: 999, background: 'rgba(226,106,92,0.08)', border: '1.5px solid var(--error)', color: 'var(--error)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Delete account
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--ink-500)' }}>Are you sure?</span>
              <button onClick={onDeleteAccount} style={{ padding: '10px 20px', borderRadius: 999, background: 'var(--error)', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Yes, delete everything</button>
              <button onClick={() => setConfirmDelete(false)} style={{ fontSize: 13, color: 'var(--ink-500)', cursor: 'pointer' }}>Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const interestIcon = { cycling: <Ico.Bike/>, music: <Ico.Music/>, soccer: <Ico.Soccer/>, photography: <Ico.Camera/> }

  // Auth state
  const [user, setUser] = useState(null) // null = logged out
  const [authLoading, setAuthLoading] = useState(true) // true while restoring session
  // route: 'landing' | 'login' | 'dashboard' | 'upload' | 'loading' | 'hub'
  const [route, setRoute] = useState('landing')
  const [topic, setTopic] = useState('Photosynthesis')
  const [pendingTopic, setPendingTopic] = useState(null)
  const [initialHubTab, setInitialHubTab] = useState(null)
  const [fromUpload, setFromUpload] = useState(false)
  const [uploadCtx, setUploadCtx] = useState(null)

  // UI modals
  const [showPersona, setShowPersona] = useState(false)
  const [showAccountSettings, setShowAccountSettings] = useState(false)

  // Theme & persona — seeded from saved user on restore
  const [dark, setDark] = useState(false)
  const [grade, setGrade] = useState('High schooler')
  const [interest, setInterest] = useState('music')

  const persona = { grade, interest, iconNode: interestIcon[interest] || <Ico.Music/> }

  // Apply user's saved persona (grade + interest) to local state
  const applyUserPersona = (u) => {
    if (u?.grade) setGrade(u.grade)
    if (u?.interest) setInterest(u.interest)
  }

  const onPersonaChange = (p) => {
    if (p.grade) setGrade(p.grade)
    if (p.interest) setInterest(p.interest)
    setShowPersona(false)
  }

  const [currentModule, setCurrentModule] = useState(null)

  const onLogin = async (userData) => {
    try {
      if (userData.googleAuth) {
        const data = await api.getGoogleUrl()
        return data
      }
      if (userData.isNew) {
        const data = await api.register(userData)
        setToken(data.token)
        setUser(data.user)
        applyUserPersona(data.user)
      } else {
        const data = await api.login({ email: userData.email, password: userData.password })
        setToken(data.token)
        setUser(data.user)
        applyUserPersona(data.user)
      }
      if (pendingTopic) {
        const target = pendingTopic
        setPendingTopic(null)
        startLearning(target)
      } else {
        setRoute('dashboard')
      }
    } catch (err) {
      throw err
    }
  }

  const onLogout = async () => {
    try { await api.logout() } catch (e) {}
    clearToken()
    setUser(null)
    setRoute('landing')
  }

  const onDeleteAccount = async () => {
    try { await api.deleteMe() } catch (e) {}
    clearToken()
    setUser(null)
    setShowAccountSettings(false)
    setRoute('landing')
  }

  const onAccountSave = async (updates) => {
    try {
      const data = await api.updateMe(updates)
      // updateMe returns the user object directly (not wrapped)
      const updated = data.user || data
      setUser(updated)
      applyUserPersona(updated)
    } catch (err) {
      alert(err.message)
    }
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  }, [dark])

  // ── Restore session from localStorage on mount ────────────────────────────
  useEffect(() => {
    const savedToken = getToken()
    if (!savedToken) {
      setAuthLoading(false)
      return
    }
    api.getMe()
      .then(u => {
        setUser(u)
        applyUserPersona(u)
        setRoute('dashboard')
      })
      .catch(() => {
        // Token expired or invalid — clear it silently
        clearToken()
      })
      .finally(() => setAuthLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // ── PKCE flow: Supabase redirects to /auth/callback?code=XXXX ──
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    if (code && window.location.pathname === '/auth/callback') {
      // Exchange the code via our backend
      window.history.replaceState(null, '', '/') // clean up URL immediately
      fetch('/api/auth/google/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
        .then(r => r.json())
        .then(data => {
          if (data.error) throw new Error(data.error)
          setToken(data.token)
          setUser(data.user)
          setRoute('dashboard')
          if (!data.user?.age || !data.user?.qualification) {
            setShowAccountSettings(true)
          }
        })
        .catch(err => {
          console.error('OAuth code exchange failed:', err)
          setRoute('login')
        })
      return
    }

    // ── Hash-fragment flow (implicit): access_token in URL hash ──
    const hash = window.location.hash
    if (hash && hash.includes('access_token=')) {
      const params = new URLSearchParams(hash.substring(1))
      const accessToken = params.get('access_token')
      if (accessToken) {
        setToken(accessToken)
        window.history.replaceState(null, '', window.location.pathname) // clear hash
        api.getMe().then(u => {
          setUser(u)
          setRoute('dashboard')
          if (!u.age || !u.qualification) {
            setShowAccountSettings(true)
          }
        }).catch(err => {
          console.error("OAuth callback error:", err)
          setRoute('login')
        })
      }
    }
  }, [])

  const startLearning = (q) => { setTopic(q); setFromUpload(false); setRoute('loading') }
  const startUpload = (payload) => { setTopic(payload.title || 'My module'); setFromUpload(true); setUploadCtx(payload); setRoute('loading') }

  const onDemoLoad = async (demoId, targetTab = null) => {
    try {
      if (targetTab) setInitialHubTab(targetTab)
      else setInitialHubTab(null)
      const mod = await api.getDemoModule(demoId)
      setCurrentModule(mod)
      setRoute('hub')
    } catch (err) {
      alert('Could not load demo: ' + err.message)
    }
  }

  const onMockTestTrigger = (q) => {
    setCurrentModule({
      id: null,
      topic: q?.trim() || 'Custom Syllabus Exam',
      persona: { grade, interest },
      status: 'complete',
      mode: 'mocktest_first',
      mock_test: null,
      textContent: { title: q?.trim() || 'Custom Syllabus', subtitle: 'Step-by-step marked AI Exam', sections: [] },
      slides: [],
      mindmap: [],
      audio: { chapters: [] }
    });
    setRoute('hub');
  }

  // Shared topbar props
  const topbarProps = {
    persona,
    onChangePersona: () => setShowPersona(true),
    onAccountSettings: () => setShowAccountSettings(true),
    onLogout,
    dark,
    onToggleDark: () => setDark(d => !d),
    user,
  }

  // Don't render anything until session restore check is done (prevents flash)
  if (authLoading) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'var(--cream)', display: 'grid', placeItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid var(--peach-300)', borderTopColor: 'var(--peach-500)', animation: 'spin-slow 0.8s linear infinite' }}/>
          <span style={{ color: 'var(--ink-400)', fontSize: 14 }}>Restoring your session…</span>
        </div>
      </div>
    )
  }

  return (
    <>
      {route === 'landing' && (
        <LandingPage
          intensity={1.0}
          onStart={(q) => {
            if (q && typeof q === 'string') {
              const trimmed = q.trim()
              if (!user && !getToken()) {
                if (trimmed.toLowerCase() === 'photosynthesis') {
                  onDemoLoad('demo-photosynthesis')
                  return
                }
                setPendingTopic(trimmed)
                setRoute('login')
                return
              }
              startLearning(trimmed)
            } else {
              setRoute('dashboard')
            }
          }}
          onDemoLaunch={(demoId, targetTab) => onDemoLoad(demoId, targetTab)}
          onUpload={() => {
            if (!user && !getToken()) setRoute('login')
            else setRoute('upload')
          }}
          onLogin={() => setRoute('login')}
          user={user}
        />
      )}
      {route === 'login' && (
        <LoginPage onLogin={onLogin} onBack={() => setRoute('landing')}/>
      )}
      {route === 'dashboard' && (
        <DashboardPage
          {...topbarProps}
          onSearch={(q) => {
            if (!user && !getToken()) {
              if (q.trim().toLowerCase() === 'photosynthesis') {
                onDemoLoad('demo-photosynthesis')
                return
              }
              setPendingTopic(q.trim())
              setRoute('login')
              return
            }
            startLearning(q)
          }}
          onDemoLaunch={(demoId, targetTab) => onDemoLoad(demoId, targetTab)}
          onUpload={() => {
            if (!user && !getToken()) setRoute('login')
            else setRoute('upload')
          }}
          onDemoLoad={onDemoLoad}
          onResume={async (item) => {
            try {
              const mod = await api.getModule(item.id)
              setCurrentModule(mod)
              setRoute('hub')
            } catch (err) {
              alert(err.message)
            }
          }}
          onLand={() => setRoute('landing')}
          onLogin={() => setRoute('login')}
          onMockTestTrigger={onMockTestTrigger}
        />
      )}
      {route === 'upload' && (
        <QuickLearningPage
          {...topbarProps}
          onSubmit={startUpload}
          onBack={() => setRoute('dashboard')}
        />
      )}
      {route === 'loading' && (
        <LoadingPage 
          topic={topic} 
          fromUpload={fromUpload} 
          onGenerate={() => {
            const cleanPersona = { grade: persona.grade, interest: persona.interest }
            return fromUpload ? api.uploadFiles(uploadCtx.files, cleanPersona, null) : api.generateModule(topic, cleanPersona)
          }}
          onDone={(module) => { setCurrentModule(module); setRoute('hub') }}
          onBack={() => setRoute('landing')}
          onGoLogin={() => setRoute('login')}
        />
      )}
      {route === 'hub' && (
        <LearningHub
          module={currentModule}
          initialTab={initialHubTab}
          {...topbarProps}
          onBack={() => setRoute('dashboard')}
        />
      )}

      {showPersona && <PersonaModal persona={persona} onSave={onPersonaChange} onClose={() => setShowPersona(false)}/>}
      {showAccountSettings && (
        <AccountSettingsModal
          user={user}
          onSave={onAccountSave}
          onDeleteAccount={onDeleteAccount}
          onClose={() => setShowAccountSettings(false)}
        />
      )}
    </>
  )
}
