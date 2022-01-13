import { Product } from './Product'
import { User } from './User'
import { Member } from './Member'

export type PaymentStatus =
  | 'balance_due'
  | 'credit_owed'
  | 'failed'
  | 'paid'
  | 'void'
export type ShipmentStatus =
  | 'backorder'
  | 'canceled'
  | 'partial'
  | 'pending'
  | 'ready'
  | 'shipped'
export type OrderStatus =
  | 'new'
  | 'pending'
  | 'needs_review'
  | 'void'
  | 'complete'
  | 'archived'
export type OLIStatus = 'backorder' | 'on_hand' | 'void'

export interface Order {
  id: number | string
  status: OrderStatus
  payment_status: PaymentStatus
  shipment_status: ShipmentStatus
  total: number
  name: string
  email: string
  phone: string
  address?: string
  notes?: string
  subtotal?: number
  item_count: number
  email_sent?: boolean
  history?: object
  createdAt: string
  updatedAt: string
  OrderLineItems: LineItem[]
  UserId?: string
  User?: User
  Member?: Member
  Members?: Member // eek :/
  fts?: string
}

export type PartialOrder = Partial<Order>

export interface LineItem {
  id?: string | number
  createdAt?: string
  updatedAt?: string
  description: string
  quantity: number
  selected_unit?: string
  price: number
  total: number
  kind: string
  vendor?: string
  WholesaleOrderId?: number
  OrderId?: number
  invalid?: string
  status?: OLIStatus
  data?: {
    product?: Product
    payment?: { receipt_url: string; receipt_number: string }
  }
}
