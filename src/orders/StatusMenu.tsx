import React, { useState } from 'react'
import { Action } from 'material-table'
import { IconButton, Menu, MenuItem } from '@material-ui/core'
import TimelapseIcon from '@material-ui/icons/Timelapse'
import ShippingIcon from '@material-ui/icons/LocalShipping'

import { Order } from '../types/Order'
import { ORDER_STATUSES, SHIPMENT_STATUSES } from '../constants'
import { supabase } from '../lib/supabaseClient'

// this global var isn't great, but there doesn't seem to be a better option :/
let selectedOrders: Order[]

async function updateOrderStatus(status: string) {
  return await supabase
    .from('Orders')
    .update({ status })
    .in(
      'id',
      selectedOrders.map((o) => o.id)
    )
}

async function updateOrderShipmentStatus(shipment_status: string) {
  return await supabase
    .from('Orders')
    .update({ shipment_status })
    .in(
      'id',
      selectedOrders.map((o) => o.id)
    )
}

function StatusMenu(props: {
  for: 'status' | 'shipment_status'
  setNeedsRefresh: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const { setNeedsRefresh } = props
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const getIcon = () => {
    switch (props.for) {
      case 'status':
        return <TimelapseIcon />
      case 'shipment_status':
        return <ShippingIcon />
    }
  }

  const getMenuItems = () => {
    switch (props.for) {
      case 'status':
        return Object.entries(ORDER_STATUSES).map((v) => (
          <MenuItem
            key={v[0]}
            onClick={() => {
              if (!selectedOrders || selectedOrders.length === 0) {
                console.warn('ugh no selectedOrders')
                return
              }
              updateOrderStatus(v[0]).then(() => {
                setNeedsRefresh(true)
                handleClose()
              })
            }}
          >
            {v[1]}
          </MenuItem>
        ))
      case 'shipment_status':
        return Object.entries(SHIPMENT_STATUSES).map((v) => (
          <MenuItem
            key={v[0]}
            onClick={() => {
              if (!selectedOrders || selectedOrders.length === 0) {
                console.warn('ugh no selectedOrders')
                return
              }
              updateOrderShipmentStatus(v[0]).then(() => {
                setNeedsRefresh(true)
                handleClose()
              })
            }}
          >
            {v[1]}
          </MenuItem>
        ))
    }
  }

  return (
    <>
      <IconButton
        aria-label="set status"
        aria-controls="basic-menu"
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        {getIcon()}
      </IconButton>

      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button'
        }}
      >
        {getMenuItems()}
      </Menu>
    </>
  )
}

export function getStatusAction(
  setNeedsRefresh: React.Dispatch<React.SetStateAction<boolean>>
): Action<Order> {
  return {
    tooltip: 'SET STATUS',
    icon: () => <StatusMenu for="status" setNeedsRefresh={setNeedsRefresh} />,
    onClick: (e, data) => {
      selectedOrders = data as Order[]
    }
  }
}

export function getShipmentStatusAction(
  setNeedsRefresh: React.Dispatch<React.SetStateAction<boolean>>
): Action<Order> {
  return {
    tooltip: 'SET SHIPMENT STATUS',
    icon: () => (
      <StatusMenu for="shipment_status" setNeedsRefresh={setNeedsRefresh} />
    ),
    onClick: (e, data) => {
      selectedOrders = data as Order[]
    }
  }
}
