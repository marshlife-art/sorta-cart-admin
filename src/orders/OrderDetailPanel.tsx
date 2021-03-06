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
    },
    squareLink: {
      marginLeft: '1em'
    }
  })
)

export default function OrderDetailPanel(props: { order: Order }) {
  const classes = useStyles()
  const order = props.order
  const line_items = props.order.OrderLineItems || []
  const adjustments = line_items.filter(
    (li) =>
      li.kind !== 'product' && li.kind !== 'payment' && li.kind !== 'credit'
  )
  const payments = line_items.filter((li) => li.kind === 'payment')
  const paymentsTotal = payments.reduce(
    (acc, v) => acc + parseFloat(`${v.total}`),
    0
  )
  const credits = line_items.filter((li) => li.kind === 'credit')
  const creditsTotal = credits.reduce(
    (acc, v) => acc + parseFloat(`${v.total}`),
    0
  )
  const balance =
    parseFloat(`${order.total}`) +
    parseFloat(`${creditsTotal}`) +
    parseFloat(`${paymentsTotal}`)

  return (
    <div className={classes.root}>
      <Table aria-label="order details table" size="small">
        <TableHead>
          <TableRow>
            <TableCell component="th">
              Line Items ({order.item_count})
            </TableCell>
            <TableCell component="th" align="right">
              on hand
            </TableCell>
            <TableCell component="th" align="right">
              price
            </TableCell>
            <TableCell component="th" align="right">
              unit
            </TableCell>
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
                    {li.description}
                    {li.data && li.data.product
                      ? ` ${li.data.product.unf}`
                      : ''}
                  </TableCell>
                  <TableCell align="right">
                    {li.status === 'on_hand' ? 'x' : ''}
                  </TableCell>
                  <TableCell align="right">{li.price}</TableCell>
                  <TableCell align="right">{li.selected_unit}</TableCell>
                  <TableCell align="right">{li.quantity}</TableCell>
                  <TableCell align="right">{li.total}</TableCell>
                </TableRow>
              )
          )}

          <TableRow>
            <TableCell component="td" scope="row" colSpan={3} />
            <TableCell component="td" scope="row" align="right">
              <b>Sub Total</b>
            </TableCell>
            <TableCell component="td" scope="row" align="right">
              {order.subtotal}
            </TableCell>
          </TableRow>

          {adjustments.length > 0 && (
            <TableRow>
              <TableCell component="td" scope="row">
                <b>Adjustments</b>
              </TableCell>
            </TableRow>
          )}
          {adjustments.map((li, idx) => (
            <TableRow key={`orderli${idx}`}>
              <TableCell component="td" scope="row" colSpan={3}>
                {`(${li.kind}) `} {li.description}
              </TableCell>
              <TableCell align="right">{li.quantity}</TableCell>
              <TableCell align="right">{li.total}</TableCell>
            </TableRow>
          ))}

          <TableRow>
            <TableCell component="td" scope="row" colSpan={3} />
            <TableCell component="td" scope="row" align="right">
              <b>Total</b>
            </TableCell>
            <TableCell component="td" scope="row" align="right">
              {order.total}
            </TableCell>
          </TableRow>

          {payments && payments.length > 0 && (
            <TableRow>
              <TableCell component="td" scope="row">
                <b>Payments</b>
              </TableCell>
            </TableRow>
          )}
          {payments.map((li, idx) => (
            <TableRow key={`orderli${idx}`}>
              <TableCell component="td" scope="row" colSpan={3}>
                {li.description}
                {li.data && li.data.payment && li.data.payment.receipt_number && (
                  <Link
                    className={classes.squareLink}
                    color="secondary"
                    href={li.data.payment.receipt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {li.data.payment.receipt_number}
                  </Link>
                )}
              </TableCell>
              <TableCell align="right">{li.quantity}</TableCell>
              <TableCell align="right">{li.total}</TableCell>
            </TableRow>
          ))}

          {credits && credits.length > 0 && (
            <TableRow>
              <TableCell component="td" scope="row">
                <b>Credits</b>
              </TableCell>
            </TableRow>
          )}
          {credits.map((li, idx) => (
            <TableRow key={`orderli${idx}`}>
              <TableCell component="td" scope="row" colSpan={3}>
                {li.description}
              </TableCell>
              <TableCell align="right">{li.quantity}</TableCell>
              <TableCell align="right">{li.total}</TableCell>
            </TableRow>
          ))}

          {balance > 0 && (
            <TableRow>
              <TableCell component="td" scope="row" colSpan={3} />
              <TableCell component="td" scope="row" align="right">
                <b>Balance Due</b>
              </TableCell>
              <TableCell component="td" scope="row" align="right">
                {balance.toFixed(2)}
              </TableCell>
            </TableRow>
          )}

          {balance < 0 && (
            <TableRow>
              <TableCell component="td" scope="row" colSpan={3} />
              <TableCell component="td" scope="row" align="right">
                <b>Credit Owed</b>
              </TableCell>
              <TableCell component="td" scope="row" align="right">
                {Math.abs(balance).toFixed(2)}
              </TableCell>
            </TableRow>
          )}
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
              <Link color="secondary" href={`mailto:${order.email}`}>
                {order.email}
              </Link>
              <br />
              <Link color="secondary" href={`tel:${order.phone}`}>
                {order.phone}
              </Link>
              <br />
              {order.address} <br />
            </Typography>
          </div>
        </Grid>
        {order.User && order.User !== order.Member && (
          <Grid item xs={4}>
            <div className={classes.gridItem}>
              <Typography
                variant="overline"
                display="block"
                className={classes.gridHeading}
                gutterBottom
              >
                created by
              </Typography>
              <Typography variant="body1">
                <Link color="secondary" href={`mailto:${order.User.email}`}>
                  {order.User.email}
                </Link>{' '}
                {order.User.role && <>({order.User.role}) </>}
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
