import React, { useState, useEffect } from 'react'
// import Link from '@material-ui/core/Link'
import Button from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Title from './Title'
import { RouteComponentProps, withRouter } from 'react-router-dom'

import { API_HOST } from '../constants'
import { Order } from '../types/Order'

interface OrderData {
  data: Order[]
  page: number
  totalCount: number
}

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3)
  },
  rowHover: {
    '&:hover': {
      backgroundColor: theme.palette.background.default,
      cursor: 'pointer'
    }
  }
}))

function Orders(props: RouteComponentProps) {
  const classes = useStyles()

  const [orders, setOrders] = useState<OrderData>({
    data: [],
    page: 0,
    totalCount: 0
  })

  useEffect(() => {
    fetch(`${API_HOST}/orders`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ pageSize: 10 })
    })
      .then((response) => response.json())
      .then(setOrders)
      .catch((err) => {
        console.warn(err)
        return { data: [], page: 0, totalCount: 0 }
      })
  }, [])

  return (
    <React.Fragment>
      <Title>recent orders</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>created</TableCell>
            <TableCell>status</TableCell>
            <TableCell>name</TableCell>
            <TableCell>email</TableCell>
            <TableCell>items</TableCell>
            <TableCell>subtotal</TableCell>
            <TableCell align="right">total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.data.map((order) => (
            <TableRow
              key={order.id}
              className={classes.rowHover}
              onClick={() => props.history.push(`/orders/edit/${order.id}`)}
            >
              <TableCell>
                {order.createdAt && new Date(order.createdAt).toLocaleString()}
              </TableCell>
              <TableCell>{order.status}</TableCell>
              <TableCell>{order.name}</TableCell>
              <TableCell>{order.email}</TableCell>
              <TableCell>{order.item_count}</TableCell>
              <TableCell>{order.subtotal}</TableCell>
              <TableCell align="right">{order.total}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className={classes.seeMore}>
        <Button
          variant="contained"
          color="primary"
          onClick={(event: any) => {
            props.history.push('/orders')
          }}
        >
          SEE MORE ORDERS
        </Button>
      </div>
    </React.Fragment>
  )
}

export default withRouter(Orders)
