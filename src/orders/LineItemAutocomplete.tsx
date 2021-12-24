import React, { useState, useEffect } from 'react'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import CircularProgress from '@material-ui/core/CircularProgress'

import { Product } from '../types/Product'
import useSWR from 'swr'
import { supabase } from '../lib/supabaseClient'

interface ProductOption {
  name: string
  product: Product
}

interface LineItemAutocompleteProps {
  onItemSelected: (value: { name: string; product: Product }) => void
}

export default function LineItemAutocomplete(props: LineItemAutocompleteProps) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<ProductOption[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(open && options.length === 0)

  useSWR({ key: 'lineitem_autocomplete', q }, async ({ q }) => {
    if (!q) {
      setOptions([])
      return
    }
    let query = supabase.from('products').select()

    if (q) {
      query = query.or(
        [
          'name',
          'description',
          'vendor',
          'category',
          'sub_category',
          'upc_code',
          'plu'
        ]
          .map((f) => `${f}.ilike.%${q}%`)
          .join(',')
      )
    }

    const { data: products, error } = await query

    if (error || !products) {
      return
    }

    setOptions(
      products.map((p) => ({
        name: `${p.name} ${p.description} ${p.pk} ${p.size} $${p.ws_price} ${
          p.u_price !== p.ws_price ? `($${p.u_price} EA)` : ''
        }${
          isNaN(parseInt(`${p.count_on_hand}`))
            ? ''
            : ` ${p.count_on_hand} on hand`
        }`,
        product: p
      }))
    )
    setLoading(false)
  })

  useEffect(() => {
    if (!open) {
      setOptions([])
    }
  }, [open])

  function onInputChnage(value: string) {
    if (value && value.length > 2) {
      setQ(value)
      setLoading(true)
    }
  }

  return (
    <Autocomplete
      id="add-line-item-autocomplete"
      style={{ width: '100%' }}
      open={open}
      onOpen={() => {
        setOpen(true)
      }}
      onClose={() => {
        setOpen(false)
      }}
      getOptionSelected={(option, value) => option.name === value.name}
      getOptionLabel={(option) => option.name}
      onChange={(event, value) =>
        value && typeof value !== 'string' && props.onItemSelected(value)
      }
      options={options}
      loading={loading}
      freeSolo
      renderInput={(params) => (
        <TextField
          {...params}
          label="Product search"
          fullWidth
          variant="outlined"
          value={q}
          onChange={(event) => onInputChnage(event.target.value)}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            )
          }}
        />
      )}
    />
  )
}
