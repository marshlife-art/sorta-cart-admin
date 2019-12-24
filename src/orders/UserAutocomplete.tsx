import React from 'react'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import CircularProgress from '@material-ui/core/CircularProgress'

import { User } from '../types/User'
import { API_HOST } from '../constants'

const token = localStorage && localStorage.getItem('token')

interface UserResponse {
  data: User[]
}

interface UserOption {
  name: string
  user: User
}

interface UserAutocompleteProps {
  onItemSelected: (value: { name: string; user: User }) => void
}

export default function UserAutocomplete(props: UserAutocompleteProps) {
  const [open, setOpen] = React.useState(false)
  const [options, setOptions] = React.useState<UserOption[]>([])
  const [q, setQ] = React.useState('')
  const [loading, setLoading] = React.useState(open && options.length === 0)

  React.useEffect(() => {
    let active = true

    if (!loading) {
      return undefined
    }

    ;(async () => {
      const response = await fetch(`${API_HOST}/users`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ search: q })
      })

      const users = (await response.json()) as UserResponse

      if (active) {
        setOptions(
          users.data.map(p => ({
            name: `${p.name} ${p.email}`,
            user: p
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
          label="User search"
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
