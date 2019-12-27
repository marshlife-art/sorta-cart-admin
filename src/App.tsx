import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { connect } from 'react-redux'
import { ThunkDispatch } from 'redux-thunk'
import clsx from 'clsx'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import Drawer from '@material-ui/core/Drawer'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import List from '@material-ui/core/List'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'

import { mainListItems } from './listItems' // secondaryListItems

import { RootState } from './redux'
import { UserServiceProps } from './redux/session/reducers'
import { checkSession } from './redux/session/actions'
import { PreferencesServiceProps } from './redux/preferences/reducers'
import { getPreferences } from './redux/preferences/actions'

import Loading from './Loading'
import Dashboard from './dashboard/Dashboard'
import Login from './auth/Login'
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

const drawerWidth = 240

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex'
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1
    },
    title: {
      flexGrow: 1
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0
    },
    drawerPaper: {
      width: drawerWidth
    },
    content: {
      flexGrow: 1
    },
    toolbar: theme.mixins.toolbar
  })
)

interface DispatchProps {
  checkSession: () => void
  getPreferences: () => void
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
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar className={classes.toolbar}>
            {userService.user && (
              <IconButton
                edge="start"
                aria-label="open drawer"
                onClick={() => setOpen(true)}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography
              component="h1"
              variant="h6"
              className={classes.title}
              noWrap
            >
              MARSH
            </Typography>
            <UserMenu />
          </Toolbar>
        </AppBar>

        {userService && userService.user && userService.user.email && (
          <Drawer
            classes={{
              paper: clsx(classes.drawerPaper)
            }}
            onClose={() => setOpen(false)}
            open={open}
          >
            <List onClick={() => setOpen(false)}>{mainListItems}</List>
            {/* 
              <Divider />
              <List>{secondaryListItems}</List> 
              */}
          </Drawer>
        )}

        <main className={classes.content}>
          <div className={classes.toolbar} />
          {/* ROUTER */}

          {loading ? (
            <Loading />
          ) : (
            <Switch>
              <Route path="/login" component={Login} />
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
    getPreferences: () => dispatch(getPreferences())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
