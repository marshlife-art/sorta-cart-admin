import { useEffect, useState } from 'react'

import { Service } from '../types/Service'
import { WholesaleOrder } from '../types/WholesaleOrder'
import { API_HOST } from '../constants'
import { OrderStatus } from '../types/Order'

const token = localStorage && localStorage.getItem('token')

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
  setLoading: (value: boolean) => void
) => {
  const [result, setResult] = useState<Service<WholesaleOrder>>({
    status: 'loading'
  })

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    if (id === 'new') {
      setResult({ status: 'loaded', payload: blankWholesaleOrder })
      setLoading(false)
      return
    }

    fetch(`${API_HOST}/wholesaleorder/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(response => {
        setResult({ status: 'loaded', payload: response as WholesaleOrder })
      })
      .catch(error => {
        console.warn('useWholesaleOrderService fetch caught err:', error)
        setResult({ ...error })
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id, setLoading])

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

  useEffect(() => {
    reloadWholesaleOrders &&
      fetch(`${API_HOST}/wholesaleorders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status
        })
      })
        .then(response => response.json())
        .then(response => {
          setResult({
            status: 'loaded',
            payload: response.data as WholesaleOrder[]
          })
        })
        .catch(error => {
          console.warn('useWholesaleOrderService fetch caught err:', error)
          setResult({ ...error })
        })
        .finally(() => {
          setReloadWholesaleOrders(false)
          setLoading(false)
        })
  }, [reloadWholesaleOrders, setReloadWholesaleOrders, status, setLoading])

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

  useEffect(() => {
    if (!doSave || !wholesaleOrder || !wholesaleOrder.id) {
      setDoSave(false)
      return
    }

    const path =
      wholesaleOrder.id === 'new'
        ? '/wholesaleorder/create'
        : '/wholesaleorder/upsert'
    fetch(`${API_HOST}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(wholesaleOrder)
    })
      .then(response => response.json())
      .then(response => {
        setResult({
          status: 'loaded',
          payload: response.order as WholesaleOrder
        })
        setSnackMsg(response.msg)
        setSnackOpen(true)
      })
      .catch(error => {
        console.warn('useWholesaleOrderSaveService fetch caught err:', error)
        setResult({ ...error })
        setSnackMsg(`o noz! ${error}`)
        setSnackOpen(true)
      })
      .finally(() => {
        setDoSave(false)
      })
  }, [wholesaleOrder, doSave, setDoSave, setSnackMsg, setSnackOpen])

  return result
}

export {
  useWholesaleOrderService,
  useAllWholesaleOrdersService,
  useWholesaleOrderSaveService
}
