import React from 'react'
import ReactDOM from 'react-dom'

// import bugsnag from '@bugsnag/js'
// import bugsnagReact from '@bugsnag/plugin-react'

import { Provider } from 'react-redux'
import store from './redux'
import App from './App'

if (process.env.NODE_ENV === 'production') {
  // const bugsnagClient = bugsnag('a9970532605e3f85a84598092888a776')
  // bugsnagClient.use(bugsnagReact, React)
  // const ErrorBoundary = bugsnagClient.getPlugin('react')

  ReactDOM.render(
    // <ErrorBoundary>
    <Provider store={store}>
      <App />
    </Provider>,
    // </ErrorBoundary>,
    document.querySelector('#root')
  )
} else {
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.querySelector('#root')
  )
}
