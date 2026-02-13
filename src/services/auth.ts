const TOKEN_KEY = 'short_auth_token'
const EMAIL_KEY = 'short_auth_email'
const AUTH_EVENT = 'short-auth-changed'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAuth(token: string, email: string): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(EMAIL_KEY, email)
  window.dispatchEvent(new Event(AUTH_EVENT))
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(EMAIL_KEY)
  window.dispatchEvent(new Event(AUTH_EVENT))
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

export function getAuthEmail(): string | null {
  return localStorage.getItem(EMAIL_KEY)
}

export function onAuthChanged(handler: () => void): () => void {
  window.addEventListener(AUTH_EVENT, handler)
  return () => window.removeEventListener(AUTH_EVENT, handler)
}
