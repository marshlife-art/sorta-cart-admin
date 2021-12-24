import { SupaOrder, SupaOrderLineItem } from '../types/SupaTypes'
import { supabase } from './supabaseClient'

export const getMemberCreditsAdjustmentsSums = async (
  MemberId: string | number
) => {
  if (MemberId === undefined) {
    return {
      credits_sum: 0,
      adjustments_sum: 0,
      credits: [],
      adjustments: [],
      store_credit: 0
    }
  }

  const { data: orders, error } = await supabase
    .from<SupaOrder>('Orders')
    .select('id')
    .eq('MemberId', MemberId)

  if (error || !orders) {
    console.warn(
      '[getMemberCreditsAdjustmentsSums] selecting Orders got error:',
      error
    )
    return {
      credits_sum: 0,
      adjustments_sum: 0,
      credits: [],
      adjustments: [],
      store_credit: 0
    }
  }

  const orderIds = orders.map((o) => o.id)

  const { data: credits } = await supabase
    .from<SupaOrderLineItem>('OrderLineItems')
    .select()
    .eq('kind', 'credit')
    .in('OrderId', orderIds)

  const { data: adjustments } = await supabase
    .from<SupaOrderLineItem>('OrderLineItems')
    .select()
    .eq('kind', 'adjustment')
    .in('OrderId', orderIds)
    .ilike('description', '%store credit%')

  const credits_sum = credits
    ? credits
        .map(({ total }) => (total ? total : 0))
        .reduce((sum, i) => sum + i, 0)
    : 0

  const adjustments_sum = adjustments
    ? adjustments
        .map(({ total }) => (total ? total : 0))
        .reduce((sum, i) => sum + i, 0)
    : 0

  const store_credit = +(credits_sum + Math.abs(adjustments_sum)).toFixed(2)

  return { credits_sum, adjustments_sum, credits, adjustments, store_credit }
}

export const getStoreCreditReport = async () => {
  const { data: members, error } = await supabase.from('Members').select()

  if (error || !members) {
    console.warn('getting members failed error:', error)
    return []
  }

  const rows = await Promise.all(
    members.map(async (member) => {
      const {
        credits_sum,
        adjustments_sum,
        credits,
        adjustments,
        store_credit
      } = await getMemberCreditsAdjustmentsSums(member.id)

      if (!adjustments || !credits) {
        return []
      }
      return {
        ...member,
        credits,
        credits_sum,
        adjustments,
        adjustments_sum,
        store_credit
      }
    })
  )

  return rows
    .filter((o) => o)
    .filter((r) => r.store_credit !== 0)
    .sort(function (a, b) {
      return a.store_credit - b.store_credit
    })
}

export const getStoreCreditForUser = async (UserId: number) => {
  if (UserId === undefined) {
    return 0
  }

  const { data, error } = await supabase
    .from('Member')
    .select('id')
    .eq('UserId', UserId)
    .single()
  if (error || !data) {
    return 0
  }
  const MemberId = data.id

  if (!MemberId) {
    return 0
  }

  const { store_credit } = await getMemberCreditsAdjustmentsSums(MemberId)

  return store_credit
}
