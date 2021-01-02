import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import Button from '@material-ui/core/Button'
import Menu, { MenuProps } from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import DeleteIcon from '@material-ui/icons/Delete'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import { Page } from '../types/Page'

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

const StyledMenuItem = withStyles((theme) => ({
  root: {
    '&:focus': {
      backgroundColor: theme.palette.primary.main,
      '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
        color: theme.palette.common.white
      }
    }
  }
}))(MenuItem)

interface EditAnnouncementMenuProps {
  page: Page
  onSaveBtnClick: () => void
  onDeleteBtnClick: () => void
}

export default function EditAnnouncementMenu(props: EditAnnouncementMenuProps) {
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
          onClick={props.onSaveBtnClick}
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
            if (window.confirm('are you sure?')) {
              props.onDeleteBtnClick()
            }
            handleClose()
          }}
          disabled={!props.page.id}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="delete announcement" />
        </StyledMenuItem>
      </StyledMenu>
    </>
  )
}
