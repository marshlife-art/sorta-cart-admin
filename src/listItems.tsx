import React from 'react'
import { Link } from 'react-router-dom'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import ListSubheader from '@material-ui/core/ListSubheader'
import { Icon } from '@material-ui/core'

export const mainListItems = (
  <div>
    <ListItem button component={Link} to="/">
      <ListItemIcon>
        <Icon>dashboard</Icon>
      </ListItemIcon>
      <ListItemText primary="Dashboard" />
    </ListItem>
    <ListItem button component={Link} to="/products">
      <ListItemIcon>
        <Icon>view_list</Icon>
      </ListItemIcon>
      <ListItemText primary="Products" />
    </ListItem>
    <ListItem button component={Link} to="/products/import">
      <ListItemIcon>
        <Icon>open_in_browser</Icon>
      </ListItemIcon>
      <ListItemText primary="Import Products" />
    </ListItem>
    <ListItem button component={Link} to="/products/update">
      <ListItemIcon>
        <Icon>update</Icon>
      </ListItemIcon>
      <ListItemText primary="Update Products" />
    </ListItem>
    <ListItem button component={Link} to="/orders">
      <ListItemIcon>
        <Icon>shopping_cart</Icon>
      </ListItemIcon>
      <ListItemText primary="Orders" />
    </ListItem>
    <ListItem button component={Link} to="/wholesaleorders">
      <ListItemIcon>
        <Icon>local_shipping</Icon>
      </ListItemIcon>
      <ListItemText primary="Wholesale Orders" />
    </ListItem>
    <ListItem button component={Link} to="/members">
      <ListItemIcon>
        <Icon>people</Icon>
      </ListItemIcon>
      <ListItemText primary="Members" />
    </ListItem>
    <ListItem button component={Link} to="/storecredits">
      <ListItemIcon>
        <Icon>local_atm</Icon>
      </ListItemIcon>
      <ListItemText primary="Store Credits" />
    </ListItem>
  </div>
)

export const secondaryListItems = (
  <div>
    <ListSubheader inset>Saved reports</ListSubheader>
    <ListItem button>
      <ListItemIcon>
        <Icon>assignment</Icon>
      </ListItemIcon>
      <ListItemText primary="Current month" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <Icon>assignment</Icon>
      </ListItemIcon>
      <ListItemText primary="Last quarter" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <Icon>assignment</Icon>
      </ListItemIcon>
      <ListItemText primary="Year-end sale" />
    </ListItem>
  </div>
)
