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
import Typography from '@material-ui/core/Typography'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'

import Loading from '../Loading'
import { API_HOST } from '../constants'

const token = localStorage && localStorage.getItem('token')

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      margin: theme.spacing(2),
      padding: theme.spacing(2),
      zIndex: 2
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
  const [markup, setMarkup] = useState(0.0)
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
    formData.delete('markup')
    formData.append('vendor', vendor)
    formData.append('import_tag', importTag)
    formData.append('prev_import_tag', prevImportTag)
    formData.append('markup', `${markup}`)

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
        <Grid item sm={4}>
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
          <TextField
            label="Markup"
            helperText="Markup percentage. Use decimal format."
            type="number"
            inputProps={{
              min: '0',
              max: '1',
              step: '0.01'
            }}
            fullWidth
            value={markup}
            onChange={event =>
              setMarkup(
                isNaN(parseFloat(event.target.value))
                  ? 0.0
                  : parseFloat(event.target.value)
              )
            }
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

          <div className={classes.gridItem}>
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
          </div>
        </Grid>
        <Grid item sm={8}>
          <Typography variant="h6" gutterBottom>
            Helpful Information
          </Typography>
          <Typography variant="body1" gutterBottom component="div">
            <dl>
              <dt>What kind of file should be uploaded?</dt>
              <dd>Comma separated value files with the extension .csv</dd>

              <dt>What columns will get processed?</dt>
              <dd>
                <b>unf</b>, <b>upc_code</b>, <b>name</b>, <b>description</b>,{' '}
                <b>pk</b>, <b>size</b>, <b>unit_type</b>, <b>ws_price</b>,{' '}
                <b>u_price</b>, <b>ws_price_markup</b>, <b>u_price_markup</b>,{' '}
                <b>category</b>, <b>sub_category</b>, <b>codes</b>, <b>a</b>,{' '}
                <b>r</b>, <b>c</b>, <b>l</b>, <b>d</b>, <b>f</b>, <b>g</b>,{' '}
                <b>v</b>, <b>w</b>, <b>y</b>, <b>k</b>, <b>ft</b>, <b>m</b>,{' '}
                <b>s</b>, <b>n</b>, <b>og</b>.
              </dd>

              <dt>Are any of these optional?</dt>
              <dd>
                <b>unf</b>, <b>ws_price_markup</b>, <b>u_price_markup</b>,{' '}
                <b>category</b>, <b>sub_category</b>, <b>codes</b>, <b>a</b>,{' '}
                <b>r</b>, <b>c</b>, <b>l</b>, <b>d</b>, <b>f</b>, <b>g</b>,{' '}
                <b>v</b>, <b>w</b>, <b>y</b>, <b>k</b>, <b>ft</b>, <b>m</b>,{' '}
                <b>s</b>, <b>n</b>, <b>og</b>.
              </dd>

              <dt>
                <b>codes</b> column
              </dt>
              <dd>
                the <b>codes</b> column value can be a comma-separated list of
                codes. the values that can be entered in this field are any
                combination of a, r, c, l, d, f, g, v, w, y, k, ft, m, s, n, og,
                1, 2, 3.
              </dd>

              <dt>How do the code columns translate?</dt>
              <dd>
                The values in the code columns need to be the same as the
                header. so for example if there's a column <b>a</b> then the
                value for the fields in the column need to be <i>a</i> (or blank
                if not appliciable). except for the <b>og</b> column which can
                have values og, 1, 2, or 3.
                <br />
                <br />
                <table>
                  <thead>
                    <tr>
                      <th>code</th>
                      <th>translation</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>a</td>
                      <td>Artificial ingredients</td>
                    </tr>
                    <tr>
                      <td>c</td>
                      <td>Low carb</td>
                    </tr>
                    <tr>
                      <td>d</td>
                      <td>Dairy free</td>
                    </tr>
                    <tr>
                      <td>f</td>
                      <td>Food Service items</td>
                    </tr>
                    <tr>
                      <td>g</td>
                      <td>Gluten free</td>
                    </tr>
                    <tr>
                      <td>k</td>
                      <td>Kosher</td>
                    </tr>
                    <tr>
                      <td>l</td>
                      <td>Low sodium/no salt</td>
                    </tr>
                    <tr>
                      <td>m</td>
                      <td>Non-GMO Project Verified</td>
                    </tr>
                    <tr>
                      <td>r</td>
                      <td>Refined sugar</td>
                    </tr>
                    <tr>
                      <td>v</td>
                      <td>Vegan</td>
                    </tr>
                    <tr>
                      <td>w</td>
                      <td>Wheat free</td>
                    </tr>
                    <tr>
                      <td>ft</td>
                      <td>Fair Trade</td>
                    </tr>
                    <tr>
                      <td>n</td>
                      <td>Natural</td>
                    </tr>
                    <tr>
                      <td>s</td>
                      <td>Specialty Only</td>
                    </tr>
                    <tr>
                      <td>y</td>
                      <td>Yeast free</td>
                    </tr>
                    <tr>
                      <td>og</td>
                      <td>Organic</td>
                    </tr>
                    <tr>
                      <td>1</td>
                      <td>100% organic</td>
                    </tr>
                    <tr>
                      <td>2</td>
                      <td>95%+ organic</td>
                    </tr>
                    <tr>
                      <td>3</td>
                      <td>70%+ organic</td>
                    </tr>
                  </tbody>
                </table>
              </dd>

              <dt>How is markup applied?</dt>
              <dd>
                Markup is a percentage in decimal format so 0.10 will markup
                products by 10%. The formula is: <i>PRICE + (PRICE * MARKUP)</i>{' '}
                so if the value of <b>ws_price</b> is 10.00 and the markup
                specified is 0.10 the the markup price will be 11.00.
                <br />
                <br />
                If any rows of the price sheet has a non-empty, non-zero value
                in the <b>ws_price_markup</b> or <b>u_price_markup</b> then that
                will be used as the markup price. This means only some rows of
                the price sheet can contain special markups while the rest of
                the sheet can have a single markup applied.
              </dd>

              <dt>Import Tag</dt>
              <dd>
                This field is used to track changes to new price sheets that are
                meant to update products that have already been imported once. A
                use-case for this is when uploading partial lists of product for
                a vendor. So for example if a sub-set of products are imported,
                then a while later a new sheet of products can be imported
                without having to destroy and re-import all the products for a
                vendor. If uploading a complete list of all products for a
                particular vendor then it would be reasonable to use the same
                value as the Vendor field.
                <br />
                <br />
                <b>NOTE:</b> it can be useful to include the current date in the
                value for the Import Tag field (or otherwise make this a unique
                value). When creating wholesale orders it might be useful to
                know which price sheet a product that was ordered came from.
                <br />
                <br />
                When the Previous Import Tag is specified, products with that
                tag are first deleted before new products are created.
              </dd>
            </dl>
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  )
}
