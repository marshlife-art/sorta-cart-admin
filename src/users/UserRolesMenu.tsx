import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Menu, { MenuProps } from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import ListItemText from '@material-ui/core/ListItemText'
import { User } from '../types/User'
import { API_HOST } from '../constants'

const StyledMenu = withStyles({
  paper: {
    border: '1px solid #d3d4d5'
  }
})((props: MenuProps) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'center'
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'center'
    }}
    {...props}
  />
))

const StyledMenuItem = withStyles(theme => ({
  root: {
    '&:focus': {
      backgroundColor: theme.palette.primary.main,
      '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
        color: theme.palette.common.white
      }
    }
  }
}))(MenuItem)

export default function UserRolesMenu(props: {
  user: User
  disabled: boolean
}) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [role, setRole] = React.useState(props.user.role || 'none')

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleRoleChange = (id: string | undefined, role: string) => {
    if (!id) {
      return
    }
    const token = localStorage && localStorage.getItem('token')
    fetch(`${API_HOST}/user/role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ id, role })
    })
      .then(response => response.json())
      .then(resp => {
        // console.log('resp success!?', resp)
        handleClose()
        setRole(role)
      })
      .catch(err => console.warn('handleRoleChange caught err:', err))
  }

  return (
    <div>
      <Button
        aria-controls="user-roles-menu"
        aria-haspopup="true"
        variant="contained"
        color="primary"
        onClick={handleClick}
        disabled={props.disabled}
      >
        {role}
      </Button>
      <StyledMenu
        id="user-roles-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {/* <StyledMenuItem>
          <ListItemText
            primary="Superuser"
            onClick={() => handleRoleChange(props.user.id, 'superuser')}
          />
        </StyledMenuItem> */}
        <StyledMenuItem>
          <ListItemText
            primary="admin"
            onClick={() => handleRoleChange(props.user.id, 'admin')}
          />
        </StyledMenuItem>
        <StyledMenuItem>
          <ListItemText
            primary="member"
            onClick={() => handleRoleChange(props.user.id, 'member')}
          />
        </StyledMenuItem>
        <StyledMenuItem>
          <ListItemText
            primary="guest"
            onClick={() => handleRoleChange(props.user.id, 'guest')}
          />
        </StyledMenuItem>
      </StyledMenu>
    </div>
  )
}
