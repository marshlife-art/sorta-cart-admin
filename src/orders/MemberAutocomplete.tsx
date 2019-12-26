import React from 'react'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import CircularProgress from '@material-ui/core/CircularProgress'

import { Member } from '../types/Member'
import { API_HOST } from '../constants'

const token = localStorage && localStorage.getItem('token')

interface MemberResponse {
  data: Member[]
}

interface MemberOption {
  name: string
  member: Member
}

interface MemberAutocompleteProps {
  onItemSelected: (value: { name: string; member: Member }) => void
}

export default function MemberAutocomplete(props: MemberAutocompleteProps) {
  const [open, setOpen] = React.useState(false)
  const [options, setOptions] = React.useState<MemberOption[]>([])
  const [q, setQ] = React.useState('')
  const [loading, setLoading] = React.useState(open && options.length === 0)

  React.useEffect(() => {
    let active = true

    if (!loading) {
      return undefined
    }

    ;(async () => {
      const response = await fetch(`${API_HOST}/members`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ search: q })
      })

      const members = (await response.json()) as MemberResponse
      console.log('[MemberAutocomplete] members:', members)
      if (active) {
        setOptions(
          members.data.map(p => ({
            name: `${p.name} ${
              p.User && p.User.email ? p.User.email : p.registration_email
            }`,
            member: p
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
          label="Member search"
          fullWidth
          autoFocus
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
