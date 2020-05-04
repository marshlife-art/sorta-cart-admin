import React, { useState, useEffect, useCallback, createRef } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import MaterialTable from 'material-table'
import { Chip } from '@material-ui/core'
// import MoreVertIcon from '@material-ui/icons/MoreVert'
// import IconButton from '@material-ui/core/IconButton'
// import Tooltip from '@material-ui/core/Tooltip'

import { Product } from '../types/Product'
import { API_HOST } from '../constants'

const PROPERTY_MAP: { [index: string]: string } = {
  a: 'Artificial ingredients',
  c: 'Low carb',
  d: 'Dairy free',
  f: 'Food Service items',
  g: 'Gluten free',
  k: 'Kosher',
  l: 'Low sodium/no salt',
  m: 'Non-GMO Project Verified',
  og: 'Organic',
  r: 'Refined sugar',
  v: 'Vegan',
  w: 'Wheat free',
  ft: 'Fair Trade',
  n: 'Natural',
  s: 'Specialty Only',
  y: 'Yeast free',
  1: '100% organic',
  2: '95%+ organic',
  3: '70%+ organic'
}

function renderCodes(codes: string | undefined) {
  return (
    codes &&
    codes
      .split(', ')
      .map((code, idx) =>
        PROPERTY_MAP[code] ? (
          <Chip
            label={PROPERTY_MAP[code]}
            style={{ margin: 5 }}
            size="small"
            key={`pprop${idx}`}
          />
        ) : (
          ''
        )
      )
  )
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(2),
      maxWidth: '100vw',
      minHeight: `100vh`
    }
  })
)

function Products() {
  const classes = useStyles()
  let tableRef = createRef<any>()

  // ugh, this is needed because tableRef.current is always null inside the deleteAction onClick fn :/
  const [needsRefresh, setNeedsRefresh] = useState(false)
  const refreshTable = useCallback(() => {
    tableRef.current && tableRef.current.onQueryChange()
    setNeedsRefresh(false)
  }, [tableRef, setNeedsRefresh])

  const token = localStorage && localStorage.getItem('token')

  const deleteAction = {
    tooltip: 'destroy all selected products',
    icon: 'delete',
    onClick: (e: any, data: Product | Product[]) => {
      const ids = Array.isArray(data) ? data.map((p) => p.id) : [data.id]
      if (ids.length === 0) {
        return
      }
      if (
        window.confirm(
          `are sure you want to destroy these ${ids.length} products?`
        )
      ) {
        fetch(`${API_HOST}/products/destroy`, {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ ids })
        })
          .catch((err) => console.warn('destroy products caught err:', err))
          .finally(() => setNeedsRefresh(true))
      }
    }
  }

  useEffect(() => {
    if (needsRefresh) {
      refreshTable()
    }
  }, [needsRefresh, refreshTable])

  const [categoryLookup, setCategoryLookup] = useState<object>(() => {
    fetch(`${API_HOST}/categories`)
      .then((response) => response.json())
      .then((result) => setCategoryLookup(result))
  })

  const [subCategoryLookup, setSubCategoryLookup] = useState<object>(() => {
    fetch(`${API_HOST}/sub_categories`)
      .then((response) => response.json())
      .then((result) => setSubCategoryLookup(result))
  })

  const [vendorLookup, setVendorLookup] = useState<object>(() => {
    fetch(`${API_HOST}/products/vendors`)
      .then((response) => response.json())
      .then((result) => setVendorLookup(result))
  })

  return (
    <div className={classes.root}>
      <MaterialTable
        tableRef={tableRef}
        columns={[
          {
            title: 'category',
            field: 'category',
            type: 'string',
            lookup: categoryLookup,
            filterPlaceholder: 'filter'
          },
          {
            title: 'sub category',
            field: 'sub_category',
            type: 'string',
            lookup: subCategoryLookup,
            filterPlaceholder: 'filter'
          },
          {
            title: 'vendor',
            field: 'vendor',
            type: 'string',
            lookup: vendorLookup,
            filterPlaceholder: 'filter'
          },
          { title: 'name', field: 'name', type: 'string', hidden: true },
          {
            title: 'description',
            field: 'description',
            type: 'string',
            filterPlaceholder: 'filter',
            filterCellStyle: {
              paddingTop: '32px'
            },
            render: (row) => {
              if (row.name) {
                return `${row.name} -- ${row.description}`
              } else {
                return row.description
              }
            }
          },
          {
            title: 'pk',
            field: 'pk',
            type: 'numeric',
            filtering: false
          },
          { title: 'size', field: 'size', type: 'string', filtering: false },
          {
            title: 'unit type',
            field: 'unit_type',
            type: 'string',
            lookup: { CS: 'Case', EA: 'Each' },
            filterPlaceholder: 'filter'
          },
          {
            title: 'price',
            field: 'ws_price',
            type: 'currency',
            filtering: false
          },
          {
            title: 'unit price',
            field: 'u_price',
            type: 'currency',
            filtering: false
          },
          {
            title: 'properties',
            field: 'codes',
            type: 'string',
            lookup: PROPERTY_MAP,
            filterPlaceholder: 'filter',
            render: (row) => renderCodes(row.codes)
          },
          { title: 'upc', field: 'upc_code', type: 'string', hidden: true },
          // { title: 'unf', field: 'unf', type: 'string' },
          { title: 'id', field: 'id', type: 'string', hidden: true }
        ]}
        data={(query) =>
          new Promise((resolve, reject) => {
            fetch(`${API_HOST}/products`, {
              method: 'post',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(query)
            })
              .then((response) => response.json())
              .then((result) => {
                resolve(result)
              })
              .catch((err) => {
                console.warn('onoz, caught err:', err)
                return resolve({ data: [], page: 0, totalCount: 0 })
              })
          })
        }
        title="Products"
        options={{
          headerStyle: { position: 'sticky', top: 0 },
          maxBodyHeight: 'calc(100vh - 121px - 28px)',
          pageSize: 50,
          pageSizeOptions: [50, 100, 500],
          debounceInterval: 750,
          filtering: true,
          search: true,
          emptyRowsWhenPaging: false,
          selection: true
        }}
        actions={[deleteAction]}
      />
    </div>
  )
}

export default Products
