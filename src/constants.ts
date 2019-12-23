import { OrderStatus, PaymentStatus, ShipmentStatus } from './types/Order'

export const API_HOST = 'http://localhost:3000'

type OrderStatusLookup = { [key in OrderStatus]: string }
export const ORDER_STATUSES: OrderStatusLookup = {
  new: 'new',
  pending: 'pending',
  needs_review: 'needs review',
  void: 'void',
  complete: 'complete',
  archived: 'archived'
}

type OrderPaymentStatusLookup = { [key in PaymentStatus]: string }
export const PAYMENT_STATUSES: OrderPaymentStatusLookup = {
  balance_due: 'balance due',
  credit_owed: 'credit owed',
  failed: 'failed',
  paid: 'paid',
  void: 'void'
}

type OrderShipmentStatusLookup = { [key in ShipmentStatus]: string }
export const SHIPMENT_STATUSES: OrderShipmentStatusLookup = {
  backorder: 'backorder',
  canceled: 'canceled',
  partial: 'partial',
  pending: 'pending',
  ready: 'ready',
  shipped: 'shipped'
}
