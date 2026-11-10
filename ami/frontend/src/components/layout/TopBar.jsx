import { useState, useEffect, useRef } from 'react'
import { Ico } from '../ui/Icons.jsx'

function BrandMark({ size = 32 }) {
  return (
    <span className="brand-mark" style={{ width: size, height: size }}>
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
        <path d="M4 18 C 6 8, 12 4, 12 4 C 12 4, 18 8, 20 18" stroke="white" strokeWidth="2.4" strokeLinecap="round" fill="none"/>
        <circle cx="12" cy="12" r="2" fill="white"/>
      </svg>
    </span>
  )
}

export function Brand({ tag = 'VOICE' }) {
  return (
    <div className="brand" title="AMI Voice · Powered by Gnani AI">
      <BrandMark/>
      <span>AMI</span>
      {tag && <span className="brand-tag">{tag}</span>}
    </div>
  )
}

function UserMenu({ persona, onChangePersona, onAccountSettings, onLogout, user }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  // Derive initials and display info from user prop (falls back to defaults)
  const displayName = user?.name || 'Alex Liu'
  const displayEmail = user?.email || 'alex@ami.app'
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="user-menu" ref={ref}>
      <button className={`avatar-btn ${open ? 'is-open' : ''}`} onClick={() => setOpen(o => !o)}>
        <span className="avatar-circle">{initials}</span>
        <span className="avatar-status"/>
      </button>
      {open && (
        <div className="user-menu-pop">
          <div className="user-menu-head">
            <span className="user-menu-avatar">{initials}</span>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <strong className="user-menu-name">{displayName}</strong>
              <span className="user-menu-email">{displayEmail}</span>
            </div>
          </div>
          {persona && (
            <div className="user-menu-meta">
              <span className="user-menu-meta-label">Learning as</span>
              <span className="user-menu-meta-value">
                <span style={{ color: 'var(--peach-500)', display: 'inline-flex' }}>{persona.iconNode}</span>
                {persona.grade} · {persona.interest}
              </span>
            </div>
          )}
          <div className="user-menu-sep"/>
          <button className="user-menu-item" onClick={() => { setOpen(false); onChangePersona?.() }}>
            <Ico.Pencil/> <span>Personalize</span>
          </button>
          <button className="user-menu-item" onClick={() => { setOpen(false); onAccountSettings?.() }}>
            <Ico.Settings/> <span>Account settings</span>
          </button>
          <div className="user-menu-sep"/>
          <button className="user-menu-item user-menu-item--danger" onClick={() => { setOpen(false); onLogout?.() }}>
            <Ico.LogOut/> <span>Log out</span>
          </button>
        </div>
      )}
      <style>{`
        .user-menu { position: relative; }
        .avatar-btn { position: relative; width: 38px; height: 38px; border-radius: 50%; border: 1.5px solid var(--ink-100); background: var(--paper); padding: 0; cursor: pointer; display: grid; place-items: center; transition: all 0.2s var(--ease-organic); }
        .avatar-btn:hover { border-color: var(--peach-300); transform: translateY(-1px); box-shadow: var(--shadow-sm); }
        .avatar-btn.is-open { border-color: var(--peach-500); box-shadow: 0 0 0 4px rgba(244,122,74,0.12); }
        .avatar-circle { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, var(--peach-300), var(--peach-500)); color: white; font-size: 12px; font-weight: 700; display: grid; place-items: center; }
        .avatar-status { position: absolute; bottom: 1px; right: 1px; width: 9px; height: 9px; border-radius: 50%; background: var(--success, #4ade80); border: 2px solid var(--paper); }
        .user-menu-pop { position: absolute; top: calc(100% + 10px); right: 0; width: 260px; background: var(--paper); border: 1px solid var(--ink-100); border-radius: 14px; box-shadow: var(--shadow-lg); padding: 10px; z-index: 50; animation: user-menu-in 0.18s var(--ease-spring) both; transform-origin: top right; }
        @keyframes user-menu-in { from { opacity: 0; transform: translateY(-4px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .user-menu-head { display: flex; align-items: center; gap: 12px; padding: 8px 8px 12px; }
        .user-menu-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--peach-300), var(--peach-500)); color: white; font-size: 14px; font-weight: 700; display: grid; place-items: center; flex-shrink: 0; }
        .user-menu-name { font-size: 14px; color: var(--ink-900); }
        .user-menu-email { font-size: 12px; color: var(--ink-500); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .user-menu-meta { display: flex; flex-direction: column; gap: 4px; padding: 10px 12px; background: var(--cream-deep); border-radius: 10px; margin: 0 2px 4px; }
        .user-menu-meta-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-500); }
        .user-menu-meta-value { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 500; color: var(--ink-900); }
        .user-menu-sep { height: 1px; background: var(--ink-100); margin: 6px 4px; }
        .user-menu-item { width: 100%; display: flex; align-items: center; gap: 10px; padding: 9px 10px; background: transparent; border: none; border-radius: 8px; font: inherit; font-size: 13px; font-weight: 500; color: var(--ink-900); text-align: left; cursor: pointer; transition: background 0.15s ease; }
        .user-menu-item:hover { background: var(--cream-deep); }
        .user-menu-item svg { color: var(--ink-500); flex-shrink: 0; }
        .user-menu-item--danger { color: #c2410c; }
        .user-menu-item--danger svg { color: currentColor; }
      `}</style>
    </div>
  )
}

export function TopBar({ persona, onChangePersona, onAccountSettings, onLogout, dark, onToggleDark, user }) {
  return (
    <div className="topbar">
      <Brand/>
      {persona && (
        <div className="topbar-center" onClick={onChangePersona} style={{ cursor: 'pointer' }}>
          <span style={{ color: 'var(--ink-500)' }}>For:</span>
          <strong>{persona.grade}</strong>
          <span style={{ color: 'var(--ink-300)' }}>•</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: 'var(--peach-500)' }}>{persona.iconNode}</span>
            {persona.interest}
          </span>
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button className="icon-btn" onClick={onToggleDark} title="Toggle theme">
          {dark ? <Ico.Sun/> : <Ico.Moon/>}
        </button>
        <UserMenu
          persona={persona}
          onChangePersona={onChangePersona}
          onAccountSettings={onAccountSettings}
          onLogout={onLogout}
          user={user}
        />
      </div>
    </div>
  )
}
