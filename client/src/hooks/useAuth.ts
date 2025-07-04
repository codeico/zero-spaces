import { useState, useEffect, useContext, createContext, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authApi } from '../services/api'
import type { User, AuthState, RegisterData, LoginData } from '../types'

interface AuthContextType extends AuthState {
  login: (data: LoginData) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
    error: null,
  })
  const navigate = useNavigate()

  useEffect(() => {
    // Check for existing auth on app load
    const token = localStorage.getItem('auth_token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        const user: User = JSON.parse(userData)
        setAuthState({
          user,
          token,
          loading: false,
          error: null,
        })
      } catch (error) {
        // Invalid stored data, clear it
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        setAuthState(prev => ({ ...prev, loading: false }))
      }
    } else {
      setAuthState(prev => ({ ...prev, loading: false }))
    }
  }, [])

  const login = async (data: LoginData) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await authApi.login(data)
      
      // Store auth data
      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      setAuthState({
        user: response.user,
        token: response.token,
        loading: false,
        error: null,
      })
      
      toast.success('Login successful!')
      navigate('/')
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Login failed'
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }))
      toast.error(errorMessage)
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await authApi.register(data)
      
      setAuthState(prev => ({ ...prev, loading: false, error: null }))
      
      toast.success('Registration successful! Please login.')
      navigate('/login')
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Registration failed'
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }))
      toast.error(errorMessage)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    setAuthState({
      user: null,
      token: null,
      loading: false,
      error: null,
    })
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ 
      ...authState, 
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}