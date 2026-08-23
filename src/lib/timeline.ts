export const SCENE_COLORS = [
  'bg-sky-900/60',
  'bg-violet-900/60',
  'bg-teal-900/60',
  'bg-rose-900/60',
  'bg-amber-900/60',
]

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
