import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import session, { UserServiceProps } from './session/reducers'
import preferences, { PreferencesServiceProps } from './preferences/reducers'

export interface RootState {
  session: UserServiceProps
  preferences: PreferencesServiceProps
}

export default createStore(
  combineReducers<RootState>({
    session,
    preferences
  }),
  applyMiddleware(thunk)
)
