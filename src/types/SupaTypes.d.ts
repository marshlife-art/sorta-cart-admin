import { definitions } from './supabase'

export type SupaProduct = definitions['products']
export type SupaMember = definitions['Members']
export type SupaOrderLineItem = definitions['OrderLineItems']
export type SupaOrder = definitions['Orders']
export type SupaOrderWithLineItems = SupaOrder & {
  OrderLineItems: SupaOrderLineItem[]
}
export type SupaWholesaleOrder = definitions['WholesaleOrders']
