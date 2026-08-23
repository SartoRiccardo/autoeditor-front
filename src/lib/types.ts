export type VideoStatus = 'in_review' | 'submitted'
export type ResolvedBy = 'agent' | 'human'
export type ClipSource = 'agent' | 'user'

export interface VideoSummary {
  id: number
  external_id: string
  title: string
  status: VideoStatus
  created_at: string
  submitted_at: string | null
  archived_at: string | null
  purge_at: string | null
  clip_count: number
  viewed_count: number
}

export interface Video {
  id: number
  external_id: string
  title: string
  video_path: string
  duration: number
  status: VideoStatus
  created_at: string
  submitted_at: string | null
  archived_at: string | null
}

export interface Scene {
  id: number
  video_id: number
  external_id: string
  label: string
  description: string | null
  start: number
  end: number
  order: number
}

export interface Clip {
  id: number
  video_id: number
  scene_id: number
  external_id: string
  take_label: string
  source: ClipSource
  agent_start: number
  agent_end: number
  agent_usable: boolean
  agent_confidence: number | null
  start: number
  end: number
  usable: boolean
  resolved_by: ResolvedBy
  viewed: boolean
  resolved_at: string | null
}

export interface ClipCreate {
  scene_id: number
  take_label: string
  start: number
  end: number
  usable?: boolean
}

export interface VideoDetail {
  video: Video
  scenes: Scene[]
  clips: Clip[]
}

export interface ClipPatch {
  id: number
  start: number
  end: number
  usable: boolean
  viewed?: boolean
}

export interface CleanupHealth {
  running: boolean
  healthy: boolean
  started_at: string | null
  last_run_at: string | null
  seconds_since_last_run: number | null
  last_error: string | null
}
