import { LineItem } from './Product'

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
export type OrderStatus = 'new' | 'needs_review' | 'void' | 'archived'

export interface Order {
  id: number
  status: OrderStatus
  payment_status: PaymentStatus
  shipment_status: ShipmentStatus
  line_items: LineItem[]
  total: number
  name: string
  email: string
  phone: string
  address?: string
  notes?: string
  history?: object
  createdAt: string
  updatedAt: string
  WholesaleOrderId?: number
}

export type PartialOrder = Partial<Order>
