import { Member } from './Member'

export interface User {
  id?: string
  name?: string
  email?: string
  phone?: string
  address?: string
  token?: string
  role?: string
  Member?: Member
  createdAt?: string
  updatedAt?: string
}

export interface UserLogin {
  username: string
  password: string
}

export interface LoginError {
  error: string
  reason: string
}

export interface LoginMessage {
  message: string
}
