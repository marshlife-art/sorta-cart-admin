import React, { useState, useEffect, createRef } from 'react'
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
  let tableRef = createRef<any>()

  const [searchExpanded, setSearchExpanded] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)

  const token = localStorage && localStorage.getItem('token')

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
    onClick: (e: any, data: Order[]) => {
      const orderIds = data.map((order) => order.id)
      console.log('printAction orderIds:', orderIds, ' data:', data)

      fetch(`${API_HOST}/orders/print`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ orderIds })
      })
        .then((response) => response.text())
        .then((result) => {
          try {
            // eslint-disable-next-line
            const wOpen = window.open('about:blank')
            if (wOpen) {
              wOpen.document.body.innerHTML += result
            }
          } catch (e) {
            console.warn('caught error doing this razzle dazze shit e:', e)
          }
        })
        .catch((err) => {
          console.warn(err)
        })
    }
  }

  const editAction = {
    tooltip: 'EDIT',
    icon: 'edit',
    onClick: (e: any, data: Order[]) => {
      data[0] && data[0].id && props.history.push(`/orders/edit/${data[0].id}`)
    }
  }

  // const archiveAction = {
  //   tooltip: 'ARCHIVE',
  //   icon: 'archive',
  //   onClick: (e: any, data: Order[]) => {
  //     console.log('archive these muthafuckaz')
  //   }
  // }

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
          {
            title: 'created',
            field: 'createdAt',
            type: 'datetime',
            filtering: false,
            render: (order: Order) => new Date(order.createdAt).toLocaleString()
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
          { title: 'history', field: 'history', type: 'string', hidden: true },
          { title: 'id', field: 'id', type: 'string', hidden: true }
        ]}
        data={(query) =>
          new Promise((resolve, reject) => {
            // console.log('query:', query)
            fetch(`${API_HOST}/orders`, {
              method: 'post',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify(query)
            })
              .then((response) => response.json())
              .then((result) => {
                // console.log('result', result)
                resolve(result)
              })
              .catch((err) => {
                console.warn(err)
                return resolve({ data: [], page: 0, totalCount: 0 })
              })
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
            setActions([printAction, editAction])
          } else {
            setActions([printAction])
          }
        }}
        actions={actions}
      />
    </div>
  )
}

export default withRouter(Orders)
