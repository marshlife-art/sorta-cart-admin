import React from 'react'
import { RouteProps, Redirect, Route } from 'react-router-dom'

import { UserServiceProps } from '../redux/session/reducers'

const ProtectedRoute = ({
  component: Component,
  userService,
  ...rest
}: RouteProps & UserServiceProps) => (
  <Route
    {...rest}
    render={props =>
      userService.user &&
      userService.user.role &&
      userService.user.role === 'admin' &&
      Component ? (
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
