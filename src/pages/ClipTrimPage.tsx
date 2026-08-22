import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import type { VideoDetail } from '../lib/types'
import TrimSlider from '../components/TrimSlider'

export default function ClipTrimPage() {
  const { videoId, clipId } = useParams()
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)

  const [detail, setDetail] = useState<VideoDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [start, setStart] = useState(0)
  const [end, setEnd] = useState(0)
  const [playhead, setPlayhead] = useState(0)
  const [usable, setUsable] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.getVideo(Number(videoId)).then(setDetail).catch((e) => setError(e.message))
  }, [videoId])

  const clip = detail?.clips.find((c) => c.id === Number(clipId)) ?? null

  useEffect(() => {
    if (!clip) return
    setUsable(clip.usable)
    setSaving(false)
    // handles are relative to the proxy's own duration; loaded once metadata is ready
  }, [clip?.id])

  const onLoadedMetadata = () => {
    const v = videoRef.current
    if (!v || !clip) return
    setDuration(v.duration)
    const agentSpan = clip.agent_end - clip.agent_start
    // if this clip was already human-resolved, restore its relative selection;
    // otherwise default to the full proxy range (= confirming the agent's candidate)
    if (clip.resolved_by === 'human' && agentSpan > 0) {
      setStart(Math.max(0, clip.start - clip.agent_start))
      setEnd(Math.min(v.duration, clip.end - clip.agent_start))
    } else {
      setStart(0)
      setEnd(v.duration)
    }
  }

  const onTimeUpdate = () => {
    const v = videoRef.current
    if (!v) return
    setPlayhead(v.currentTime)
    if (v.currentTime >= end) {
      v.currentTime = start
    }
  }

  const onSeek = (t: number) => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = t
    setPlayhead(t)
  }

  const onRangeChange = useCallback((s: number, e: number) => {
    setStart(s)
    setEnd(e)
  }, [])

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      if (v.currentTime < start || v.currentTime >= end) v.currentTime = start
      v.play()
    } else {
      v.pause()
    }
  }

  const goToNext = () => {
    if (!detail) return
    const idx = detail.clips.findIndex((c) => c.id === Number(clipId))
    const next = detail.clips[idx + 1]
    if (next) {
      navigate(`/videos/${videoId}/clips/${next.id}`)
    } else {
      navigate(`/videos/${videoId}`)
    }
  }

  const handleSave = async () => {
    if (!clip) return
    setSaving(true)
    try {
      await api.patchClip(clip.id, {
        start: clip.agent_start + start,
        end: clip.agent_start + end,
        usable,
        viewed: true,
      })
      goToNext()
    } catch (e) {
      setError((e as Error).message)
      setSaving(false)
    }
  }

  if (error) return <p className="p-6 text-sm text-red-400">{error}</p>
  if (!detail || !clip) return <p className="p-6 text-sm text-neutral-500">Loading…</p>

  const readOnly = detail.video.status === 'submitted'

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 pb-6 pt-6">
      <button onClick={() => navigate(`/videos/${videoId}`)} className="mb-4 self-start text-sm text-neutral-500">
        ← grid
      </button>

      <div className="overflow-hidden rounded-xl bg-black">
        <video
          ref={videoRef}
          src={`/media/${clip.proxy_video_path}`}
          className="aspect-video w-full"
          playsInline
          muted
          onClick={togglePlay}
          onLoadedMetadata={onLoadedMetadata}
          onTimeUpdate={onTimeUpdate}
        />
      </div>

      <TrimSlider
        duration={duration}
        start={start}
        end={end}
        playhead={playhead}
        onChange={onRangeChange}
        onSeek={onSeek}
      />

      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm text-neutral-400">
          {clip.scene_label} · {clip.take_label}
        </span>
        <button onClick={togglePlay} className="rounded-full bg-neutral-800 px-4 py-1.5 text-sm text-neutral-100">
          Play / pause
        </button>
      </div>

      <div className="mt-6 flex gap-2">
        <button
          onClick={() => setUsable(true)}
          className={`flex-1 rounded-full py-3 text-sm font-medium ${
            usable ? 'bg-emerald-500 text-neutral-950' : 'bg-neutral-800 text-neutral-300'
          }`}
        >
          Usable
        </button>
        <button
          onClick={() => setUsable(false)}
          className={`flex-1 rounded-full py-3 text-sm font-medium ${
            !usable ? 'bg-red-500 text-neutral-950' : 'bg-neutral-800 text-neutral-300'
          }`}
        >
          Unusable
        </button>
      </div>

      {!readOnly && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-4 rounded-full bg-neutral-100 py-3 text-sm font-medium text-neutral-900 disabled:opacity-40"
        >
          {saving ? 'Saving…' : 'Submit & next'}
        </button>
      )}
    </div>
  )
}
