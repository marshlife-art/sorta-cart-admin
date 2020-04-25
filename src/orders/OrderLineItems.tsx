import React, { useEffect } from 'react'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import ClearIcon from '@material-ui/icons/Clear'

import { LineItem } from '../types/Order'
import { TAX_RATE, TAX_RATE_STRING } from '../constants'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      overflowX: 'auto',
      height: '100%'
    },
    table: {
      maxWidth: '95vw',
      padding: theme.spacing(1),
      borderCollapse: 'separate',
      '& td': {
        border: 'none'
      }
    },
    qtyinput: {
      width: '50px'
    }
  })
)

function usdFormat(num: number | string) {
  if (num === undefined) {
    return '0.00'
  }
  if (typeof num === 'string') {
    return `$${parseFloat(num).toFixed(2)}`
  } else {
    return `$${num.toFixed(2)}`
  }
}

function subtotal(items: LineItem[]) {
  return items
    .filter((li) => li.kind === 'product')
    .map(({ total }) => (typeof total === 'string' ? parseFloat(total) : total))
    .reduce((sum, i) => sum + i, 0)
}

function adjustmentsTotal(items: LineItem[]) {
  return items
    .filter((li) => li.kind === 'adjustment')
    .map(({ total }) => (typeof total === 'string' ? parseFloat(total) : total))
    .reduce((sum, i) => sum + i, 0)
}

function liTotal(line_item: LineItem): number {
  const u_price =
    line_item.data && line_item.data.product && line_item.data.product.u_price
      ? parseFloat(line_item.data.product.u_price)
      : line_item.price
  const ws_price =
    line_item.data && line_item.data.product
      ? parseFloat(line_item.data.product.ws_price)
      : line_item.price

  return line_item.selected_unit === 'EA' && u_price
    ? isNaN(line_item.quantity * u_price)
      ? 0.0
      : line_item.quantity * u_price
    : isNaN(line_item.quantity * ws_price)
    ? 0.0
    : line_item.quantity * ws_price
}

function liPkSize(line_item: LineItem): string {
  const pksize = []
  line_item.data &&
    line_item.data.product &&
    line_item.data.product.pk &&
    line_item.data.product.pk !== 1 &&
    pksize.push(line_item.data.product.pk)
  line_item.data &&
    line_item.data.product &&
    line_item.data.product.size &&
    pksize.push(line_item.data.product.size)
  return pksize.join(' / ')
}

function OrderLineItems(props: {
  line_items: LineItem[]
  onLineItemUpdated: (idx: number, line_item: LineItem) => void
  removeLineItem: (idx: number) => void
  onTaxesChange: (amount: number) => void
  onTotalChange: (total: number) => void
  onSubTotalChange: (subtotal: number) => void
}) {
  const classes = useStyles()

  const orderSubtotal = subtotal(props.line_items)
  const orderAdjustmentsTotal = adjustmentsTotal(props.line_items)
  const orderTaxes = TAX_RATE * (orderSubtotal + orderAdjustmentsTotal)
  const orderTotal = orderTaxes + orderSubtotal + orderAdjustmentsTotal

  const { onTaxesChange, onTotalChange, onSubTotalChange } = props
  useEffect(() => {
    onTaxesChange(orderTaxes)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderTaxes]) // adding onTaxesChange here causes infinite loopz

  useEffect(() => {
    onTotalChange(orderTotal)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderTotal]) // adding onTotalChange causes infinite loopz :/

  useEffect(() => {
    onSubTotalChange(orderSubtotal)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderSubtotal])

  const handleUnitChange = (line_item: LineItem, unit: string) => {
    line_item.selected_unit = unit
    if (line_item.data && line_item.data.product) {
      line_item.price =
        unit === 'CS'
          ? +line_item.data.product.ws_price
          : +line_item.data.product.u_price
    }
    line_item.total = liTotal(line_item)
    const idx = props.line_items.indexOf(line_item)
    props.onLineItemUpdated(idx, line_item)
  }

  const handleQtyChange = (line_item: LineItem, quantity: number) => {
    line_item.quantity = quantity > 0 ? quantity : 1
    line_item.total = liTotal(line_item)
    const idx = props.line_items.indexOf(line_item)
    props.onLineItemUpdated(idx, line_item)
  }

  const handleDescriptionChange = (
    line_item: LineItem,
    description: string
  ) => {
    line_item.description = description
    const idx = props.line_items.indexOf(line_item)
    props.onLineItemUpdated(idx, line_item)
  }

  const handlePriceChange = (line_item: LineItem, price: number) => {
    line_item.price = price
    line_item.total = liTotal(line_item)
    const idx = props.line_items.indexOf(line_item)
    props.onLineItemUpdated(idx, line_item)
  }

  const removeLineItem = (line_item: LineItem) => {
    const idx = props.line_items.indexOf(line_item)
    props.removeLineItem(idx)
  }

  const adjustments = props.line_items.filter((li) => li.kind === 'adjustment')
  const payments = props.line_items.filter((li) => li.kind === 'payment')

  return (
    <Paper className={classes.root}>
      <Table className={classes.table} aria-label="cart">
        <TableHead>
          <TableRow>
            <TableCell align="center"></TableCell>
            <TableCell>Description</TableCell>
            <TableCell align="center">Price</TableCell>
            <TableCell align="center">Unit</TableCell>
            <TableCell align="center">Qty.</TableCell>
            <TableCell align="center">Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.line_items.map(
            (line_item, idx) =>
              line_item.kind === 'product' && (
                <TableRow key={`li${idx}`}>
                  <TableCell align="center">
                    <Tooltip title="remove line item">
                      <IconButton
                        aria-label="delete"
                        size="small"
                        onClick={(event: any) => removeLineItem(line_item)}
                      >
                        <ClearIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{line_item.description}</TableCell>
                  <TableCell align="right">
                    <div>
                      {line_item.data &&
                      line_item.data.product &&
                      line_item.selected_unit === 'EA' &&
                      line_item.data.product.u_price
                        ? usdFormat(line_item.data.product.u_price)
                        : usdFormat(
                            line_item.data && line_item.data.product
                              ? line_item.data.product.ws_price
                              : line_item.price
                          )}
                    </div>
                    <div>{liPkSize(line_item)}</div>
                  </TableCell>
                  <TableCell align="center">
                    {line_item.data &&
                    line_item.data.product &&
                    line_item.data.product.u_price &&
                    line_item.data.product.u_price !==
                      line_item.data.product.ws_price ? (
                      <Select
                        value={line_item.selected_unit}
                        onChange={(event: any) =>
                          handleUnitChange(line_item, event.target.value)
                        }
                        margin="dense"
                      >
                        <MenuItem value="CS">Case</MenuItem>
                        <MenuItem value="EA">Each</MenuItem>
                      </Select>
                    ) : line_item.data &&
                      line_item.data.product &&
                      line_item.data.product.unit_type === 'CS' ? (
                      'Case'
                    ) : (
                      'Each'
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      className={classes.qtyinput}
                      type="number"
                      InputLabelProps={{
                        shrink: true
                      }}
                      margin="dense"
                      fullWidth
                      value={line_item.quantity}
                      onChange={(event: any) =>
                        handleQtyChange(line_item, event.target.value)
                      }
                      inputProps={{ min: '1', step: '1' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {usdFormat(line_item.total)}
                  </TableCell>
                </TableRow>
              )
          )}
          <TableRow>
            <TableCell rowSpan={1} colSpan={3} />
            <TableCell align="right">Subtotal</TableCell>
            <TableCell align="center">
              {props.line_items && props.line_items.length}
            </TableCell>
            <TableCell align="right">{usdFormat(orderSubtotal)}</TableCell>
          </TableRow>
          {adjustments.map((line_item, idx) => (
            <TableRow key={`li${idx}`}>
              <TableCell align="center">
                <Tooltip title="remove adjustment">
                  <IconButton
                    aria-label="delete"
                    size="small"
                    onClick={(event: any) => removeLineItem(line_item)}
                  >
                    <ClearIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              </TableCell>
              <TableCell colSpan={2}>
                <TextField
                  type="text"
                  InputLabelProps={{
                    shrink: true
                  }}
                  margin="dense"
                  fullWidth
                  value={line_item.description}
                  onChange={(event: any) =>
                    handleDescriptionChange(line_item, event.target.value)
                  }
                />
              </TableCell>
              <TableCell>
                <TextField
                  type="number"
                  margin="dense"
                  fullWidth
                  value={line_item.price || line_item.total}
                  onChange={(event: any) =>
                    handlePriceChange(line_item, event.target.value)
                  }
                  inputProps={{
                    min: '-9999',
                    max: '9999',
                    step: '1'
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    )
                  }}
                />
              </TableCell>

              <TableCell align="right">
                <TextField
                  className={classes.qtyinput}
                  type="number"
                  InputLabelProps={{
                    shrink: true
                  }}
                  margin="dense"
                  fullWidth
                  value={line_item.quantity}
                  onChange={(event: any) =>
                    handleQtyChange(line_item, event.target.value)
                  }
                  inputProps={{ min: '1', step: '1' }}
                />
              </TableCell>
              <TableCell align="right">{usdFormat(line_item.total)}</TableCell>
            </TableRow>
          ))}

          <TableRow>
            <TableCell rowSpan={1} colSpan={3} />
            <TableCell align="right">Tax</TableCell>
            <TableCell align="center">{TAX_RATE_STRING}</TableCell>
            <TableCell align="right">{usdFormat(orderTaxes)}</TableCell>
          </TableRow>

          {payments.map((line_item, idx) => (
            <TableRow key={`li${idx}`}>
              <TableCell align="center">
                <Tooltip title="remove adjustment">
                  <IconButton
                    aria-label="delete"
                    size="small"
                    onClick={(event: any) => removeLineItem(line_item)}
                  >
                    <ClearIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              </TableCell>
              <TableCell colSpan={2}>
                <TextField
                  type="text"
                  InputLabelProps={{
                    shrink: true
                  }}
                  margin="dense"
                  fullWidth
                  value={line_item.description}
                  onChange={(event: any) =>
                    handleDescriptionChange(line_item, event.target.value)
                  }
                />
              </TableCell>
              <TableCell>
                <TextField
                  type="number"
                  margin="dense"
                  fullWidth
                  value={line_item.price || line_item.total}
                  onChange={(event: any) =>
                    handlePriceChange(line_item, event.target.value)
                  }
                  inputProps={{
                    min: '-9999',
                    max: '-0.01',
                    step: '0.01'
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    )
                  }}
                />
              </TableCell>

              <TableCell align="right">
                <TextField
                  className={classes.qtyinput}
                  type="number"
                  InputLabelProps={{
                    shrink: true
                  }}
                  margin="dense"
                  fullWidth
                  value={line_item.quantity}
                  onChange={(event: any) =>
                    handleQtyChange(line_item, event.target.value)
                  }
                  inputProps={{ min: '1', step: '1' }}
                />
              </TableCell>
              <TableCell align="right">{usdFormat(line_item.total)}</TableCell>
            </TableRow>
          ))}

          <TableRow>
            <TableCell rowSpan={1} colSpan={3} />
            <TableCell align="right">Total</TableCell>
            <TableCell align="right" colSpan={2}>
              <b>{usdFormat(orderTotal)}</b>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Paper>
  )
}

export default OrderLineItems
