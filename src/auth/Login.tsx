import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { ThunkDispatch } from 'redux-thunk'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { Container, Button, TextField } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

import { RootState } from '../redux'
import { login } from '../redux/session/actions'
import { UserServiceProps } from '../redux/session/reducers'

interface OwnProps {}

interface DispatchProps {
  login: (email: string, password: string) => void
}

type Props = UserServiceProps & OwnProps & DispatchProps & RouteComponentProps

const useStyles = makeStyles(theme => ({
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1)
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  }
}))

function Login(props: Props) {
  const doLogin = (event: React.FormEvent) => {
    event.preventDefault()
    const target = event.currentTarget as HTMLFormElement
    const emailEl = target.elements.namedItem('email') as HTMLInputElement
    const passwordEl = target.elements.namedItem('password') as HTMLInputElement

    if (
      emailEl &&
      emailEl.value.length > 0 &&
      passwordEl &&
      passwordEl.value.length > 0
    ) {
      props.login(emailEl.value, passwordEl.value)
    }
  }

  const { userService, history } = props
  const classes = useStyles()

  // when userService changes, figure out if the page should redirect if a user is already logged in.
  useEffect(() => {
    if (
      userService.user &&
      !userService.isFetching &&
      userService.user.name &&
      userService.user.roles &&
      userService.user.roles.includes('admin')
    ) {
      history.push('/admin')
    } else if (
      userService.user &&
      !userService.isFetching &&
      userService.user.name
    ) {
      history.push('/')
    }
  }, [userService, history])

  return (
    <Container maxWidth="sm">
      <form onSubmit={doLogin} className={classes.form}>
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
            Login
          </Button>
        </div>

        <div>
          {props.userService.user && <div>{props.userService.user.name}</div>}

          {props.userService.error && (
            <div>{props.userService.error.reason}</div>
          )}
        </div>
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
    login: (email, password) => dispatch(login(email, password))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Login))
