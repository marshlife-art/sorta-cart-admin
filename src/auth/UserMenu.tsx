import React from 'react'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import IconButton from '@material-ui/core/IconButton'
import Badge from '@material-ui/core/Badge'
import TagFaces from '@material-ui/icons/TagFaces'
import { useDispatch, useSelector } from 'react-redux'

import { RootState } from '../redux'
import { UserService } from '../redux/session/reducers'
import { logout } from '../redux/session/actions'

function UserMenu() {
  const userService = useSelector<RootState, UserService>(
    (state) => state.session.userService
  )
  const dispatch = useDispatch()

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    dispatch(logout())
    handleClose()
  }

  const isAdmin = (): boolean => {
    return !!(
      userService &&
      userService.user &&
      userService.user.role &&
      userService.user.role === 'admin'
    )
  }

  return (
    <>
      <IconButton
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

export default UserMenu
