import React from 'react'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import CircularProgress from '@material-ui/core/CircularProgress'

import { Product } from '../types/Product'
import { API_HOST } from '../constants'

interface ProductResponse {
  data: Product[]
}

interface ProductOption {
  name: string
  product: Product
}

interface LineItemAutocompleteProps {
  onItemSelected: (value: { name: string; product: Product }) => void
}

export default function LineItemAutocomplete(props: LineItemAutocompleteProps) {
  const [open, setOpen] = React.useState(false)
  const [options, setOptions] = React.useState<ProductOption[]>([])
  const [q, setQ] = React.useState('')
  const [loading, setLoading] = React.useState(open && options.length === 0)

  React.useEffect(() => {
    let active = true

    if (!loading) {
      return undefined
    }

    ;(async () => {
      const response = await fetch(`${API_HOST}/products`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ search: q })
      })

      const products = (await response.json()) as ProductResponse

      if (active) {
        setOptions(
          products.data.map(p => ({
            name: `${p.name} ${p.description} ${p.pk} ${p.size} $${
              p.ws_price
            } ${p.u_price !== p.ws_price ? `($${p.u_price} EA)` : ''}`,
            product: p
          }))
        )
        setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [loading, q])

  React.useEffect(() => {
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
      getOptionLabel={option => option.name}
      onChange={(event, value) => props.onItemSelected(value)}
      options={options}
      loading={loading}
      freeSolo
      renderInput={params => (
        <TextField
          {...params}
          label="Product search"
          fullWidth
          variant="outlined"
          value={q}
          onChange={event => onInputChnage(event.target.value)}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            )
          }}
        />
      )}
    />
  )
}
