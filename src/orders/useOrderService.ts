import { useEffect, useState } from 'react'

import { Service } from '../types/Service'
import { Order } from '../types/Order'
import { supabase } from '../lib/supabaseClient'

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

    supabase
      .from<Order>('Orders')
      .select('*, OrderLineItems ( * )')
      .eq('id', id)
      .single()
      .then((result) => {
        console.log('zomg result.data:', result.data)
        result.data && setResult({ status: 'loaded', payload: result.data })

        setLoading(false)
      })
  }, [id, setLoading])

  return result
}

export { useOrderService }
