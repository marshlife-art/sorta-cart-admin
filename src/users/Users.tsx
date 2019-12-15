import React, { useState, useEffect } from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import MaterialTable, { Action } from 'material-table'
// import Paper from '@material-ui/core/Paper'
// import Grid from '@material-ui/core/Grid'
// import List from '@material-ui/core/List'
// import ListItem from '@material-ui/core/ListItem'
// import Add from '@material-ui/icons/Add'
// import ListItemText from '@material-ui/core/ListItemText'
// import Divider from '@material-ui/core/Divider'
// import Snackbar from '@material-ui/core/Snackbar'
// import IconButton from '@material-ui/core/IconButton'
// import CloseIcon from '@material-ui/icons/Close'
import { connect } from 'react-redux'
// import { Switch } from 'react-router'
// import ProtectedRoute from '../auth/ProtectedRoute'
import { RootState } from '../redux'
import { UserService, UserServiceProps } from '../redux/session/reducers'
// import { useAllUsersService } from './useUserService'
import { UserRouterProps } from '../types/UserRouterProps'
// import { User } from '../types/User'
import NewUserModal from './NewUserModal'

const API_HOST = 'http://localhost:3000'

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

interface Props {
  userService?: UserService
}

function Users(props: Props & RouteComponentProps<UserRouterProps>) {
  const classes = useStyles()
  const { userService } = props

  console.log('#TODO: deal with userService:', userService)

  const [searchExpanded, setSearchExpanded] = useState(false)
  const token = localStorage && localStorage.getItem('token')

  const [newUserModalOpen, setNewUserModalOpen] = useState(false)

  const searchAction = {
    icon: searchExpanded ? 'zoom_out' : 'search',
    tooltip: searchExpanded ? 'Close Search' : 'Search',
    isFreeAction: true,
    onClick: () => setSearchExpanded(!searchExpanded)
  }

  const newUserAction = {
    icon: 'add',
    tooltip: 'add new user',
    isFreeAction: true,
    onClick: () => setNewUserModalOpen(true)
  }

  const [actions, setActions] = useState<Action<any>[]>([
    searchAction,
    newUserAction
  ])

  useEffect(() => {
    setActions([searchAction, newUserAction])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchExpanded]) // note: adding actions to dep array is not pleasant :/

  return (
    <div className={classes.root}>
      <MaterialTable
        columns={[
          { title: 'name', field: 'name', type: 'string' },
          { title: 'email', field: 'email', type: 'string' },
          { title: 'roles', field: 'roles', type: 'string' },
          {
            title: 'created',
            field: 'createdAt',
            type: 'datetime',
            filtering: false,
            render: row => new Date(row.createdAt).toLocaleString()
          },
          {
            title: 'updated',
            field: 'updatedAt',
            type: 'datetime',
            filtering: false,
            render: row => new Date(row.updatedAt).toLocaleString()
          },
          { title: 'id', field: 'id', type: 'string', hidden: true }
        ]}
        data={query =>
          new Promise((resolve, reject) => {
            console.log('query:', query)
            fetch(`${API_HOST}/users`, {
              method: 'post',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify(query)
            })
              .then(response => response.json())
              .then(result => {
                console.log('result', result)
                resolve(result)
              })
              .catch(err => {
                console.warn(err)
                return resolve({ data: [], page: 0, totalCount: 0 })
              })
          })
        }
        title="Users"
        options={{
          headerStyle: { position: 'sticky', top: 0 },
          maxBodyHeight: 'calc(100vh - 121px)',
          pageSize: 50,
          pageSizeOptions: [50, 100, 500],
          debounceInterval: 750,
          filtering: true,
          search: searchExpanded,
          emptyRowsWhenPaging: false
        }}
        actions={actions}
      />

      <NewUserModal
        open={newUserModalOpen}
        handleClose={() => setNewUserModalOpen(false)}
      />
    </div>
  )
}

const mapStateToProps = (states: RootState): UserServiceProps => {
  return {
    userService: states.session.userService
  }
}

export default connect(mapStateToProps, undefined)(withRouter(Users))
