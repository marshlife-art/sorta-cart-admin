import { useEffect, useState } from 'react'

import { Service } from '../types/Service'
import { orderFetcher } from '../services/fetchers'
import { SuperOrderAndAssoc as Order } from '../types/SupaTypes'

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

    orderFetcher(Number(id)).then((result) => {
      result.data &&
        setResult({ status: 'loaded', payload: result.data as Order })
      setLoading(false)
    })
  }, [id, setLoading])

  return result
}

export { useOrderService }
