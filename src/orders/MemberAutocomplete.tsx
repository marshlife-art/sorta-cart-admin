import React, { useState, useEffect } from 'react'
import useSWR from 'swr'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import CircularProgress from '@material-ui/core/CircularProgress'

import { Member } from '../types/Member'
import { supabase } from '../lib/supabaseClient'

interface MemberOption {
  name: string
  member: Member
}

interface MemberAutocompleteProps {
  onItemSelected: (value: { name: string; member: Member }) => void
}

export default function MemberAutocomplete(props: MemberAutocompleteProps) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<MemberOption[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(open && options.length === 0)

  useSWR({ key: 'member_autocomplete', q }, async ({ q }) => {
    if (!q) {
      setOptions([])
      return
    }
    let query = supabase.from('Members').select()

    if (q) {
      query = query.or(
        ['name', 'registration_email', 'phone']
          .map((f) => `${f}.ilike.%${q}%`)
          .join(',')
      )
    }

    const { data: members, error } = await query

    if (error || !members) {
      return
    }

    setOptions(
      members.map((m) => ({
        name: `${m.name} ${
          m.User && m.User.email ? m.User.email : m.registration_email
        }`,
        member: m
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
    if (value && value.length > 0) {
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
          label="Member search"
          fullWidth
          autoFocus
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
