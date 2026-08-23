import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePatchClipsMutation, useVideoQuery } from '../lib/queries'
import { clamp } from '../lib/timeline'
import type { Clip } from '../lib/types'

const AUTOSAVE_INTERVAL_MS = 10_000

type ClipOverride = Pick<Clip, 'start' | 'end' | 'usable' | 'viewed'>

export type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export function useProjectEditor(videoId: number) {
  const { data: detail, isPending, error } = useVideoQuery(videoId)
  const patchClips = usePatchClipsMutation(videoId)

  const [overrides, setOverrides] = useState<Record<number, ClipOverride>>({})
  const [selectedClipId, setSelectedClipId] = useState<number | null>(null)
  const [zoom, setZoom] = useState(0)
  const [viewportStart, setViewportStart] = useState(0)
  const [playhead, setPlayhead] = useState(0)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const dirtyRef = useRef<Set<number>>(new Set())

  const duration = detail?.video.duration ?? 0

  const clips = useMemo(() => {
    if (!detail) return []
    return detail.clips
      .map((c) => ({ ...c, ...overrides[c.id] }))
      .sort((a, b) => a.start - b.start)
  }, [detail, overrides])

  // interval below reads clips via this ref instead of closing over `clips` directly,
  // so an in-progress trim drag (which updates `clips` on every pointermove) doesn't
  // keep tearing down and restarting the 10s timer
  const clipsRef = useRef(clips)
  clipsRef.current = clips

  // initialize zoom/selection once the video loads
  useEffect(() => {
    if (!detail || duration <= 0 || zoom > 0) return
    setZoom(duration)
    setViewportStart(0)
    if (detail.clips.length > 0) {
      setSelectedClipId([...detail.clips].sort((a, b) => a.start - b.start)[0].id)
    }
  }, [detail, duration, zoom])

  const selectedClip = clips.find((c) => c.id === selectedClipId) ?? null

  const setViewport = useCallback(
    (start: number, z: number) => {
      const clampedZoom = clamp(z, Math.min(2, duration || 2), duration || z)
      const clampedStart = clamp(start, 0, Math.max(0, duration - clampedZoom))
      setZoom(clampedZoom)
      setViewportStart(clampedStart)
    },
    [duration],
  )

  const ensureVisible = useCallback(
    (time: number) => {
      setViewportStart((prev) => {
        if (time >= prev && time <= prev + zoom) return prev
        return clamp(time - zoom / 2, 0, Math.max(0, duration - zoom))
      })
    },
    [zoom, duration],
  )

  const selectClip = useCallback(
    (id: number, opts: { recenter?: boolean } = { recenter: true }) => {
      setSelectedClipId(id)
      const clip = clips.find((c) => c.id === id)
      if (clip && opts.recenter !== false) {
        ensureVisible((clip.start + clip.end) / 2)
      }
    },
    [clips, ensureVisible],
  )

  const updateClip = useCallback((id: number, patch: Partial<ClipOverride>) => {
    setOverrides((prev) => {
      const base = prev[id]
      return { ...prev, [id]: { ...(base as ClipOverride), ...patch } }
    })
    dirtyRef.current.add(id)
  }, [])

  const trimClip = useCallback(
    (id: number, start: number, end: number) => {
      updateClip(id, { start, end })
    },
    [updateClip],
  )

  const setReview = useCallback(
    (id: number, usable: boolean) => {
      updateClip(id, { usable, viewed: true })
    },
    [updateClip],
  )

  const flush = useCallback(async () => {
    const dirtyIds = Array.from(dirtyRef.current)
    if (dirtyIds.length === 0) return
    setSaveState('saving')
    try {
      const patches = dirtyIds.map((id) => {
        const clip = clipsRef.current.find((c) => c.id === id)!
        return { id, start: clip.start, end: clip.end, usable: clip.usable, viewed: clip.viewed }
      })
      await patchClips.mutateAsync(patches)
      dirtyIds.forEach((id) => dirtyRef.current.delete(id))
      setSaveState('saved')
    } catch (e) {
      setSaveState('error')
      throw e
    }
  }, [patchClips])

  useEffect(() => {
    const interval = setInterval(flush, AUTOSAVE_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [flush])

  return {
    isPending,
    error,
    video: detail?.video ?? null,
    scenes: detail?.scenes ?? [],
    clips,
    duration,
    selectedClip,
    selectedClipId,
    selectClip,
    zoom,
    viewportStart,
    setViewport,
    playhead,
    setPlayhead,
    trimClip,
    setReview,
    saveState,
    flush,
  }
}
