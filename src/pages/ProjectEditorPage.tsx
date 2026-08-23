import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useSubmitVideoMutation } from '../lib/queries'
import SceneTimeline from '../components/SceneTimeline'
import ZoomSlider from '../components/ZoomSlider'
import ClipEditStrip from '../components/ClipEditStrip'
import CursorTimeline from '../components/CursorTimeline'
import TimelineScrollbar from '../components/TimelineScrollbar'
import EditorControls from '../components/EditorControls'
import { useProjectEditor } from '../hooks/useProjectEditor'

export default function ProjectEditorPage() {
  const { videoId } = useParams()
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const editor = useProjectEditor(Number(videoId))
  const {
    isPending,
    error,
    video,
    scenes,
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
  } = editor
  const submitVideo = useSubmitVideoMutation(Number(videoId))

  // timeupdate fires only a few times a second on mobile browsers, which makes
  // the cursor timeline visibly lag behind actual playback - drive it from a
  // rAF loop instead while playing for a smooth, in-sync marker
  useEffect(() => {
    if (!playing) return
    let frame: number
    const tick = () => {
      const v = videoRef.current
      if (v) setPlayhead(v.currentTime)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing, setPlayhead])

  // iOS Safari in particular sometimes ignores the preload hint outright and
  // never starts fetching metadata on its own - an explicit load() forces it
  useEffect(() => {
    videoRef.current?.load()
  }, [video?.video_path])

  if (error) return <p className="p-6 text-sm text-red-400">{(error as Error).message}</p>
  if (isPending || !video) return <p className="p-6 text-sm text-neutral-500">Loading…</p>

  const readOnly = video.status === 'submitted' || !!video.archived_at
  const allViewed = clips.length > 0 && clips.every((c) => c.viewed)

  const seekTo = (t: number) => {
    const v = videoRef.current
    if (v) {
      // setting currentTime before metadata has loaded is silently ignored by
      // most browsers (esp. mobile Safari) - defer until it's actually seekable
      if (v.readyState >= 1) {
        v.currentTime = t
      } else {
        const applyOnceReady = () => {
          v.currentTime = t
          v.removeEventListener('loadedmetadata', applyOnceReady)
        }
        v.addEventListener('loadedmetadata', applyOnceReady)
      }
    }
    setPlayhead(t)
  }

  const handleSelect = (id: number) => {
    selectClip(id)
    const clip = clips.find((c) => c.id === id)
    if (clip) seekTo(clip.start)
  }

  const goToOffset = (offset: number) => {
    if (!selectedClipId) return
    const idx = clips.findIndex((c) => c.id === selectedClipId)
    const target = clips[idx + offset]
    if (target) handleSelect(target.id)
  }

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play()
      setPlaying(true)
    } else {
      v.pause()
      setPlaying(false)
    }
  }

  const handleSubmit = async () => {
    setSubmitError(null)
    try {
      await flush()
      await submitVideo.mutateAsync()
      navigate('/')
    } catch (e) {
      setSubmitError((e as Error).message)
    }
  }

  const handleManualSave = async () => {
    try {
      await flush()
      toast.success('Saved!')
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col px-4 pb-40 pt-6">
      <div className="mb-3 flex items-center justify-between">
        <Link to="/" className="text-sm text-neutral-500">
          ← Projects
        </Link>
        <button
          onClick={handleManualSave}
          disabled={saveState === 'saving'}
          className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium text-neutral-400 disabled:opacity-40"
        >
          {saveState === 'saving' ? 'Saving…' : 'Save'}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl bg-black">
        <video
          ref={videoRef}
          src={`/media/${video.video_path}`}
          className="aspect-video w-full"
          playsInline
          muted
          preload="metadata"
          onClick={togglePlay}
          onTimeUpdate={(e) => setPlayhead(e.currentTarget.currentTime)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 px-1">
          <TimelineScrollbar
            duration={duration}
            zoom={zoom}
            viewportStart={viewportStart}
            onChange={(vs) => setViewport(vs, zoom)}
          />
        </div>
        <ZoomSlider duration={duration} zoom={zoom} viewportStart={viewportStart} onChange={setViewport} />
      </div>

      <div>
        <SceneTimeline
          scenes={scenes}
          clips={clips}
          duration={duration}
          selectedClipId={selectedClipId}
          viewportStart={viewportStart}
          zoom={zoom}
          onSelectClip={handleSelect}
        />
      </div>

      <ClipEditStrip
        selectedClip={selectedClip}
        viewportStart={viewportStart}
        zoom={zoom}
        onTrim={(s, e) => selectedClip && trimClip(selectedClip.id, s, e)}
        onPan={(vs) => setViewport(vs, zoom)}
      />

      <CursorTimeline viewportStart={viewportStart} zoom={zoom} playhead={playhead} onSeek={seekTo} />

      <div className="fixed inset-x-0 bottom-0 border-t border-neutral-800 bg-neutral-950/95 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3 backdrop-blur">
        <div className="mx-auto max-w-2xl px-4">
          <EditorControls
            playing={playing}
            onTogglePlay={togglePlay}
            onPrev={() => goToOffset(-1)}
            onNext={() => goToOffset(1)}
            onAccept={() => selectedClip && setReview(selectedClip.id, true)}
            onReject={() => selectedClip && setReview(selectedClip.id, false)}
            usable={selectedClip ? (selectedClip.viewed ? selectedClip.usable : null) : null}
            disabled={readOnly || !selectedClip}
          />

          {submitError && <p className="mt-3 text-center text-sm text-red-400">{submitError}</p>}

          {!readOnly && (
            <button
              disabled={!allViewed || submitVideo.isPending}
              onClick={handleSubmit}
              className="mx-auto mt-3 block w-full rounded-full bg-neutral-100 py-3 text-sm font-medium text-neutral-900 disabled:opacity-30"
            >
              {allViewed
                ? submitVideo.isPending
                  ? 'Submitting…'
                  : 'Submit project'
                : `${clips.filter((c) => c.viewed).length}/${clips.length} reviewed`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
