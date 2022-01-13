import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Container, Button, TextField } from '@material-ui/core'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'

import { RootState } from '../redux'
import { login } from '../redux/session/actions'
import { UserService } from '../redux/session/reducers'

const useStyles = makeStyles((theme) => ({
  form: {
    width: '100%',
    minHeight: '100vh',
    marginTop: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  title: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  }
}))

export default function Login() {
  const navigate = useNavigate()
  const userService = useSelector<RootState, UserService>(
    (state) => state.session.userService
  )
  const dispatch = useDispatch()

  const doLogin = (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    const target = event.currentTarget as HTMLFormElement
    const emailEl = target.elements.namedItem('email') as HTMLInputElement

    if (emailEl && emailEl.value.length > 0) {
      dispatch(login(emailEl.value, password))
    }
  }

  const classes = useStyles()
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')

  // when userService changes, figure out if the page should redirect if a user is already logged in.
  useEffect(() => {
    if (
      userService.user &&
      !userService.isFetching &&
      userService.user.role &&
      userService.user.role === 'admin'
    ) {
      navigate('/')
    }
    // else if (userService.user && !userService.isFetching) {
    //   setError('o noz! error! ...hmm, not an admin?')
    // }
  }, [userService])

  return (
    <Container maxWidth="sm">
      <form onSubmit={doLogin} className={classes.form}>
        <div className={classes.title}>
          <Typography variant="h2" display="block">
            SORTA-CART
          </Typography>
          <Typography variant="overline" display="inline">
            admin
          </Typography>
        </div>
        <TextField
          label="email"
          name="email"
          type="text"
          autoFocus
          fullWidth
          required
        />
        <TextField
          label="password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
        />

        <div>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={userService.isFetching}
            className={classes.submit}
          >
            {!password ? 'Email Magic Link' : 'Login'}
          </Button>
        </div>

        <Box>
          {userService.message && (
            <Typography variant="body1" display="block" gutterBottom>
              {userService.message.message}
            </Typography>
          )}
        </Box>
        <Box color="error.main">
          {userService.error && (
            <>
              <Typography variant="overline" display="block">
                onoz! an error!
              </Typography>
              <Typography variant="body1" display="block" gutterBottom>
                {userService.error.reason}
              </Typography>
            </>
          )}
          {error && (
            <>
              <Typography variant="overline" display="block">
                onoz! an error!
              </Typography>
              <Typography variant="body1" display="block" gutterBottom>
                {error}
              </Typography>
            </>
          )}
        </Box>
      </form>
    </Container>
  )
}
