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
  let groupedLineItems: {
    [key: string]: GroupedItem
  } = {}
  lineItems?.forEach(li => {
    const id = li.data && li.data.product && li.data.product.id
    const key = id ? id : li.description
    // ain't no(tsc)body tell me nothin'
    const liTotal = parseFloat((li.total as unknown) as string)
    let acc = groupedLineItems[key]
    groupedLineItems[key] = {
      qtySum: acc ? acc.qtySum + li.quantity : li.quantity,
      totalSum: acc ? acc.totalSum + liTotal : liTotal,
      product: li && li.data && li.data.product,
      vendor: li.vendor,
      description: li.description,
      line_items: acc ? [...acc.line_items, li] : [li]
    }
    orderTotal = orderTotal + liTotal
  })

  orderTotal = orderTotal

  console.log(' groupedLineItems:', groupedLineItems)
  return (
    <Table size="small" className={classes.liTable}>
      <TableHead>
        <TableRow>
          <TableCell className={classes.unf}>unf</TableCell>
          <TableCell>description</TableCell>
          <TableCell>price</TableCell>
          <TableCell>pk</TableCell>
          <TableCell align="center">qty</TableCell>
          <TableCell align="right">total</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {Object.values(groupedLineItems).map(
          (item: GroupedItem, idx: number) => (
            <>
              <TableRow key={`wsgli${idx}`} className={classes.groupedRow}>
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
                    `${item.product.category} ${item.product.sub_category} ${item.product.name} ${item.product.description}`}
                  {item.product && (
                    <>
                      <br />
                      {`${item.product.upc_code}`}
                    </>
                  )}
                </TableCell>
                <TableCell>
                  {item.product && ` ${item.product.ws_price}`}
                  <br />
                  {item.product &&
                    `${
                      item.product.ws_price !== item.product.u_price
                        ? `(${item.product.u_price}EA)`
                        : ''
                    }`}
                </TableCell>
                <TableCell>{item.product && item.product.pk}</TableCell>
                <TableCell align="center" className={classes.groupedRowTotals}>
                  {item.qtySum}
                </TableCell>
                <TableCell align="right" className={classes.groupedRowTotals}>
                  {item.totalSum.toFixed(2)}
                </TableCell>
              </TableRow>
              {item.line_items.map(li => (
                <TableRow key={`wsli${li.id}`}>
                  <TableCell />
                  <TableCell>{li.vendor}</TableCell>
                  <TableCell>{li.selected_unit}</TableCell>
                  <TableCell />
                  <TableCell align="center">{li.quantity}</TableCell>
                  <TableCell align="right">{li.total}</TableCell>
                </TableRow>
              ))}
            </>
          )
        )}

        <TableRow>
          <TableCell colSpan={4}></TableCell>
          <TableCell
            colSpan={2}
            align="center"
            className={classes.groupedRowTotals}
          >
            TOTAL
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={4}></TableCell>
          <TableCell className={classes.groupedRowTotals} align="center">
            {Object.keys(groupedLineItems).length}
          </TableCell>
          <TableCell align="right" className={classes.groupedRowTotals}>
            {orderTotal.toFixed(2)}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

    // <div>
    //   <h4>line itemz {lineItems && lineItems.length}</h4>
    //   {lineItems &&
    //     lineItems.map((li, idx) => {
    //       return (
    //         <div key={`wsoli${idx}`}>
    //           <h5>LINE ITEM</h5>
    //           {li.vendor}
    //           {li.description}
    //           {li.quantity}
    //           {li.total}

    //         </div>
    //       )
    //     })}
    // </div>
  )
}
