import { apiFetch } from '@/services/apiFetch'
import type { ApiResponse, FileMetadata, UploadInitResponse, UploadStatusResponse } from '../types'

async function readJson<T>(res: Response): Promise<T> {
  const text = await res.text()
  if (!text) throw new Error(`Empty response (status ${res.status})`)

  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error(text)
  }
}

async function readApiData<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await readJson<any>(res).catch(() => null)
    const message = body?.message ?? body?.error ?? `Request failed (status ${res.status})`
    throw new Error(message)
  }

  const json = await readJson<ApiResponse<T>>(res)
  return json.data
}

export const filesApi = {
  async listFiles(userId?: string): Promise<FileMetadata[]> {
    const query = userId ? `?user_id=${encodeURIComponent(userId)}` : ''
    const res = await apiFetch(`/files${query}`)
    return readApiData<FileMetadata[]>(res)
  },

  async getFile(fileId: string): Promise<FileMetadata> {
    const res = await apiFetch(`/files/${encodeURIComponent(fileId)}`)
    return readApiData<FileMetadata>(res)
  },

  async deleteFile(fileId: string): Promise<void> {
    const res = await apiFetch(`/files/${encodeURIComponent(fileId)}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`Delete failed (status ${res.status})`)
  },

  async createUpload(input: {
    user_id: string
    filename: string
    content_type: string
    size: number
  }): Promise<UploadInitResponse> {
    const res = await apiFetch('/files/uploads', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    return readApiData<UploadInitResponse>(res)
  },

  async getUpload(uploadId: string): Promise<UploadStatusResponse> {
    const res = await apiFetch(`/files/uploads/${encodeURIComponent(uploadId)}`)
    return readApiData<UploadStatusResponse>(res)
  },

  async getPartUrl(uploadId: string, partNumber: number): Promise<string> {
    const res = await apiFetch(
      `/files/uploads/${encodeURIComponent(uploadId)}/parts/${partNumber}/url`,
    )
    const data = await readApiData<{ url: string }>(res)
    return data.url
  },

  async registerPart(uploadId: string, partNumber: number, etag: string): Promise<void> {
    const res = await apiFetch(
      `/files/uploads/${encodeURIComponent(uploadId)}/parts/${partNumber}`,
      {
        method: 'POST',
        body: JSON.stringify({ etag }),
      },
    )
    if (!res.ok) throw new Error(`Register failed (status ${res.status})`)
  },

  async completeUpload(uploadId: string): Promise<FileMetadata> {
    const res = await apiFetch(`/files/uploads/${encodeURIComponent(uploadId)}/complete`, {
      method: 'POST',
    })
    return readApiData<FileMetadata>(res)
  },

  async abortUpload(uploadId: string): Promise<void> {
    const res = await apiFetch(`/files/uploads/${encodeURIComponent(uploadId)}/abort`, {
      method: 'POST',
    })
    if (!res.ok) throw new Error(`Abort failed (status ${res.status})`)
  },
}
