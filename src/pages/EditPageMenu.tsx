import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import Button from '@material-ui/core/Button'
import Menu, { MenuProps } from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'

import SaveIcon from '@material-ui/icons/Save'

import DeleteIcon from '@material-ui/icons/Delete'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'

const StyledMenu = (props: MenuProps) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right'
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right'
    }}
    {...props}
  />
)

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

export default function EditPageMenu() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <ButtonGroup
        variant="contained"
        color="primary"
        aria-label="split button"
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          // onClick={() => setSnackOpen(true)}
        >
          save
        </Button>
        <Button
          aria-controls="customized-menu"
          aria-haspopup="true"
          variant="contained"
          color="primary"
          size="small"
          onClick={handleClick}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>

      <StyledMenu
        id="customized-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <StyledMenuItem
          onClick={() => {
            window.confirm('are you sure?')
            handleClose()
          }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="delete page" />
        </StyledMenuItem>
      </StyledMenu>
    </>
  )
}
