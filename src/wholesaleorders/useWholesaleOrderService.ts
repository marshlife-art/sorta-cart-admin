import { useCallback, useEffect, useState } from 'react'

import { Service } from '../types/Service'
import { WholesaleOrder } from '../types/WholesaleOrder'
import { API_HOST } from '../constants'
import { OrderStatus } from '../types/Order'
import { supabase } from '../lib/supabaseClient'
import useSWR from 'swr'

const blankWholesaleOrder: WholesaleOrder = {
  id: '',
  vendor: '',
  notes: '',
  status: 'new',
  payment_status: 'balance_due',
  shipment_status: 'backorder',
  createdAt: '',
  updatedAt: ''
}

const useWholesaleOrderService = (
  id: string | undefined,
  setLoading: (value: boolean) => void,
  reload: boolean,
  setReload: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const [result, setResult] = useState<Service<WholesaleOrder>>({
    status: 'loading'
  })

  useSWR({ key: 'get_wholesale_order', id, reload }, async ({ id, reload }) => {
    if (!id) {
      setLoading(false)
      setReload(false)
      return
    }

    if (id === 'new') {
      setResult({ status: 'loaded', payload: blankWholesaleOrder })
      setLoading(false)
      setReload(false)
      return
    }

    let query = supabase
      .from('WholesaleOrders')
      .select('*, OrderLineItems ( * )')
      .eq('id', id)
      .single()

    const { data, error } = await query

    if (error) {
      console.warn('useWholesaleOrderService got error:', error)
      // #TODO: handle errorz
      // setResult({ error })
    }

    // whee, so need to JSON.parse each OrderLineItem .data field
    const { OrderLineItems, ...rest } = data
    const wholesaleOrder = {
      ...rest,
      OrderLineItems: OrderLineItems.map(
        ({ data, ...rest }: { data: string }) => ({
          ...rest,
          data: JSON.parse(data)
        })
      )
    }

    setResult({
      status: 'loaded',
      payload: wholesaleOrder as WholesaleOrder
    })

    setReload(false)
    setLoading(false)
  })

  return result
}

const useAllWholesaleOrdersService = (
  status: OrderStatus,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  reloadWholesaleOrders: boolean,
  setReloadWholesaleOrders: (reloadWholesaleOrders: boolean) => void
) => {
  const [result, setResult] = useState<Service<WholesaleOrder[]>>({
    status: 'loading'
  })

  useSWR(
    { key: 'get_wholesale_orders', reloadWholesaleOrders, status },
    async ({ reloadWholesaleOrders, status }) => {
      if (!reloadWholesaleOrders) {
        return
      }
      let query = supabase.from('WholesaleOrders').select()
      if (status) {
        query = query.eq('status', status)
      }

      const { data, error, count } = await query

      if (error) {
        console.warn('useWholesaleOrderService got error:', error)
        // #TODO: handle errorz
        // setResult({ error })
      }

      setResult({
        status: 'loaded',
        payload: data as WholesaleOrder[]
      })
      setReloadWholesaleOrders(false)
      setLoading(false)
    }
  )

  return result
}

const useWholesaleOrderSaveService = (
  wholesaleOrder: WholesaleOrder | undefined,
  doSave: boolean,
  setDoSave: (value: boolean) => void,
  setSnackMsg: (msg: string) => void,
  setSnackOpen: (value: boolean) => void
) => {
  const [result, setResult] = useState<Service<WholesaleOrder>>({
    status: 'loading'
  })

  const createOrUpdateWholesaleOrder = useCallback(async () => {
    if (!doSave || !wholesaleOrder || !wholesaleOrder.id) {
      setDoSave(false)
      return
    }

    const { data, error } = await supabase
      .from('WholesaleOrders')
      .upsert({
        ...wholesaleOrder,
        id: wholesaleOrder.id === 'new' ? undefined : wholesaleOrder.id,
        createdAt:
          wholesaleOrder.id === 'new' ? undefined : wholesaleOrder.createdAt,
        updatedAt:
          wholesaleOrder.id === 'new' ? undefined : wholesaleOrder.updatedAt,
        OrderLineItems: undefined
      })
      .single()

    if (error) {
      setSnackMsg(error.message)
      setSnackOpen(true)
      setResult({ status: 'error', error: new Error(error.message) })
    } else {
      setSnackMsg('Saved!')
      setSnackOpen(true)
      setResult({
        status: 'loaded',
        payload: data as WholesaleOrder
      })
    }

    setDoSave(false)
  }, [wholesaleOrder, doSave, setDoSave, setSnackMsg, setSnackOpen])

  useEffect(() => {
    createOrUpdateWholesaleOrder()
  }, [doSave])

  return result
}

export {
  useWholesaleOrderService,
  useAllWholesaleOrdersService,
  useWholesaleOrderSaveService
}
