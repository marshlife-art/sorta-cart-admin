import React, { useState, useEffect, createRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import MaterialTable, { Action } from 'material-table'
import OrderDetailPanel from './OrderDetailPanel'
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  SHIPMENT_STATUSES
} from '../constants'
import { formatRelative } from 'date-fns'
import { getStatusAction, getShipmentStatusAction } from './StatusMenu'
import printOrders from '../lib/printOrder'
import { ordersDataTableFetcher } from '../services/fetchers'
import { SuperOrderAndAssoc as Order } from '../types/SupaTypes'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(2),
      maxWidth: '100vw',
      minHeight: '100vh'
    }
  })
)

export default function Orders() {
  const navigate = useNavigate()
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
    onClick: () => navigate('/orders/create')
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
      data[0] && data[0].id && navigate(`/orders/edit/${data[0].id}`)
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
            const { data, error, count } = await ordersDataTableFetcher(q)

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
