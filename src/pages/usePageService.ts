import { useEffect, useState } from 'react'

import { Service } from '../types/Service'
import { Page } from '../types/Page'

const API_HOST = 'http://localhost:3000'

const usePageService = (
  slug: string | undefined,
  setLoading: (value: boolean) => void
) => {
  const [result, setResult] = useState<Service<Page>>({
    status: 'loading'
  })

  useEffect(() => {
    if (!slug || slug.length === 0) {
      setLoading(false)
      return
    }

    fetch(`${API_HOST}/page?slug=${slug}`)
      .then(response => response.json())
      .then(response => {
        console.log('page', response)
        setResult({ status: 'loaded', payload: response as Page })
      })
      .catch(error => {
        console.warn('usePageService fetch caught err:', error)
        setResult({ ...error })
      })
      .finally(() => {
        setLoading(false)
      })
  }, [slug, setLoading])

  return result
}

const useAllPagesService = () => {
  const [result, setResult] = useState<Service<Page[]>>({
    status: 'loading'
  })

  useEffect(() => {
    fetch(`${API_HOST}/pages`)
      .then(response => response.json())
      .then(response => {
        console.log('page', response)
        setResult({ status: 'loaded', payload: response.rows as Page[] })
      })
      .catch(error => {
        console.warn('usePageService fetch caught err:', error)
        setResult({ ...error })
      })
  }, [])

  return result
}

export { usePageService, useAllPagesService }
