import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

export default function SettingsPage() {
  const [key, setKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.getApiKey().then((r) => setKey(r.key)).catch((e) => setError(e.message))
  }, [])

  const copy = async () => {
    if (!key) return
    await navigator.clipboard.writeText(key)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const regenerate = async () => {
    if (!confirm('Regenerate the API key? Anything using the old key will stop working.')) return
    const r = await api.regenerateApiKey()
    setKey(r.key)
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-6">
      <Link to="/" className="mb-4 inline-block text-sm text-neutral-500">
        ← back
      </Link>
      <h1 className="mb-4 text-lg font-semibold text-neutral-50">Settings</h1>

      <h2 className="mb-1 text-sm font-medium text-neutral-300">MCP / API key</h2>
      <p className="mb-3 text-xs text-neutral-500">
        Use this as the <code>x-api-key</code> header for the ingest endpoint and MCP tools.
      </p>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {key && (
        <div className="flex items-center gap-2">
          <code className="flex-1 truncate rounded-lg bg-neutral-900 px-3 py-2 text-xs text-neutral-300">
            {key}
          </code>
          <button onClick={copy} className="rounded-full bg-neutral-800 px-3 py-2 text-xs text-neutral-100">
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}

      <button
        onClick={regenerate}
        className="mt-4 rounded-full bg-neutral-900 px-4 py-2 text-xs text-red-400"
      >
        Regenerate key
      </button>
    </div>
  )
}
