import { useCleanupHealthQuery } from '../lib/queries'

export default function HealthDot() {
  const { data: health, isError } = useCleanupHealthQuery()

  const healthy = !isError && health?.healthy
  const color = healthy ? 'bg-emerald-400' : 'bg-red-500'
  const title = isError
    ? 'cleanup task: unreachable'
    : health
      ? `cleanup task: ${health.healthy ? 'healthy' : 'unhealthy'}${
          health.last_error ? ` - ${health.last_error}` : ''
        }${health.last_run_at ? ` - last ran ${health.last_run_at}` : ''}`
      : 'cleanup task: checking…'

  return <span title={title} className={`inline-block h-2 w-2 shrink-0 rounded-full ${color}`} />
}
