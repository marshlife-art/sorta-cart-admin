import React, { useState, useEffect, useCallback, createRef } from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import { Menu, MenuItem } from '@material-ui/core'
import Divider from '@material-ui/core/Divider'
import MaterialTable from 'material-table'
import Link from '@material-ui/core/Link'

import { LineItem } from '../types/Order'
import { API_HOST } from '../constants'

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

function AddWholesaleOrderLineItems(
  props: AddWholesaleOrderLineItemsProps & RouteComponentProps
) {
  const classes = useStyles()
  let tableRef = createRef<any>()

  const [needsRefresh, setNeedsRefresh] = useState(false)
  const refreshTable = useCallback(() => {
    tableRef.current && tableRef.current.onQueryChange()
    setNeedsRefresh(false)
  }, [tableRef, setNeedsRefresh])

  const [selectedLineItems, setSelectedLineItems] = useState<string[]>()

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
        setSelectedLineItems(data.map((li) => li.id) as string[])
      }
    }
  }

  useEffect(() => {
    if (needsRefresh) {
      refreshTable()
    }
  }, [needsRefresh, refreshTable])

  const [wholesaleorderLookup, setWholesaleOrderLookup] = useState<
    Array<{ id: string; name: string }>
  >()
  useEffect(() => {
    fetch(`${API_HOST}/wholesaleorders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ status: ['new', 'needs_review'] })
    })
      .then((response) => response.json())
      .then((result) =>
        setWholesaleOrderLookup(
          result.data.map(
            (order: { id: string; vendor: string; createdAt: string }) => ({
              id: order.id,
              name: `${order.vendor} ${new Date(
                order.createdAt
              ).toLocaleDateString()}`
            })
          )
        )
      )
      .catch(console.warn)
  }, [])
  const [
    wholesaleorderMenuAnchorEl,
    setWholesaleOrderMenuAnchorEl
  ] = React.useState<null | HTMLElement>(null)

  const handleWholesaleOrderMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setWholesaleOrderMenuAnchorEl(event.currentTarget)
  }

  const handleWholesaleOrderMenuClose = () => {
    setSelectedLineItems([])
    setWholesaleOrderMenuAnchorEl(null)
  }

  const handleWholesaleOrderSelect = (id: string) => {
    fetch(`${API_HOST}/wholesaleorder/addlineitems`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ id, selectedLineItems })
    })
      .then((response) => response.json())
      .then((result) => {
        // console.log('update line items result:', result)
      })
      .catch(console.warn)
      .finally(() => {
        handleWholesaleOrderMenuClose()
        setNeedsRefresh(true)
        props.setReloadOrders(true)
      })
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
                  props.history.push(`/orders/edit/${row.OrderId}`)
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
        data={(query) =>
          new Promise((resolve, reject) => {
            fetch(`${API_HOST}/wholesaleorders/lineitems`, {
              method: 'post',
              headers: {
                'Content-Type': 'application/json'
              },
              credentials: 'include',
              body: JSON.stringify(query)
            })
              .then((response) => response.json())
              .then((result) => {
                resolve(result)
              })
              .catch((err) => {
                console.warn('onoz, caught err:', err)
                return resolve({ data: [], page: 0, totalCount: 0 })
              })
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

export default withRouter(AddWholesaleOrderLineItems)
