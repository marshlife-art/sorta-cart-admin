import React from 'react'
import { LineItem } from '../types/Order'

export default function WholesaleOrderLineItems(props: {
  lineItems?: LineItem[]
}) {
  const { lineItems } = props
  return (
    <div>
      <h4>line itemz {lineItems && lineItems.length}</h4>
      {lineItems &&
        lineItems.map((li, idx) => {
          return (
            <div key={`wsoli${idx}`}>
              <h5>LINE ITEM</h5>
              {li.vendor}
              {li.description}
              {li.quantity}
              {li.total}
              {li.data &&
                li.data.product &&
                `${li.data.product.name} ${li.data.product.description}`}
            </div>
          )
        })}
    </div>
  )
}
