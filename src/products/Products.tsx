import React, { useState, useEffect, useCallback, createRef } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import MaterialTable, { Query } from 'material-table'

import { SupaProduct as Product } from '../types/SupaTypes'
import { getNoBackorderAction, getFeaturedAction } from './TableActionMenu'
import {
  distinctProductVendors,
  productsFetcher,
  distinctProductCategories,
  distinctProductSubCategories
} from '../services/fetchers'
import { deleteProducts } from '../services/mutations'

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

  const deleteAction = {
    tooltip: 'destroy all selected products',
    icon: 'delete',
    onClick: async (e: any, data: Product | Product[]) => {
      const ids = Array.isArray(data) ? data.map((p) => p.id) : [data.id]
      if (ids.length === 0) {
        return
      }
      if (
        window.confirm(
          `are sure you want to destroy these ${ids.length} products?`
        )
      ) {
        const { error } = await deleteProducts(ids)

        if (error) {
          console.warn('destroy products caught err:', error)
        }
        setNeedsRefresh(true)
      }
    }
  }

  useEffect(() => {
    if (needsRefresh) {
      refreshTable()
      setSearchExpanded(true)
    }
  }, [needsRefresh, refreshTable])

  const [searchExpanded, setSearchExpanded] = useState(true)

  const [categoryLookup, setCategoryLookup] = useState<object>(() => {
    distinctProductCategories().then((result) => setCategoryLookup(result))
  })

  const [subCategoryLookup, setSubCategoryLookup] = useState<object>(() => {
    distinctProductSubCategories('').then((result) =>
      setSubCategoryLookup(result)
    )
  })

  const [vendorLookup, setVendorLookup] = useState<object>(() => {
    distinctProductVendors().then((result) => setVendorLookup(result))
  })

  const [catDefaultFilter, setCatDefaultFilter] = useState<
    '' | string[] | undefined
  >()
  const [subCatDefaultFilter, setSubCatDefaultFilter] = useState<
    '' | string[] | undefined
  >()

  async function setSelectedCatsFromQuery(query: Query<any>) {
    try {
      const categories = query.filters
        .filter((f) => f.column.field === 'category')
        .reduce(
          (terms: string[], t: { value: string[] }) => [...terms, ...t.value],
          []
        )
      const subCatz = query.filters
        .filter((f) => f.column.field === 'sub_category')
        .reduce(
          (terms: string[], t: { value: string[] }) => [...terms, ...t.value],
          []
        )
      if (categories.length === 0) {
        return
      }

      let newSubCatz = {}

      for await (const cat of categories) {
        const result = await distinctProductSubCategories(cat)
        newSubCatz = {
          ...newSubCatz,
          ...result
        }
      }

      setCatDefaultFilter(categories)
      setSubCategoryLookup(newSubCatz)
      setSubCatDefaultFilter(subCatz)
    } catch (e) {
      console.warn('onoz caught err:', e)
    }
  }

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
            filterPlaceholder: 'filter',
            defaultFilter: catDefaultFilter
          },
          {
            title: 'sub category',
            field: 'sub_category',
            type: 'string',
            lookup: subCategoryLookup,
            filterPlaceholder: 'filter',
            defaultFilter: subCatDefaultFilter
          },
          {
            title: 'vendor',
            field: 'vendor',
            type: 'string',
            lookup: vendorLookup,
            filterPlaceholder: 'filter'
          },
          {
            title: 'import tag',
            field: 'import_tag',
            type: 'string',
            filterPlaceholder: 'filter',
            filterCellStyle: {
              paddingTop: '32px'
            }
          },
          { title: 'name', field: 'name', type: 'string', hidden: true },
          {
            title: 'name -- description',
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
            title: 'pk size unit',
            field: 'pk',
            type: 'numeric',
            filtering: false,
            render: (row) => {
              return `${row.pk} ${row.size} ${row.unit_type}`
            }
          },
          {
            title: 'size',
            field: 'size',
            type: 'string',
            filtering: false,
            hidden: true
          },
          {
            title: 'unit type',
            field: 'unit_type',
            type: 'string',
            filtering: false,
            hidden: true
          },
          {
            title: 'price',
            field: 'ws_price',
            type: 'string',
            filtering: false,
            render: (row) => {
              return `$${row.ws_price} ${
                row.u_price && row.ws_price !== row.u_price
                  ? `(${row.u_price} ea)`
                  : ''
              }`
            }
          },
          {
            title: 'count',
            field: 'count_on_hand',
            type: 'boolean',
            filtering: true,
            render: (row) => row.count_on_hand
          },
          {
            title: 'no backorder',
            field: 'no_backorder',
            type: 'boolean'
          },
          {
            title: 'featured',
            field: 'featured',
            type: 'boolean'
          },
          { title: 'upc', field: 'upc_code', type: 'string', hidden: true },
          // { title: 'unf', field: 'unf', type: 'string' },
          { title: 'id', field: 'id', type: 'string', hidden: true }
        ]}
        data={(q) =>
          new Promise(async (resolve, reject) => {
            setSelectedCatsFromQuery(q)

            const { data, error, count } = await productsFetcher(q)

            if (!data || error) {
              resolve({ data: [], page: 0, totalCount: 0 })
            } else {
              resolve({ data, page: q.page, totalCount: count || 0 })
            }
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
          search: searchExpanded,
          emptyRowsWhenPaging: false,
          selection: true
        }}
        onSelectionChange={(data: Product[], rowData?: Product | undefined) => {
          searchExpanded && setSearchExpanded(false)
          setSearchExpanded(data.length === 0)
        }}
        actions={[
          getFeaturedAction(setNeedsRefresh),
          getNoBackorderAction(setNeedsRefresh),
          deleteAction
        ]}
      />
    </div>
  )
}

export default Products
