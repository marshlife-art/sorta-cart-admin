import React from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDistance } from 'date-fns'
import Button from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'

import Title from './Title'
import { SupaWholesaleOrder as WholesaleOrder } from '../types/SupaTypes'
import { useWholesaleOrdersDashboard } from '../services/hooks/wholesaleorders'

interface WholesaleOrderData {
  data: WholesaleOrder[]
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

export default function WholesaleOrders() {
  const navigate = useNavigate()
  const classes = useStyles()

  const { wholesaleOrders, isError, isLoading } = useWholesaleOrdersDashboard()

  if (isError) return <div>failed to load</div>
  if (isLoading) return <div>loading...</div>

  return (
    <React.Fragment>
      <Title>recent wholesale orders</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>created</TableCell>
            <TableCell>vendor</TableCell>
            <TableCell>status</TableCell>
            {/* <TableCell>payment status</TableCell>
            <TableCell>shipment status</TableCell>
           <TableCell>items</TableCell>
            <TableCell>subtotal</TableCell>
            <TableCell align="right">total</TableCell> */}
          </TableRow>
        </TableHead>
        <TableBody>
          {wholesaleOrders?.data?.map((order) => (
            <TableRow
              key={order.id}
              className={classes.rowHover}
              onClick={() => navigate(`/wholesaleorders/edit/${order.id}`)}
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
              <TableCell>{order.vendor}</TableCell>
              <TableCell>{order.status}</TableCell>
              {/*<TableCell>{order.payment_status}</TableCell>
              <TableCell>{order.shipment_status}</TableCell>
               <TableCell>{order.item_count}</TableCell>
              <TableCell>{order.subtotal}</TableCell>
              <TableCell align="right">{order.total}</TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className={classes.seeMore}>
        <Button
          variant="contained"
          color="primary"
          onClick={(event: any) => {
            navigate('/wholesaleorders')
          }}
        >
          SEE MORE
        </Button>
      </div>
    </React.Fragment>
  )
}
