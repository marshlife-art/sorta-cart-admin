import React from 'react'
import ReactDOM from 'react-dom'

import { Provider } from 'react-redux'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { RootState } from './redux'
import { App } from './App'

const initialState: RootState = {
  session: { userService: { isFetching: false, user: undefined } },
  preferences: {
    preferencesService: {
      isFetching: false,
      preferences: { dark_mode: 'true' }
    }
  }
}
const mockStore = configureMockStore([thunk])
const store = mockStore(initialState)

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    div
  )
  ReactDOM.unmountComponentAtNode(div)
})
