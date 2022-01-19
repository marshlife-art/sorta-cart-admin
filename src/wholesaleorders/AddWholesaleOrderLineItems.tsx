import React, { useState, useEffect, useCallback, createRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import { Menu, MenuItem } from '@material-ui/core'
import Divider from '@material-ui/core/Divider'
import MaterialTable, { Query } from 'material-table'
import Link from '@material-ui/core/Link'

import { OrderStatus } from '../types/Order'
import { useAllWholesaleOrdersService } from './useWholesaleOrderService'
import { SupaOrderLineItem as LineItem } from '../types/SupaTypes'
import {
  insertWholesaleOrder,
  updateOrderLineItems
} from '../services/mutations'
import { wholesaleOrdersDataTableFetcher } from '../services/fetchers'

// #TODO: deal with this
// function tryParseData(data: any): object {
//   if (!(data instanceof String) || typeof data !== 'string') {
//     return data as object
//   }
//   try {
//     return JSON.parse(data)
//   } catch (e) {
//     return {}
//   }
// }

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      maxWidth: '100vw'
    }
  })
)

interface AddWholesaleOrderLineItemsProps {
  setReloadOrders: React.Dispatch<React.SetStateAction<boolean>>
}

export default function AddWholesaleOrderLineItems(
  props: AddWholesaleOrderLineItemsProps
) {
  const navigate = useNavigate()
  const classes = useStyles()
  let tableRef = createRef<any>()

  const [needsRefresh, setNeedsRefresh] = useState(false)
  const refreshTable = useCallback(() => {
    tableRef.current && tableRef.current.onQueryChange()
    setNeedsRefresh(false)
  }, [tableRef, setNeedsRefresh])

  const [selectedLineItems, setSelectedLineItems] = useState<number[]>()

  const addAction = {
    tooltip: 'ADD LINE ITEMS TO ORDER',
    icon: 'add',
    onClick: (
      event: React.MouseEvent<HTMLButtonElement>,
      data: LineItem | LineItem[]
    ) => {
      handleWholesaleOrderMenuOpen(event)
      if (Array.isArray(data)) {
        // ain't nobody (tsc) tell me nothin
        setSelectedLineItems(data.map((li) => li.id) as number[])
      }
    }
  }

  const [reloadOrders, setReloadOrders] = useState(true)
  const allWholesaleOrders = useAllWholesaleOrdersService(
    null as unknown as OrderStatus,
    () => {},
    reloadOrders,
    setReloadOrders
  )

  useEffect(() => {
    if (needsRefresh) {
      refreshTable()
    }
  }, [needsRefresh, refreshTable])

  const [wholesaleorderLookup, setWholesaleOrderLookup] =
    useState<Array<{ id: string; name: string }>>()

  useEffect(() => {
    if (allWholesaleOrders.status === 'loaded') {
      setWholesaleOrderLookup(
        allWholesaleOrders.payload
          .filter(
            (wo) => wo.status && ['new', 'needs_review'].includes(wo.status)
          )
          .map((order) => ({
            id: `${order.id}`,
            name: `${order.vendor} ${new Date(
              order.createdAt || ''
            ).toLocaleDateString()}`
          }))
      )
    }
  }, [allWholesaleOrders])
  const [wholesaleorderMenuAnchorEl, setWholesaleOrderMenuAnchorEl] =
    React.useState<null | HTMLElement>(null)

  const handleWholesaleOrderMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setWholesaleOrderMenuAnchorEl(event.currentTarget)
  }

  const handleWholesaleOrderMenuClose = () => {
    setSelectedLineItems([])
    setWholesaleOrderMenuAnchorEl(null)
  }

  const handleWholesaleOrderSelect = async (id: string) => {
    if (!selectedLineItems?.length) {
      return
    }

    let WholesaleOrderId: number | undefined
    if (id === undefined) {
      const { data, error } = await insertWholesaleOrder({
        vendor: 'New Wholesale Order',
        status: 'new',
        payment_status: 'balance_due',
        shipment_status: 'backorder'
      })

      if (error || !data) {
        return
      }
      WholesaleOrderId = data.id
    } else {
      WholesaleOrderId = Number(id)
    }

    const { error } = await updateOrderLineItems(
      { WholesaleOrderId },
      selectedLineItems?.map((id) => Number(id))
    )

    if (error) {
      console.warn(
        '[AddWholesaleOrderLineItems] handleWholesaleOrderSelect() got error response:',
        error
      )
    }
    handleWholesaleOrderMenuClose()
    setNeedsRefresh(true)
    props.setReloadOrders(true)
  }

  return (
    <div className={classes.root}>
      <MaterialTable
        tableRef={tableRef}
        columns={[
          {
            title: 'vendor',
            field: 'vendor',
            type: 'string',
            filterPlaceholder: 'filter'
          },
          {
            title: 'OrderId',
            field: 'OrderId',
            type: 'string',
            filtering: true,
            render: (row) => (
              <Link
                color="secondary"
                href={`/orders/edit/${row.OrderId}`}
                onClick={(e: any) => {
                  e.preventDefault()
                  navigate(`/orders/edit/${row.OrderId}`)
                }}
              >
                Order #{row.OrderId}
              </Link>
            )
          },
          {
            title: 'qty',
            field: 'quantity',
            type: 'string',
            filtering: false
          },
          { title: 'total', field: 'total', type: 'string', filtering: false },
          {
            title: 'product',
            field: 'data',
            type: 'string',
            render: (row) =>
              row.data && row.data.product
                ? `${row.data.product.name} ${row.data.product.description}`
                : null
          },
          { title: 'id', field: 'id', type: 'string', hidden: true },
          {
            title: 'WholesaleOrderId',
            field: 'WholesaleOrderId',
            type: 'string',
            hidden: true
          }
        ]}
        data={(q) =>
          new Promise(async (resolve, reject) => {
            const {
              data: orderLineItems,
              error,
              count
            } = await wholesaleOrdersDataTableFetcher(q)

            // whee, so need to JSON.parse each OrderLineItem .data field
            // ughhhhh i guess?!?! fuck tsc :/

            if (!orderLineItems || error) {
              resolve({ data: [], page: 0, totalCount: 0 })
            } else {
              // const data: LineItem[] | null = orderLineItems.map(({ data, ...rest }) => ({
              //   ...rest,
              //   data: tryParseData(data) as SupaOrderLineItemData
              // }))

              resolve({
                data: orderLineItems,
                page: q.page,
                totalCount: count || 0
              })
            }
          })
        }
        title="Line Items"
        options={{
          headerStyle: { position: 'sticky', top: 0 },
          maxBodyHeight: 'calc(100vh - 121px - 28px)',
          pageSize: 50,
          pageSizeOptions: [50, 100, 500],
          debounceInterval: 750,
          filtering: true,
          search: true,
          emptyRowsWhenPaging: false,
          selection: true
        }}
        actions={[addAction]}
      />

      <Menu
        id="simple-menu"
        anchorEl={wholesaleorderMenuAnchorEl}
        keepMounted
        open={Boolean(wholesaleorderMenuAnchorEl)}
        onClose={handleWholesaleOrderMenuClose}
      >
        <MenuItem onClick={() => handleWholesaleOrderSelect('new')}>
          New wholesale order
        </MenuItem>
        <Divider />
        {wholesaleorderLookup &&
          wholesaleorderLookup.map(
            (wholesaleorder: { id: string; name: string }) => (
              <MenuItem
                key={`wholesaleorder-sel-${wholesaleorder.id}`}
                onClick={() => handleWholesaleOrderSelect(wholesaleorder.id)}
              >
                {wholesaleorder.name}
              </MenuItem>
            )
          )}
      </Menu>
    </div>
  )
}
