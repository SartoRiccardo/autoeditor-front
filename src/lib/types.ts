export type VideoStatus = 'in_review' | 'submitted'
export type ResolvedBy = 'agent' | 'human'

export interface VideoSummary {
  id: number
  external_id: string
  title: string
  status: VideoStatus
  created_at: string
  submitted_at: string | null
  clip_count: number
  viewed_count: number
}

export interface Clip {
  id: number
  video_id: number
  external_id: string
  scene_label: string
  take_label: string
  agent_start: number
  agent_end: number
  agent_usable: boolean
  agent_confidence: number | null
  start: number
  end: number
  usable: boolean
  resolved_by: ResolvedBy
  viewed: boolean
  proxy_video_path: string
  resolved_at: string | null
}

export interface VideoDetail {
  video: {
    id: number
    external_id: string
    title: string
    status: VideoStatus
    created_at: string
    submitted_at: string | null
  }
  clips: Clip[]
}
