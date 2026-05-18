import { useState, useEffect, useRef } from 'react'
import type { AuthState } from '../hooks/useAuth'
import { PANEL_URL, supabase } from '../lib/supabase'

const DEV_ACCOUNTS = [
  { label: 'Nutzer',  email: 'test-nutzer@solarproof.dev',  role: 'user',   color: '#334155' },
  { label: 'Anwalt',  email: 'test-anwalt@solarproof.dev',  role: 'lawyer', color: '#1d4ed8' },
] as const

const DEV_PASSWORD = 'solarproof-dev-2026'

interface DevPanelProps {
  auth: AuthState
}

type Tab = 'session' | 'build'

const POS_KEY  = 'solarproof-devpanel-pos'
const OPEN_KEY = 'solarproof-devpanel-open'
const TAB_KEY  = 'solarproof-devpanel-tab'

function defaultPos() {
  return { x: 12, y: Math.max(80, window.innerHeight - 570) }
}

function loadPos(): { x: number; y: number } {
  try {
    const raw = localStorage.getItem(POS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return defaultPos()
}

export function DevPanel({ auth }: DevPanelProps) {
  const [open, setOpen] = useState(() => localStorage.getItem(OPEN_KEY) === 'true')
  const [tab,  setTab]  = useState<Tab>(() => (localStorage.getItem(TAB_KEY) as Tab) ?? 'session')
  const [pos,  setPos]  = useState<{ x: number; y: number }>(loadPos)

  const dragging   = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 })

  useEffect(() => { localStorage.setItem(OPEN_KEY, String(open)) }, [open])
  useEffect(() => { localStorage.setItem(TAB_KEY, tab) }, [tab])

  // Alt+D toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault()
        setOpen(v => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Drag
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      const next = { x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y }
      setPos(next)
      localStorage.setItem(POS_KEY, JSON.stringify(next))
    }
    const onUp = () => { dragging.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  if (!auth.isAdmin) return null

  const onHeaderMouseDown = (e: React.MouseEvent) => {
    dragging.current = true
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
  }

  const handleSignOut = () => {
    if (confirm('Wirklich abmelden?')) auth.signOut()
  }

  async function switchTo(email: string) {
    await supabase.auth.signOut()
    await supabase.auth.signInWithPassword({ email, password: DEV_PASSWORD })
    // onAuthStateChange in useAuth reacts automatically
  }

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{ position: 'fixed', bottom: 12, left: 12, zIndex: 9999 }}
        className="flex items-center gap-1.5 bg-gray-900 text-white text-xs font-mono px-3 py-1.5 rounded-full shadow-lg hover:bg-gray-800 transition-colors select-none"
        title="Dev Panel (Alt+D)"
      >
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', flexShrink: 0, display: 'inline-block' }} />
        ADMIN
      </button>

      {/* Panel */}
      {open && (
        <div
          style={{
            position:      'fixed',
            left:          pos.x,
            top:           pos.y,
            zIndex:        9999,
            width:         380,
            maxHeight:     540,
            background:    '#0A1628',
            borderRadius:  10,
            boxShadow:     '0 8px 32px rgba(0,0,0,0.65)',
            display:       'flex',
            flexDirection: 'column',
            overflow:      'hidden',
            color:         '#e2e8f0',
            fontSize:      12,
          }}
        >
          {/* Draggable header */}
          <div
            onMouseDown={onHeaderMouseDown}
            style={{
              cursor:         'grab',
              padding:        '8px 12px',
              background:     '#111c30',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'space-between',
              userSelect:     'none',
            }}
          >
            <span style={{ color: '#22c55e', fontWeight: 700, fontSize: 11, letterSpacing: 1, fontFamily: 'monospace' }}>
              ● DEV PANEL
            </span>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '0 2px' }}
            >
              ×
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #1e3050' }}>
            {(['session', 'build'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex:            1,
                  padding:         '6px 0',
                  background:      tab === t ? '#0f2040' : 'transparent',
                  border:          'none',
                  color:           tab === t ? '#93c5fd' : '#64748b',
                  cursor:          'pointer',
                  fontSize:        11,
                  fontFamily:      'monospace',
                  textTransform:   'uppercase',
                  letterSpacing:   0.5,
                }}
              >
                {t === 'session' ? 'Session' : 'Build'}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ padding: '12px 14px', overflowY: 'auto', flex: 1, fontFamily: 'monospace' }}>
            {tab === 'session' && (
              <>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>
                  <tbody>
                    <Row label="user.id" value={auth.user?.id ?? '—'} />
                    <Row label="email"   value={auth.user?.email ?? '—'} />
                    <Row label="role"    value={String(auth.user?.app_metadata?.role ?? '—')} />
                  </tbody>
                </table>
                <div style={{ borderTop: '1px solid #1e3050', paddingTop: 10 }}>
                  <div style={{ color: '#64748b', fontSize: 10, marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                    Als Rolle einloggen
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {DEV_ACCOUNTS.map(acc => (
                      <button
                        key={acc.role}
                        onClick={() => switchTo(acc.email)}
                        title={acc.email}
                        style={{
                          background:   acc.color,
                          border:       'none',
                          color:        '#fff',
                          padding:      '4px 10px',
                          borderRadius: 4,
                          cursor:       'pointer',
                          fontSize:     11,
                          fontFamily:   'monospace',
                          opacity:      auth.user?.email === acc.email ? 0.4 : 1,
                        }}
                        disabled={auth.user?.email === acc.email}
                      >
                        {acc.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            {tab === 'build' && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <Row label="version"    value={__APP_VERSION__} />
                  <Row label="git"        value={__GIT_COMMIT__} />
                  <Row label="built_at"   value={__BUILD_TIME__.substring(0, 19) + 'Z'} />
                  <Row label="mode"       value={import.meta.env.MODE} />
                  <Row label="panel_url"  value={PANEL_URL} />
                </tbody>
              </table>
            )}
          </div>

          {/* Footer */}
          {tab === 'session' && (
            <div style={{ padding: '8px 14px', borderTop: '1px solid #1e3050' }}>
              <button
                onClick={handleSignOut}
                style={{
                  background:  '#7f1d1d',
                  border:      'none',
                  color:       '#fca5a5',
                  padding:     '5px 12px',
                  borderRadius: 4,
                  cursor:      'pointer',
                  fontSize:    11,
                  fontFamily:  'monospace',
                }}
              >
                Abmelden
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr style={{ borderBottom: '1px solid #1e3050' }}>
      <td style={{ color: '#64748b', padding: '5px 0', paddingRight: 12, whiteSpace: 'nowrap', verticalAlign: 'top' }}>
        {label}
      </td>
      <td style={{ color: '#e2e8f0', padding: '5px 0', wordBreak: 'break-all' }}>
        {value}
      </td>
    </tr>
  )
}
