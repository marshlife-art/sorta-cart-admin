export interface User {
  id?: string
  name?: string
  email?: string
  phone?: string
  address?: string
  token?: string
  role?: string
}

export interface UserLogin {
  username: string
  password: string
}

export interface LoginError {
  error: string
  reason: string
}
