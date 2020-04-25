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

const NULL_USER: User = {
  id: undefined,
  email: undefined,
  token: undefined
}

export const checkSession = (): ThunkAction<
  Promise<void>,
  {},
  {},
  AnyAction
> => {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>): Promise<void> => {
    return new Promise<void>((resolve) => {
      dispatch(isFetching(true))

      // gonna get weird when there's no localStorage :/
      const token = localStorage && localStorage.getItem('token')

      if (!token) {
        // reject('no token')
        dispatch(isFetching(false))
        dispatch(set(NULL_USER))
        resolve()
        return
      }

      fetch(`${API_HOST}/check_session`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((response) => response.json())
        .then((response) => {
          // console.log('check_session', response)
          if (response.msg === 'ok' && response.user) {
            dispatch(set(response.user))
          } else {
            dispatch(set(NULL_USER))
          }
        })
        .catch((err) => {
          console.warn('check_session caught err:', err)
          // hmm, maybe the API is just down? ...is it really necessary to NULL the user?
          dispatch(set(NULL_USER))
        })
        .finally(() => {
          dispatch(isFetching(false))
          resolve()
        })
    })
  }
}

export const register = (
  regKey: string,
  password: string
): ThunkAction<Promise<void>, {}, {}, AnyAction> => {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>): Promise<void> => {
    return new Promise<void>((resolve) => {
      dispatch(isFetching(true))

      fetch(`${API_HOST}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ regKey, password })
      })
        .then((response) => response.json())
        .then((response) => {
          // console.log('[session/actions] user login', response)
          if (response.msg === 'ok' && response.user && response.user.token) {
            localStorage && localStorage.setItem('token', response.user.token)
            dispatch(set(response.user))
          } else {
            dispatch(setError({ error: 'error', reason: response.message }))
          }
        })
        .catch((e) => {
          console.log('register error:', e)
          dispatch(
            setError({
              error: 'error',
              reason: 'unable to register right now :('
            })
          )
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
    return new Promise<void>((resolve) => {
      dispatch(isFetching(true))

      fetch(`${API_HOST}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })
        .then((response) => response.json())
        .then((response) => {
          // console.log('[session/actions] user login', response)
          if (response.msg === 'ok' && response.user && response.user.token) {
            localStorage && localStorage.setItem('token', response.user.token)
            dispatch(set(response.user))
          } else {
            dispatch(setError({ error: 'error', reason: response.message }))
          }
        })
        .catch((e) => {
          console.log('login error:', e)
          dispatch(
            setError({ error: 'error', reason: 'unable to login right now :(' })
          )
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
    return new Promise<void>((resolve) => {
      dispatch(isFetching(true))

      const token = localStorage && localStorage.getItem('token')
      fetch(`${API_HOST}/logout`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
        .catch(console.warn)
        .finally(() => {
          localStorage && localStorage.removeItem('token')
          dispatch(set(NULL_USER))
          dispatch(isFetching(false))
          resolve()
        })
    })
  }
}
