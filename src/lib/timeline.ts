// kept away from red/green hues on purpose - those are reserved for clip
// review status (rejected/accepted), so scene bands can't be mistaken for them
export const SCENE_COLORS = ['bg-[#1e293b]', 'bg-[#312e81]', 'bg-[#164e63]', 'bg-[#581c87]', 'bg-[#3f3f46]']

export function sceneColor(index: number) {
  return SCENE_COLORS[index % SCENE_COLORS.length]
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function formatTime(seconds: number) {
  const s = Math.max(0, seconds)
  const m = Math.floor(s / 60)
  const rem = (s % 60).toFixed(1).padStart(4, '0')
  return `${m}:${rem}`
}

export const MIN_ZOOM_SECONDS = 2

const NICE_TICK_INTERVALS = [0.1, 0.2, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600]

// picks a "nice" seconds-per-gridline spacing so the edit strip shows roughly
// targetTicks gridlines no matter how zoomed in/out the current window is
export function pickTickInterval(windowSeconds: number, targetTicks = 6) {
  const raw = windowSeconds / targetTicks
  return NICE_TICK_INTERVALS.find((n) => n >= raw) ?? NICE_TICK_INTERVALS[NICE_TICK_INTERVALS.length - 1]
}
