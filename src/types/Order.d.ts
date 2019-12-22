import { Product } from './Product'

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
  | 'archived'

export interface Order {
  id: number
  status: OrderStatus
  payment_status: PaymentStatus
  shipment_status: ShipmentStatus
  total: number
  name: string
  email: string
  phone: string
  address?: string
  notes?: string
  history?: object
  createdAt: string
  updatedAt: string
  OrderLineItems: LineItem[]
  WholesaleOrderId?: number
}

export type PartialOrder = Partial<Order>

export interface OrderRouterProps {
  id: string
}

export interface LineItem {
  description: string
  quantity: number
  selected_unit?: string
  price: number
  total: number
  kind: string
  data?: { product?: Product }
}
