import { User } from './User'

export interface Member {
  id: string
  registration_email: string
  name: string
  phone: string
  address: string
  discount: number
  discount_type: string
  fees_paid: number
  store_credit: number
  shares: number
  member_type: string
  data: { [key: string]: string }
  createdAt?: string
  updatedAt?: string
  User?: User
}

export interface MemberRouterProps {
  id: string
}
