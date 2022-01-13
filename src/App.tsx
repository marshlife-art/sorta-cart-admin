import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import clsx from 'clsx'

import { ThemeProvider } from '@material-ui/core/styles'

import CssBaseline from '@material-ui/core/CssBaseline'
import Drawer from '@material-ui/core/Drawer'
import List from '@material-ui/core/List'
import Divider from '@material-ui/core/Divider'
import Fab from '@material-ui/core/Fab'
import MUISwitch from '@material-ui/core/Switch'
import MenuIcon from '@material-ui/icons/Menu'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import FaceIcon from '@material-ui/icons/Face'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'

import { darkTheme, lightTheme } from './theme'
import { mainListItems } from './listItems' // secondaryListItems

import { RootState } from './redux'
import { UserService } from './redux/session/reducers'
import { checkSession, logout } from './redux/session/actions'

import { PreferencesService } from './redux/preferences/reducers'
import { getPreferences, setPreferences } from './redux/preferences/actions'

import Loading from './Loading'
import Dashboard from './dashboard/Dashboard'
import Login from './auth/Login'
import ProtectedRoute from './auth/ProtectedRoute'
// import UserMenu from './auth/UserMenu'
import StoreCredits from './members/StoreCredits'
import Orders from './orders/Orders'
import WholesaleOrders from './wholesaleorders/WholesaleOrders'
import Products from './products/Products'
import ImportProducts from './products/ImportProducts'
import EditOrder from './orders/EditOrder'
import Members from './members/Members'
import EditMember from './members/EditMember'
import { APP_VERSION } from './constants'
import UpdateProducts from './products/UpdateProducts'

const drawerWidth = 240

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      minHeight: '100vh'
    },
    nav: {
      // background: theme.palette.primary.main,
      zIndex: theme.zIndex.speedDial,
      display: 'flex',
      // height: '48px',
      // width: '48px',
      alignItems: 'center',
      position: 'fixed',
      // bottom: theme.spacing(1),
      // top: 'calc(50vh  - 28px)',
      top: '-12px',
      left: '-24px',
      transition: '200ms ease-in-out',
      '& svg': {
        display: 'none'
      },
      '&:hover': {
        top: -6,
        left: -12
      },
      '&:hover svg': {
        display: 'inline-block'
      }
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
      marginLeft: '16px',
      maxWidth: '98%'
    }
  })
)

export function App() {
  const userService = useSelector<RootState, UserService>(
    (state) => state.session.userService
  )

  const preferencesService = useSelector<RootState, PreferencesService>(
    (state) => state.preferences.preferencesService
  )

  const dispatch = useDispatch()

  const [loading, setLoading] = useState(true)
  const [useDarkTheme, setUseDarkTheme] = useState<null | boolean>(null)

  useEffect(() => {
    dispatch(getPreferences())
  }, [])

  useEffect(() => {
    if (
      preferencesService &&
      !preferencesService.isFetching &&
      preferencesService.preferences
    ) {
      if (useDarkTheme === null) {
        setUseDarkTheme(
          preferencesService.preferences.dark_mode === 'true' ? true : false
        )
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferencesService])

  useEffect(() => {
    if (
      preferencesService &&
      preferencesService.preferences &&
      (preferencesService.preferences.dark_mode === 'true' ? true : false) !==
        useDarkTheme
    ) {
      dispatch(setPreferences({ dark_mode: useDarkTheme ? 'true' : 'false' }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useDarkTheme])

  useEffect(() => {
    dispatch(checkSession())
  }, [])

  useEffect(() => {
    if (userService) {
      !userService.isFetching && userService.user && setLoading(false)
    }
  }, [userService])

  const classes = useStyles()
  const [open, setOpen] = React.useState(false)

  const theme =
    preferencesService &&
    preferencesService.preferences &&
    preferencesService.preferences.dark_mode === 'true'
      ? darkTheme
      : lightTheme

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Router basename={process.env.PUBLIC_URL}>
        <div className={classes.root}>
          <CssBaseline />

          {userService &&
            userService.user &&
            userService.user.role === 'admin' && (
              <div className={classes.nav}>
                {/* <IconButton
              edge="start"
              aria-label="open drawer"
              onClick={() => setOpen(true)}
            >
              
            </IconButton> */}

                <Fab
                  color="secondary"
                  aria-label="menu"
                  onClick={() => setOpen(true)}
                >
                  <MenuIcon />
                </Fab>
              </div>
            )}

          {userService &&
            userService.user &&
            userService.user.role === 'admin' && (
              <Drawer
                classes={{
                  paper: clsx(classes.drawerPaper)
                }}
                onClose={() => setOpen(false)}
                open={open}
              >
                <List onClick={() => setOpen(false)}>{mainListItems}</List>

                <Divider />
                <ListItem
                  button
                  onClick={() => setUseDarkTheme((prev) => !prev)}
                >
                  <ListItemText>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span>Dark Theme</span>
                      <MUISwitch
                        checked={
                          useDarkTheme === null || useDarkTheme === undefined
                            ? false
                            : useDarkTheme
                        }
                        value="useDarkTheme"
                        inputProps={{ 'aria-label': 'secondary checkbox' }}
                      />
                    </div>
                  </ListItemText>
                </ListItem>
                <Divider />
                <ListItem button onClick={() => dispatch(logout())}>
                  <ListItemIcon>
                    <FaceIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="log out"
                    secondary={
                      <span
                        style={{
                          display: 'block',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden'
                        }}
                      >
                        {userService && userService.user
                          ? userService.user.email
                          : ''}
                      </span>
                    }
                  />
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
              // <ProtectedRoute path="/" element={< />} />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/products"
                  element={<ProtectedRoute path="/" element={<Products />} />}
                />
                <Route
                  path="/products/import"
                  element={
                    <ProtectedRoute path="/" element={<ImportProducts />} />
                  }
                />
                <Route
                  path="/products/update"
                  element={
                    <ProtectedRoute path="/" element={<UpdateProducts />} />
                  }
                />
                <Route
                  path="/orders"
                  element={<ProtectedRoute path="/" element={<Orders />} />}
                />
                <Route
                  path="/orders/edit/:id"
                  element={<ProtectedRoute path="/" element={<EditOrder />} />}
                />
                <Route
                  path="/orders/create"
                  element={<ProtectedRoute path="/" element={<EditOrder />} />}
                />
                <Route
                  path="/wholesaleorders/*"
                  element={
                    <ProtectedRoute path="/" element={<WholesaleOrders />} />
                  }
                />
                <Route
                  path="/members"
                  element={<ProtectedRoute path="/" element={<Members />} />}
                />
                <Route
                  path="/members/:id"
                  element={<ProtectedRoute path="/" element={<EditMember />} />}
                />
                <Route
                  path="/storecredits"
                  element={
                    <ProtectedRoute path="/" element={<StoreCredits />} />
                  }
                />
                <Route
                  path="/"
                  element={<ProtectedRoute path="/" element={<Dashboard />} />}
                />
                {/* <ProtectedRoute path="/" element={<Dashboard />} /> */}
              </Routes>
            )}

            {/* <Box pt={4}>FOOT'r</Box> */}
          </main>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
