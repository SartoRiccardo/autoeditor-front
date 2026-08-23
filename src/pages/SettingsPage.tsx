import { useState } from 'react'
import { Link } from 'react-router-dom'
import ConfirmDialog from '../components/ConfirmDialog'
import { useApiKeyQuery, useRegenerateApiKeyMutation } from '../lib/queries'

export default function SettingsPage() {
  const { data, isPending, error } = useApiKeyQuery()
  const regenerateApiKey = useRegenerateApiKeyMutation()
  const [copied, setCopied] = useState(false)
  const [confirmingRegenerate, setConfirmingRegenerate] = useState(false)

  const key = data?.key

  const copy = async () => {
    if (!key) return
    await navigator.clipboard.writeText(key)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const regenerate = () => {
    regenerateApiKey.mutate()
    setConfirmingRegenerate(false)
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-6">
      <Link to="/" className="mb-4 inline-block text-sm text-neutral-400">
        ← back
      </Link>
      <h1 className="mb-4 text-lg font-semibold text-neutral-50">Settings</h1>

      <h2 className="mb-1 text-sm font-medium text-neutral-300">MCP / API key</h2>
      <p className="mb-3 text-xs text-neutral-400">
        Use this as the <code>x-api-key</code> header for the ingest endpoint and MCP tools.
      </p>

      {!isPending && error && <p className="text-sm text-red-400">{(error as Error).message}</p>}
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
        onClick={() => setConfirmingRegenerate(true)}
        disabled={regenerateApiKey.isPending}
        className="mt-4 rounded-full bg-neutral-900 px-4 py-2 text-xs text-red-400 disabled:opacity-30"
      >
        Regenerate key
      </button>

      <ConfirmDialog
        open={confirmingRegenerate}
        title="Regenerate the API key?"
        description="Anything using the old key will stop working."
        confirmLabel="Regenerate"
        danger
        onConfirm={regenerate}
        onCancel={() => setConfirmingRegenerate(false)}
      />
    </div>
  )
}
