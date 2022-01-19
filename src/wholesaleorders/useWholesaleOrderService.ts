import { useCallback, useEffect, useState } from 'react'
import useSWR from 'swr'

import { Service } from '../types/Service'
import { SupaWholesaleOrder as WholesaleOrder } from '../types/SupaTypes'
import { OrderStatus } from '../types/Order'

import {
  wholesaleOrderFetcher,
  wholesaleOrdersFetcher
} from '../services/fetchers'
import { upsertWholesaleOrder } from '../services/mutations'

const blankWholesaleOrder: WholesaleOrder = {
  id: undefined,
  api_key: undefined,
  vendor: '',
  notes: '',
  status: 'new',
  payment_status: 'balance_due',
  shipment_status: 'backorder',
  createdAt: '',
  updatedAt: '',
  OrderLineItems: []
}

// hmm
// function tryParseData(data: string) {
//   try {
//     return JSON.parse(data)
//   } catch (e) {
//     return data
//   }
// }

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

    if (id === undefined) {
      setResult({ status: 'loaded', payload: blankWholesaleOrder })
      setLoading(false)
      setReload(false)
      return
    }

    const { data, error } = await wholesaleOrderFetcher(Number(id))

    if (error || !data) {
      console.warn('useWholesaleOrderService got error:', error)
      // #TODO: handle errorz
      // setResult({ error })
      setResult({
        status: 'error',
        error: new Error(error?.message || 'unknown error')
      })
    } else {
      setResult({
        status: 'loaded',
        payload: data
      })
    }

    // whee, so need to JSON.parse each OrderLineItem .data field
    // const { OrderLineItems, ...rest } = data
    // const wholesaleOrder = {
    //   ...rest,
    //   OrderLineItems: OrderLineItems.map(
    //     ({ data, ...rest }: { data: string }) => ({
    //       ...rest,
    //       data: tryParseData(data)
    //     })
    //   )
    // }

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

      const { data, error } = await wholesaleOrdersFetcher(status)

      if (error || !data) {
        console.warn('useWholesaleOrderService got error:', error)
        // #TODO: handle errorz
        // setResult({ error })
        setResult({
          status: 'loaded',
          payload: []
        })
      } else {
        setResult({
          status: 'loaded',
          payload: data
        })
      }

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
    if (!doSave || !wholesaleOrder) {
      setDoSave(false)
      return
    }

    const { data, error } = await upsertWholesaleOrder(wholesaleOrder)

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
