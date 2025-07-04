export interface User {
  id: string
  email: string
  username: string
  walletAddress: string
  createdAt: string
  updatedAt?: string
}

export interface Video {
  id: string
  title: string
  videoUrl: string
  ownerId: string
  signature: string
  createdAt: string
  owner?: User
}

export interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
}

export interface RegisterData {
  email: string
  password: string
  confirmPassword: string
}

export interface LoginData {
  email: string
  password: string
}

export interface UploadVideoData {
  title: string
  videoFile: File
  password: string
}

export interface ApiResponse<T = any> {
  message: string
  data?: T
  error?: string
}

export interface VideoUploadResponse {
  message: string
  video: Video
}

export interface AuthResponse {
  message: string
  token: string
  user: User
}

export interface RegisterResponse {
  message: string
  user: User
}

export interface SupabaseFileUpload {
  data: {
    path: string
    id: string
    fullPath: string
  } | null
  error: Error | null
}