import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import Add from '@material-ui/icons/Add'
import ListItemText from '@material-ui/core/ListItemText'
import Divider from '@material-ui/core/Divider'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import { connect } from 'react-redux'
import { Switch } from 'react-router'
import ProtectedRoute from '../auth/ProtectedRoute'
import { RootState } from '../redux'
import { UserService, UserServiceProps } from '../redux/session/reducers'
import EditPage from './EditPage'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(2),
      maxWidth: '100vw',
      minHeight: `calc(100vh - 64px)`
    },
    title: {
      display: 'flex',
      alignItems: 'center'
    },
    titleText: {
      flexGrow: 1
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
      height: '100%'
    }
  })
)

const Default = () => <h3>pages!</h3>

function Pages(props: { userService?: UserService }) {
  const classes = useStyles()
  const { userService } = props

  const [snackOpen, setSnackOpen] = useState(false)
  const handleSnackClose = (
    event: React.SyntheticEvent | React.MouseEvent,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return
    }
    setSnackOpen(false)
  }

  return userService ? (
    <>
      <Grid
        container
        direction="row"
        justify="space-between"
        alignItems="stretch"
        className={classes.root}
        spacing={2}
      >
        <Grid xs={12} sm={4} md={3} lg={2} item>
          <Paper className={classes.paper}>
            <List>
              <ListItem>
                <ListItemText>
                  <div className={classes.title}>
                    <span className={classes.titleText}>PAGES</span>
                    <IconButton
                      aria-label="add page"
                      color="inherit"
                      title="add page"
                      onClick={() => setSnackOpen(true)}
                    >
                      <Add />
                    </IconButton>
                  </div>
                </ListItemText>
              </ListItem>
              <Divider />
              {/* <ListItem button onClick={() => setSnackOpen(true)}>
                <ListItemIcon>
                  <Add />
                </ListItemIcon>
                <ListItemText primary="New Page" />
              </ListItem>

              <Divider /> */}
              <ListItem button component={Link} to="/pages/edit/foo">
                <ListItemText primary="foo" />
              </ListItem>
              <ListItem button component={Link} to="/pages/edit/bar">
                <ListItemText primary="bar" />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid xs={12} sm={8} md={9} lg={10} item>
          <Paper className={classes.paper}>
            <Switch>
              <ProtectedRoute
                userService={userService}
                path="/pages"
                component={Default}
                exact
              />
              <ProtectedRoute
                userService={userService}
                path="/pages/edit/:page"
                component={EditPage}
              />
            </Switch>
          </Paper>
        </Grid>
      </Grid>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        open={snackOpen}
        autoHideDuration={4000}
        onClose={handleSnackClose}
        ContentProps={{
          'aria-describedby': 'message-id'
        }}
        message={<span id="message-id">Created new page!</span>}
        action={[
          <IconButton
            key="close"
            aria-label="close"
            color="inherit"
            onClick={handleSnackClose}
          >
            <CloseIcon />
          </IconButton>
        ]}
      />
    </>
  ) : null
}

const mapStateToProps = (states: RootState): UserServiceProps => {
  return {
    userService: states.session.userService
  }
}

export default connect(mapStateToProps, undefined)(Pages)
