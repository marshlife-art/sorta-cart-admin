import React from 'react'
import Button from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Title from './Title'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { formatDistance } from 'date-fns/esm'
import useSWR from 'swr'

import { Order } from '../types/Order'
import { supabase } from '../lib/supabaseClient'

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

  const { data: orders, error } = useSWR<OrderData>(
    'dashboard_orders',
    async () => {
      const {
        data,
        error,
        count: totalCount
      } = await supabase
        .from<Order>('Orders')
        .select('*', { count: 'exact' })
        .order('createdAt', { ascending: false })
        .limit(20)

      if (!error && data?.length && totalCount) {
        return {
          data,
          page: 0,
          totalCount
        }
      }

      return {
        data: [],
        page: 0,
        totalCount: 0
      }
    }
  )

  if (error) return <div>failed to load</div>
  if (!orders) return <div>loading...</div>

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
          {orders.data.map((order) => (
            <TableRow
              key={order.id}
              className={classes.rowHover}
              onClick={() => props.history.push(`/orders/edit/${order.id}`)}
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
            props.history.push('/orders')
          }}
        >
          ALL ORDERS
        </Button>
      </div>
    </React.Fragment>
  )
}

export default withRouter(Orders)
