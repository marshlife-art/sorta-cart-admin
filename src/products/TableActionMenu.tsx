import React, { useState } from 'react'
import { Action } from 'material-table'
import {
  Icon,
  IconButton,
  Menu,
  MenuItem,
  SvgIconTypeMap
} from '@material-ui/core'
import { OverridableComponent } from '@material-ui/core/OverridableComponent'
import { PostgrestError } from '@supabase/supabase-js'

import { SupaProduct } from '../types/SupaTypes'
import { updateProducts } from '../services/mutations'

// this global var isn't great, but there doesn't seem to be a better option :/
let selectedProducts: SupaProduct[]

async function updateProductNoBackorder(v: string) {
  const no_backorder: boolean = v === 'true'
  return await updateProducts(
    { no_backorder },
    selectedProducts.map((p) => p.id)
  )
}

async function updateProductFeatured(v: string) {
  const featured: boolean = v === 'true'
  return await updateProducts(
    { featured },
    selectedProducts.map((p) => p.id)
  )
}

function TableActionMenu(props: {
  setNeedsRefresh: React.Dispatch<React.SetStateAction<boolean>>
  onItemClick: (v: string) => Promise<{
    error: PostgrestError | null
  }>
  Icon: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>
}) {
  const { setNeedsRefresh, onItemClick, Icon } = props
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
        <Icon />
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
              onItemClick(v).then((response) => {
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
): Action<SupaProduct> {
  return {
    tooltip: 'SET NO BACKORDER',
    icon: () => (
      <TableActionMenu
        setNeedsRefresh={setNeedsRefresh}
        onItemClick={updateProductNoBackorder}
        Icon={() => <Icon>local_shipping</Icon>}
      />
    ),
    onClick: (e, data) => {
      selectedProducts = data as SupaProduct[]
    }
  }
}

export function getFeaturedAction(
  setNeedsRefresh: React.Dispatch<React.SetStateAction<boolean>>
): Action<SupaProduct> {
  return {
    tooltip: 'SET FEATURED',
    icon: () => (
      <TableActionMenu
        setNeedsRefresh={setNeedsRefresh}
        onItemClick={updateProductFeatured}
        Icon={() => <Icon>star</Icon>}
      />
    ),
    onClick: (e, data) => {
      selectedProducts = data as SupaProduct[]
    }
  }
}
