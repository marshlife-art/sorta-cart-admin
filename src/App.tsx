import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { connect } from 'react-redux'
import { ThunkDispatch } from 'redux-thunk'
import clsx from 'clsx'

import CssBaseline from '@material-ui/core/CssBaseline'
import Drawer from '@material-ui/core/Drawer'
import List from '@material-ui/core/List'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import TagFaces from '@material-ui/icons/TagFaces'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'

import { mainListItems } from './listItems' // secondaryListItems

import { RootState } from './redux'
import { UserServiceProps } from './redux/session/reducers'
import { checkSession, logout } from './redux/session/actions'

import { PreferencesServiceProps } from './redux/preferences/reducers'
import { getPreferences } from './redux/preferences/actions'

import Loading from './Loading'
import Dashboard from './dashboard/Dashboard'
import Login from './auth/Login'
import Register from './auth/Register'
import ProtectedRoute from './auth/ProtectedRoute'
import UserMenu from './auth/UserMenu'
import Pages from './pages/Pages'
import Orders from './orders/Orders'
import WholesaleOrders from './wholesaleorders/WholesaleOrders'
import Users from './users/Users'
import Products from './products/Products'
import ImportProducts from './products/ImportProducts'
import EditOrder from './orders/EditOrder'
import Members from './members/Members'
import EditMember from './members/EditMember'
import { APP_VERSION } from './constants'

const drawerWidth = 240

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      minHeight: '100vh'
    },
    nav: {
      zIndex: theme.zIndex.drawer + 1,
      display: 'flex',
      height: '36px',
      alignItems: 'center',
      marginLeft: '2px',
      position: 'fixed',
      top: 0,
      left: 0
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0
    },
    drawerPaper: {
      width: drawerWidth
    },
    version: {
      fontStyle: 'italic',
      fontSize: '0.8em',
      flexGrow: 1,
      alignSelf: 'center',
      flexDirection: 'column',
      display: 'flex',
      justifyContent: 'flex-end'
    },
    content: {
      // flexGrow: 1
    }
  })
)

interface DispatchProps {
  checkSession: () => void
  getPreferences: () => void
  logout: () => void
}

type Props = UserServiceProps & PreferencesServiceProps & DispatchProps

const App: React.FC<Props> = (props: Props) => {
  const [loading, setLoading] = useState(true)

  // checkSession is destructured from props and passed into useEffect
  // which is a bit confusing since checkSession is also imported. ah scope.
  const {
    checkSession,
    userService,
    getPreferences
    // ,preferencesService
  } = props

  useEffect(() => {
    getPreferences()
  }, [getPreferences])

  useEffect(() => {
    checkSession()
  }, [checkSession])

  useEffect(() => {
    // console.log(
    //   'userService fx.. userService.isFetching:',
    //   !userService.isFetching && !!userService.user,
    //   'userService:',
    //   userService
    // )
    !userService.isFetching && userService.user && setLoading(false)
    setOpen(userService.isFetching && !!userService.user)
  }, [userService])

  const classes = useStyles()
  const [open, setOpen] = React.useState(true)

  // #TODO: move this. i guess.
  // console.log(preferencesService)

  return (
    <Router>
      <div className={classes.root}>
        <CssBaseline />
        <div className={classes.nav}>
          {userService.user && userService.user.role === 'admin' ? (
            <IconButton
              edge="start"
              aria-label="open drawer"
              onClick={() => setOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <UserMenu />
          )}
        </div>

        {userService && userService.user && userService.user.email && (
          <Drawer
            classes={{
              paper: clsx(classes.drawerPaper)
            }}
            onClose={() => setOpen(false)}
            open={open}
          >
            <List onClick={() => setOpen(false)}>{mainListItems}</List>

            <Divider />
            <ListItem button onClick={() => props.logout()}>
              <ListItemIcon>
                <TagFaces />
              </ListItemIcon>
              <ListItemText primary="log out" />
            </ListItem>

            {/* <List>{secondaryListItems}</List>  */}
            <div className={classes.version}>
              <span>{APP_VERSION}</span>
            </div>
          </Drawer>
        )}

        <main className={classes.content}>
          {/* ROUTER */}

          {loading ? (
            <Loading />
          ) : (
            <Switch>
              <Route path="/login" component={Login} />
              <Route path="/register" component={Register} />
              <ProtectedRoute
                userService={userService}
                path="/products"
                component={Products}
                exact
              />
              <ProtectedRoute
                userService={userService}
                path="/products/import"
                component={ImportProducts}
              />
              <ProtectedRoute
                userService={userService}
                path="/orders"
                exact
                component={Orders}
              />
              <ProtectedRoute
                userService={userService}
                path="/orders/edit/:id"
                component={EditOrder}
              />
              <ProtectedRoute
                userService={userService}
                path="/orders/create"
                component={EditOrder}
              />
              <ProtectedRoute
                userService={userService}
                path="/wholesaleorders"
                component={WholesaleOrders}
              />
              <ProtectedRoute
                userService={userService}
                path="/users"
                component={Users}
              />
              <ProtectedRoute
                userService={userService}
                path="/members"
                component={Members}
                exact
              />
              <ProtectedRoute
                userService={userService}
                path="/members/:id"
                component={EditMember}
              />
              <ProtectedRoute
                userService={userService}
                path="/pages"
                component={Pages}
              />
              <ProtectedRoute
                userService={userService}
                path="/"
                component={Dashboard}
              />
            </Switch>
          )}

          {/* <Box pt={4}>FOOT'r</Box> */}
        </main>
      </div>
    </Router>
  )
}

const mapStateToProps = (
  states: RootState
): UserServiceProps & PreferencesServiceProps => {
  return {
    userService: states.session.userService,
    preferencesService: states.preferences.preferencesService
  }
}

const mapDispatchToProps = (
  dispatch: ThunkDispatch<{}, {}, any>
): DispatchProps => {
  return {
    checkSession: () => dispatch(checkSession()),
    getPreferences: () => dispatch(getPreferences()),
    logout: () => dispatch(logout())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
