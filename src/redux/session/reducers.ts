import { combineReducers } from 'redux'

import { Action } from './actions'
import { User, LoginError, LoginMessage } from '../../types/User'

export interface UserService {
  isFetching: boolean
  user?: User
  error?: LoginError
  message?: LoginMessage
}

export interface UserServiceProps {
  userService: UserService
}

export const userService = (
  state: UserService = { isFetching: false },
  action: Action
): UserService => {
  switch (action.type) {
    case 'SET':
      return { ...state, user: action.user, error: undefined }
    case 'SET_FETCHING':
      return {
        ...state,
        isFetching: action.isFetching
      }
    case 'SET_ERROR':
      return { ...state, user: undefined, error: action.error }
    case 'SET_MAGIC':
      return { ...state, user: undefined, message: action.message }
  }
  return state
}

export default combineReducers<UserServiceProps>({
  userService
})
