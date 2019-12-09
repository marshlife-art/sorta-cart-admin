import React, { useState } from 'react'
import { RouteProps, Redirect } from 'react-router-dom'
import { fakeAuth } from '../services/auth'

export default function Login(props: RouteProps) {
  const [redirectToReferrer, setRedirectToReferrer] = useState(false)

  const login = () => {
    fakeAuth.authenticate(() => {
      setRedirectToReferrer(true)
    })
  }

  const from = (props.location && props.location.state) || {
    from: { pathname: '/' }
  }

  return redirectToReferrer === true ? (
    <Redirect to={from} />
  ) : (
    <div>
      <p>You must log in to view the page</p>
      <button onClick={login}>Log in</button>
    </div>
  )
}
