import { create } from "zustand"

interface User {
  id: string
  name: string
  email: string
  role?: string
  token?: string
  [key: string]: any
}

interface AuthState {
  isLoggedIn: boolean
  user: User | null
  token: string | null
  login: (user: User) => void
  logout: () => void
  initializeAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  user: null,
  token: null,

  login: (user: User) => {
    const token = user.token || ""
    localStorage.setItem("auth_token", token)
    localStorage.setItem("user_data", JSON.stringify(user))
    document.cookie = `auth_token=${token}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`
    set({ isLoggedIn: true, user, token })
  },

  logout: () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
    localStorage.removeItem("restaurant-cart-storage")
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    set({ isLoggedIn: false, user: null, token: null })
    window.dispatchEvent(new CustomEvent("userDataUpdated"))
  },

  initializeAuth: () => {
    const token = localStorage.getItem("auth_token")
    const userDataStr = localStorage.getItem("user_data")
    if (token && userDataStr) {
      try {
        const user = JSON.parse(userDataStr)
        set({ isLoggedIn: true, user: { ...user, token }, token })
      } catch {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_data")
        set({ isLoggedIn: false, user: null, token: null })
      }
    }
  },
}))

// ✅ authClient — drop-in replacement for lib/auth.ts
// Keeps the same API so the second login page works without changes
export const authClient = {
  async login(email: string, password: string) {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          message: data.message,
          errors: data.errors,
          status: response.status,
          data: data,
        }
      }

      // Extract token and user from response
      const token = data.token || data.data?.token || data.access_token
      const user = data.user || data.data?.user || data.data

      if (token && user) {
        // Use the store's login to save everything consistently
        useAuthStore.getState().login({ ...user, token })
        window.dispatchEvent(new CustomEvent("userDataUpdated"))
      }

      return {
        success: true,
        user: user,
      }
    } catch (error) {
      throw error
    }
  },

  async logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    })
    useAuthStore.getState().logout()
  },

  async getCurrentUser() {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) return null

      const response = await fetch("/api/auth/me", {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) return null

      const data = await response.json()
      return data.user || null
    } catch {
      return null
    }
  },

  async checkAuth() {
    const user = await this.getCurrentUser()
    return !!user
  },

  async getUserRole() {
    const user = await this.getCurrentUser()
    return user?.role || null
  },

  async isAdmin() {
    const role = await this.getUserRole()
    return role === "admin"
  },

  async isMember() {
    const role = await this.getUserRole()
    return role === "member"
  },
}