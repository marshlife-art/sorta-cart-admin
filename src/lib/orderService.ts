import { supabase } from './supabaseClient'
import { SupaOrder, SupaOrderLineItem } from '../types/SupaTypes'
import { Order } from '../types/Order'
import { TAX_RATE } from '../constants'

// supabase

export const createOrder = async (
  order: SupaOrder,
  orderLineItems: SupaOrderLineItem[]
) => {
  const { data, error } = await supabase
    .from<SupaOrder>('Orders')
    .insert(
      {
        ...order,
        id: undefined,
        createdAt: undefined,
        updatedAt: undefined
      },
      { returning: 'representation' }
    )
    .single()

  if (error || !data || !data.id) {
    return null // ...something?
  }

  for await (const oli of orderLineItems) {
    await supabase.from<SupaOrderLineItem>('OrderLineItems').insert(
      {
        ...oli,
        OrderId: data.id
      },
      { returning: 'minimal' }
    )
  }

  return data

  // #TODO deal with on_hand_count checking like:

  // order.OrderLineItems.map((oli) => delete oli.id)
  // const createdOrder = await Order.create(order, { include: [OrderLineItem] })
  // const additionalBackOrderItems = []
  // for await (let oli of createdOrder.OrderLineItems) {
  //   if (oli?.data?.product?.unf || oli?.data?.product?.upc_code) {
  //     const product = await Product.findOne({
  //       attributes: ['u_price', 'count_on_hand'],
  //       where: {
  //         unf: oli.data.product.unf,
  //         upc_code: oli.data.product.upc_code
  //       },
  //       raw: true
  //     })
  //     const pCount = isNaN(parseInt(product.count_on_hand))
  //       ? 0
  //       : parseInt(product.count_on_hand)
  //     // so 1. check if there's enough count_on_hand to satasify this li.
  //     //  if so, set status = 'on_hand' and Product.decrement('count_on_hand'
  //     // if there only some count_on_hand for this li then:
  //     //   Product.decrement('count_on_hand') whaterver product.count_on_hand
  //     //   set oli.status = 'on_hand' and oli.quantity = eaQty and oli.selected_unit = 'EA'
  //     //   and create a new oli with remainder.
  //     // only account for EA selected_unit, let CS units move to backorder
  //     if (pCount > 0 && oli.selected_unit === 'EA') {
  //       const eaQty = isNaN(parseInt(`${oli.quantity}`))
  //         ? 0
  //         : parseInt(`${oli.quantity}`)
  //       if (eaQty > pCount) {
  //         // need to create a backorder line item
  //         const price = parseFloat(`${product.u_price}`)
  //         additionalBackOrderItems.push({
  //           ...oli.get({ plain: true }),
  //           quantity: eaQty - pCount,
  //           price,
  //           total: +((eaQty - pCount) * price).toFixed(2),
  //           status: 'backorder',
  //           selected_unit: 'EA'
  //         })
  //         oli.price = price
  //         oli.total = +(pCount * price).toFixed(2)
  //         oli.quantity = pCount
  //         oli.selected_unit = 'EA'
  //       }
  //       oli.status = 'on_hand'
  //       await oli.save()
  //       await Product.decrement('count_on_hand', {
  //         by: Math.min(eaQty, pCount),
  //         where: {
  //           unf: oli.data.product.unf,
  //           upc_code: oli.data.product.upc_code
  //         }
  //       }).catch((error) =>
  //         console.warn(
  //           'caught error trying to decrement Product.count_on_hand! err:',
  //           error
  //         )
  //       )
  //     } else {
  //       oli.status = 'backorder'
  //       await oli.save()
  //     }
  //   }
  // }
  // for await (li of additionalBackOrderItems) {
  //   try {
  //     delete li.id
  //     const newoli = await OrderLineItem.create(li)
  //     await createdOrder.addOrderLineItem(newoli)
  //   } catch (error) {
  //     console.warn('caught error trying to addOrderLineItem! error:', error)
  //   }
  // }
  // return await createdOrder.reload()
}

export const updateOrder = async (
  order: SupaOrder,
  orderLineItems: SupaOrderLineItem[]
) => {
  if (!order || !order.id) {
    // throw new Error('no such order id exist to update!')
    console.warn('no such order id exist to update!')
    return null
  }

  const { data, error } = await supabase
    .from<SupaOrder>('Orders')
    .update(
      {
        ...order,
        id: undefined,
        createdAt: undefined,
        updatedAt: undefined
      },
      { returning: 'representation' }
    )
    .eq('id', order.id)
    .single()

  if (error || !data || !data.id) {
    console.warn('onoz updateOrder got error:', error)
    return null // ...something?
  }

  // prevent orpahned OrderLineItems, purge existing ones first.
  const { error: oldDeleteError } = await supabase
    .from<SupaOrderLineItem>('OrderLineItems')
    .delete({ returning: 'minimal' })
    .eq('OrderId', order.id)

  if (oldDeleteError) {
    console.warn('onoz oldDeleteError:', oldDeleteError)
    return null
  }

  for await (const oli of orderLineItems) {
    const { error: oldCreateError } = await supabase
      .from<SupaOrderLineItem>('OrderLineItems')
      .insert(
        {
          ...oli,
          OrderId: data.id
        },
        { returning: 'minimal' }
      )
    if (oldCreateError) {
      console.warn('onoz oldCreateError:', oldCreateError)
    }
  }

  return data
}

export interface OrderCreditItem {
  OrderId: string | number
  total: number | string
  description: string
}

function toMoney(input: any) {
  if (isNaN(parseFloat(input))) {
    return 0
  }
  return +parseFloat(input).toFixed(2)
}

export const createOrderCredits = async (items: OrderCreditItem[]) => {
  if (!items || items.length === 0) {
    throw new Error('[createOrderCredits] invalid request!')
  }

  return await Promise.all(
    items.map(async (item) => {
      if (item.OrderId && item.total && item.description) {
        const OrderId = parseInt(`${item.OrderId}`)
        const absPrice = Math.abs(parseFloat(`${item.total}`))
        const price = toMoney(-absPrice)
        const total = toMoney(-(absPrice + absPrice * TAX_RATE))

        const { data: orderLineItems, error } = await supabase
          .from<SupaOrderLineItem>('OrderLineItems')
          .select()
          .eq('OrderId', OrderId)
          .eq('kind', 'credit')
          .eq('total', total)

        if (error || !orderLineItems || orderLineItems.length > 0) {
          return
        }

        await supabase.from<SupaOrderLineItem>('OrderLineItems').insert({
          quantity: 1,
          price,
          total,
          description: `STORE CREDIT (${item.description})`,
          kind: 'credit',
          OrderId
        })
      }
    })
  )
}
