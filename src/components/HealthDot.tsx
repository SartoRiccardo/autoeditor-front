import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { CleanupHealth } from '../lib/types'

const POLL_MS = 30_000

export default function HealthDot() {
  const [health, setHealth] = useState<CleanupHealth | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    const check = () => {
      api
        .cleanupHealth()
        .then((h) => {
          if (!cancelled) {
            setHealth(h)
            setFailed(false)
          }
        })
        .catch(() => {
          if (!cancelled) setFailed(true)
        })
    }
    check()
    const id = setInterval(check, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  const healthy = !failed && health?.healthy
  const color = healthy ? 'bg-emerald-400' : 'bg-red-500'
  const title = failed
    ? 'cleanup task: unreachable'
    : health
      ? `cleanup task: ${health.healthy ? 'healthy' : 'unhealthy'}${
          health.last_error ? ` - ${health.last_error}` : ''
        }${health.last_run_at ? ` - last ran ${health.last_run_at}` : ''}`
      : 'cleanup task: checking…'

  return <span title={title} className={`inline-block h-2 w-2 shrink-0 rounded-full ${color}`} />
}
