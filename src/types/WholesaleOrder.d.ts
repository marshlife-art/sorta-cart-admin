import { LineItem, OrderStatus, PaymentStatus, ShipmentStatus } from './Order'

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
}

export interface WholesaleOrderRouterProps {
  id: string
}
