import { useState } from 'react'

type FeedbackType = 'feedback' | 'bug' | 'idea'

export function FeedbackButton() {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<FeedbackType>('feedback')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = () => {
    if (!message.trim()) return

    // Build mailto link with structured feedback
    const subject = `[SolarProof ${type}] v${__APP_VERSION__} (${__GIT_COMMIT__})`
    const body = [
      `Typ: ${type}`,
      `Version: ${__APP_VERSION__} (${__GIT_COMMIT__})`,
      email ? `Antwort an: ${email}` : '',
      '',
      '---',
      '',
      message.trim(),
    ].filter(Boolean).join('\n')

    window.open(
      `mailto:feedback@maxone.one?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      '_blank'
    )

    setSent(true)
    setTimeout(() => {
      setOpen(false)
      setSent(false)
      setMessage('')
      setEmail('')
    }, 2000)
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gray-900 hover:bg-gray-800 text-white rounded-full p-3 shadow-lg transition-colors"
        title="Feedback geben"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      </button>

      {/* Feedback modal */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Feedback</h3>
                <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {sent ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-700 font-medium">Danke!</p>
                  <p className="text-sm text-gray-500 mt-1">Dein E-Mail-Programm öffnet sich.</p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-gray-500 mb-4">
                    Dein Feedback hilft uns, SolarProof besser zu machen. Es öffnet sich dein E-Mail-Programm.
                  </p>

                  {/* Type selector */}
                  <div className="flex gap-2 mb-4">
                    {([
                      { key: 'feedback' as const, label: 'Feedback' },
                      { key: 'bug' as const, label: 'Fehler' },
                      { key: 'idea' as const, label: 'Idee' },
                    ]).map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => setType(key)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          type === key
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Was möchtest du uns mitteilen?"
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:border-amber-400 mb-3"
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-Mail (optional, für Rückfragen)"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm mb-4"
                  />

                  <button
                    onClick={handleSubmit}
                    disabled={!message.trim()}
                    className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
                  >
                    Absenden
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
