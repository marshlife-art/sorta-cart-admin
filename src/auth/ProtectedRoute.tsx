import React from 'react'
import { RouteProps, Redirect, Route } from 'react-router-dom'
import { fakeAuth } from '../services/auth'

const ProtectedRoute = ({ component: Component, ...rest }: RouteProps) => (
  <Route
    {...rest}
    render={props =>
      fakeAuth.isAuthenticated === true && Component ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{
            pathname: '/login',
            state: { from: props.location }
          }}
        />
      )
    }
  />
)

export default ProtectedRoute
