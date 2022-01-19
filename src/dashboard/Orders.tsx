import React from 'react'
import Button from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Title from './Title'
import { formatDistance } from 'date-fns/esm'

import { useNavigate } from 'react-router-dom'
import { useOrdersDashboard } from '../services/hooks/orders'
import { SuperOrderAndAssoc as Order } from '../types/SupaTypes'

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

export default function Orders() {
  const navigate = useNavigate()
  const classes = useStyles()

  const { orders, isError, isLoading } = useOrdersDashboard()

  if (isError) return <div>failed to load</div>
  if (isLoading) return <div>loading...</div>

  return (
    <React.Fragment>
      <Title>orders in the last 14 days</Title>
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
          {orders?.data?.map((order) => (
            <TableRow
              key={order.id}
              className={classes.rowHover}
              onClick={() => navigate(`/orders/edit/${order.id}`)}
            >
              <TableCell
                title={
                  order.createdAt && new Date(order.createdAt).toLocaleString()
                }
              >
                {order.createdAt &&
                  formatDistance(new Date(order.createdAt), Date.now(), {
                    addSuffix: true
                  })}
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
            navigate('/orders')
          }}
        >
          ALL ORDERS
        </Button>
      </div>
    </React.Fragment>
  )
}
