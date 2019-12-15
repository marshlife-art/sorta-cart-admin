export interface User {
  id?: string
  name?: string
  email?: string
  token?: string
  roles?: string[]
}

export interface UserLogin {
  username: string
  password: string
}

export interface LoginError {
  error: string
  reason: string
}
