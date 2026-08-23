import { useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSubmitVideoMutation } from '../lib/queries'
import SceneTimeline from '../components/SceneTimeline'
import ZoomSlider from '../components/ZoomSlider'
import ClipEditStrip from '../components/ClipEditStrip'
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

  if (error) return <p className="p-6 text-sm text-red-400">{(error as Error).message}</p>
  if (isPending || !video) return <p className="p-6 text-sm text-neutral-500">Loading…</p>

  const readOnly = video.status === 'submitted' || !!video.archived_at
  const allViewed = clips.length > 0 && clips.every((c) => c.viewed)

  const seekTo = (t: number) => {
    const v = videoRef.current
    if (v) v.currentTime = t
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

  const saveLabel = { idle: '', saving: 'saving…', saved: 'saved', error: 'save failed' }[saveState]

  return (
    <div className="mx-auto flex max-w-2xl flex-col px-4 pb-10 pt-6">
      <div className="mb-3 flex items-center justify-between">
        <Link to="/" className="text-sm text-neutral-500">
          ← back
        </Link>
        <span className="text-xs text-neutral-600">{saveLabel}</span>
      </div>

      <h1 className="mb-3 truncate text-lg font-semibold text-neutral-50">{video.title}</h1>

      <div className="overflow-hidden rounded-xl bg-black">
        <video
          ref={videoRef}
          src={`/media/${video.video_path}`}
          className="aspect-video w-full"
          playsInline
          muted
          onClick={togglePlay}
          onTimeUpdate={(e) => setPlayhead(e.currentTarget.currentTime)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
      </div>

      <div className="mt-4">
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

      <ZoomSlider duration={duration} zoom={zoom} viewportStart={viewportStart} onChange={setViewport} />

      <ClipEditStrip
        scenes={scenes}
        clips={clips}
        selectedClip={selectedClip}
        viewportStart={viewportStart}
        zoom={zoom}
        playhead={playhead}
        onTrim={(s, e) => selectedClip && trimClip(selectedClip.id, s, e)}
        onSeek={seekTo}
        onPan={(vs) => setViewport(vs, zoom)}
      />

      <div className="px-1">
        <TimelineScrollbar
          duration={duration}
          zoom={zoom}
          viewportStart={viewportStart}
          onChange={(vs) => setViewport(vs, zoom)}
        />
      </div>

      {selectedClip && (
        <p className="mt-2 text-center text-sm text-neutral-400">{selectedClip.take_label}</p>
      )}

      <div className="mt-4">
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
      </div>

      {submitError && <p className="mt-4 text-center text-sm text-red-400">{submitError}</p>}

      {!readOnly && (
        <button
          disabled={!allViewed || submitVideo.isPending}
          onClick={handleSubmit}
          className="mx-auto mt-8 block w-full max-w-lg rounded-full bg-neutral-100 py-3 text-sm font-medium text-neutral-900 disabled:opacity-30"
        >
          {allViewed
            ? submitVideo.isPending
              ? 'Submitting…'
              : 'Submit project'
            : `${clips.filter((c) => c.viewed).length}/${clips.length} reviewed`}
        </button>
      )}
    </div>
  )
}
