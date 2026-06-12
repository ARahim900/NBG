import { useEffect, useState } from 'react'
import { Share, SquarePlus, X } from 'lucide-react'

/** The non-standard event Chromium fires when a PWA is installable. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'nbg-install-dismissed'

const isStandalone = (): boolean =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as { standalone?: boolean }).standalone === true

const isIOS = (): boolean =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) &&
  !/crios|fxios/i.test(navigator.userAgent)

/**
 * First-run "Add to Home Screen" prompt. Shows once for new visitors who
 * haven't installed the app, with steps tailored to their device. Dismissal
 * is remembered, and it never appears when the app is already standalone.
 */
export default function InstallPrompt() {
  const [visible, setVisible] = useState(false)
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const ios = isIOS()

  useEffect(() => {
    let dismissed = false
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === '1'
    } catch {
      /* storage unavailable — treat as not dismissed */
    }
    if (dismissed || isStandalone()) return

    const onBeforeInstall = (e: Event) => {
      e.preventDefault() // keep our own UI in control of when to prompt
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)

    // Surface the prompt shortly after load, on phones (or any installable browser).
    const mobile = window.matchMedia('(max-width: 1023px)').matches
    const timer = window.setTimeout(() => {
      if (mobile || ios) setVisible(true)
    }, 2500)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.clearTimeout(timer)
    }
  }, [ios])

  const dismiss = () => {
    setVisible(false)
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      /* storage unavailable — it will simply prompt again next visit */
    }
  }

  const install = async () => {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
    dismiss()
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm"
        onClick={dismiss}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-title"
        className="relative z-10 w-full animate-fade-up rounded-t-3xl border-t border-glow/20 bg-[#081626]/95 p-5 text-white shadow-2xl backdrop-blur-xl sm:max-w-md sm:rounded-3xl sm:border"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.25rem)' }}
      >
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute right-3 top-3 rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3.5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 p-1.5 ring-1 ring-white/15">
            <img
              src="/logo.png"
              alt="NBG Health"
              className="h-full w-full rounded-xl object-contain"
            />
          </span>
          <div className="min-w-0">
            <h2 id="install-title" className="text-base font-extrabold leading-tight">
              Install NBG Health
            </h2>
            <p className="mt-0.5 text-[0.8rem] leading-snug text-white/70">
              Add it to your home screen for quick, full-screen access — no app
              store needed.
            </p>
          </div>
        </div>

        {/* Instructions */}
        {ios ? (
          <ol className="mt-4 space-y-2 text-[0.82rem] text-white/85">
            <li className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-teal">
                1
              </span>
              Tap the <Share className="mx-0.5 inline h-4 w-4 align-text-bottom" />{' '}
              <span className="font-semibold">Share</span> button in Safari.
            </li>
            <li className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-teal">
                2
              </span>
              Scroll down and tap{' '}
              <SquarePlus className="mx-0.5 inline h-4 w-4 align-text-bottom" />{' '}
              <span className="font-semibold">Add to Home Screen</span>.
            </li>
            <li className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-teal">
                3
              </span>
              Tap <span className="font-semibold">Add</span> — done.
            </li>
          </ol>
        ) : deferred ? (
          <div className="mt-5 flex gap-2.5">
            <button
              onClick={install}
              className="flex-1 rounded-xl bg-teal px-4 py-2.5 text-sm font-bold text-navy-900 transition-colors hover:bg-teal/90"
            >
              Install app
            </button>
            <button
              onClick={dismiss}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white"
            >
              Maybe later
            </button>
          </div>
        ) : (
          <p className="mt-4 text-[0.82rem] leading-snug text-white/85">
            Open your browser menu and choose{' '}
            <span className="font-semibold">&ldquo;Add to Home screen&rdquo;</span>{' '}
            (or <span className="font-semibold">Install app</span>).
          </p>
        )}

        {ios && (
          <button
            onClick={dismiss}
            className="mt-5 w-full rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/15"
          >
            Got it
          </button>
        )}
      </div>
    </div>
  )
}
