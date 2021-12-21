import { ThunkAction, ThunkDispatch } from 'redux-thunk'
import { AnyAction } from 'redux'

import { User, LoginError, LoginMessage } from '../../types/User'
import { supabase } from '../../lib/supabaseClient'

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
export interface SetMagic {
  type: 'SET_MAGIC'
  message: LoginMessage
}

export type Action = SetAction | SetFetcing | SetError | SetMagic

export const set = (user: User): SetAction => {
  return { type: 'SET', user }
}
export const setError = (error: LoginError): SetError => {
  return { type: 'SET_ERROR', error }
}
export const isFetching = (isFetching: boolean): SetFetcing => {
  return { type: 'SET_FETCHING', isFetching }
}
export const setMagic = (message: LoginMessage): SetMagic => {
  return { type: 'SET_MAGIC', message }
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

      const session = supabase.auth.session()
      console.log('zomg supabase.auth.session():', session)
      if (session?.user) {
        console.log('zomg have user:', session?.user)
        dispatch(set({ ...session.user, role: 'admin' })) // #TODO: don't hard-code admin role :/
      } else {
        dispatch(set(NULL_USER))
      }

      dispatch(isFetching(false))
      resolve()
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

      supabase.auth
        .signIn({ email, password })
        .then((response) => {
          if (response.user && response.user.id) {
            dispatch(set({ ...response.user, role: 'admin' })) // #TODO: don't hard-code admin role :/
          } else {
            if (!password && !response.error) {
              dispatch(
                setMagic({
                  message: 'Check your email for a magic login link.'
                })
              )
            } else {
              dispatch(
                setError({
                  error: 'error',
                  reason: response.error?.message || 'unknown error'
                })
              )
            }
          }
        })
        .catch((err) => {
          console.warn('[login] caught error:', err.response.text)
        })
        .finally(() => resolve())
    })
  }
}

export const logout = (): ThunkAction<Promise<void>, {}, {}, AnyAction> => {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>): Promise<void> => {
    return new Promise<void>((resolve) => {
      dispatch(isFetching(true))

      supabase.auth
        .signOut()
        .catch(console.warn)
        .finally(() => {
          dispatch(set(NULL_USER))
          dispatch(isFetching(false))
          resolve()
        })
    })
  }
}
