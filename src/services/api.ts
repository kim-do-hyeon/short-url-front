import axios from 'axios'
import { getToken, setAuth } from './auth'

export interface LinkCreatePayload {
  original_url: string
  custom_code?: string
  ttl_days?: number
  expires_at?: string
  password?: string
  max_clicks?: number
  one_time?: boolean
}

export interface LinkCreateResponse {
  code: string
  short_url: string
  expires_at: string | null
  password_protected: boolean
  max_clicks: number | null
  one_time: boolean
}

export interface LinkStats {
  code: string
  original_url: string
  created_at: string
  expires_at: string | null
  password_protected: boolean
  max_clicks: number | null
  one_time: boolean
  click_count: number
  active: boolean
  last_accessed_at: string | null
}

export interface PublicLinkInfo {
  code: string
  active: boolean
  password_protected: boolean
  original_url: string | null
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user_email: string
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8000',
  timeout: 8000,
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export async function createShortLink(payload: LinkCreatePayload): Promise<LinkCreateResponse> {
  const { data } = await api.post<LinkCreateResponse>('/api/links', payload)
  return data
}

export async function fetchLinks(): Promise<LinkStats[]> {
  const { data } = await api.get<{ items: LinkStats[] }>('/api/links')
  return data.items
}

export async function deleteShortLink(code: string): Promise<void> {
  await api.delete(`/api/links/${code}`)
}

export async function fetchLinkStats(code: string): Promise<LinkStats> {
  const { data } = await api.get<LinkStats>(`/api/links/${code}/stats`)
  return data
}

export async function fetchPublicLinkInfo(code: string): Promise<PublicLinkInfo> {
  const { data } = await api.get<PublicLinkInfo>(`/api/links/${code}/public`)
  return data
}

export async function resolveLink(code: string, password?: string): Promise<string> {
  const { data } = await api.post<{ original_url: string }>(`/api/links/${code}/resolve`, { password })
  return data.original_url
}

export async function signup(email: string, password: string): Promise<void> {
  const { data } = await api.post<AuthResponse>('/api/auth/signup', { email, password })
  setAuth(data.access_token, data.user_email)
}

export async function login(email: string, password: string): Promise<void> {
  const { data } = await api.post<AuthResponse>('/api/auth/login', { email, password })
  setAuth(data.access_token, data.user_email)
}
