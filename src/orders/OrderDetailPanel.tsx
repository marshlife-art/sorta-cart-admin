import React from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'

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
      paddingTop: theme.spacing(2),
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
      textAlign: 'center'
    }
  })
)

export default function OrderDetailPanel(props: { order: Order }) {
  const classes = useStyles()
  const order = props.order
  const line_items = props.order.OrderLineItems

  return (
    <div className={classes.root}>
      <Grid container direction="row" justify="center" alignItems="center">
        <Grid item xs={6}>
          <div className={classes.gridItem}>
            <Typography
              variant="overline"
              display="block"
              className={classes.gridHeading}
              gutterBottom
            >
              address
            </Typography>
            <Typography variant="body1">{order.address}</Typography>
          </div>
        </Grid>
        <Grid item xs={6}>
          <div className={classes.gridItem}>
            <Typography
              variant="overline"
              display="block"
              className={classes.gridHeading}
              gutterBottom
            >
              notes
            </Typography>
            <Typography variant="body1">{order.notes}</Typography>
          </div>
        </Grid>
      </Grid>

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
                  <TableCell component="th" scope="row">
                    {li.data && li.data.product
                      ? `${li.data.product.name} ${li.data.product.description}`
                      : 'product'}
                  </TableCell>
                  <TableCell align="right">{li.quantity}</TableCell>
                  <TableCell align="right">{li.total}</TableCell>
                </TableRow>
              )
          )}

          {line_items.map(
            (li, idx) =>
              li.kind === 'adjustment' && (
                <TableRow key={`orderli${idx}`}>
                  <TableCell component="th" scope="row">
                    [{li.kind}]{li.description}
                  </TableCell>
                  <TableCell align="right">{li.quantity}</TableCell>
                  <TableCell align="right">{li.total}</TableCell>
                </TableRow>
              )
          )}
        </TableBody>
      </Table>
    </div>
  )
}
