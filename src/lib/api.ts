import type { CleanupHealth, Clip, ClipCreate, ClipPatch, Scene, SceneCreate, SceneUpdate, VideoDetail, VideoSummary } from './types'

class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: 'include',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, body.detail || res.statusText)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  me: () => request<{ authenticated: boolean; email?: string }>('/api/auth/me'),
  logout: () => request('/api/auth/logout', { method: 'POST' }),

  listVideos: () => request<VideoSummary[]>('/api/videos'),
  getVideo: (id: number) => request<VideoDetail>(`/api/videos/${id}`),
  submitVideo: (id: number) => request<VideoDetail['video']>(`/api/videos/${id}/submit`, { method: 'POST' }),
  archiveVideo: (id: number) => request<VideoDetail['video']>(`/api/videos/${id}`, { method: 'DELETE' }),
  restoreVideo: (id: number) => request<VideoDetail['video']>(`/api/videos/${id}/restore`, { method: 'POST' }),

  patchClips: (videoId: number, clips: ClipPatch[]) =>
    request<Clip[]>(`/api/videos/${videoId}/clips`, { method: 'PATCH', body: JSON.stringify({ clips }) }),

  createClip: (videoId: number, clip: ClipCreate) =>
    request<Clip>(`/api/videos/${videoId}/clips`, { method: 'POST', body: JSON.stringify(clip) }),

  moveClipScene: (videoId: number, clipId: number, sceneId: number) =>
    request<Clip>(`/api/videos/${videoId}/clips/${clipId}/scene`, {
      method: 'PATCH',
      body: JSON.stringify({ scene_id: sceneId }),
    }),

  deleteClip: (videoId: number, clipId: number) =>
    request<{ ok: boolean }>(`/api/videos/${videoId}/clips/${clipId}`, { method: 'DELETE' }),

  createScene: (videoId: number, scene: SceneCreate) =>
    request<Scene>(`/api/videos/${videoId}/scenes`, { method: 'POST', body: JSON.stringify(scene) }),

  updateScene: (videoId: number, sceneId: number, patch: SceneUpdate) =>
    request<Scene>(`/api/videos/${videoId}/scenes/${sceneId}`, { method: 'PATCH', body: JSON.stringify(patch) }),

  getApiKey: () => request<{ key: string; created_at: string }>('/api/settings/api-key'),
  regenerateApiKey: () => request<{ key: string; created_at: string }>('/api/settings/api-key/regenerate', { method: 'POST' }),

  cleanupHealth: () => request<CleanupHealth>('/api/health/cleanup'),
}

export { ApiError }
