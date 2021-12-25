import React, { useState } from 'react'
import { Action } from 'material-table'
import { IconButton, Menu, MenuItem } from '@material-ui/core'
import NoBackorderIcon from '@material-ui/icons/LocalShipping'

import { supabase } from '../lib/supabaseClient'
import { Product } from '../types/Product'
import { SupaProduct } from '../types/SupaTypes'

// this global var isn't great, but there doesn't seem to be a better option :/
let selectedProducts: Product[]

async function updateProductNoBackorder(v: string) {
  const no_backorder: boolean = v === 'true'
  return await supabase
    .from<SupaProduct>('products')
    .update({ no_backorder })
    .in(
      'id',
      selectedProducts.map((p) => p.id)
    )
}

function TableActionMenu(props: {
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

  return (
    <>
      <IconButton
        aria-label="set status"
        aria-controls="no-backorder-menu"
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        <NoBackorderIcon />
      </IconButton>

      <Menu
        id="no-backorder-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button'
        }}
      >
        {['true', 'false'].map((v) => (
          <MenuItem
            key={v}
            onClick={() => {
              if (!selectedProducts || selectedProducts.length === 0) {
                console.warn('ugh no selectedOrders')
                return
              }
              updateProductNoBackorder(v).then((response) => {
                setNeedsRefresh(true)
                handleClose()
              })
            }}
          >
            {v}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

export function getNoBackorderAction(
  setNeedsRefresh: React.Dispatch<React.SetStateAction<boolean>>
): Action<Product> {
  return {
    tooltip: 'SET NO BACKORDER',
    icon: () => <TableActionMenu setNeedsRefresh={setNeedsRefresh} />,
    onClick: (e, data) => {
      selectedProducts = data as Product[]
    }
  }
}
