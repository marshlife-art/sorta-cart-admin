import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import CreditIcon from '@material-ui/icons/LocalAtm'
import Link from '@material-ui/core/Link'
import TextField from '@material-ui/core/TextField'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'

import {
  SupaOrderLineItem,
  SupaWholesaleOrder as WholesaleOrder
} from '../types/SupaTypes'
import { LineItemData, GroupedItem } from './EditWholesaleOrder'
import { createOrderCredits, OrderCreditItem } from '../lib/orderService'
import { updateOrderLineItems } from '../services/mutations'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    liTable: {
      marginTop: theme.spacing(4)
    },
    deleteBtn: {
      width: '88px'
    },
    unf: {
      minWidth: '105px'
    },
    groupedRow: {
      backgroundColor: theme.palette.background.default
    },
    groupedRowTotals: theme.typography.h6,
    qtyinput: {
      width: '50px'
    }
  })
)

function toMoney(input: any) {
  if (isNaN(parseFloat(input))) {
    return 0
  }
  return +parseFloat(input).toFixed(2)
}

export default function WholesaleOrderLineItems(props: {
  wholesaleOrder?: WholesaleOrder
  setReload: React.Dispatch<React.SetStateAction<boolean>>
  lineItemData: LineItemData
  setLineItemData: React.Dispatch<React.SetStateAction<LineItemData>>
  setSnackMsg: (value: React.SetStateAction<string>) => void
  setSnackOpen: React.Dispatch<React.SetStateAction<boolean>>
  calcAdjustments: boolean
}) {
  const navigate = useNavigate()

  const classes = useStyles()
  const lineItems = props?.wholesaleOrder?.OrderLineItems

  const {
    lineItemData,
    setLineItemData,
    setSnackMsg,
    setSnackOpen,
    calcAdjustments
  } = props

  const [loading, setLoading] = useState(false)

  function calc() {
    let groupedLineItems: {
      [key: string]: GroupedItem
    } = {}

    setLineItemData((prevData) => ({
      ...prevData,
      productTotal: 0,
      adjustmentTotal: 0,
      orderTotal: 0
    }))

    lineItems?.forEach((li) => {
      const id =
        li.data &&
        li.data.product &&
        `${li.data.product.unf}${li.data.product.upc_code}`
      const key = id ? id : li.description || 'unknown'

      let acc = groupedLineItems[key]

      const qty: number =
        li.data && li.data.product && li.selected_unit === 'EA'
          ? (li.quantity || 1) / (li.data.product.pk || 1)
          : li.quantity || 1

      const qtyUnits =
        li.data && li.data.product && li.selected_unit === 'CS'
          ? (li.quantity || 1) * (li.data.product.pk || 1)
          : li.quantity || 1

      const wsPriceCost = isNaN(Number(li.data?.product?.ws_price_cost))
        ? 0
        : Number(li.data?.product?.ws_price_cost)
      const liTotalCheck = isNaN(Number(li.total)) ? 0 : Number(li.total)
      const liTotal =
        (li.data && li.data.product
          ? +(wsPriceCost * qty).toFixed(2)
          : liTotalCheck) || 0

      groupedLineItems[key] = {
        qtySum: acc ? acc.qtySum + qty : qty,
        qtyUnits: acc ? acc.qtyUnits + qtyUnits : qtyUnits,
        qtyAdjustments: 0,
        totalSum: toMoney(acc ? acc.totalSum + liTotal : liTotal),
        product: li && li.data && li.data.product,
        vendor: li.vendor,
        description: li.description || 'no description',
        line_items: acc ? [...acc.line_items, li] : [li]
      }

      setLineItemData((prevData) => ({
        ...prevData,
        productTotal: prevData.productTotal + parseFloat(`${liTotal}`),
        orderTotal: prevData.orderTotal + liTotal
      }))
    })

    Object.values(groupedLineItems).forEach((item) => {
      // check if qtySum is not a round number (i.e. a partial case)
      if (item.qtySum % 1 !== 0 && item.product) {
        const pk = item.product.pk || 1
        const qty = item.line_items.reduce(
          (acc, v) =>
            acc + (v.selected_unit === 'EA' && v.quantity ? v.quantity : 0),
          0
        )
        // quantity needed to complete a case
        const quantity = Math.abs((qty % pk) - pk)
        const uPriceCost = isNaN(Number(item.product.u_price_cost))
          ? 0
          : Number(item.product.u_price_cost)
        const price = +(quantity * uPriceCost).toFixed(2)

        const total = isNaN(Number(price)) ? 0 : Number(price)
        if (calcAdjustments) {
          item.line_items.push({
            quantity,
            price,
            total,
            kind: 'adjustment',
            description: `add ${quantity} EA`
          })
        }
        // also add to the sums when creating this adjustment.
        item.totalSum = toMoney(item.totalSum + total)
        item.qtySum = Math.round(item.qtySum + quantity / pk)
        item.qtyAdjustments = quantity

        setLineItemData((prevData) => ({
          ...prevData,
          adjustmentTotal: prevData.adjustmentTotal + +total,
          orderTotal: prevData.orderTotal + total
        }))
      } else if (item.line_items && item.product) {
        // okay, so try to figure out if this is a manually added line item (i.e. no orderId)
        const qtyAdjustments = item.line_items.reduce((acc, li) => {
          if (!li.OrderId) {
            const pk = item.product?.pk || 1
            const qty = li.quantity || 1
            acc += pk * qty
          }
          return acc
        }, 0)
        if (qtyAdjustments) {
          item.qtyAdjustments = qtyAdjustments
        }
      }
    })

    setLineItemData((prevData) => ({
      ...prevData,
      groupedLineItems
    }))
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(calc, [lineItems, calcAdjustments])

  async function removeLineItem(item: GroupedItem) {
    const ids = item.line_items.map((li) => Number(li.id)).filter((a) => a)
    if (ids && ids.length && window.confirm('are you sure?')) {
      const { error } = await updateOrderLineItems(
        { WholesaleOrderId: null },
        ids
      )
      if (error) {
        console.warn('[removeLineItem] got error updating OLIs:', error)
      }
      props.setReload(true)
    }
  }

  async function issueOrderCredits(item: GroupedItem) {
    const items: OrderCreditItem[] = item.line_items
      .filter((li) => !!li.OrderId)
      .map((li) => ({
        OrderId: Number(li.OrderId),
        total: li.total || 0,
        description: item.description
      }))

    if (!items || !items.length) {
      return
    }

    if (window.confirm('will issue order credits. are you sure?')) {
      try {
        await createOrderCredits(items)
        setSnackMsg('Store credits created!')
        setSnackOpen(true)
      } catch (e) {
        console.warn('createOrderCredits caught error:', e)
        setSnackMsg(`onoz! error creating credits: ${e}`)
        setSnackOpen(true)
      }
    }
  }

  async function handleQtyChange(
    li: SupaOrderLineItem,
    qtyString: string,
    idx: number
  ) {
    setLoading(true)
    const qty = isNaN(parseInt(qtyString)) ? 1 : parseInt(qtyString)

    const quantity = qty > 0 ? qty : 1
    const { error } = await updateOrderLineItems({ quantity }, [Number(li.id)])

    if (error) {
      setSnackMsg(`error updating line item: ${error.message}`)
      setSnackOpen(true)
    } else {
      props.setReload(true)
    }
    // forgive me for my sinz, this is weird :/
    setTimeout(() => setLoading(false), 2000)
  }

  function tryGetEaQty(li: SupaOrderLineItem): React.ReactNode {
    if (li.data && li.data.product && li.selected_unit === 'EA') {
      const qty = li.quantity || 1
      const pk = li.data.product.pk || 1
      return +(qty / pk).toFixed(2)
    }
    return null
  }

  return (
    <Table size="small" className={classes.liTable}>
      <TableHead>
        <TableRow>
          <TableCell className={classes.deleteBtn} />
          <TableCell className={classes.unf}>unf / upc / plu</TableCell>
          <TableCell>description</TableCell>
          <TableCell>price</TableCell>
          <TableCell>cost</TableCell>
          <TableCell>pk</TableCell>

          <TableCell align="center">qty</TableCell>
          <TableCell align="right">total</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {Object.values(lineItemData.groupedLineItems).map(
          (item: GroupedItem, idx: number) => (
            <React.Fragment key={`wsgli${idx}`}>
              <TableRow className={classes.groupedRow}>
                <TableCell className={classes.deleteBtn}>
                  <Tooltip title="remove line item">
                    <IconButton
                      aria-label="remove line item"
                      onClick={() => removeLineItem(item)}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="give order credits">
                    <IconButton
                      aria-label="issue order credits for this item"
                      onClick={() => issueOrderCredits(item)}
                    >
                      <CreditIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  {item.product && item.product.unf && item.product.unf}

                  {item.product && item.product.upc_code && (
                    <div>
                      <br />
                      {`  ${item.product.upc_code}`}
                    </div>
                  )}
                  {item.product && item.product.plu && (
                    <div>
                      <br />
                      {`  ${item.product.plu}`}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {item.product &&
                    `${item.product.name} ${item.product.description}`}
                  {item.product && (
                    <>
                      <br />
                      {`${item.product.category} > ${item.product.sub_category}`}{' '}
                    </>
                  )}
                </TableCell>
                <TableCell>
                  {item.product && item.product.ws_price}
                  {item.product &&
                  item.product.ws_price !== item.product.u_price ? (
                    <>
                      <br />
                      {`(${item.product.u_price}EA)`}
                    </>
                  ) : (
                    ''
                  )}
                </TableCell>
                <TableCell>
                  {item.product && ` ${item.product.ws_price_cost}`}
                  <br />
                  {item.product &&
                    `${
                      item.product.ws_price_cost !== item.product.u_price_cost
                        ? `(${item.product.u_price_cost}EA)`
                        : ''
                    }`}
                </TableCell>
                <TableCell>{item.product && item.product.pk}</TableCell>

                <TableCell align="center" className={classes.groupedRowTotals}>
                  {+item.qtySum.toFixed(2)}
                </TableCell>
                <TableCell align="right" className={classes.groupedRowTotals}>
                  {item.totalSum.toFixed(2)}
                </TableCell>
              </TableRow>
              {item.line_items.map((li, idx) => (
                <TableRow key={`wsli${li.id}`}>
                  <TableCell colSpan={2} />
                  <TableCell>
                    [{li.kind}] {li.vendor}{' '}
                    {li.data && li.data.product && li.data.product.import_tag
                      ? li.data.product.import_tag
                      : li.description}{' '}
                    {li.OrderId ? (
                      <Link
                        color="secondary"
                        href={`/orders/edit/${li.OrderId}`}
                        onClick={(e: any) => {
                          e.preventDefault()
                          navigate(`/orders/edit/${li.OrderId}`)
                        }}
                      >
                        Order #{li.OrderId}
                      </Link>
                    ) : (
                      li.kind === 'product' && <i>(Manually Added Line Item)</i>
                    )}
                  </TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell>
                    {li.OrderId
                      ? li.kind === 'adjustment'
                        ? `${li.quantity} EA`
                        : `${li.quantity} ${li.selected_unit}`
                      : li.kind !== 'adjustment' && (
                          <TextField
                            className={classes.qtyinput}
                            type="number"
                            InputLabelProps={{
                              shrink: true
                            }}
                            margin="dense"
                            fullWidth
                            value={li.quantity}
                            onChange={async (event: any) =>
                              await handleQtyChange(li, event.target.value, idx)
                            }
                            inputProps={{ min: '1', step: '1' }}
                            disabled={loading}
                          />
                        )}
                  </TableCell>
                  <TableCell align="center">{tryGetEaQty(li)}</TableCell>
                  <TableCell align="right">{li.total}</TableCell>
                </TableRow>
              ))}
            </React.Fragment>
          )
        )}

        <TableRow>
          <TableCell colSpan={2} align="left">
            ITEM COUNT
          </TableCell>
          <TableCell colSpan={2} align="right">
            PRODUCT TOTAL
          </TableCell>
          <TableCell colSpan={2} align="right">
            {calcAdjustments && 'ADJUSTMENTS TOTAL'}
          </TableCell>
          <TableCell
            colSpan={2}
            align="right"
            className={classes.groupedRowTotals}
          >
            TOTAL
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={2} align="left">
            {Object.keys(lineItemData.groupedLineItems).length}
          </TableCell>
          <TableCell colSpan={2} align="right">
            {lineItemData.productTotal.toFixed(2)}
          </TableCell>
          <TableCell colSpan={2} align="right">
            {calcAdjustments && lineItemData.adjustmentTotal.toFixed(2)}
          </TableCell>
          <TableCell
            colSpan={2}
            align="right"
            className={classes.groupedRowTotals}
          >
            {lineItemData.orderTotal.toFixed(2)}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}
