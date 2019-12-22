import React from 'react'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import IconButton from '@material-ui/core/IconButton'
import Badge from '@material-ui/core/Badge'
import TagFaces from '@material-ui/icons/TagFaces'
import { connect } from 'react-redux'
import { ThunkDispatch } from 'redux-thunk'

import { RootState } from '../redux'
import { UserService } from '../redux/session/reducers'
// import { UserServiceProps } from '../redux/session/reducers'
import { logout } from '../redux/session/actions'

interface UserServiceProps {
  userService?: UserService
}

interface DispatchProps {
  logout: () => void
}

function UserMenu(props: UserServiceProps & DispatchProps) {
  const { userService, logout } = props
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
    handleClose()
  }

  const isAdmin = (): boolean => {
    return !!(
      userService &&
      userService.user &&
      userService.user.roles &&
      userService.user.roles.includes('admin')
    )
  }

  return (
    <>
      <IconButton
        color="inherit"
        aria-controls="user-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <Badge badgeContent={0} color="secondary">
          <TagFaces />
        </Badge>
      </IconButton>

      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {/* {isAdmin() && <MenuItem onClick={handleClose}>Profile</MenuItem>}
        {isAdmin() && <MenuItem onClick={handleClose}>My account</MenuItem>} */}
        {isAdmin() && <MenuItem onClick={handleLogout}>Logout</MenuItem>}

        {!isAdmin() && <MenuItem onClick={handleClose}>Login</MenuItem>}
      </Menu>
    </>
  )
}

const mapStateToProps = (states: RootState): UserServiceProps => {
  return {
    userService: states.session.userService
  }
}

const mapDispatchToProps = (
  dispatch: ThunkDispatch<{}, {}, any>
): DispatchProps => {
  return {
    logout: () => dispatch(logout())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserMenu)
