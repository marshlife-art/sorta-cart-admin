import { useEffect, useState } from 'react'

import { Service } from '../types/Service'
import { Order } from '../types/Order'
import { API_HOST } from '../constants'

const useOrderService = (
  id: string | undefined,
  setLoading: (value: boolean) => void
) => {
  const [result, setResult] = useState<Service<Order>>({
    status: 'loading'
  })

  useEffect(() => {
    if (!id || id.length === 0) {
      setLoading(false)
      return
    }

    const token = localStorage && localStorage.getItem('token')

    fetch(`${API_HOST}/order/edit/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(response => {
        // console.log('page', response)
        setResult({ status: 'loaded', payload: response as Order })
      })
      .catch(error => {
        console.warn('useOrderService fetch caught err:', error)
        setResult({ ...error })
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id, setLoading])

  return result
}

// const useOrderSaveService = (
//   order: Order | undefined,
//   doSave: boolean,
//   setDoSave: (value: boolean) => void,
//   setSnackMsg: (msg: string) => void,
//   setSnackOpen: (value: boolean) => void
// ) => {
//   const [result, setResult] = useState<Service<Order>>({
//     status: 'loading'
//   })

//   useEffect(() => {
//     if (!doSave || !order) {
//       setDoSave(false)
//       return
//     }

//     console.log('need to save order', order)
//     setResult({ status: 'error', error: new Error('#TODO') })
//     fetch(`${API_HOST}/order/create`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${token}`
//       },
//       body: JSON.stringify(order)
//     })
//       .then(response => response.json())
//       .then(response => {
//         // console.log('usePageSaveService response:', response)
//         setResult({ status: 'loaded', payload: response as Order })
//         setSnackMsg(response.msg)
//         setSnackOpen(true)
//       })
//       .catch(error => {
//         console.warn('usePageSaveService fetch caught err:', error)
//         setResult({ ...error })
//         setSnackMsg(`o noz! ${error}`)
//         setSnackOpen(true)
//       })
//       .finally(() => {
//         setDoSave(false)
//       })
//   }, [order, doSave, setDoSave, setSnackMsg, setSnackOpen])

//   return result
// }

export { useOrderService }
