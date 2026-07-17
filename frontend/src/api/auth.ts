import axios from 'axios'
import { apiBaseUrl } from '@/config'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  fullName: string
}

export interface AuthResponse {
  token: string
  email: string
  fullName: string
  roles: string[]
}

export interface UserDTO {
  id: number
  email: string
  fullName: string
  status: string
  roles: string[]
}

const authClient = axios.create({
  baseURL: apiBaseUrl + '/auth',
  headers: { 'Content-Type': 'application/json' }
})

export const authApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await authClient.post('/login', data)
    return res.data
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await authClient.post('/register', data)
    return res.data
  },

  async me(): Promise<UserDTO> {
    const res = await authClient.get('/me')
    return res.data
  },

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const res = await authClient.post('/refresh', { refreshToken })
    return res.data
  }
}