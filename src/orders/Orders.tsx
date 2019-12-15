import React, { useState, useEffect, createRef } from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import MaterialTable, { Action } from 'material-table'
// import Paper from '@material-ui/core/Paper'
// import Grid from '@material-ui/core/Grid'
// import List from '@material-ui/core/List'
// import ListItem from '@material-ui/core/ListItem'
// import Add from '@material-ui/icons/Add'
// import ListItemText from '@material-ui/core/ListItemText'
// import Divider from '@material-ui/core/Divider'
// import Snackbar from '@material-ui/core/Snackbar'
// import IconButton from '@material-ui/core/IconButton'
// import CloseIcon from '@material-ui/icons/Close'
// import { connect } from 'react-redux'
// import { Switch } from 'react-router'
// import ProtectedRoute from '../auth/ProtectedRoute'
// import { RootState } from '../redux'
import {
  Order,
  OrderStatus,
  PaymentStatus,
  ShipmentStatus
} from '../types/Order'
import OrderDetailPanel from './OrderDetailPanel'
import { API_HOST } from '../constants'

type OrderStatusLookup = { [key in OrderStatus]: string }
const statusLookup: OrderStatusLookup = {
  new: 'new',
  pending: 'pending',
  needs_review: 'needs review',
  void: 'void',
  archived: 'archived'
}
type OrderPaymentStatusLookup = { [key in PaymentStatus]: string }
const paymentStatusLookup: OrderPaymentStatusLookup = {
  balance_due: 'balance due',
  credit_owed: 'credit owed',
  failed: 'failed',
  paid: 'paid',
  void: 'void'
}
type OrderShipmentStatusLookup = { [key in ShipmentStatus]: string }
const shipmentStatusLookup: OrderShipmentStatusLookup = {
  backorder: 'backorder',
  canceled: 'canceled',
  partial: 'partial',
  pending: 'pending',
  ready: 'ready',
  shipped: 'shipped'
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(2),
      maxWidth: '100vw',
      minHeight: `calc(100vh - 64px)`
    }
  })
)

// const detailPanel = (rowData: Order) => (
//   <div>
//     <table>
//       <thead>
//         <tr>
//           <th>id</th>
//           <th>address</th>
//           <th>notes</th>
//         </tr>
//       </thead>
//       <tbody>
//         <tr>
//           <td>{rowData.id}</td>
//           <td>{rowData.address}</td>
//           <td>{rowData.notes}</td>
//         </tr>
//       </tbody>
//     </table>
//   </div>
// )

function Orders(props: RouteComponentProps) {
  const classes = useStyles()
  let tableRef = createRef<any>()

  const [searchExpanded, setSearchExpanded] = useState(false)
  const token = localStorage && localStorage.getItem('token')

  const searchAction = {
    icon: searchExpanded ? 'zoom_out' : 'search',
    tooltip: searchExpanded ? 'Close Search' : 'Search',
    isFreeAction: true,
    onClick: () => setSearchExpanded(!searchExpanded)
  }

  const newOrderAction = {
    icon: 'add',
    tooltip: 'add new order',
    isFreeAction: true,
    onClick: () => console.log('#TODO: add new order')
  }

  const deleteAction = {
    tooltip: 'Remove All Selected Users',
    icon: 'delete',
    onClick: (e: any, data: Order[]) => {
      console.log('deleteAction data:', data)
      alert('You want to delete ' + data.length + ' rows')
    }
  }

  const [actions, setActions] = useState<Action<any>[]>([
    searchAction,
    newOrderAction,
    deleteAction
  ])

  useEffect(() => {
    setActions([searchAction, newOrderAction, deleteAction])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchExpanded]) // note: adding actions to dep array is not pleasant :/

  return (
    <div className={classes.root}>
      <MaterialTable
        tableRef={tableRef}
        columns={[
          {
            title: 'status',
            field: 'status',
            type: 'string',
            lookup: statusLookup
          },
          {
            title: 'payment status',
            field: 'payment_status',
            type: 'string',
            lookup: paymentStatusLookup
          },
          {
            title: 'shipment status',
            field: 'shipment_status',
            type: 'string',
            lookup: shipmentStatusLookup
          },
          { title: 'name', field: 'name', type: 'string', filtering: false },
          { title: 'email', field: 'email', type: 'string', filtering: false },
          {
            title: 'line items',
            field: 'OrderLineItems',
            type: 'string',
            filtering: false,
            render: (order: Order) =>
              order.OrderLineItems ? order.OrderLineItems.length : 0
          },
          { title: 'total', field: 'total', type: 'numeric', filtering: false },
          {
            title: 'created',
            field: 'createdAt',
            type: 'datetime',
            filtering: false,
            render: (order: Order) => new Date(order.createdAt).toLocaleString()
          },
          {
            title: 'updated',
            field: 'updatedAt',
            type: 'datetime',
            filtering: false,
            render: (order: Order) =>
              order.updatedAt
                ? new Date(order.updatedAt).toLocaleString()
                : null
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
        data={query =>
          new Promise((resolve, reject) => {
            console.log('query:', query)
            fetch(`${API_HOST}/orders`, {
              method: 'post',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify(query)
            })
              .then(response => response.json())
              .then(result => {
                console.log('result', result)
                resolve(result)
              })
              .catch(err => {
                console.warn(err)
                return resolve({ data: [], page: 0, totalCount: 0 })
              })
          })
        }
        detailPanel={order => <OrderDetailPanel order={order} />}
        onRowClick={(event, rowData, togglePanel) =>
          togglePanel && togglePanel()
        }
        title="Orders"
        options={{
          headerStyle: { position: 'sticky', top: 0 },
          maxBodyHeight: 'calc(100vh - 121px)',
          pageSize: 50,
          pageSizeOptions: [50, 100, 500],
          debounceInterval: 750,
          filtering: true,
          search: searchExpanded,
          emptyRowsWhenPaging: false,
          selection: true
        }}
        actions={actions}
      />
    </div>
  )
}

export default withRouter(Orders)
