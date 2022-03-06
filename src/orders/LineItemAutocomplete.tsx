import React, { useState, useEffect } from 'react'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import CircularProgress from '@material-ui/core/CircularProgress'

import { useProductsAutocomplete } from '../services/hooks/products'
import { ProductOption } from '../services/fetchers/types'

interface LineItemAutocompleteProps {
  onItemSelected: (value: ProductOption) => void
}

export default function LineItemAutocomplete(props: LineItemAutocompleteProps) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<ProductOption[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)

  const { products, isLoading, isError } = useProductsAutocomplete(q)

  useEffect(() => {
    if (!products) {
      return
    }
    setOptions(products)
    setLoading(false)
  }, [products])

  useEffect(() => {
    if (isError) {
      setOptions([])
    }
    setLoading(isLoading)
  }, [isError, isLoading])

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
