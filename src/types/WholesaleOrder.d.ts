import { LineItem, OrderStatus, PaymentStatus, ShipmentStatus } from './Order'

export type SquareStatus = 'new' | 'ready_to_import' | 'complete'

export interface WholesaleOrder {
  id: string
  vendor: string
  notes?: string
  status: OrderStatus
  payment_status: PaymentStatus
  shipment_status: ShipmentStatus
  createdAt: string
  updatedAt: string
  OrderLineItems?: LineItem[]

  calc_adjustments?: boolean
  square_status?: string
  square_loaded_at?: string
  data?: object
}

export interface WholesaleOrderRouterProps {
  id: string
}
