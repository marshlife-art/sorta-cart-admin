import { useEffect, useState } from 'react'

import { Service } from '../types/Service'
import { Page } from '../types/Page'
import { API_HOST } from '../constants'

const usePageService = (
  id: string | undefined,
  setLoading: (value: boolean) => void
) => {
  const [result, setResult] = useState<Service<Page>>({
    status: 'loading'
  })

  useEffect(() => {
    if (!id || id.length === 0) {
      setLoading(false)
      return
    }

    fetch(`${API_HOST}/page?id=${id}`)
      .then((response) => response.json())
      .then((response) => {
        setResult({ status: 'loaded', payload: response as Page })
      })
      .catch((error) => {
        console.warn('usePageService fetch caught err:', error)
        setResult({ ...error })
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id, setLoading])

  return result
}

const useAllPagesService = (
  reloadPages: boolean,
  setReloadPages: (reloadPages: boolean) => void
) => {
  const [result, setResult] = useState<Service<Page[]>>({
    status: 'loading'
  })

  useEffect(() => {
    reloadPages &&
      fetch(`${API_HOST}/pages`, {
        credentials: 'include'
      })
        .then((response) => response.json())
        .then((response) => {
          setResult({ status: 'loaded', payload: response.rows as Page[] })
        })
        .catch((error) => {
          console.warn('usePageService fetch caught err:', error)
          setResult({ ...error })
        })
        .finally(() => setReloadPages(false))
  }, [reloadPages, setReloadPages])

  return result
}

const usePageSaveService = (
  page: Page | undefined,
  doSave: boolean,
  setDoSave: (value: boolean) => void,
  setSnackMsg: (msg: string) => void,
  setSnackOpen: (value: boolean) => void
) => {
  const [result, setResult] = useState<Service<Page>>({
    status: 'loading'
  })

  useEffect(() => {
    if (!doSave || !page || page.slug.length === 0) {
      setDoSave(false)
      return
    }
    fetch(`${API_HOST}/page`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
       
      },
      credentials: 'include',
      body: JSON.stringify(page)
    })
      .then((response) => response.json())
      .then((response) => {
        setResult({ status: 'loaded', payload: response.page[0] as Page })
        setSnackMsg(response.msg)
        setSnackOpen(true)
      })
      .catch((error) => {
        console.warn('usePageSaveService fetch caught err:', error)
        setResult({ ...error })
        setSnackMsg(`o noz! ${error}`)
        setSnackOpen(true)
      })
      .finally(() => {
        setDoSave(false)
      })
  }, [page, doSave, setDoSave, setSnackMsg, setSnackOpen])

  return result
}

export { usePageService, useAllPagesService, usePageSaveService }