import { useSearchParams } from 'react-router-dom'

export default function LoginPage() {
  const [params] = useSearchParams()
  const notWhitelisted = params.get('error') === 'not_whitelisted'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-2xl font-semibold text-neutral-50">Clip Review</h1>
      {notWhitelisted && (
        <p className="max-w-xs text-sm text-red-400">
          That Google account isn't authorized for this app.
        </p>
      )}
      <a
        href="/api/auth/login"
        className="rounded-full bg-neutral-100 px-6 py-3 text-sm font-medium text-neutral-900 active:scale-95 transition"
      >
        Sign in with Google
      </a>
      {/* TEMPORARY: only works when the backend has DEV_AUTH_BYPASS=true (local LAN
          testing, since Google rejects plain-http non-localhost redirect URIs).
          Remove this link once real-device OAuth testing is no longer needed. */}
      <a href="/api/auth/dev-login" className="text-xs text-neutral-400 underline">
        dev bypass (LAN testing only)
      </a>
    </div>
  )
}
