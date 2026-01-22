export type ApiResponse<T> = {
  status: number
  data: T
}

export type FileMetadata = {
  id: string
  user_id: string
  filename: string
  content_type: string
  size: number
  uploaded_at: string
  url?: string | null
  uploader_username?: string | null
  uploader_global_name?: string | null
  uploader_avatar_url?: string | null
}

export type FileUploadPart = {
  part_number: number
  etag: string
}

export type UploadInitResponse = {
  upload_id: string
  file_id: string
  user_id: string
  key: string
  filename: string
  content_type: string
  size: number
  part_size: number
  url: string
}

export type UploadStatusResponse = UploadInitResponse & {
  parts: FileUploadPart[]
}
