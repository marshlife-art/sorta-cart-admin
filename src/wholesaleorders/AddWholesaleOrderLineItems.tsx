import React, { useState, useEffect, useCallback, createRef } from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import { Menu, MenuItem } from '@material-ui/core'
import Divider from '@material-ui/core/Divider'
import MaterialTable from 'material-table'
import Link from '@material-ui/core/Link'

import { LineItem, OrderStatus } from '../types/Order'
import { supabase } from '../lib/supabaseClient'
import { useAllWholesaleOrdersService } from './useWholesaleOrderService'
import { SupaOrderLineItem, SupaWholesaleOrder } from '../types/SupaTypes'

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
          .filter((wo: { status: OrderStatus }) =>
            ['new', 'needs_review'].includes(wo.status)
          )
          .map((order: { id: string; vendor: string; createdAt: string }) => ({
            id: order.id,
            name: `${order.vendor} ${new Date(
              order.createdAt
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

    let WholesaleOrderId: number
    if (id === 'new') {
      const { data, error } = await supabase
        .from<SupaWholesaleOrder>('WholesaleOrders')
        .insert(
          {
            vendor: 'New Wholesale Order',
            status: 'new',
            payment_status: 'balance_due',
            shipment_status: 'backorder'
          },
          { returning: 'representation' }
        )
        .single()
      if (error || !data) {
        return
      }
      WholesaleOrderId = data.id
    } else {
      WholesaleOrderId = parseInt(id)
    }

    const response = await supabase
      .from<SupaOrderLineItem>('OrderLineItems')
      .update({ WholesaleOrderId }, { returning: 'minimal' })
      .in(
        'id',
        selectedLineItems?.map((id) => parseInt(id))
      )
    if (response.error) {
      console.warn(
        '[AddWholesaleOrderLineItems] handleWholesaleOrderSelect() got error response:',
        response
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
        data={(q) =>
          new Promise(async (resolve, reject) => {
            let query = supabase
              .from('OrderLineItems')
              .select('*', { count: 'exact' })
              .is('WholesaleOrderId', null)
              .eq('kind', 'product')
              .or('status.neq.on_hand,status.is.null')

            //(status != 'on_hand' or status is null)
            if (q.filters.length) {
              q.filters.forEach((filter) => {
                if (filter.column.field && filter.value) {
                  if (filter.value instanceof Array && filter.value.length) {
                    const or = filter.value
                      .map((v) => `${String(filter.column.field)}.eq."${v}"`)
                      .join(',')
                    query = query.or(or)
                  } else if (filter.value.length) {
                    query = query.or(
                      `${String(filter.column.field)}.eq."${filter.value}"`
                    )
                  }
                }
              })
            }

            if (q.search) {
              // #todo consider q.search.split(' ')
              query = query.or(
                ['vendor', 'description']
                  .map((f) => `${f}.ilike."%${q.search}%"`)
                  .join(',')
              )
            }
            if (q.page) {
              query = query.range(
                q.pageSize * q.page,
                q.pageSize * q.page + q.pageSize
              )
            }
            if (q.pageSize) {
              query = query.limit(q.pageSize)
            }
            if (q.orderBy && q.orderBy.field) {
              query = query.order(q.orderBy.field, {
                ascending: q.orderDirection === 'asc'
              })
            }

            const { data: orderLineItems, error, count } = await query

            // whee, so need to JSON.parse each OrderLineItem .data field
            const data =
              orderLineItems &&
              (orderLineItems.map(({ data, ...rest }: { data: string }) => ({
                ...rest,
                data: JSON.parse(data)
              })) as LineItem[])

            if (!data || error) {
              resolve({ data: [], page: 0, totalCount: 0 })
            } else {
              resolve({ data, page: q.page, totalCount: count || 0 })
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

export default withRouter(AddWholesaleOrderLineItems)
