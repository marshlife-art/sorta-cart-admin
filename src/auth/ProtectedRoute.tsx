import React from 'react'
import { RouteProps, Redirect, Route } from 'react-router-dom'

import { UserServiceProps, UserService } from '../redux/session/reducers'

const isAdmin = (userService: UserService): boolean =>
  userService.user && userService.user.role && userService.user.role === 'admin'
    ? true
    : false

interface ProtectedRouteProps {
  children?: React.ReactNode
}

const ProtectedRoute = ({
  component: Component,
  userService,
  children,
  ...rest
}: ProtectedRouteProps & RouteProps & UserServiceProps) => (
  <Route
    {...rest}
    render={props =>
      isAdmin(userService) ? (
        Component ? (
          <Component {...props} />
        ) : (
          children
        )
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
