import React from 'react'
import { withRouter } from 'react-router-dom'

import { fakeAuth } from '../services/auth'

const Signout = withRouter(({ history }) =>
  fakeAuth.isAuthenticated ? (
    <button
      onClick={() => {
        fakeAuth.signout(() => history.push('/'))
      }}
    >
      Sign out
    </button>
  ) : null
)

export default Signout

/*
<IconButton color="inherit">
  <Badge badgeContent={4} color="secondary">
    <NotificationsIcon />
  </Badge>
</IconButton>
*/
