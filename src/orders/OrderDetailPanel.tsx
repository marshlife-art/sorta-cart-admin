import React from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Link from '@material-ui/core/Link'

import { Order } from '../types/Order'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      marginRight: theme.spacing(2),
      borderLeft: `${theme.spacing(6)}px solid ${theme.palette.divider}`
    },
    gridHeading: {
      color: theme.palette.text.secondary
    },
    gridItem: {
      paddingBottom: theme.spacing(2),
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
      textAlign: 'center'
    },
    lastUpdated: {
      marginLeft: theme.spacing(2)
    }
  })
)

export default function OrderDetailPanel(props: { order: Order }) {
  const classes = useStyles()
  const order = props.order
  const line_items = props.order.OrderLineItems || []
  const adjustments = line_items.filter(li => li.kind !== 'product')

  return (
    <div className={classes.root}>
      <Table aria-label="order details table" size="small">
        <TableHead>
          <TableRow>
            <TableCell component="th">Line Items</TableCell>
            <TableCell component="th" align="right">
              qty
            </TableCell>
            <TableCell component="th" align="right">
              total
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {line_items.map(
            (li, idx) =>
              li.kind === 'product' && (
                <TableRow key={`orderli${idx}`}>
                  <TableCell component="td" scope="row">
                    {li.vendor && `[${li.vendor}] `}
                    {li.data && li.data.product
                      ? `${li.data.product.name} ${li.data.product.description}`
                      : 'product'}
                  </TableCell>
                  <TableCell align="right">{li.quantity}</TableCell>
                  <TableCell align="right">{li.total}</TableCell>
                </TableRow>
              )
          )}

          {adjustments.length > 0 && (
            <TableRow>
              <TableCell component="td" scope="row">
                <b>Adjustments</b>
              </TableCell>
            </TableRow>
          )}
          {adjustments.map((li, idx) => (
            <TableRow key={`orderli${idx}`}>
              <TableCell component="td" scope="row">
                {`(${li.kind}) `} {li.description}
              </TableCell>
              <TableCell align="right">{li.quantity}</TableCell>
              <TableCell align="right">{li.total}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Grid container direction="row" justify="center" alignItems="flex-start">
        <Grid item xs={4}>
          <div className={classes.gridItem}>
            <Typography
              variant="overline"
              display="block"
              className={classes.gridHeading}
              gutterBottom
            >
              customer
            </Typography>
            <Typography variant="body1">
              {order.name}{' '}
              <Link color="primary" href={`mailto:${order.email}`}>
                {order.email}
              </Link>
              <br />
              <Link color="primary" href={`tel:${order.phone}`}>
                {order.phone}
              </Link>
              <br />
              {order.address} <br />
            </Typography>
          </div>
        </Grid>
        {order.User && (
          <Grid item xs={4}>
            <div className={classes.gridItem}>
              <Typography
                variant="overline"
                display="block"
                className={classes.gridHeading}
                gutterBottom
              >
                user
              </Typography>
              <Typography variant="body1">
                {order.User.name}{' '}
                <Link color="primary" href={`mailto:${order.User.email}`}>
                  {order.User.email}
                </Link>{' '}
                <br />
                {order.User.phone && (
                  <>
                    <Link color="primary" href={`tel:${order.User.phone}`}>
                      {order.User.phone}
                    </Link>{' '}
                    <br />
                  </>
                )}
                {order.User.address && <>{order.User.address} </>}
              </Typography>
            </div>
          </Grid>
        )}
        <Grid item xs={4}>
          <div className={classes.gridItem}>
            <Typography
              variant="overline"
              display="block"
              className={classes.gridHeading}
              gutterBottom
            >
              notes
            </Typography>
            <Typography variant="body2">{order.notes}</Typography>
          </div>
        </Grid>
      </Grid>
      {order.createdAt !== order.updatedAt && (
        <div className={classes.lastUpdated}>
          <i>Last updated</i> {new Date(order.updatedAt).toLocaleString()}
        </div>
      )}
    </div>
  )
}
