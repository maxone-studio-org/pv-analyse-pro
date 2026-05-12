import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[SolarProof] Unerwarteter Fehler:', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ error: null })
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-[calc(100vh-112px)] flex items-center justify-center px-6">
          <div className="max-w-md w-full text-center space-y-4">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Unerwarteter Fehler</h2>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                Etwas ist schiefgelaufen. Deine Daten sind nicht betroffen —
                sie liegen nur in deinem Browser.
              </p>
            </div>
            <details className="text-left bg-gray-50 rounded-xl p-4 text-xs text-gray-500 font-mono">
              <summary className="cursor-pointer font-semibold text-gray-700 mb-2">Fehlerdetails</summary>
              {this.state.error.message}
            </details>
            <button
              onClick={this.handleReset}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              Neu laden
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
