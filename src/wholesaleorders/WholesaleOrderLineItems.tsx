import React from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'

import { LineItem } from '../types/Order'
import { Product } from '../types/Product'
import { WholesaleOrder } from '../types/WholesaleOrder'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    liTable: {
      marginTop: theme.spacing(4)
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

interface GroupedItem {
  qtySum: number
  totalSum: number
  // id: number | undefined
  product: Product | undefined
  vendor: string | undefined
  description: string
  line_items: LineItem[]
}

export default function WholesaleOrderLineItems(props: {
  wholesaleOrder?: WholesaleOrder
}) {
  const classes = useStyles()
  const lineItems = props?.wholesaleOrder?.OrderLineItems
  // console.log('wholesaleOrder:', props?.wholesaleOrder)
  let orderTotal: number = 0
  let productTotal: number = 0
  let adjustmentTotal: number = 0
  let groupedLineItems: {
    [key: string]: GroupedItem
  } = {}

  lineItems?.forEach(li => {
    const id = li.data && li.data.product && li.data.product.id
    const key = id ? id : li.description

    let acc = groupedLineItems[key]

    const qty =
      li.data && li.data.product && li.selected_unit === 'EA'
        ? li.quantity / li.data.product.pk
        : li.quantity

    // ain't no(tsc)body tell me nothin'
    // const liTotal = parseFloat((li.total as unknown) as string)
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
    productTotal = productTotal + parseFloat(`${liTotal}`)
    orderTotal = orderTotal + liTotal
  })

  Object.values(groupedLineItems).forEach(item => {
    // check if qtySum is not a round number (i.e. a partial case)
    if (item.qtySum % 1 !== 0 && item.product) {
      const pk = item.product.pk
      const qty = item.line_items.reduce((acc, v) => acc + v.quantity, 0)
      // quantity needed to complete a case
      const quantity = Math.abs((qty % pk) - pk)
      const price = +(quantity * parseFloat(item.product.u_price_cost)).toFixed(
        2
      )

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
      orderTotal = orderTotal + total
      adjustmentTotal = adjustmentTotal + total
    }
  })

  // console.log(' groupedLineItems:', groupedLineItems)
  return (
    <Table size="small" className={classes.liTable}>
      <TableHead>
        <TableRow>
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
        {Object.values(groupedLineItems).map(
          (item: GroupedItem, idx: number) => (
            <React.Fragment key={`wsgli${idx}`}>
              <TableRow className={classes.groupedRow}>
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
                  <TableCell />
                  <TableCell>
                    [{li.kind}] {li.vendor}{' '}
                    {li.data && li.data.product && li.data.product.import_tag
                      ? li.data.product.import_tag
                      : li.description}
                    {li.OrderId && ` Order #${li.OrderId}`}
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
          <TableCell align="center">ITEM COUNT</TableCell>
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
          <TableCell align="center">
            {Object.keys(groupedLineItems).length}
          </TableCell>
          <TableCell colSpan={2} align="right">
            {productTotal.toFixed(2)}
          </TableCell>
          <TableCell colSpan={2} align="right">
            {adjustmentTotal.toFixed(2)}
          </TableCell>
          <TableCell
            colSpan={2}
            align="right"
            className={classes.groupedRowTotals}
          >
            {orderTotal.toFixed(2)}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}
