interface Props {
  onImpressum: () => void
  onDatenschutz: () => void
}

export function Footer({ onImpressum, onDatenschutz }: Props) {
  return (
    <footer className="mt-12 py-6 border-t border-gray-100 text-center text-xs text-gray-400 space-x-4">
      <span>© {new Date().getFullYear()} SolarProof</span>
      <span>·</span>
      <button
        onClick={onImpressum}
        className="hover:text-gray-600 transition-colors underline underline-offset-2"
      >
        Impressum
      </button>
      <span>·</span>
      <button
        onClick={onDatenschutz}
        className="hover:text-gray-600 transition-colors underline underline-offset-2"
      >
        Datenschutz
      </button>
    </footer>
  )
}
