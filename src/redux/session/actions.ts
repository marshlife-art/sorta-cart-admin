import { ThunkAction, ThunkDispatch } from 'redux-thunk'
import { AnyAction } from 'redux'

import { User, LoginError } from '../../types/User'
import { API_HOST } from '../../constants'

export interface SetAction {
  type: 'SET'
  user: User
}
export interface SetFetcing {
  type: 'SET_FETCHING'
  isFetching: boolean
}
export interface SetError {
  type: 'SET_ERROR'
  error: LoginError
}

export type Action = SetAction | SetFetcing | SetError

export const set = (user: User): SetAction => {
  return { type: 'SET', user }
}
export const setError = (error: LoginError): SetError => {
  return { type: 'SET_ERROR', error }
}
export const isFetching = (isFetching: boolean): SetFetcing => {
  return { type: 'SET_FETCHING', isFetching }
}

export const checkSession = (): ThunkAction<
  Promise<void>,
  {},
  {},
  AnyAction
> => {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>): Promise<void> => {
    return new Promise<void>(resolve => {
      dispatch(isFetching(true))

      const token = localStorage && localStorage.getItem('token')

      if (!token) {
        // reject('no token')
        dispatch(isFetching(false))
        dispatch(set({ name: undefined, email: undefined, token: undefined }))
        resolve()
        return
      }

      fetch(`${API_HOST}/check_session`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => response.json())
        .then(response => {
          // console.log('check_session', response)
          if (response.msg === 'ok' && response.user) {
            dispatch(set(response.user))
          } else {
            dispatch(
              set({ name: undefined, email: undefined, token: undefined })
            )
          }
        })
        .catch(err => {
          console.warn('check_session caught err:', err)
          dispatch(set({ name: undefined, email: undefined, token: undefined }))
        })
        .finally(() => {
          dispatch(isFetching(false))
          resolve()
        })
    })
  }
}

export const login = (
  email: string,
  password: string
): ThunkAction<Promise<void>, {}, {}, AnyAction> => {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>): Promise<void> => {
    return new Promise<void>(resolve => {
      dispatch(isFetching(true))

      const body = { email: email, password: password }
      fetch(`${API_HOST}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
        .then(response => response.json())
        .then(response => {
          // console.log('[session/actions] user login', response)
          if (response.msg === 'ok' && response.user && response.user.token) {
            localStorage && localStorage.setItem('token', response.user.token)
            dispatch(set(response.user))
          } else {
            dispatch(setError({ error: 'error', reason: response.message }))
          }
        })
        .finally(() => {
          dispatch(isFetching(false))
          resolve()
        })
    })
  }
}

export const logout = (): ThunkAction<Promise<void>, {}, {}, AnyAction> => {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>): Promise<void> => {
    return new Promise<void>(resolve => {
      dispatch(isFetching(true))
      localStorage && localStorage.removeItem('token')
      dispatch(isFetching(false))
      resolve()
    })
  }
}
