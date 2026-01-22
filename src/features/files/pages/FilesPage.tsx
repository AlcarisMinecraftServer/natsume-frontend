import { useEffect, useMemo, useRef, useState } from 'react'
import type { DragEventHandler } from 'react'
import {
  FaCloudUploadAlt,
  FaCopy,
  FaExternalLinkAlt,
  FaPause,
  FaPlay,
  FaRedo,
  FaTimes,
  FaTrash,
} from 'react-icons/fa'
import { toast } from 'react-toastify'

import { useAuth } from '@/features/auth/context/AuthContext'

import { filesApi } from '../services/filesApi'
import type { FileMetadata, UploadStatusResponse } from '../types'

type UploadTaskStatus = 'queued' | 'preparing' | 'uploading' | 'paused' | 'failed' | 'completed'

type UploadTask = {
  id: string
  file: File
  uploadId?: string
  partSize?: number
  uploadedBytes: number
  status: UploadTaskStatus
  error?: string
}

type StoredUploads = Record<string, { uploadId: string }>

const STORAGE_KEY = 'natsume.fileUploads.v1'

function fileFingerprint(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}`
}

function loadStoredUploads(): StoredUploads {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as StoredUploads
  } catch {
    return {}
  }
}

function saveStoredUploads(map: StoredUploads) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

function setStoredUpload(fingerprint: string, uploadId: string) {
  const map = loadStoredUploads()
  map[fingerprint] = { uploadId }
  saveStoredUploads(map)
}

function clearStoredUpload(fingerprint: string) {
  const map = loadStoredUploads()
  delete map[fingerprint]
  saveStoredUploads(map)
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB'] as const
  const exp = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / Math.pow(1024, exp)
  return `${value.toFixed(value >= 10 || exp === 0 ? 0 : 1)} ${units[exp]}`
}

function formatUploadedAt(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return new Intl.DateTimeFormat('ja-JP', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d)
}

function contentTypeLabel(contentType: string): string {
  const ct = (contentType || '').toLowerCase()
  if (ct.startsWith('video/')) return '動画ファイル'
  if (ct.startsWith('image/')) return '画像ファイル'
  if (ct.startsWith('audio/')) return '音声ファイル'
  if (ct === 'application/pdf') return 'PDF'
  if (ct.startsWith('text/')) return 'テキスト'
  if (ct.includes('zip') || ct.includes('compressed')) return '圧縮ファイル'
  return 'ファイル'
}

function shortUserId(id: string): string {
  const v = (id || '').trim()
  if (v.length <= 10) return v
  return `${v.slice(0, 6)}...${v.slice(-4)}`
}

function uploaderLabel(f: FileMetadata): string {
  return f.uploader_global_name?.trim() || f.uploader_username?.trim() || f.user_id?.trim() || 'unknown'
}

function computeUploadedBytes(file: File, partSize: number, uploadedParts: Set<number>): number {
  const totalParts = Math.ceil(file.size / partSize)
  let sum = 0
  for (const part of uploadedParts) {
    if (part < 1 || part > totalParts) continue
    const start = (part - 1) * partSize
    const end = Math.min(start + partSize, file.size)
    sum += end - start
  }
  return sum
}

async function getExistingUploadOrCreate(
  fingerprint: string,
  file: File,
  userId: string,
): Promise<UploadStatusResponse> {
  const stored = loadStoredUploads()[fingerprint]
  if (stored?.uploadId) {
    try {
      return await filesApi.getUpload(stored.uploadId)
    } catch {
      clearStoredUpload(fingerprint)
    }
  }

  const init = await filesApi.createUpload({
    user_id: userId,
    filename: file.name,
    content_type: file.type || 'application/octet-stream',
    size: file.size,
  })
  setStoredUpload(fingerprint, init.upload_id)
  return { ...init, parts: [] }
}

export default function FilesPage() {
  const { actor } = useAuth()

  const [onlyMine, setOnlyMine] = useState(true)
  const [loading, setLoading] = useState(true)
  const [files, setFiles] = useState<FileMetadata[]>([])
  const [uploads, setUploads] = useState<UploadTask[]>([])

  const controllersRef = useRef<Record<string, AbortController>>({})

  const canUpload = Boolean(actor?.id)

  const activeUploadId = useMemo(
    () => uploads.find((u) => u.status === 'preparing' || u.status === 'uploading')?.id,
    [uploads],
  )

  const refreshFiles = async () => {
    setLoading(true)
    try {
      const data = await filesApi.listFiles(onlyMine ? actor?.id : undefined)
      setFiles(data)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refreshFiles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyMine])

  useEffect(() => {
    if (activeUploadId) return
    const next = uploads.find((u) => u.status === 'queued')
    if (!next) return
    void startUpload(next.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploads, activeUploadId])

  const enqueueFiles = (newFiles: File[]) => {
    if (!canUpload) {
      toast.error('ログイン情報が見つかりません')
      return
    }

    setUploads((prev) => {
      const existing = new Set(prev.map((u) => u.id))
      const next: UploadTask[] = [...prev]
      for (const f of newFiles) {
        const id = fileFingerprint(f)
        if (existing.has(id)) continue
        next.push({ id, file: f, uploadedBytes: 0, status: 'queued' })
      }
      return next
    })
  }

  const startUpload = async (taskId: string) => {
    const userId = actor?.id
    if (!userId) return

    const task = uploads.find((u) => u.id === taskId)
    if (!task) return

    setUploads((prev) => prev.map((u) => (u.id === taskId ? { ...u, status: 'preparing' } : u)))

    const controller = new AbortController()
    controllersRef.current[taskId] = controller

    try {
      const upload = await getExistingUploadOrCreate(taskId, task.file, userId)
      const partSize = upload.part_size
      const uploadedParts = new Set(upload.parts.map((p) => p.part_number))
      const initialUploadedBytes = computeUploadedBytes(task.file, partSize, uploadedParts)

      setUploads((prev) =>
        prev.map((u) =>
          u.id === taskId
            ? {
              ...u,
              uploadId: upload.upload_id,
              partSize,
              uploadedBytes: initialUploadedBytes,
              status: 'uploading',
              error: undefined,
            }
            : u,
        ),
      )

      await uploadFileParts({
        upload,
        file: task.file,
        signal: controller.signal,
        onProgress: (deltaBytes) => {
          setUploads((prev) =>
            prev.map((u) =>
              u.id === taskId ? { ...u, uploadedBytes: u.uploadedBytes + deltaBytes } : u,
            ),
          )
        },
      })

      await filesApi.completeUpload(upload.upload_id)
      clearStoredUpload(taskId)

      setUploads((prev) => prev.map((u) => (u.id === taskId ? { ...u, status: 'completed' } : u)))
      toast.success(`${task.file.name} をアップロードしました`)
      await refreshFiles()
    } catch (e) {
      const err = e as any
      if (err?.name === 'AbortError') {
        setUploads((prev) => prev.map((u) => (u.id === taskId ? { ...u, status: 'paused' } : u)))
        return
      }

      setUploads((prev) =>
        prev.map((u) =>
          u.id === taskId
            ? { ...u, status: 'failed', error: (e as Error).message || 'Upload failed' }
            : u,
        ),
      )
      toast.error((e as Error).message)
    } finally {
      delete controllersRef.current[taskId]
    }
  }

  const pauseUpload = (taskId: string) => {
    controllersRef.current[taskId]?.abort()
  }

  const resumeUpload = (taskId: string) => {
    if (activeUploadId) return
    setUploads((prev) => prev.map((u) => (u.id === taskId ? { ...u, status: 'queued' } : u)))
  }

  const cancelUpload = async (taskId: string) => {
    const task = uploads.find((u) => u.id === taskId)
    if (!task) return

    controllersRef.current[taskId]?.abort()

    try {
      const stored = loadStoredUploads()[taskId]
      if (stored?.uploadId) {
        await filesApi.abortUpload(stored.uploadId)
      }
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      clearStoredUpload(taskId)
      setUploads((prev) => prev.filter((u) => u.id !== taskId))
    }
  }

  const onFilesPicked = (fileList: FileList | null) => {
    if (!fileList) return
    enqueueFiles(Array.from(fileList))
  }

  const onDrop: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const dropped = Array.from(e.dataTransfer.files)
    if (dropped.length) enqueueFiles(dropped)
  }

  const onDragOver: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const deleteFile = async (file: FileMetadata) => {
    const ok = window.confirm(`削除しますか？\n${file.filename}`)
    if (!ok) return
    try {
      await filesApi.deleteFile(file.id)
      toast.success('削除しました')
      await refreshFiles()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const copyUrl = async (file: FileMetadata) => {
    if (!file.url) return
    try {
      await navigator.clipboard.writeText(file.url)
      toast.success('URLをコピーしました')
    } catch {
      toast.error('コピーに失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full w-full bg-[#f8fafc]">
        <div className="animate-spin h-10 w-10 border-4 border-[#e9eef1] border-t-[#4a5b77] rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full bg-[#eef5ff] text-[#080d12] p-4 font-sans">
      <div className="bg-white rounded-[1.25rem] p-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
          <div className="flex items-center gap-2">
            <input
              id="files-only-mine"
              type="checkbox"
              checked={onlyMine}
              onChange={(e) => setOnlyMine(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="files-only-mine" className="text-sm text-[#4b5256]">
              自分のファイルのみ表示
            </label>
          </div>

          <div className="flex items-center gap-2 md:ml-auto">
            <button
              onClick={() => refreshFiles()}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[#e9eef1] text-[#4b5256] hover:bg-[#f8fafc] transition-colors"
            >
              <FaRedo className="text-[#7f8b91]" />
              更新
            </button>

            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[#e9eef1] text-[#4b5256] hover:bg-[#f8fafc] transition-colors cursor-pointer">
              <FaCloudUploadAlt className="text-[#7f8b91]" />
              ファイル選択
              <input
                type="file"
                multiple
                onChange={(e) => onFilesPicked(e.target.files)}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div
          className="mt-4 rounded-2xl border-2 border-dashed border-[#e9eef1] bg-[#f6f9fb] p-5 text-center"
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <div className="text-[#4a5b77] font-semibold">ここにドラッグ&ドロップ</div>
          <div className="mt-1 text-sm text-[#7f8b91]">
            ファイルをアップロードします。
          </div>
        </div>
      </div>

      {uploads.length > 0 && (
        <div className="bg-white rounded-[1.25rem] p-4 mb-4">
          <div className="text-sm font-semibold text-[#4a5b77] mb-3">アップロード</div>

          <div className="space-y-3">
            {uploads.map((u) => {
              const total = u.file.size
              const percent = total ? Math.min(100, Math.floor((u.uploadedBytes / total) * 100)) : 0
              const isActive = u.status === 'uploading' || u.status === 'preparing'

              return (
                <div
                  key={u.id}
                  className="rounded-2xl border border-[#e9eef1] bg-white p-3"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[#080d12] truncate">{u.file.name}</div>
                      <div className="text-sm text-[#7f8b91]">
                        {formatBytes(u.uploadedBytes)} / {formatBytes(total)} ({percent}%)
                        {u.status === 'paused' && ' - 一時停止'}
                        {u.status === 'failed' && ' - 失敗'}
                        {u.status === 'completed' && ' - 完了'}
                      </div>
                      {u.error && <div className="text-sm text-red-600 mt-1">{u.error}</div>}
                    </div>

                    <div className="flex items-center gap-2">
                      {u.status === 'uploading' && (
                        <button
                          onClick={() => pauseUpload(u.id)}
                          className="px-3 py-2 rounded-xl border border-[#e9eef1] text-[#4b5256] hover:bg-[#f8fafc] transition-colors"
                          title="Pause"
                        >
                          <FaPause />
                        </button>
                      )}

                      {u.status === 'paused' && (
                        <button
                          onClick={() => resumeUpload(u.id)}
                          className="px-3 py-2 rounded-xl border border-[#e9eef1] text-[#4b5256] hover:bg-[#f8fafc] transition-colors"
                          title="Resume"
                        >
                          <FaPlay />
                        </button>
                      )}

                      {u.status === 'failed' && (
                        <button
                          onClick={() => resumeUpload(u.id)}
                          className="px-3 py-2 rounded-xl border border-[#e9eef1] text-[#4b5256] hover:bg-[#f8fafc] transition-colors"
                          title="Retry"
                        >
                          <FaRedo />
                        </button>
                      )}

                      {(u.status === 'queued' || u.status === 'paused' || u.status === 'failed') && (
                        <button
                          onClick={() => cancelUpload(u.id)}
                          className="px-3 py-2 rounded-xl border border-[#e9eef1] text-[#4b5256] hover:bg-[#f8fafc] transition-colors"
                          title="Cancel"
                        >
                          <FaTimes />
                        </button>
                      )}

                      {u.status === 'completed' && (
                        <button
                          onClick={() => setUploads((prev) => prev.filter((x) => x.id !== u.id))}
                          className="px-3 py-2 rounded-xl border border-[#e9eef1] text-[#4b5256] hover:bg-[#f8fafc] transition-colors"
                          title="Close"
                        >
                          <FaTimes />
                        </button>
                      )}

                      {isActive && (
                        <div className="h-2 w-2 rounded-full bg-[#24afff] animate-pulse" />
                      )}
                    </div>
                  </div>

                  <div className="mt-3 h-2 rounded-full bg-[#e9eef1] overflow-hidden">
                    <div
                      className="h-full bg-[#24afff] transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-[1.25rem] p-4">
        <div className="text-sm font-semibold text-[#4a5b77] mb-3">ファイル一覧</div>

        {files.length === 0 ? (
          <div className="text-sm text-[#7f8b91]">ファイルがありません</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#7f8b91]">
                  <th className="py-2 pr-3">ファイル名</th>
                  <th className="py-2 pr-3">アップロード者</th>
                  <th className="py-2 pr-3">サイズ</th>
                  <th className="py-2 pr-3">種類</th>
                  <th className="py-2 pr-3">アップロード日時</th>
                  <th className="py-2 pr-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {files.map((f) => (
                  <tr key={f.id} className="border-t border-[#e9eef1]">
                    <td className="py-2 pr-3 font-medium text-[#080d12]">{f.filename}</td>
                    <td className="py-2 pr-3 text-[#4b5256]">
                      {(() => {
                        const hasName = Boolean(
                          f.uploader_global_name?.trim() || f.uploader_username?.trim(),
                        )
                        return (
                          <>
                            <div className="font-medium text-[#080d12]">
                              {uploaderLabel(f)}
                              {f.user_id === actor?.id ? (
                                <span className="ml-2 text-xs text-[#7f8b91]">(自分)</span>
                              ) : null}
                            </div>
                            {!hasName ? (
                              <div className="text-xs text-[#7f8b91]">{shortUserId(f.user_id)}</div>
                            ) : null}
                          </>
                        )
                      })()}
                    </td>
                    <td className="py-2 pr-3 text-[#4b5256]">{formatBytes(f.size)}</td>
                    <td className="py-2 pr-3 text-[#4b5256]">
                      <div className="font-medium text-[#080d12]">{contentTypeLabel(f.content_type)}</div>
                      <div className="text-xs text-[#7f8b91]">{f.content_type}</div>
                    </td>
                    <td className="py-2 pr-3 text-[#4b5256]">{formatUploadedAt(f.uploaded_at)}</td>
                    <td className="py-2 pr-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => f.url && window.open(f.url, '_blank')}
                          disabled={!f.url}
                          className="px-3 py-2 rounded-xl border border-[#e9eef1] text-[#4b5256] hover:bg-[#f8fafc] transition-colors disabled:opacity-40"
                          title="Open"
                        >
                          <FaExternalLinkAlt />
                        </button>
                        <button
                          onClick={() => copyUrl(f)}
                          disabled={!f.url}
                          className="px-3 py-2 rounded-xl border border-[#e9eef1] text-[#4b5256] hover:bg-[#f8fafc] transition-colors disabled:opacity-40"
                          title="Copy URL"
                        >
                          <FaCopy />
                        </button>
                        <button
                          onClick={() => deleteFile(f)}
                          className="px-3 py-2 rounded-xl border border-[#e9eef1] text-red-600 hover:bg-[#fff5f5] transition-colors"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

async function uploadFileParts(opts: {
  upload: UploadStatusResponse
  file: File
  signal: AbortSignal
  onProgress: (deltaBytes: number) => void
}) {
  const { upload, file, signal, onProgress } = opts
  const partSize = upload.part_size
  const totalParts = Math.ceil(file.size / partSize)

  const uploadedParts = new Set(upload.parts.map((p) => p.part_number))
  const missing: number[] = []
  for (let part = 1; part <= totalParts; part++) {
    if (!uploadedParts.has(part)) missing.push(part)
  }

  const concurrency = 4
  let cursor = 0

  const worker = async () => {
    while (cursor < missing.length) {
      if (signal.aborted) throw new DOMException('Aborted', 'AbortError')

      const partNumber = missing[cursor]
      cursor += 1

      const start = (partNumber - 1) * partSize
      const end = Math.min(start + partSize, file.size)
      const blob = file.slice(start, end)

      const url = await filesApi.getPartUrl(upload.upload_id, partNumber)
      let res: Response
      try {
        res = await fetch(url, { method: 'PUT', body: blob, signal })
      } catch (e) {
        const msg = (e as Error)?.message ?? ''
        if (/failed to fetch/i.test(msg)) {
          throw new Error(
            'R2へのアップロードがCORSでブロックされました。R2 bucketのCORSで Origin(http://localhost:5173) / PUT / Content-Type を許可してください。',
          )
        }
        throw e
      }
      if (!res.ok) throw new Error(`Upload failed: part ${partNumber} (status ${res.status})`)

      const etag = res.headers.get('etag')
      if (!etag) {
        throw new Error(
          'ETag header is missing. Check R2 bucket CORS: expose header "etag".',
        )
      }

      await filesApi.registerPart(upload.upload_id, partNumber, etag)
      onProgress(end - start)
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()))
}
