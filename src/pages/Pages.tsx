import React, { useState, useEffect } from 'react'
import { Link, withRouter, RouteComponentProps } from 'react-router-dom'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
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
import { useAllPagesService } from './usePageService'
import { PageRouterProps } from '../types/PageRouterProps'
import { Page } from '../types/Page'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(2),
      maxWidth: '100vw',
      minHeight: '100vh'
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

interface Props {
  userService?: UserService
}

function Pages(props: Props & RouteComponentProps<PageRouterProps>) {
  const classes = useStyles()
  const { userService } = props

  const [pages, setPages] = useState<Page[]>([])
  const [reloadPages, setReloadPages] = useState(true)
  const allPages = useAllPagesService(reloadPages, setReloadPages)

  useEffect(() => {
    allPages.status === 'loaded' && setPages(allPages.payload)
  }, [allPages])

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

  function addPage() {
    props.history.push('/pages/edit/newpage')
    setSnackOpen(true)
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
                      title="add page"
                      onClick={() => addPage()}
                    >
                      <Add />
                    </IconButton>
                  </div>
                </ListItemText>
              </ListItem>
              <Divider />
              {pages.map((page: Page, idx: number) => (
                <ListItem
                  button
                  component={Link}
                  to={`/pages/edit/${page.slug}`}
                  key={`page${idx}`}
                >
                  <ListItemText primary={page.slug} />
                </ListItem>
              ))}
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
                path="/pages/edit/:slug"
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
          <IconButton key="close" aria-label="close" onClick={handleSnackClose}>
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

export default connect(mapStateToProps, undefined)(withRouter(Pages))
