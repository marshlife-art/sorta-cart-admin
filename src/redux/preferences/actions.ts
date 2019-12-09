import { ThunkAction, ThunkDispatch } from 'redux-thunk'
import { AnyAction } from 'redux'

import { Preferences, PreferencesError } from '../../types/Preferences'

const DEFAULT_PREFERENCES: Preferences = {
  dark_mode: 'false'
}

export interface SetAction {
  type: 'SET_PREFERENCES'
  preferences: Preferences
}
export interface SetFetcing {
  type: 'SET_FETCHING_PREFERENCES'
  isFetching: boolean
}
export interface SetError {
  type: 'SET_ERROR_PREFERENCES'
  error: PreferencesError
}

export type Action = SetAction | SetFetcing | SetError

export const set = (preferences: Preferences): SetAction => {
  return { type: 'SET_PREFERENCES', preferences }
}
export const setError = (error: PreferencesError): SetError => {
  return { type: 'SET_ERROR_PREFERENCES', error }
}
export const isFetching = (isFetching: boolean): SetFetcing => {
  return { type: 'SET_FETCHING_PREFERENCES', isFetching }
}

export const getPreferences = (): ThunkAction<
  Promise<void>,
  {},
  {},
  AnyAction
> => {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>): Promise<void> => {
    return new Promise<void>((resolve, rject) => {
      dispatch(isFetching(true))

      const preferences = localStorage && localStorage.getItem('preferences')

      if (!preferences) {
        dispatch(set(DEFAULT_PREFERENCES))
      } else {
        dispatch(set(JSON.parse(preferences)))
      }
      dispatch(isFetching(false))
      resolve()
    })
  }
}
