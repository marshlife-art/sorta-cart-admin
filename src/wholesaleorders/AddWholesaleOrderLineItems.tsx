// import React, { useState } from 'react'
// import { Button } from '@material-ui/core'

// export default function AddWholesaleOrderLineItems() {
//   const [showTable, setShowTable] = useState(false)

//   return (
//     <div>
//       <Button onClick={() => setShowTable(!showTable)}>
//         {showTable ? 'X' : 'add more line items'}
//       </Button>
//       {showTable && <>li table</>}
//     </div>
//   )
// }

import React, { useState, useEffect, useCallback, createRef } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import MaterialTable, { Action } from 'material-table'
// import { Chip } from '@material-ui/core'
// import MoreVertIcon from '@material-ui/icons/MoreVert'
// import IconButton from '@material-ui/core/IconButton'
// import Tooltip from '@material-ui/core/Tooltip'

import { LineItem } from '../types/Order'
import { API_HOST } from '../constants'

const token = localStorage && localStorage.getItem('token')

// const PROPERTY_MAP: { [index: string]: string } = {
//   a: 'Artificial ingredients',
//   c: 'Low carb',
//   d: 'Dairy free',
//   f: 'Food Service items',
//   g: 'Gluten free',
//   k: 'Kosher',
//   l: 'Low sodium/no salt',
//   m: 'Non-GMO Project Verified',
//   og: 'Organic',
//   r: 'Refined sugar',
//   v: 'Vegan',
//   w: 'Wheat free',
//   ft: 'Fair Trade',
//   n: 'Natural',
//   s: 'Specialty Only',
//   y: 'Yeast free',
//   1: '100% organic',
//   2: '95%+ organic',
//   3: '70%+ organic'
// }

// function renderCodes(codes: string) {
//   return codes
//     .split(', ')
//     .map((code, idx) =>
//       PROPERTY_MAP[code] ? (
//         <Chip
//           label={PROPERTY_MAP[code]}
//           style={{ margin: 5 }}
//           size="small"
//           key={`pprop${idx}`}
//         />
//       ) : (
//         ''
//       )
//     )
// }

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(2),
      maxWidth: '100vw',
      minHeight: `calc(100vh - 64px)`
    }
  })
)

function AddWholesaleOrderLineItems(props: {
  addLineItemsToOrder: (data: LineItem[]) => void
}) {
  const classes = useStyles()
  let tableRef = createRef<any>()
  const [searchExpanded, setSearchExpanded] = useState(false)

  // ugh, this is needed because tableRef.current is always null inside the addAction onClick fn :/
  const [needsRefresh, setNeedsRefresh] = useState(false)
  const refreshTable = useCallback(() => {
    tableRef.current && tableRef.current.onQueryChange()
    setNeedsRefresh(false)
  }, [tableRef, setNeedsRefresh])

  const searchAction = {
    icon: searchExpanded ? 'zoom_out' : 'search',
    tooltip: searchExpanded ? 'Close Search' : 'Search',
    isFreeAction: true,
    onClick: () => setSearchExpanded(!searchExpanded)
  }

  const addAction = {
    tooltip: 'ADD LINE ITEMS TO ORDER',
    icon: 'add',
    onClick: (e: any, data: LineItem[]) => {
      // const ids = data.map(p => p.id)
      // console.log('addLineItemsToOrder data:', data)
      props.addLineItemsToOrder(data)
    }
  }

  const [actions, setActions] = useState<Action<any>[]>([])

  useEffect(() => {
    setActions([searchAction, addAction])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchExpanded]) // note: adding 'searchAction' to dep array is not pleasant :/

  useEffect(() => {
    if (needsRefresh) {
      refreshTable()
    }
  }, [needsRefresh, refreshTable])

  // const [categoryLookup, setCategoryLookup] = useState<object>(() => {
  //   fetch(`${API_HOST}/categories`)
  //     .then(response => response.json())
  //     .then(result => setCategoryLookup(result))
  // })

  // const [subCategoryLookup, setSubCategoryLookup] = useState<object>(() => {
  //   fetch(`${API_HOST}/sub_categories`)
  //     .then(response => response.json())
  //     .then(result => setSubCategoryLookup(result))
  // })

  return (
    <div className={classes.root}>
      <MaterialTable
        tableRef={tableRef}
        columns={[
          {
            title: 'vendor',
            field: 'vendor',
            type: 'string',
            filterPlaceholder: 'filter'
          },
          {
            title: 'qty',
            field: 'quantity',
            type: 'string',
            filtering: false
          },
          { title: 'total', field: 'total', type: 'string', filtering: false },
          {
            title: 'product',
            field: 'data',
            type: 'string',
            render: row =>
              row.data && row.data.product
                ? `${row.data.product.name} ${row.data.product.description}`
                : null
          },
          { title: 'id', field: 'id', type: 'string', hidden: true },
          { title: 'OrderId', field: 'OrderId', type: 'string', hidden: true },
          {
            title: 'WholesaleOrderId',
            field: 'WholesaleOrderId',
            type: 'string',
            hidden: true
          }
        ]}
        data={query =>
          new Promise((resolve, reject) => {
            fetch(`${API_HOST}/wholesaleorders/lineitems`, {
              method: 'post',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify(query)
            })
              .then(response => response.json())
              .then(result => {
                resolve(result)
              })
              .catch(err => {
                console.warn('onoz, caught err:', err)
                return resolve({ data: [], page: 0, totalCount: 0 })
              })
          })
        }
        title="Add Line Items"
        options={{
          headerStyle: { position: 'sticky', top: 0 },
          maxBodyHeight: 'calc(100vh - 121px - 64px - 28px)',
          pageSize: 50,
          pageSizeOptions: [50, 100, 500],
          debounceInterval: 750,
          filtering: true,
          search: searchExpanded,
          emptyRowsWhenPaging: false,
          selection: true
        }}
        actions={actions}
      />
    </div>
  )
}

export default AddWholesaleOrderLineItems
