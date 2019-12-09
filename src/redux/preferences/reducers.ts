import { combineReducers } from 'redux'

import { Action } from './actions'
import { Preferences, PreferencesError } from '../../types/Preferences'

export interface PreferencesService {
  isFetching: boolean
  preferences?: Preferences
  error?: PreferencesError
}

export interface PreferencesServiceProps {
  preferencesService: PreferencesService
}

const preferencesService = (
  state: PreferencesService = { isFetching: false },
  action: Action
): PreferencesService => {
  switch (action.type) {
    case 'SET_PREFERENCES':
      return { ...state, preferences: action.preferences, error: undefined }
    case 'SET_FETCHING_PREFERENCES':
      return {
        ...state,
        isFetching: action.isFetching
      }
    case 'SET_ERROR_PREFERENCES':
      return { ...state, preferences: undefined, error: action.error }
  }
  return state
}

export default combineReducers<PreferencesServiceProps>({
  preferencesService
})
