import { definitions } from './supabase'

export type User = {
  email?: string
  role?: string
}
export type SupaProduct = definitions['products']
export type SupaMember = definitions['Members']
export type SupaUser = { email?: string } // hmm, figure this out.
export type SupaMemberWithUser = SupaMember & { User: SupaUser }
export type SupaOrderLineItemData = {
  product?: SupaProduct
  payment?: { receipt_url: string; receipt_number: string }
}
export type SupaOrderLineItem = Omit<
  definitions['OrderLineItems'],
  'id' | 'data'
> & {
  id?: number
  data?: SupaOrderLineItemData | null
}
export type SupaOrder = definitions['Orders']
export type SupaOrderWithLineItems = SupaOrder & {
  OrderLineItems: SupaOrderLineItem[]
}
export type SupaOrderWithMembers = SupaOrder & {
  Members?: SupaMember
}
export type SuperOrderAndAssoc = SupaOrder & {
  OrderLineItems: SupaOrderLineItem[]
  Members?: SupaMember
  User?: User
}

type WholesaleOrder = definitions['WholesaleOrders']
export type SupaWholesaleOrder = Omit<WholesaleOrder, 'id' | 'api_key'> & {
  id?: number
  api_key?: string
  OrderLineItems: SupaOrderLineItem[]
  data?: any
}

export type SupaCatmap = definitions['catmap']
