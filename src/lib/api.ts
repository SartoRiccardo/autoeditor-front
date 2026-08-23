import type { Clip, VideoDetail, VideoSummary } from './types'

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

  patchClip: (id: number, body: { start: number; end: number; usable: boolean; viewed?: boolean }) =>
    request<Clip>(`/api/clips/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  getApiKey: () => request<{ key: string; created_at: string }>('/api/settings/api-key'),
  regenerateApiKey: () => request<{ key: string; created_at: string }>('/api/settings/api-key/regenerate', { method: 'POST' }),
}

export { ApiError }
