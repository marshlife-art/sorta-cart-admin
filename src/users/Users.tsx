import React, { useState, useEffect, createRef } from 'react'
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
import { User } from '../types/User'
import NewUserModal from './NewUserModal'
import UserRolesMenu from './UserRolesMenu'
import { API_HOST } from '../constants'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(2),
      maxWidth: '100vw',
      minHeight: `100vh`
    }
  })
)

interface Props {
  userService?: UserService
}

function Users(props: Props & RouteComponentProps<UserRouterProps>) {
  const classes = useStyles()
  const { userService } = props
  const tableRef = createRef<any>()

  const [searchExpanded, setSearchExpanded] = useState(false)
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

  const deleteAction = {
    tooltip: 'Remove User',
    icon: 'delete',
    onClick: (e: any, user: User) => {
      if (
        userService &&
        userService.user &&
        userService.user.email === user.email
      ) {
        alert('you cannot delete yrself!')
      } else {
        if (!user.id) {
          return
        }
        if (window.confirm(`Are you sure you want to delete ${user.email}?`)) {
          fetch(`${API_HOST}/user`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ id: user.id })
          })
            .then((response) => response.json())
            .then(() => tableRef.current && tableRef.current.onQueryChange())
            .catch((err) => console.warn('user deleteAction caught err', err))
        }
      }
    }
  }

  const [actions, setActions] = useState<Action<any>[]>([
    searchAction,
    newUserAction,
    deleteAction
  ])

  useEffect(() => {
    setActions([searchAction, newUserAction, deleteAction])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchExpanded]) // note: adding actions to dep array is not pleasant :/

  return (
    <div className={classes.root}>
      <MaterialTable
        tableRef={tableRef}
        columns={[
          {
            title: 'role',
            field: 'role',
            type: 'string',
            render: (row) => (
              <UserRolesMenu
                user={row as User}
                disabled={
                  !!(
                    userService &&
                    userService.user &&
                    userService.user.email === row.email
                  )
                }
              />
            )
          },
          { title: 'email', field: 'email', type: 'string' },
          {
            title: 'active',
            field: 'active',
            type: 'boolean',
            filtering: false
          },
          {
            title: 'created',
            field: 'createdAt',
            type: 'datetime',
            filtering: false,
            render: (row) => new Date(row.createdAt).toLocaleString()
          },
          {
            title: 'updated',
            field: 'updatedAt',
            type: 'datetime',
            filtering: false,
            render: (row) => new Date(row.updatedAt).toLocaleString()
          },
          { title: 'id', field: 'id', type: 'string', hidden: true }
        ]}
        data={(query) =>
          new Promise((resolve, reject) => {
            fetch(`${API_HOST}/users`, {
              method: 'post',
              headers: {
                'Content-Type': 'application/json'
              },
              credentials: 'include',
              body: JSON.stringify(query)
            })
              .then((response) => response.json())
              .then((result) => {
                resolve(result)
              })
              .catch((err) => {
                console.warn(err)
                return resolve({ data: [], page: 0, totalCount: 0 })
              })
          })
        }
        title="Users"
        options={{
          headerStyle: { position: 'sticky', top: 0 },
          maxBodyHeight: 'calc(100vh - 121px - 28px)',
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
        handleClose={() => {
          setNewUserModalOpen(false)
        }}
        handleRefresh={() =>
          tableRef.current && tableRef.current.onQueryChange()
        }
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
