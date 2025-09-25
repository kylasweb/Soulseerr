import axios from 'axios'

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  username?: string;
  role: 'CLIENT' | 'READER';
  firstName?: string;
  lastName?: string;
}

interface AuthUser {
  id: string;
  email: string;
  username: string | null;
  role: 'CLIENT' | 'READER' | 'ADMIN';
  status: string;
  clientProfile?: any;
  readerProfile?: any;
  adminProfile?: any;
  wallet?: any;
}

export class AuthService {
  private static readonly API_BASE = '/api'

  /**
   * Register a new user
   */
  static async register(data: RegisterData): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      const response = await axios.post(`${this.API_BASE}/auth/register`, data)

      if (response.data.user) {
        return { success: true, user: response.data.user }
      }

      return { success: false, error: response.data.error || 'Registration failed' }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Registration failed'
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Login user
   */
  static async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: AuthUser; token?: string; error?: string }> {
    try {
      const response = await axios.post(`${this.API_BASE}/auth/login`, credentials)

      if (response.data.user && response.data.token) {
        return {
          success: true,
          user: response.data.user,
          token: response.data.token
        }
      }

      return { success: false, error: response.data.error || 'Login failed' }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Login failed'
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      await axios.post(`${this.API_BASE}/auth/logout`)
      return { success: true }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Logout failed'
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      const response = await axios.get(`${this.API_BASE}/users/profile`)

      if (response.data.user) {
        return { success: true, user: response.data.user }
      }

      return { success: false, error: 'Failed to get user profile' }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to get user profile'
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(data: Partial<AuthUser>): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      const response = await axios.put(`${this.API_BASE}/users/profile`, data)

      if (response.data.user) {
        return { success: true, user: response.data.user }
      }

      return { success: false, error: response.data.error || 'Profile update failed' }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Profile update failed'
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Check if user is authenticated by verifying token
   */
  static async verifyToken(token: string): Promise<{ valid: boolean; user?: AuthUser }> {
    try {
      // Set token in axios defaults for this request
      const originalToken = axios.defaults.headers.common['Authorization']
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

      const response = await axios.get(`${this.API_BASE}/users/profile`)

      // Restore original token
      if (originalToken) {
        axios.defaults.headers.common['Authorization'] = originalToken
      } else {
        delete axios.defaults.headers.common['Authorization']
      }

      return { valid: true, user: response.data.user }
    } catch (error) {
      return { valid: false }
    }
  }
}