import React, { useState } from 'react'
import { makeStyles, Theme, createStyles } from '@material-ui/core'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import FormHelperText from '@material-ui/core/FormHelperText'
import Select from '@material-ui/core/Select'
import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'

import Loading from '../Loading'
import { API_HOST } from '../constants'

const token = localStorage && localStorage.getItem('token')

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      margin: theme.spacing(2),
      padding: theme.spacing(2)
    },
    gridItem: {
      margin: theme.spacing(2, 0)
    },
    vendor: {
      display: 'flex',
      alignItems: 'center',
      margin: theme.spacing(2, 0)
    }
  })
)

export default function ImportProducts() {
  const classes = useStyles()
  const [loading, setLoading] = useState(false)
  const [vendor, setVendor] = useState('')
  const [importTag, setImportTag] = useState('')
  const [prevImportTag, setPrevImportTag] = useState('')
  const [formData, setFormData] = useState<FormData>()
  const [error, setError] = useState('')
  const [response, setResponse] = useState('')

  const [vendorLookup, setVendorLookup] = useState<object>(() => {
    fetch(`${API_HOST}/products/vendors`)
      .then(response => response.json())
      .then(result => setVendorLookup(result))
  })

  const [importTagsLookup, setImportTagsLookup] = useState<object>(() => {
    fetch(`${API_HOST}/products/import_tags`)
      .then(response => response.json())
      .then(result => setImportTagsLookup(result))
  })

  function submitData() {
    setError('')
    setResponse('')
    setLoading(true)
    if (!formData) {
      setError('please select a file!')
      return
    }
    formData.delete('vendor')
    formData.delete('import_tag')
    formData.delete('prev_import_tag')
    formData.append('vendor', vendor)
    formData.append('import_tag', importTag)
    formData.append('prev_import_tag', prevImportTag)

    fetch(`${API_HOST}/products/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    })
      .then(response => response.json())
      .then(response => {
        if (response.error) {
          setError(response.msg)
        } else {
          setResponse(response.msg)
        }
      })
      .catch(err => {
        console.warn('fetch caugher err:', err)
        setError(err.toString())
      })
      .finally(() => setLoading(false))
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setLoading(true)
    if (event.target.files && event.target.files.length) {
      let data = new FormData()
      data.append('file', event.target.files[0])
      setFormData(data)
      setLoading(false)
    } else {
      setFormData(undefined)
      setLoading(false)
    }
  }

  const [
    vendorMenuAnchorEl,
    setVendorMenuAnchorEl
  ] = React.useState<null | HTMLElement>(null)

  const handleVendorMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setVendorMenuAnchorEl(event.currentTarget)
  }

  const handleVendorMenuClose = () => {
    setVendorMenuAnchorEl(null)
  }

  const handleVendorSelect = (vendor: string) => {
    setVendor(vendor)
    handleVendorMenuClose()
  }

  return (
    <Paper className={classes.root}>
      <h3>Import Products</h3>

      <Grid
        container
        spacing={2}
        direction="row"
        justify="center"
        alignItems="flex-start"
      >
        <Grid item sm={6}>
          <div className={classes.vendor}>
            <TextField
              label="Vendor"
              helperText="Required."
              fullWidth
              value={vendor}
              onChange={event => setVendor(event.target.value)}
            />

            <div>
              <Button
                aria-controls="customized-menu"
                aria-haspopup="true"
                variant="contained"
                color="primary"
                size="small"
                onClick={handleVendorMenuOpen}
              >
                <ArrowDropDownIcon />
              </Button>
            </div>

            <Menu
              id="simple-menu"
              anchorEl={vendorMenuAnchorEl}
              keepMounted
              open={Boolean(vendorMenuAnchorEl)}
              onClose={handleVendorMenuClose}
            >
              {vendorLookup &&
                Object.keys(vendorLookup).map(vendor => (
                  <MenuItem
                    key={`vendor-sel-${vendor}`}
                    onClick={() => handleVendorSelect(vendor)}
                  >
                    {vendor}
                  </MenuItem>
                ))}
            </Menu>
          </div>

          <FormControl fullWidth className={classes.gridItem}>
            <InputLabel id="prev-import-tag-select-label">
              Previous Import Tag
            </InputLabel>
            <Select
              labelId="prev-import-tag-select-label"
              id="prev-import-tag-select"
              value={prevImportTag}
              onChange={event =>
                event.target &&
                event.target.value &&
                setPrevImportTag(event.target.value as string)
              }
            >
              {importTagsLookup &&
                Object.keys(importTagsLookup).map(tag => (
                  <MenuItem key={`tag-sel-${tag}`} value={tag}>
                    {tag}
                  </MenuItem>
                ))}
            </Select>
            <FormHelperText>
              If updating, products with the tag you select here will first be
              removed.
            </FormHelperText>
          </FormControl>
          <TextField
            label="Import Tag"
            helperText="Required. This should be unique."
            fullWidth
            value={importTag}
            onChange={event => setImportTag(event.target.value)}
            className={classes.gridItem}
          />

          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={loading}
            className={classes.gridItem}
          />

          <div className={classes.gridItem}>
            <Button
              disabled={
                loading || !importTag || !vendor || formData === undefined
              }
              onClick={() => submitData()}
              size="large"
            >
              UPLOAD
            </Button>
          </div>
        </Grid>
        <Grid item sm={6}>
          {loading && <Loading />}
          {error && (
            <div className={classes.gridItem}>
              <h3>Response Error!</h3>
              <p>{error}</p>
            </div>
          )}
          {response && (
            <div className={classes.gridItem}>
              <h3>Response</h3>
              <p>{response}</p>
            </div>
          )}
        </Grid>
      </Grid>
    </Paper>
  )
}
