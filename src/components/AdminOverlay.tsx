import { useState, useEffect } from 'react'
import { addLawyer, fetchPendingLawyers, approveLawyer, rejectLawyer, fetchAllLawyers, updateLawyer, deleteLawyer, plzToBundesland, type Lawyer } from '../data/lawyers'
import { fetchContent, saveContent } from '../data/content'
import {
  TRUST_STRIP_DEFAULT, UEBERUNS_DEFAULT, ANWALT_TIPPS_DEFAULT,
  type TrustStripItems, type UeberUnsContent, type AnwaltTippsContent, type AnwaltTipp, type AnwaltLink,
} from '../data/contentDefaults'

interface Props {
  onClose: () => void
}

const EMPTY_FORM = {
  name: '',
  kanzlei: '',
  email: '',
  website: '',
  phone: '',
  plz: '',
  ort: '',
  schwerpunkteRaw: 'SENEC, Produkthaftung',
  senec_faelle: '0',
  erstberatung_kostenlos: true,
  erstberatung_eur: '',
  beschreibung: '',
  listing_typ: 'kostenlos' as Lawyer['listing_typ'],
}

// ── Tab: Anwalt hinzufügen ────────────────────────────────────────────────────

function AddTab() {
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [error, setError] = useState('')

  function set(k: keyof typeof EMPTY_FORM, v: string | boolean) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setError('')
    try {
      await addLawyer({
        name: form.name,
        kanzlei: form.kanzlei,
        email: form.email || undefined,
        website: form.website || undefined,
        phone: form.phone || undefined,
        plz: form.plz,
        ort: form.ort,
        bundesland: plzToBundesland(form.plz),
        schwerpunkte: form.schwerpunkteRaw.split(',').map(s => s.trim()).filter(Boolean),
        senec_faelle: parseInt(form.senec_faelle) || 0,
        erstberatung_kostenlos: form.erstberatung_kostenlos,
        erstberatung_eur: form.erstberatung_kostenlos ? null : (parseInt(form.erstberatung_eur) || null),
        beschreibung: form.beschreibung || undefined,
        listing_typ: form.listing_typ,
      })
      setStatus('ok')
      setForm({ ...EMPTY_FORM })
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setStatus('error')
    }
  }

  const field = (label: string, k: keyof typeof EMPTY_FORM, placeholder = '') => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type="text"
        value={form[k] as string}
        onChange={e => set(k, e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-blue-400 focus:outline-none"
      />
    </div>
  )

  return (
    <form onSubmit={submit} className="px-6 py-5 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {field('Name', 'name', 'Dr. Max Mustermann')}
        {field('Kanzlei', 'kanzlei', 'Muster & Partner')}
        {field('E-Mail', 'email', 'kanzlei@example.de')}
        {field('Website', 'website', 'https://kanzlei.de')}
        {field('Telefon', 'phone', '+49 221 123456')}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">PLZ</label>
          <input
            type="text" required maxLength={5} pattern="\d{5}" value={form.plz}
            onChange={e => set('plz', e.target.value)} placeholder="44135"
            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-blue-400 focus:outline-none"
          />
        </div>
        {field('Ort', 'ort', 'Dortmund')}
      </div>

      {field('Schwerpunkte (kommagetrennt)', 'schwerpunkteRaw', 'SENEC, Produkthaftung')}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">SENEC-Fälle</label>
          <input type="number" min={0} value={form.senec_faelle} onChange={e => set('senec_faelle', e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-400 focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Listing-Typ</label>
          <select value={form.listing_typ} onChange={e => set('listing_typ', e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-400 focus:outline-none">
            <option value="kostenlos">Kostenlos</option>
            <option value="basis">Basis</option>
            <option value="premium">Premium</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="erstberatung_kostenlos" checked={form.erstberatung_kostenlos}
          onChange={e => set('erstberatung_kostenlos', e.target.checked)} className="rounded" />
        <label htmlFor="erstberatung_kostenlos" className="text-sm text-gray-700">Erstberatung kostenlos</label>
      </div>

      {!form.erstberatung_kostenlos && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Erstberatung EUR</label>
          <input type="number" min={0} value={form.erstberatung_eur}
            onChange={e => set('erstberatung_eur', e.target.value)} placeholder="190"
            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-400 focus:outline-none" />
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Beschreibung (optional)</label>
        <textarea value={form.beschreibung} onChange={e => set('beschreibung', e.target.value)}
          rows={2} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-400 focus:outline-none resize-none" />
      </div>

      {status === 'ok' && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800">Anwalt erfolgreich hinzugefügt.</div>
      )}
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-800 break-all">Fehler: {error}</div>
      )}

      <button type="submit" disabled={status === 'loading'}
        className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors">
        {status === 'loading' ? 'Speichert …' : 'Anwalt speichern'}
      </button>
    </form>
  )
}

// ── Tab: Ausstehende Einreichungen ────────────────────────────────────────────

function PendingTab() {
  const [pending, setPending] = useState<Lawyer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [acting, setActing]   = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    setError('')
    try {
      setPending(await fetchPendingLawyers())
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  async function approve(id: string) {
    setActing(id)
    try {
      await approveLawyer(id)
      setPending(prev => prev.filter(l => l.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setActing(null)
    }
  }

  async function reject(id: string) {
    setActing(id)
    try {
      await rejectLawyer(id)
      setPending(prev => prev.filter(l => l.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setActing(null)
    }
  }

  return (
    <div className="px-6 py-5 space-y-4">
      <div className="flex justify-end">
        <button onClick={load} disabled={loading}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {loading ? '…' : 'Neu laden'}
        </button>
      </div>

      {error && <p className="text-xs text-red-500 break-all">{error}</p>}

      {!loading && pending.length === 0 && !error && (
        <p className="text-sm text-gray-400 text-center py-6">Keine ausstehenden Einreichungen.</p>
      )}

      <div className="space-y-3">
        {pending.map(l => (
          <div key={l.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-gray-900">{l.name}</p>
                <p className="text-xs text-gray-500">{l.kanzlei}</p>
                <p className="text-xs text-gray-400">{l.plz} {l.ort} · {l.bundesland}</p>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <button
                  onClick={() => approve(l.id)}
                  disabled={acting === l.id}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {acting === l.id ? '…' : '✓ Freigeben'}
                </button>
                <button
                  onClick={() => reject(l.id)}
                  disabled={acting === l.id}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            {l.website && <p className="text-xs text-blue-600">{l.website}</p>}
            {l.beschreibung && (
              <p className="text-xs text-gray-600 bg-white border border-gray-100 rounded-lg px-3 py-2 leading-relaxed">
                „{l.beschreibung}"
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Tab: Anwälte bearbeiten ───────────────────────────────────────────────────

function lawyerToForm(l: Lawyer) {
  return {
    name: l.name,
    kanzlei: l.kanzlei,
    email: l.email ?? '',
    website: l.website ?? '',
    phone: l.phone ?? '',
    plz: l.plz,
    ort: l.ort,
    schwerpunkteRaw: l.schwerpunkte.join(', '),
    senec_faelle: String(l.senec_faelle),
    erstberatung_kostenlos: l.erstberatung_kostenlos,
    erstberatung_eur: l.erstberatung_eur != null ? String(l.erstberatung_eur) : '',
    beschreibung: l.beschreibung ?? '',
    listing_typ: l.listing_typ,
    status: l.status ?? 'active',
  }
}

type LawyerForm = ReturnType<typeof lawyerToForm>

function EditLawyerCard({ lawyer, onSaved, onDeleted }: {
  lawyer: Lawyer
  onSaved: (updated: Lawyer) => void
  onDeleted: (id: string) => void
}) {
  const [open, setOpen]         = useState(false)
  const [form, setForm]         = useState<LawyerForm>(lawyerToForm(lawyer))
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError]       = useState('')
  const [ok, setOk]             = useState(false)

  function setF(k: keyof LawyerForm, v: string | boolean) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  async function save() {
    setSaving(true)
    setError('')
    setOk(false)
    try {
      const updates: Partial<Omit<Lawyer, 'id'>> = {
        name: form.name,
        kanzlei: form.kanzlei,
        email: form.email || undefined,
        website: form.website || undefined,
        phone: form.phone || undefined,
        plz: form.plz,
        ort: form.ort,
        bundesland: plzToBundesland(form.plz),
        schwerpunkte: form.schwerpunkteRaw.split(',').map(s => s.trim()).filter(Boolean),
        senec_faelle: parseInt(form.senec_faelle) || 0,
        erstberatung_kostenlos: form.erstberatung_kostenlos,
        erstberatung_eur: form.erstberatung_kostenlos ? null : (parseInt(form.erstberatung_eur) || null),
        beschreibung: form.beschreibung || undefined,
        listing_typ: form.listing_typ,
        status: form.status as 'active' | 'pending',
      }
      await updateLawyer(lawyer.id, updates)
      setOk(true)
      onSaved({ ...lawyer, ...updates })
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  async function del() {
    if (!window.confirm(`${lawyer.name} wirklich löschen?`)) return
    setDeleting(true)
    try {
      await deleteLawyer(lawyer.id)
      onDeleted(lawyer.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setDeleting(false)
    }
  }

  const inp = (label: string, k: keyof LawyerForm, ph = '') => (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input type="text" value={form[k] as string} onChange={e => setF(k, e.target.value)}
        placeholder={ph}
        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-blue-400 focus:outline-none" />
    </div>
  )

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-3 flex items-center justify-between gap-2 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${lawyer.status === 'active' ? 'bg-green-500' : 'bg-amber-400'}`} />
          <div>
            <p className="text-sm font-semibold text-gray-900">{lawyer.name}</p>
            <p className="text-xs text-gray-400">{lawyer.kanzlei} · {lawyer.ort}</p>
          </div>
        </div>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-gray-100 p-4 space-y-3 bg-gray-50">
          <div className="grid grid-cols-2 gap-2">
            {inp('Name', 'name')}
            {inp('Kanzlei', 'kanzlei')}
            {inp('E-Mail', 'email')}
            {inp('Website', 'website')}
            {inp('Telefon', 'phone')}
            {inp('PLZ', 'plz')}
            {inp('Ort', 'ort')}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">SENEC-Fälle</label>
              <input type="number" min={0} value={form.senec_faelle}
                onChange={e => setF('senec_faelle', e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-blue-400 focus:outline-none" />
            </div>
          </div>

          {inp('Schwerpunkte (kommagetrennt)', 'schwerpunkteRaw')}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Listing-Typ</label>
              <select value={form.listing_typ} onChange={e => setF('listing_typ', e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-blue-400 focus:outline-none">
                <option value="kostenlos">Kostenlos</option>
                <option value="basis">Basis</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select value={form.status} onChange={e => setF('status', e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-blue-400 focus:outline-none">
                <option value="active">Aktiv</option>
                <option value="pending">Ausstehend</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id={`eb-${lawyer.id}`} checked={form.erstberatung_kostenlos}
              onChange={e => setF('erstberatung_kostenlos', e.target.checked)} className="rounded" />
            <label htmlFor={`eb-${lawyer.id}`} className="text-xs text-gray-700">Erstberatung kostenlos</label>
          </div>

          {!form.erstberatung_kostenlos && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Erstberatung EUR</label>
              <input type="number" min={0} value={form.erstberatung_eur}
                onChange={e => setF('erstberatung_eur', e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-blue-400 focus:outline-none" />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Beschreibung</label>
            <textarea value={form.beschreibung} onChange={e => setF('beschreibung', e.target.value)}
              rows={2} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-blue-400 focus:outline-none resize-none" />
          </div>

          {error && <p className="text-xs text-red-500 break-all">{error}</p>}
          {ok && <p className="text-xs text-green-600">Gespeichert.</p>}

          <div className="flex gap-2 pt-1">
            <button onClick={save} disabled={saving}
              className="flex-1 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {saving ? 'Speichert …' : 'Speichern'}
            </button>
            <button onClick={del} disabled={deleting}
              className="px-3 py-2 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors">
              {deleting ? '…' : 'Löschen'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function EditTab() {
  const [lawyers, setLawyers] = useState<Lawyer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    setError('')
    try {
      setLawyers(await fetchAllLawyers())
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-6 py-5 space-y-4">
      <div className="flex justify-end">
        <button onClick={load} disabled={loading}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {loading ? '…' : 'Neu laden'}
        </button>
      </div>

      {error && <p className="text-xs text-red-500 break-all">{error}</p>}

      {!loading && lawyers.length === 0 && !error && (
        <p className="text-sm text-gray-400 text-center py-6">Keine Anwälte gefunden.</p>
      )}

      <div className="space-y-2">
        {lawyers.map(l => (
          <EditLawyerCard
            key={l.id}
            lawyer={l}
            onSaved={updated => setLawyers(prev => prev.map(x => x.id === updated.id ? updated : x))}
            onDeleted={id => setLawyers(prev => prev.filter(x => x.id !== id))}
          />
        ))}
      </div>
    </div>
  )
}

// ── Tab: Inhalte (CMS) ────────────────────────────────────────────────────────

function SaveButton({ onClick, saving, ok }: { onClick: () => void; saving: boolean; ok: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <button onClick={onClick} disabled={saving}
        className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
        {saving ? 'Speichert …' : 'Speichern'}
      </button>
      {ok && <span className="text-xs text-green-600">✓ Gespeichert</span>}
    </div>
  )
}

function InhalteTab() {
  const [adminKey, setAdminKey] = useState('')
  const [error, setError]       = useState('')

  // Trust-Strip
  const [trustItems, setTrustItems]         = useState<TrustStripItems>(TRUST_STRIP_DEFAULT)
  const [trustSaving, setTrustSaving]       = useState(false)
  const [trustOk, setTrustOk]               = useState(false)

  // Über uns
  const [ueberUns, setUeberUns]             = useState<UeberUnsContent>(UEBERUNS_DEFAULT)
  const [ueberSaving, setUeberSaving]       = useState(false)
  const [ueberOk, setUeberOk]               = useState(false)

  // Tipps & Links
  const [tipps, setTipps]                   = useState<AnwaltTippsContent>(ANWALT_TIPPS_DEFAULT)
  const [tippsSaving, setTippsSaving]       = useState(false)
  const [tippsOk, setTippsOk]               = useState(false)

  // Load all content on mount
  useEffect(() => {
    fetchContent<TrustStripItems>('trust_strip').then(v => { if (v) setTrustItems(v) }).catch(() => {})
    fetchContent<UeberUnsContent>('ueberuns').then(v => { if (v) setUeberUns(v) }).catch(() => {})
    fetchContent<AnwaltTippsContent>('anwalt_tipps').then(v => { if (v) setTipps(v) }).catch(() => {})
  }, [])

  async function saveTrust() {
    setTrustSaving(true); setError(''); setTrustOk(false)
    try { await saveContent('trust_strip', trustItems.filter(Boolean), adminKey); setTrustOk(true) }
    catch (e) { setError(e instanceof Error ? e.message : String(e)) }
    finally { setTrustSaving(false) }
  }

  async function saveUeberUns() {
    setUeberSaving(true); setError(''); setUeberOk(false)
    try { await saveContent('ueberuns', ueberUns, adminKey); setUeberOk(true) }
    catch (e) { setError(e instanceof Error ? e.message : String(e)) }
    finally { setUeberSaving(false) }
  }

  async function saveTipps() {
    setTippsSaving(true); setError(''); setTippsOk(false)
    try { await saveContent('anwalt_tipps', tipps, adminKey); setTippsOk(true) }
    catch (e) { setError(e instanceof Error ? e.message : String(e)) }
    finally { setTippsSaving(false) }
  }

  const ta = (label: string, val: string, onChange: (v: string) => void, rows = 3) => (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <textarea value={val} onChange={e => onChange(e.target.value)} rows={rows}
        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-blue-400 focus:outline-none resize-none leading-relaxed" />
    </div>
  )

  const inp = (label: string, val: string, onChange: (v: string) => void) => (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input type="text" value={val} onChange={e => onChange(e.target.value)}
        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-blue-400 focus:outline-none" />
    </div>
  )

  return (
    <div className="px-6 py-5 space-y-6">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">CMS-Key (panel.maxone.one Service Role)</label>
        <input type="password" value={adminKey}
          onChange={e => setAdminKey(e.target.value)}
          placeholder="eyJ… — nur zum Speichern nötig"
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono text-gray-700 focus:border-blue-400 focus:outline-none" />
      </div>

      {error && <p className="text-xs text-red-500 break-all">{error}</p>}

      {/* ── Trust-Strip ── */}
      <div className="border-t border-gray-100 pt-5 space-y-3">
        <h3 className="text-sm font-bold text-gray-900">Trust-Strip</h3>
        <p className="text-xs text-gray-400">Chips in der gelben Leiste unter dem Header.</p>
        {trustItems.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input type="text" value={item}
              onChange={e => setTrustItems(prev => prev.map((v, j) => j === i ? e.target.value : v))}
              className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-blue-400 focus:outline-none" />
            <button type="button"
              onClick={() => setTrustItems(prev => prev.filter((_, j) => j !== i))}
              className="px-2 py-1.5 text-gray-400 hover:text-red-500 transition-colors">✕</button>
          </div>
        ))}
        <button type="button"
          onClick={() => setTrustItems(prev => [...prev, ''])}
          className="text-xs text-blue-600 hover:underline">+ Chip hinzufügen</button>
        <SaveButton onClick={saveTrust} saving={trustSaving} ok={trustOk} />
      </div>

      {/* ── Über uns ── */}
      <div className="border-t border-gray-100 pt-5 space-y-3">
        <h3 className="text-sm font-bold text-gray-900">Über uns</h3>
        {ta('Einleitung', ueberUns.intro_lead, v => setUeberUns(p => ({ ...p, intro_lead: v })), 4)}
        {inp('Disclaimer (kursiv, klein)', ueberUns.intro_disclaimer, v => setUeberUns(p => ({ ...p, intro_disclaimer: v })))}
        <p className="text-xs font-semibold text-gray-600 pt-1">Robert</p>
        {inp('Untertitel', ueberUns.robert_subtitle, v => setUeberUns(p => ({ ...p, robert_subtitle: v })))}
        {ta('Bio', ueberUns.robert_bio, v => setUeberUns(p => ({ ...p, robert_bio: v })), 4)}
        <p className="text-xs font-semibold text-gray-600 pt-1">Max</p>
        {inp('Untertitel', ueberUns.max_subtitle, v => setUeberUns(p => ({ ...p, max_subtitle: v })))}
        {ta('Bio', ueberUns.max_bio, v => setUeberUns(p => ({ ...p, max_bio: v })), 4)}
        <p className="text-xs font-semibold text-gray-600 pt-1">Warum kostenlos?</p>
        {ta('Absatz 1', ueberUns.warum_text1, v => setUeberUns(p => ({ ...p, warum_text1: v })))}
        {ta('Absatz 2', ueberUns.warum_text2, v => setUeberUns(p => ({ ...p, warum_text2: v })))}
        <SaveButton onClick={saveUeberUns} saving={ueberSaving} ok={ueberOk} />
      </div>

      {/* ── Tipps & Links ── */}
      <div className="border-t border-gray-100 pt-5 space-y-3">
        <h3 className="text-sm font-bold text-gray-900">Tipps & Links (Schritt 4)</h3>
        <p className="text-xs text-gray-400">Tipps unter der Anwaltsliste.</p>

        {tipps.tipps.map((t, i) => (
          <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600">Tipp {i + 1}</span>
              <button type="button"
                onClick={() => setTipps(p => ({ ...p, tipps: p.tipps.filter((_, j) => j !== i) }))}
                className="text-xs text-gray-400 hover:text-red-500">✕</button>
            </div>
            {inp('Titel', t.title, v => setTipps(p => ({ ...p, tipps: p.tipps.map((x, j) => j === i ? { ...x, title: v } : x) })))}
            {ta('Beschreibung', t.desc, v => setTipps(p => ({ ...p, tipps: p.tipps.map((x: AnwaltTipp, j: number) => j === i ? { ...x, desc: v } : x) })), 2)}
          </div>
        ))}
        <button type="button"
          onClick={() => setTipps(p => ({ ...p, tipps: [...p.tipps, { title: '', desc: '' }] }))}
          className="text-xs text-blue-600 hover:underline">+ Tipp hinzufügen</button>

        <p className="text-xs font-semibold text-gray-600 pt-2">Externe Links</p>
        {tipps.externe_links.map((l, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="flex-1 grid grid-cols-2 gap-2">
              {inp('Label', l.label, v => setTipps(p => ({ ...p, externe_links: p.externe_links.map((x, j) => j === i ? { ...x, label: v } : x) })))}
              {inp('URL', l.href, v => setTipps(p => ({ ...p, externe_links: p.externe_links.map((x: AnwaltLink, j: number) => j === i ? { ...x, href: v } : x) })))}
            </div>
            <button type="button"
              onClick={() => setTipps(p => ({ ...p, externe_links: p.externe_links.filter((_, j) => j !== i) }))}
              className="mt-5 text-gray-400 hover:text-red-500">✕</button>
          </div>
        ))}
        <button type="button"
          onClick={() => setTipps(p => ({ ...p, externe_links: [...p.externe_links, { label: '', href: '' }] }))}
          className="text-xs text-blue-600 hover:underline">+ Link hinzufügen</button>

        <SaveButton onClick={saveTipps} saving={tippsSaving} ok={tippsOk} />
      </div>
    </div>
  )
}

// ── AdminOverlay ──────────────────────────────────────────────────────────────

type Tab = 'pending' | 'add' | 'edit' | 'inhalte'

export function AdminOverlay({ onClose }: Props) {
  const [tab, setTab] = useState<Tab>('pending')

  const tabs: [Tab, string][] = [
    ['pending',  'Einreichungen'],
    ['add',      'Hinzufügen'],
    ['edit',     'Bearbeiten'],
    ['inhalte',  'Inhalte'],
  ]

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center overflow-y-auto p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Admin</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex border-b border-gray-100">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 py-3 text-xs font-semibold transition-colors ${
                tab === id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'pending'  && <PendingTab />}
        {tab === 'add'      && <AddTab />}
        {tab === 'edit'     && <EditTab />}
        {tab === 'inhalte'  && <InhalteTab />}

      </div>
    </div>
  )
}
