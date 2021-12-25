import React, { useState, useEffect, createRef, useCallback } from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import MaterialTable, { Action } from 'material-table'
import { Order } from '../types/Order'
import OrderDetailPanel from './OrderDetailPanel'
import {
  API_HOST,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  SHIPMENT_STATUSES
} from '../constants'
import { formatRelative } from 'date-fns'
import { supabase } from '../lib/supabaseClient'
import { getStatusAction, getShipmentStatusAction } from './StatusMenu'
import printOrders from '../lib/printOrder'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(2),
      maxWidth: '100vw',
      minHeight: '100vh'
    }
  })
)

function Orders(props: RouteComponentProps) {
  const classes = useStyles()
  const tableRef = createRef<any>()

  const [needsRefresh, setNeedsRefresh] = useState(false)
  const refreshTable = useCallback(() => {
    tableRef.current && tableRef.current.onQueryChange()
    setNeedsRefresh(false)
  }, [tableRef, setNeedsRefresh])

  useEffect(() => {
    if (needsRefresh) {
      refreshTable()
    }
  }, [needsRefresh, refreshTable])

  const [searchExpanded, setSearchExpanded] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)

  const searchAction = {
    icon: searchExpanded ? 'zoom_out' : 'search',
    tooltip: searchExpanded ? 'CLOSE SEARCH' : 'SEARCH',
    isFreeAction: true,
    onClick: () => setSearchExpanded(!searchExpanded)
  }

  const newOrderAction = {
    icon: 'add',
    tooltip: 'NEW ORDER',
    isFreeAction: true,
    onClick: () => props.history.push('/orders/create')
  }

  const printAction = {
    tooltip: 'PRINT',
    icon: 'print',
    onClick: async (e: any, data: Order[]) => {
      const orderIds = data.map((order) => parseInt(`${order.id}`))

      try {
        const ordersHTML = await printOrders(orderIds)
        // eslint-disable-next-line
        const wOpen = window.open('about:blank')
        if (wOpen) {
          wOpen.document.body.innerHTML += ordersHTML
        }
      } catch (e) {
        console.warn('caught error doing this razzle dazze shit e:', e)
      }
    }
  }

  const editAction = {
    tooltip: 'EDIT',
    icon: 'edit',
    onClick: (e: any, data: Order[]) => {
      data[0] && data[0].id && props.history.push(`/orders/edit/${data[0].id}`)
    }
  }

  const [actions, setActions] = useState<Action<any>[]>([
    searchAction,
    newOrderAction
  ])

  useEffect(() => {
    !isSelecting && setActions([searchAction, newOrderAction])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchExpanded, isSelecting]) // note: adding actions to dep array is not pleasant :/

  return (
    <div className={classes.root}>
      <MaterialTable
        tableRef={tableRef}
        columns={[
          { title: '#', field: 'id', type: 'string', filtering: false },
          {
            title: 'created',
            field: 'createdAt',
            type: 'datetime',
            filtering: false,
            render: (order: Order) => (
              <div
                title={
                  order.createdAt && new Date(order.createdAt).toLocaleString()
                }
              >
                {order.createdAt &&
                  formatRelative(new Date(order.createdAt), Date.now())}
              </div>
            )
          },
          {
            title: 'status',
            field: 'status',
            type: 'string',
            lookup: ORDER_STATUSES
          },
          {
            title: 'payment status',
            field: 'payment_status',
            type: 'string',
            lookup: PAYMENT_STATUSES
          },
          {
            title: 'shipment status',
            field: 'shipment_status',
            type: 'string',
            lookup: SHIPMENT_STATUSES
          },
          { title: 'name', field: 'name', type: 'string', filtering: false },
          { title: 'email', field: 'email', type: 'string', filtering: false },
          {
            title: 'items',
            field: 'item_count',
            type: 'numeric',
            filtering: false
          },
          {
            title: 'total',
            field: 'total',
            type: 'currency',
            filtering: false
          },

          {
            title: 'updated',
            field: 'updatedAt',
            type: 'datetime',
            filtering: false,
            hidden: true
            // render: (order: Order) =>
            //   order.updatedAt
            //     ? new Date(order.updatedAt).toLocaleString()
            //     : null
          },
          { title: 'phone', field: 'phone', type: 'string', hidden: true },
          {
            title: 'address',
            field: 'address',
            type: 'string',
            hidden: true
          },
          { title: 'notes', field: 'notes', type: 'string', hidden: true },
          {
            title: 'WholesaleOrderId',
            field: 'WholesaleOrderId',
            type: 'string',
            hidden: true
          },
          { title: 'history', field: 'history', type: 'string', hidden: true }
        ]}
        data={(q) =>
          new Promise(async (resolve, reject) => {
            let query = supabase
              .from('Orders')
              .select('*, OrderLineItems ( * )', { count: 'exact' })

            if (q.filters.length) {
              q.filters.forEach((filter) => {
                if (filter.column.field && filter.value) {
                  if (filter.value instanceof Array && filter.value.length) {
                    const or = filter.value
                      .map((v) => `${filter.column.field}.eq.${v}`)
                      .join(',')
                    query = query.or(or)
                  } else if (filter.value.length) {
                    query = query.or(
                      `${filter.column.field}.eq.${filter.value}`
                    )
                  }
                }
              })
            }
            if (q.search) {
              query = query.textSearch('fts', q.search, {
                type: 'websearch',
                config: 'english'
              })
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
            } else {
              query = query.order('id', { ascending: false })
            }

            const { data, error, count } = await query

            if (!data || error) {
              resolve({ data: [], page: 0, totalCount: 0 })
            } else {
              resolve({ data, page: q.page, totalCount: count || 0 })
            }
          })
        }
        detailPanel={(order) => <OrderDetailPanel order={order} />}
        onRowClick={(event, rowData, togglePanel) =>
          togglePanel && togglePanel()
        }
        title="Orders"
        options={{
          headerStyle: { position: 'sticky', top: 0 },
          maxBodyHeight: 'calc(100vh - 121px - 28px)',
          pageSize: 50,
          pageSizeOptions: [50, 100, 500],
          debounceInterval: 750,
          filtering: true,
          search: searchExpanded,
          emptyRowsWhenPaging: false,
          selection: true
        }}
        onSelectionChange={(data: Order[], rowData?: Order | undefined) => {
          searchExpanded && setSearchExpanded(false)
          if (data.length === 0) {
            setIsSelecting(false)
            return
          }
          setIsSelecting(true)
          if (data.length === 1) {
            setActions([
              getStatusAction(setNeedsRefresh),
              getShipmentStatusAction(setNeedsRefresh),
              printAction,
              editAction
            ])
          } else {
            setActions([
              getStatusAction(setNeedsRefresh),
              getShipmentStatusAction(setNeedsRefresh),
              printAction
            ])
          }
        }}
        actions={actions}
      />
    </div>
  )
}

export default withRouter(Orders)
