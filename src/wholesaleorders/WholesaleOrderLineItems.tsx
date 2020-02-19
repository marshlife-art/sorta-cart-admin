import React, { useEffect } from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Link from '@material-ui/core/Link'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'

import { LineItemData, GroupedItem } from './EditWholesaleOrder'
import { WholesaleOrder } from '../types/WholesaleOrder'
import { API_HOST } from '../constants'

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
    groupedRowTotals: theme.typography.h6
  })
)

function WholesaleOrderLineItems(
  props: {
    wholesaleOrder?: WholesaleOrder
    setReload: React.Dispatch<React.SetStateAction<boolean>>
    lineItemData: LineItemData
    setLineItemData: React.Dispatch<React.SetStateAction<LineItemData>>
  } & RouteComponentProps
) {
  const classes = useStyles()
  const token = localStorage && localStorage.getItem('token')
  const lineItems = props?.wholesaleOrder?.OrderLineItems
  const { lineItemData, setLineItemData } = props

  function calc() {
    let groupedLineItems: {
      [key: string]: GroupedItem
    } = {}

    setLineItemData(prevData => ({
      ...prevData,
      productTotal: 0,
      adjustmentTotal: 0,
      orderTotal: 0
    }))

    lineItems?.forEach(li => {
      const id =
        li.data &&
        li.data.product &&
        `${li.data.product.unf}${li.data.product.upc_code}`
      const key = id ? id : li.description

      let acc = groupedLineItems[key]

      const qty =
        li.data && li.data.product && li.selected_unit === 'EA'
          ? li.quantity / li.data.product.pk
          : li.quantity

      const liTotal =
        li.data && li.data.product
          ? +(parseFloat(li.data.product.ws_price_cost) * qty).toFixed(2)
          : li.total

      groupedLineItems[key] = {
        qtySum: acc ? acc.qtySum + qty : qty,
        totalSum: acc ? acc.totalSum + liTotal : liTotal,
        product: li && li.data && li.data.product,
        vendor: li.vendor,
        description: li.description,
        line_items: acc ? [...acc.line_items, li] : [li]
      }

      setLineItemData(prevData => ({
        ...prevData,
        productTotal: prevData.productTotal + parseFloat(`${liTotal}`),
        orderTotal: prevData.orderTotal + liTotal
      }))
    })

    Object.values(groupedLineItems).forEach(item => {
      // check if qtySum is not a round number (i.e. a partial case)
      if (item.qtySum % 1 !== 0 && item.product) {
        const pk = item.product.pk
        const qty = item.line_items.reduce((acc, v) => acc + v.quantity, 0)
        // quantity needed to complete a case
        const quantity = Math.abs((qty % pk) - pk)
        const price = +(
          quantity * parseFloat(item.product.u_price_cost)
        ).toFixed(2)

        const total = price
        item.line_items.push({
          quantity,
          price,
          total,
          kind: 'adjustment',
          description: `add ${quantity} EA`
        })
        // also add to the sums when creating this adjustment.
        item.totalSum = item.totalSum + total
        item.qtySum = Math.round(item.qtySum + quantity / pk)

        setLineItemData(prevData => ({
          ...prevData,
          adjustmentTotal: prevData.adjustmentTotal + +total,
          orderTotal: prevData.orderTotal + total
        }))
      }
    })

    setLineItemData(prevData => ({
      ...prevData,
      groupedLineItems
    }))
  }

  useEffect(calc, [lineItems])

  function removeLineItem(item: GroupedItem) {
    const ids = item.line_items.map(li => li.id).filter(a => a)
    if (ids && ids.length && window.confirm('are you sure?')) {
      fetch(`${API_HOST}/wholesaleorder/removelineitem`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ids })
      })
        .then(response => response.json())
        .then(response => !response.error && props.setReload(true))
        .catch(err => console.warn('members removelineitem caught err', err))
    }
  }

  return (
    <Table size="small" className={classes.liTable}>
      <TableHead>
        <TableRow>
          <TableCell className={classes.deleteBtn} />
          <TableCell className={classes.unf}>unf</TableCell>
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
                  <Tooltip title="remove these line item(s)">
                    <IconButton
                      aria-label="remove these line item(s)"
                      onClick={() => removeLineItem(item)}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  {item.product &&
                    `${
                      item.product.unf
                        ? item.product.unf
                        : item.product.upc_code
                    } `}
                </TableCell>
                <TableCell>
                  {item.product &&
                    `${item.product.name} ${item.product.description}`}
                  {item.product && (
                    <>
                      <br />
                      {`${item.product.upc_code} ${item.product.category} > ${item.product.sub_category}`}{' '}
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
              {item.line_items.map(li => (
                <TableRow key={`wsli${li.id}`}>
                  <TableCell colSpan={2} />
                  <TableCell>
                    [{li.kind}] {li.vendor}{' '}
                    {li.data && li.data.product && li.data.product.import_tag
                      ? li.data.product.import_tag
                      : li.description}{' '}
                    {li.OrderId && (
                      <Link
                        color="secondary"
                        href=""
                        onClick={(e: any) => {
                          e.preventDefault()
                          props.history.push(`/orders/edit/${li.OrderId}`)
                        }}
                      >
                        Order #{li.OrderId}
                      </Link>
                    )}
                  </TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell>
                    {li.kind === 'adjustment'
                      ? `${li.quantity} EA`
                      : `${li.quantity} ${li.selected_unit}`}
                  </TableCell>
                  <TableCell align="center">
                    {li.data && li.data.product && li.selected_unit === 'EA'
                      ? +(li.quantity / li.data.product.pk).toFixed(2)
                      : null}
                  </TableCell>
                  <TableCell align="right">{li.total}</TableCell>
                </TableRow>
              ))}
            </React.Fragment>
          )
        )}

        <TableRow>
          <TableCell colSpan={2} align="center">
            ITEM COUNT
          </TableCell>
          <TableCell colSpan={2} align="right">
            PRODUCT TOTAL
          </TableCell>
          <TableCell colSpan={2} align="right">
            ADJUSTMENTS TOTAL
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
          <TableCell colSpan={2} align="center">
            {Object.keys(lineItemData.groupedLineItems).length}
          </TableCell>
          <TableCell colSpan={2} align="right">
            {lineItemData.productTotal.toFixed(2)}
          </TableCell>
          <TableCell colSpan={2} align="right">
            {lineItemData.adjustmentTotal.toFixed(2)}
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

export default withRouter(WholesaleOrderLineItems)
