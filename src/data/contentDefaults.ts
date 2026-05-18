export type TrustStripItems = string[]

export const TRUST_STRIP_DEFAULT: TrustStripItems = [
  'Von PV-Fachleuten gebaut, die selbst betroffen sind',
  'Kostenlos',
  'Kein Abo',
  'Keine Daten verkauft',
]

export interface UeberUnsContent {
  intro_lead: string
  intro_disclaimer: string
  robert_subtitle: string
  robert_bio: string
  max_subtitle: string
  max_bio: string
  warum_text1: string
  warum_text2: string
}

export const UEBERUNS_DEFAULT: UeberUnsContent = {
  intro_lead: 'SolarProof wurde nicht von Anwälten gebaut — sondern von echten Geschädigten, die zufällig selbst aus der Photovoltaikbranche kommen. Wir wissen, wie die Technik funktioniert, wir wissen, was SENEC verspricht — und wir wissen aus eigener Erfahrung, wann etwas davon nicht stimmt.',
  intro_disclaimer: 'Kein Interessenkonflikt. Kein Mandat. Nur Menschen, die dasselbe Problem haben wie du.',
  robert_subtitle: 'Mitgründer · PV-Fachmann · persönlich betroffen',
  robert_bio: 'Robert arbeitet selbst in der Photovoltaikbranche — und trotzdem hat ihn SENEC mit einer defekten Anlage im Stich gelassen. Er weiß, was die Technik leisten sollte, er versteht die Messdaten — und er hat erlebt, wie unverbindlich Kulanz-Angebote formuliert sind, wenn man den Hersteller nicht unter Druck setzen kann. SolarProof entstand aus genau dieser Frustration.',
  max_subtitle: 'Mitgründer · Entwickler · aus der PV-Branche',
  max_bio: 'Max kommt ebenfalls aus der Photovoltaikbranche und kennt die technische Seite von SENEC-Anlagen aus der Praxis. Seine Eltern sind SENEC-Kunden — und stecken mitten im Verfahren. Als er sah, dass es kein vernünftiges Tool gibt, das Betroffene strukturiert durch den Prozess führt, hat er eins gebaut.',
  warum_text1: 'Wir verdienen kein Geld daran, dass du die Plattform nutzt. Wir verdienen Geld, wenn ein Anwalt aus unserem Netzwerk deinen Fall erfolgreich abschließt — erst dann zahlt die Kanzlei eine Provision an uns.',
  warum_text2: 'Das bedeutet: Unser Interesse ist dasselbe wie deins. Wir helfen dir nur dann, wenn wir dir wirklich helfen können.',
}

export interface AnwaltTipp { title: string; desc: string }
export interface AnwaltLink { label: string; href: string }

export interface AnwaltTippsContent {
  tipps: AnwaltTipp[]
  externe_links: AnwaltLink[]
}

export const ANWALT_TIPPS_DEFAULT: AnwaltTippsContent = {
  tipps: [
    { title: 'Schwerpunkt: Produkthaftung oder Kaufrecht', desc: 'Suche nach Anwälten mit Erfahrung in „Produkthaftung", „PV-Anlagen" oder „Kaufrechtsmängel". SENEC-Fälle häufen sich — viele Kanzleien haben bereits Erfahrung.' },
    { title: 'OLG Hamm als Argument', desc: 'Az. 2 U 5/25 (11.04.2025) — Drosselung auf 70% = Sachmangel, Rücktrittsrecht. Bei Totalausfall gilt das erst recht. Dein Anwalt kann das sofort einsetzen.' },
    { title: 'Das bringst du mit', desc: 'SolarProof-PDF, Kaufvertrag, alle Schreiben mit SENEC, Kulanz-Angebot wenn vorhanden. Je mehr Dokumentation, desto schneller die Einschätzung.' },
  ],
  externe_links: [
    { label: 'anwaltauskunft.de', href: 'https://www.anwaltauskunft.de' },
    { label: 'advocado.de', href: 'https://www.advocado.de' },
  ],
}
