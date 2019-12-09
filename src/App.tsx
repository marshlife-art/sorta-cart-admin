import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { connect } from 'react-redux'
import { ThunkDispatch } from 'redux-thunk'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import Drawer from '@material-ui/core/Drawer'
import Box from '@material-ui/core/Box'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import List from '@material-ui/core/List'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import Container from '@material-ui/core/Container'
import MenuIcon from '@material-ui/icons/Menu'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'

import { mainListItems } from './listItems' // secondaryListItems

import { RootState } from './redux'
import { UserServiceProps } from './redux/session/reducers'
import { checkSession } from './redux/session/actions'
import { PreferencesServiceProps } from './redux/preferences/reducers'
import { getPreferences } from './redux/preferences/actions'

import Dashboard from './dashboard/Dashboard'
import Login from './auth/Login'
import ProtectedRoute from './auth/ProtectedRoute'
import UserMenu from './auth/UserMenu'

const drawerWidth = 240

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex'
  },
  toolbar: {
    paddingRight: 24 // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  menuButton: {
    marginRight: 36
  },
  menuButtonHidden: {
    display: 'none'
  },
  title: {
    flexGrow: 1
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9)
    }
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto'
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4)
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column'
  },
  fixedHeight: {
    height: 240
  }
}))

const Protected = () => <h3>Protected</h3>

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
    getPreferences,
    preferencesService
  } = props

  useEffect(() => {
    getPreferences()
  }, [getPreferences])

  useEffect(() => {
    checkSession()
  }, [checkSession])

  useEffect(() => {
    console.log(
      'userService fx.. userService.isFetching:',
      !userService.isFetching && !!userService.user,
      'userService:',
      userService
    )
    !userService.isFetching && userService.user && setLoading(false)
    setOpen(userService.isFetching && !!userService.user)
  }, [userService])

  const classes = useStyles()
  const [open, setOpen] = React.useState(true)
  const handleDrawerOpen = () => {
    setOpen(true)
  }
  const handleDrawerClose = () => {
    setOpen(false)
  }

  // #TODO: move this. i guess.
  console.log(preferencesService)

  return (
    <Router>
      <div className={classes.root}>
        <CssBaseline />
        <AppBar
          position="absolute"
          className={clsx(classes.appBar, open && classes.appBarShift)}
        >
          <Toolbar className={classes.toolbar}>
            {userService.user && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                className={clsx(
                  classes.menuButton,
                  open && classes.menuButtonHidden
                )}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              className={classes.title}
            >
              MARSH
            </Typography>
            <UserMenu />
          </Toolbar>
        </AppBar>

        {userService && userService.user && userService.user.email && (
          <Drawer
            variant="permanent"
            classes={{
              paper: clsx(
                classes.drawerPaper,
                !open && classes.drawerPaperClose
              )
            }}
            open={open}
          >
            <div className={classes.toolbarIcon}>
              <IconButton onClick={handleDrawerClose}>
                <ChevronLeftIcon />
              </IconButton>
            </div>
            <Divider />

            <>
              <List>{mainListItems}</List>
              {/* 
              <Divider />
              <List>{secondaryListItems}</List> 
              */}
            </>
          </Drawer>
        )}

        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          <Container maxWidth="lg" className={classes.container}>
            {/* ROUTER */}

            {loading ? (
              <Box pt={4}>L O A D I N G . . .</Box>
            ) : (
              <Switch>
                <Route path="/login" component={Login} />
                <ProtectedRoute
                  userService={userService}
                  path="/products"
                  component={Protected}
                />
                <ProtectedRoute
                  userService={userService}
                  path="/orders"
                  component={Protected}
                />
                <ProtectedRoute
                  userService={userService}
                  path="/users"
                  component={Protected}
                />
                <ProtectedRoute
                  userService={userService}
                  path="/pages"
                  component={Protected}
                />
                <ProtectedRoute
                  userService={userService}
                  path="/"
                  component={Dashboard}
                />
              </Switch>
            )}

            {/* <Box pt={4}>FOOT'r</Box> */}
          </Container>
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
