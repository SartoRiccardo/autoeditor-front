import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import type { ClipCreate, ClipPatch, SceneCreate, SceneUpdate } from './types'

// Single source of truth for server state: every useQuery/useMutation in the app
// lives here, keyed centrally, so no component reaches for useQueryClient directly
// and cache invalidation stays in one place instead of being spread out ad-hoc.

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export const queryKeys = {
  me: ['me'] as const,
  videos: ['videos'] as const,
  video: (id: number) => ['video', id] as const,
  cleanupHealth: ['cleanupHealth'] as const,
  apiKey: ['apiKey'] as const,
}

export function useMeQuery() {
  return useQuery({ queryKey: queryKeys.me, queryFn: api.me })
}

export function useVideosQuery() {
  return useQuery({ queryKey: queryKeys.videos, queryFn: api.listVideos })
}

export function useVideoQuery(videoId: number) {
  return useQuery({
    queryKey: queryKeys.video(videoId),
    queryFn: () => api.getVideo(videoId),
    enabled: Number.isFinite(videoId),
  })
}

// health is a lightweight status dot - fetch once on mount, don't keep polling
export function useCleanupHealthQuery() {
  return useQuery({
    queryKey: queryKeys.cleanupHealth,
    queryFn: api.cleanupHealth,
    staleTime: Infinity,
  })
}

export function useApiKeyQuery() {
  return useQuery({ queryKey: queryKeys.apiKey, queryFn: api.getApiKey })
}

export function usePatchClipsMutation(videoId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (clips: ClipPatch[]) => api.patchClips(videoId, clips),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.video(videoId) })
    },
  })
}

export function useCreateClipMutation(videoId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (clip: ClipCreate) => api.createClip(videoId, clip),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.video(videoId) })
    },
  })
}

export function useMoveClipSceneMutation(videoId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ clipId, sceneId }: { clipId: number; sceneId: number }) =>
      api.moveClipScene(videoId, clipId, sceneId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.video(videoId) })
    },
  })
}

export function useDeleteClipMutation(videoId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (clipId: number) => api.deleteClip(videoId, clipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.video(videoId) })
    },
  })
}

export function useCreateSceneMutation(videoId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (scene: SceneCreate) => api.createScene(videoId, scene),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.video(videoId) })
    },
  })
}

export function useUpdateSceneMutation(videoId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ sceneId, patch }: { sceneId: number; patch: SceneUpdate }) =>
      api.updateScene(videoId, sceneId, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.video(videoId) })
    },
  })
}

export function useSubmitVideoMutation(videoId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.submitVideo(videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.video(videoId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.videos })
    },
  })
}

export function useArchiveVideoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (videoId: number) => api.archiveVideo(videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.videos })
    },
  })
}

export function useRestoreVideoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (videoId: number) => api.restoreVideo(videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.videos })
    },
  })
}

export function useRegenerateApiKeyMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.regenerateApiKey,
    onSuccess: (key) => {
      queryClient.setQueryData(queryKeys.apiKey, key)
    },
  })
}

export function useLogoutMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.logout,
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.me, { authenticated: false })
    },
  })
}
