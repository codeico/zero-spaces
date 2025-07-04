import axios from 'axios'
import type { 
  RegisterData, 
  LoginData, 
  AuthResponse, 
  RegisterResponse, 
  VideoUploadResponse 
} from '../types'

const API_BASE_URL = import.meta.env.VITE_SUPABASE_URL
const FUNCTIONS_PATH = '/functions/v1'

const api = axios.create({
  baseURL: `${API_BASE_URL}${FUNCTIONS_PATH}`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  register: async (data: RegisterData): Promise<RegisterResponse> => {
    const response = await api.post('/register', {
      email: data.email,
      password: data.password,
    })
    return response.data
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/login', {
      email: data.email,
      password: data.password,
    })
    return response.data
  },
}

export const videoApi = {
  uploadMetadata: async (
    videoUrl: string,
    title: string,
    password: string
  ): Promise<VideoUploadResponse> => {
    const response = await api.post('/upload-video-metadata', {
      videoUrl,
      title,
      password,
    })
    return response.data
  },

  getVideos: async () => {
    // This would be implemented with Supabase client directly
    // since we need to query the database for videos
    throw new Error('Not implemented - use Supabase client directly')
  },
}

export default api