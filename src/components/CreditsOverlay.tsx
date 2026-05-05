/**
 * CreditsOverlay — modal overlay sourced from maxone's central credits API.
 * Profile/values/tech content is maintained in maxone Admin, not in this repo,
 * so it can be updated without shipping a SolarProof release. Inline FALLBACK
 * keeps the overlay rendering if the API is slow or unreachable. The
 * Versionierung + Hinweise sections remain SolarProof-specific and live here.
 */
import { useEffect, useCallback, useState } from 'react'

const CREDITS_API = 'https://maxone.one/api/credits/solarproof'
const CREDITS_TIMEOUT_MS = 3000

interface Props {
  open: boolean
  onClose: () => void
}

interface ValueItem { key: string; title: string; description: string }
interface TechChip { title: string }
interface TechCategory { title: string; items: string[] }

interface Project {
  slug: string
  client_name: string
  headline: string
  lead: string
  body: string[]
  intro_extra: string[]
  cta_label: string
  cta_href: string
  show_values: boolean
  show_tech_stack: boolean
}

interface Global {
  studio_name: string
  studio_tagline: string
  studio_href: string
  values_heading: string
  values_items: ValueItem[]
  tech_heading: string
  tech_subheading: string
  tech_chips: TechChip[]
  categories: TechCategory[]
}

interface Payload { project: Project; global: Global | null }

const FALLBACK: Payload = {
  project: {
    slug: 'solarproof',
    client_name: 'SolarProof',
    headline: 'Design & Entwicklung',
    lead: 'SolarProof wurde von maxone gebaut — Konzept, Design und Software.',
    body: [
      'maxone ist ein unabhängiges Team für Markenidentität, redaktionelles Webdesign und individuelle Software — mit Sitz in Deutschland.',
    ],
    intro_extra: [],
    cta_label: 'Zu maxone',
    cta_href: 'https://maxone.one',
    show_values: true,
    show_tech_stack: true,
  },
  global: {
    studio_name: 'maxone',
    studio_tagline:
      'Ein unabhängiges Team für Markenidentität, redaktionelles Webdesign und individuelle Software — mit Sitz in Deutschland.',
    studio_href: 'https://maxone.one',
    values_heading: 'Woran wir uns halten',
    values_items: [
      { key: 'germany', title: 'Germany First', description: 'Server und Daten in Deutschland.' },
      { key: 'self', title: 'Self-Hosted', description: 'Keine Cloud-Abhängigkeit, volle Kontrolle.' },
      { key: 'gdpr', title: 'DSGVO-native', description: 'Datenschutz by Design, nicht nachträglich.' },
      { key: 'custom', title: '100% Custom', description: 'Kein Baukasten, kein Template.' },
    ],
    tech_heading: 'Tools & Technologien',
    tech_subheading: 'Alles self-hosted, alles aus Deutschland.',
    tech_chips: [],
    categories: [],
  },
}

export function CreditsOverlay({ open, onClose }: Props) {
  const handleClose = useCallback(() => onClose(), [onClose])
  const [data, setData] = useState<Payload>(FALLBACK)

  useEffect(() => {
    if (!open) return
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), CREDITS_TIMEOUT_MS)
    fetch(CREDITS_API, { signal: controller.signal, headers: { Accept: 'application/json' } })
      .then((res) => (res.ok ? res.json() : null))
      .then((json: Partial<Payload> | null) => {
        if (!json || !json.project) return
        setData({
          project: {
            ...FALLBACK.project,
            ...json.project,
            body:
              Array.isArray(json.project.body) && json.project.body.length
                ? json.project.body
                : FALLBACK.project.body,
            intro_extra: Array.isArray(json.project.intro_extra) ? json.project.intro_extra : [],
          },
          global: json.global ? { ...FALLBACK.global!, ...json.global } : FALLBACK.global,
        })
      })
      .catch(() => { /* keep FALLBACK */ })
      .finally(() => clearTimeout(timeout))
    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, handleClose])

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const { project, global } = data
  const showValues =
    project.show_values && !!global && Array.isArray(global.values_items) && global.values_items.length > 0
  const showTechStack =
    project.show_tech_stack &&
    !!global &&
    ((Array.isArray(global.tech_chips) && global.tech_chips.length > 0) ||
      (Array.isArray(global.categories) && global.categories.length > 0))
  const hasIntroExtra = Array.isArray(project.intro_extra) && project.intro_extra.length > 0

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto animate-fade-in">
      {/* Close */}
      <button
        onClick={handleClose}
        className="fixed top-6 right-6 z-10 p-2 rounded-full bg-white/80 backdrop-blur border border-gray-200 hover:bg-gray-100 transition-colors"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="max-w-2xl mx-auto px-6 py-20">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-gray-500 mb-3">Credits</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.headline}</h1>
        <p className="text-gray-500 mb-10">SolarProof v{__APP_VERSION__} ({__GIT_COMMIT__})</p>

        {/* Lead + body */}
        <section className="mb-10 space-y-3">
          <p className="text-base italic text-gray-800 leading-relaxed">{project.lead}</p>
          {project.body.map((p, i) => (
            <p key={i} className="text-sm text-gray-600 leading-relaxed">{p}</p>
          ))}
        </section>

        {hasIntroExtra && (
          <div className="mb-10 flex flex-wrap gap-2">
            {project.intro_extra.map((s) => (
              <span
                key={s}
                className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-medium uppercase tracking-wider text-amber-700"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Values */}
        {showValues && (
          <section className="mb-12">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{global!.values_heading}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {global!.values_items.map((v) => (
                <article key={v.key} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h3 className="text-sm font-semibold text-gray-900">{v.title}</h3>
                  <p className="mt-1 text-xs text-gray-600 leading-relaxed">{v.description}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Tech stack */}
        {showTechStack && (
          <section className="mb-12">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{global!.tech_heading}</h2>
            {global!.tech_subheading && (
              <p className="text-xs text-gray-500 mb-4">{global!.tech_subheading}</p>
            )}

            {global!.tech_chips && global!.tech_chips.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {global!.tech_chips.map((c) => (
                  <span
                    key={c.title}
                    className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-800"
                  >
                    {c.title}
                  </span>
                ))}
              </div>
            )}

            {global!.categories && global!.categories.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {global!.categories.map((cat) => (
                  <div key={cat.title} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">{cat.title}</h3>
                    <ul className="space-y-1">
                      {cat.items.map((it) => (
                        <li key={it} className="text-xs text-gray-600">{it}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Profile card */}
        <section className="mb-12 rounded-xl border-l-4 border-amber-500 bg-gray-50 p-6">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-gray-500 mb-2">
            Gebaut von
          </p>
          <p className="text-2xl font-bold text-gray-900 mb-2">
            {global?.studio_name ?? 'maxone'}
          </p>
          {global?.studio_tagline && (
            <p className="text-sm italic text-gray-600 leading-relaxed mb-4">
              {global.studio_tagline}
            </p>
          )}
          <a
            href={global?.studio_href ?? project.cta_href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
          >
            {project.cta_label}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </section>

        {/* Version — SolarProof-specific, stays local */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Versionierung</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">App-Version</span>
              <span className="font-mono text-gray-900">{__APP_VERSION__}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Git-Commit</span>
              <span className="font-mono text-gray-900">{__GIT_COMMIT__}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Spezifikation</span>
              <span className="font-mono text-gray-900">v1.2</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4 leading-relaxed">
            Alle Berechnungen sind anhand der Engine-Version und des Git-Commits jederzeit
            reproduzierbar. Der Quellcode ist auf GitHub verfügbar.
          </p>
        </section>

        {/* Legal — SolarProof-specific, stays local */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Hinweise</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            SolarProof ist ein Werkzeug zur Simulation und Dokumentation.
            Die erzeugten Berichte stellen keine rechtliche oder technische Beratung dar.
            Für die Verwendung vor Gericht wird die Validierung durch einen
            Sachverständigen empfohlen.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mt-3">
            Alle Daten werden ausschließlich in deinem Browser verarbeitet.
            Keine Messdaten verlassen deinen Rechner — nur der PDF-Hash wird
            für den Zeitstempel an die Zeitstempelbehörde übermittelt.
          </p>
          <p className="text-xs text-gray-500 leading-relaxed mt-4">
            Inhalte und Marken auf dieser Plattform unterliegen dem Urheberrecht von{' '}
            <strong className="text-gray-700 font-medium">{project.client_name}</strong>.
          </p>
        </section>

        {/* Back */}
        <button
          onClick={handleClose}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Zurück zum Tool
        </button>
      </div>
    </div>
  )
}
