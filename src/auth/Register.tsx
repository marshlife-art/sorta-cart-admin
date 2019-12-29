import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { ThunkDispatch } from 'redux-thunk'
import { withRouter, RouteComponentProps, useLocation } from 'react-router-dom'
import { Container, Button, TextField } from '@material-ui/core'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'

import { RootState } from '../redux'
import { register } from '../redux/session/actions'
import { UserServiceProps } from '../redux/session/reducers'

interface OwnProps {}

interface DispatchProps {
  register: (regKey: string, password: string) => void
}

type Props = UserServiceProps & OwnProps & DispatchProps & RouteComponentProps

const useStyles = makeStyles(theme => ({
  container: {
    // minHeight: 'calc(100vh - 64px)'
  },
  form: {
    width: '100%',
    minHeight: 'calc(100vh - 64px)',
    marginTop: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  }
}))

function useQuery() {
  return new URLSearchParams(useLocation().search)
}

function Register(props: Props) {
  const doLogin = (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    const target = event.currentTarget as HTMLFormElement

    const passwordEl = target.elements.namedItem('password') as HTMLInputElement
    const passwordConfirmEl = target.elements.namedItem(
      'password_confirm'
    ) as HTMLInputElement

    let regKey: string = ''

    if (regKeyParam) {
      regKey = regKeyParam
    }

    if (!regKey) {
      const regKeyEl = target.elements.namedItem('regKey') as HTMLInputElement
      if (regKeyEl && regKeyEl.value.length > 1) {
        regKey = regKeyEl.value
      }
    }

    if (!regKey) {
      setError('no registration key')
    }

    if (
      passwordEl &&
      passwordEl.value.length > 0 &&
      passwordConfirmEl &&
      passwordConfirmEl.value.length > 0
    ) {
      if (passwordConfirmEl.value !== passwordEl.value) {
        setError('passwords do not match')
      } else {
        props.register(regKey, passwordConfirmEl.value)
      }
    }
  }

  let query = useQuery()
  const regKeyParam = query.get('regKey')
  console.log('[Register] regKeyParam', regKeyParam)
  const { userService, history } = props
  const classes = useStyles()
  const [error, setError] = useState('')

  // when userService changes, figure out if the page should redirect if a user is already logged in.
  useEffect(() => {
    if (
      userService.user &&
      !userService.isFetching &&
      userService.user.role &&
      userService.user.role === 'admin'
    ) {
      history.push('/')
    }
    // else if (userService.user && !userService.isFetching) {
    //   setError('o noz! error! ...hmm, not an admin?')
    // }
  }, [userService, history])

  return (
    <Container maxWidth="sm" className={classes.container}>
      <form onSubmit={doLogin} className={classes.form}>
        {!regKeyParam && (
          <TextField
            label="registration key"
            name="regKey"
            type="text"
            autoFocus
            fullWidth
            required
          />
        )}

        <TextField
          label="password"
          name="password"
          type="password"
          autoFocus={!!regKeyParam}
          fullWidth
          required
        />
        <TextField
          label="password_confirm"
          name="password_confirm"
          type="password"
          fullWidth
          required
        />

        <div>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={props.userService.isFetching}
            className={classes.submit}
          >
            submit
          </Button>
        </div>

        <Box color="error.main">
          {props.userService.error && (
            <>
              <Typography variant="overline" display="block">
                onoz! an error!
              </Typography>
              <Typography variant="body1" display="block" gutterBottom>
                {props.userService.error.reason}
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

const mapStateToProps = (
  states: RootState,
  ownProps: OwnProps
): UserServiceProps => {
  return {
    userService: states.session.userService
  }
}

const mapDispatchToProps = (
  dispatch: ThunkDispatch<{}, {}, any>,
  ownProps: OwnProps
): DispatchProps => {
  return {
    register: (regKey, password) => dispatch(register(regKey, password))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Register))
