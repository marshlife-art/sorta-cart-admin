import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import Button from '@material-ui/core/Button'
import Menu, { MenuProps } from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import SaveIcon from '@material-ui/icons/Save'
import DeleteIcon from '@material-ui/icons/Delete'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import FileIcon from '@material-ui/icons/FileCopy'

import { WholesaleOrder } from '../types/WholesaleOrder'

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

interface EditWholesaleOrderMenuProps {
  wholesaleOrder: WholesaleOrder
  onSaveBtnClick: () => void
  onDeleteBtnClick: () => void
  onExportToCsv: () => void
  onProductsExportToCsv: () => void
}

export default function EditMenu(props: EditWholesaleOrderMenuProps) {
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
          onClick={props.onSaveBtnClick}
        >
          save
        </Button>
        <Button
          aria-controls="wholesaleorders-menu"
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
        id="wholesaleorders-menu"
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
          disabled={!props.wholesaleOrder.id}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="delete wholesale order" />
        </StyledMenuItem>

        {/* <StyledMenuItem
          onClick={() => {
            props.onExportToCsv()
            handleClose()
          }}
          disabled={!props.wholesaleOrder.id}
        >
          <ListItemIcon>
            <FileIcon />
          </ListItemIcon>
          <ListItemText primary="Export to .csv" />
        </StyledMenuItem> */}

        <StyledMenuItem
          onClick={() => {
            props.onProductsExportToCsv()
            handleClose()
          }}
          disabled={!props.wholesaleOrder.id}
        >
          <ListItemIcon>
            <FileIcon />
          </ListItemIcon>
          <ListItemText primary="export products to .csv" />
        </StyledMenuItem>
      </StyledMenu>
    </>
  )
}
