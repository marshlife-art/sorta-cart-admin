import { OrderStatus, PaymentStatus, ShipmentStatus } from './types/Order'

export const API_HOST =
  process.env.NODE_ENV === 'production'
    ? 'https://api.marshcoop.org'
    : 'https://api.marsh.dev'

export const TAX_RATE = 0.06391
export const TAX_RATE_STRING = `${(TAX_RATE * 100).toFixed(3)}%`

type OrderStatusLookup = { [key in OrderStatus]: string }
export const ORDER_STATUSES: OrderStatusLookup = {
  new: 'new',
  needs_review: 'needs review',
  pending: 'pending',
  complete: 'complete',
  void: 'void',
  archived: 'archived'
}

type OrderPaymentStatusLookup = { [key in PaymentStatus]: string }
export const PAYMENT_STATUSES: OrderPaymentStatusLookup = {
  balance_due: 'balance due',
  paid: 'paid',
  credit_owed: 'credit owed',
  failed: 'failed',
  void: 'void'
}

type OrderShipmentStatusLookup = { [key in ShipmentStatus]: string }
export const SHIPMENT_STATUSES: OrderShipmentStatusLookup = {
  backorder: 'backorder',
  pending: 'pending',
  ready: 'ready',
  shipped: 'shipped',
  partial: 'partial',
  canceled: 'canceled'
}

export const APP_VERSION = `v${
  process.env.npm_package_version || require('../package.json').version
} made with ♥ in NYC`
