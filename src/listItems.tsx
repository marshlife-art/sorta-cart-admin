import React from 'react'
import { Link } from 'react-router-dom'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import ListSubheader from '@material-ui/core/ListSubheader'
import DashboardIcon from '@material-ui/icons/Dashboard'
import ViewListIcon from '@material-ui/icons/ViewList'
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart'
import TagFacesIcon from '@material-ui/icons/TagFaces'
import PeopleIcon from '@material-ui/icons/People'
import AssignmentIcon from '@material-ui/icons/Assignment'
import LocalShippingIcon from '@material-ui/icons/LocalShipping'
import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser'
import CreditIcon from '@material-ui/icons/LocalAtm'
import OnHandIcon from '@material-ui/icons/PanTool'
import AddStockIcon from '@material-ui/icons/LibraryAdd'
import AnnouncementsIcon from '@material-ui/icons/Notifications'

export const mainListItems = (
  <div>
    <ListItem button component={Link} to="/">
      <ListItemIcon>
        <DashboardIcon />
      </ListItemIcon>
      <ListItemText primary="Dashboard" />
    </ListItem>
    <ListItem button component={Link} to="/products">
      <ListItemIcon>
        <ViewListIcon />
      </ListItemIcon>
      <ListItemText primary="Products" />
    </ListItem>
    <ListItem button component={Link} to="/products/import">
      <ListItemIcon>
        <OpenInBrowserIcon />
      </ListItemIcon>
      <ListItemText primary="Import Products" />
    </ListItem>
    <ListItem button component={Link} to="/products/onhand">
      <ListItemIcon>
        <OnHandIcon />
      </ListItemIcon>
      <ListItemText primary="Stock On Hand" />
    </ListItem>
    <ListItem button component={Link} to="/products/addstock">
      <ListItemIcon>
        <AddStockIcon />
      </ListItemIcon>
      <ListItemText primary="Add Stock" />
    </ListItem>
    <ListItem button component={Link} to="/orders">
      <ListItemIcon>
        <ShoppingCartIcon />
      </ListItemIcon>
      <ListItemText primary="Orders" />
    </ListItem>
    <ListItem button component={Link} to="/wholesaleorders">
      <ListItemIcon>
        <LocalShippingIcon />
      </ListItemIcon>
      <ListItemText primary="Wholesale Orders" />
    </ListItem>
    <ListItem button component={Link} to="/users">
      <ListItemIcon>
        <TagFacesIcon />
      </ListItemIcon>
      <ListItemText primary="Users" />
    </ListItem>
    <ListItem button component={Link} to="/members">
      <ListItemIcon>
        <PeopleIcon />
      </ListItemIcon>
      <ListItemText primary="Members" />
    </ListItem>
    <ListItem button component={Link} to="/storecredits">
      <ListItemIcon>
        <CreditIcon />
      </ListItemIcon>
      <ListItemText primary="Store Credits" />
    </ListItem>
    <ListItem button component={Link} to="/announcements">
      <ListItemIcon>
        <AnnouncementsIcon />
      </ListItemIcon>
      <ListItemText primary="Announcements" />
    </ListItem>
  </div>
)

export const secondaryListItems = (
  <div>
    <ListSubheader inset>Saved reports</ListSubheader>
    <ListItem button>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary="Current month" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary="Last quarter" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary="Year-end sale" />
    </ListItem>
  </div>
)
