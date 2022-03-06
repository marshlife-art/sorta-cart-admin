import { FormHelperText, InputLabel, MenuItem, Select, Theme, createStyles, makeStyles } from '@material-ui/core'
import React, { useState } from 'react'
import { updateNoBackorder, updateProducts } from '../services/mutations'

import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Grid from '@material-ui/core/Grid'
import Loading from '../Loading'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import parseProductUpdatesCSV from '../lib/parseProductUpdatesCSV'
import { productFetcher } from '../services/fetchers'
import { useDistinctProductVendors } from '../services/hooks/products'

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
    },
    preFormat: {
      whiteSpace: 'pre-wrap'
    }
  })
)

export default function UpdateProducts() {
  const classes = useStyles()
  const [loading, setLoading] = useState(false)
  const [dryrun, setDryrun] = useState(true)
  const [file, setFile] = useState<File>()
  const [error, setError] = useState('')
  const [response, setResponse] = useState('')
  const [vendor, setVendor] = useState('')
  const [priceUpdate, setPriceUpdate] = useState(false)
  const { vendorLookup } = useDistinctProductVendors()

  async function submitData() {
    setError('')
    setResponse('')
    setLoading(true)
    if (!file) {
      setError('please select a file!')
      return
    }

    const result = await parseProductUpdatesCSV(file)

    // console.log('parseProductUpdatesCSV result:', result)

    if (result.problems.length) {
      setError(result.problems.join('\n '))
      setLoading(false)
      return
    }

    if (priceUpdate && vendor) {
      // set no_backorder for all products where vendor=$vendor
      const { error: updateNoBackorderError } = await updateNoBackorder(
        vendor,
        'vendor'
      )

      if (updateNoBackorderError) {
        console.warn(
          'got error updating existing products to no_backorder=true for prevImportTag:',
          vendor,
          ' updateNoBackorderError:',
          updateNoBackorderError
        )
        setResponse(
          `Error updating existing products to no_backorder=true for vendor:${vendor}. Error: ${updateNoBackorderError.message}. Stopping.`
        )
        setLoading(false)
        return
      }

    }

    const updateErrors = []
    let updateCount = 0
    for await (const product of result?.products) {
      const { data, error } = await productFetcher(product.id)

      if (error || !data) {
        if (!priceUpdate) {
          // ignore if doing price&availability update
          updateErrors.push(`unable to find a product with id: ${product.id}`)
        }
      } else if (!dryrun) {
        // productUpdates is a Partial<Product>
        let productUpdates = {}
        if (priceUpdate) {
          const { u_price, u_price_cost, ws_price, ws_price_cost } = product
          productUpdates = { u_price, u_price_cost, ws_price, ws_price_cost, no_backorder: false }
        } else {
          const { unf, upc_code, id, ...rest } = product
          productUpdates = rest
        }

        const { error: updateError } = await updateProducts(productUpdates, [
          product.id
        ])

        if (error) {
          updateErrors.push(
            `error updating product with id: ${product.id} error message: ${updateError?.message}`
          )
        } else {
          updateCount += 1
        }
      }
    }

    if (updateErrors.length) {
      const chunkUpsertErrors = updateErrors.reduce((acc, item, index) => {
        const itemsPerChunk = 20
        const chunkIndex = Math.floor(index / itemsPerChunk)
        if (!acc[chunkIndex]) {
          acc[chunkIndex] = [] // start a new chunk
        }
        acc[chunkIndex].push(item)
        return acc
      }, [] as any)

      const [twentyErrors, restOfTheErrors] = chunkUpsertErrors
      setError(
        `${dryrun === true && 'Dry Run'} ${updateCount ? `Successfully imported ${updateCount} products!\n` : ''
        }. Products from csv: ${result.products.length}. \nThere were ${updateErrors.length
        } errors adding new products:\n${twentyErrors.join('\n ')} \n\n...and ${restOfTheErrors.length
        } more`
      )
    } else {
      setResponse(
        `${dryrun === true && 'Dry Run'} Success! \nProducts from csv: ${result.products.length
        } \nProducts updated in database: ${updateCount}\n`
      )
    }

    setLoading(false)
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setLoading(true)
    if (event.target.files && event.target.files.length) {
      let data = new FormData()
      data.append('file', event.target.files[0])
      setFile(event.target.files[0])
      setLoading(false)
    } else {
      setFile(undefined)
      setLoading(false)
    }
  }

  return (
    <Paper className={classes.root}>
      <h3>Update Product Attributes</h3>

      <Grid
        container
        spacing={2}
        direction="row"
        justifyContent="center"
        alignItems="flex-start"
      >
        <Grid item sm={4}>

          <FormControl fullWidth className={classes.gridItem}>
            <FormControlLabel
              control={
                <Checkbox
                  onChange={(
                    event: React.ChangeEvent<HTMLInputElement>,
                    checked: boolean
                  ) => {
                    setPriceUpdate(checked)
                  }}
                  checked={priceUpdate}
                />
              }
              label="Price &amp; Availability Update"
            />
            <FormHelperText>
              If checked, only price and availability for vendor's products are updated.
              Upload vendor price sheet(s) to get updated price and availability for existing products.
            </FormHelperText>
          </FormControl>

          {priceUpdate && (<FormControl fullWidth className={classes.gridItem}>
            <InputLabel id="prev-import-tag-select-label">
              Vendor
            </InputLabel>
            <Select
              labelId="prev-import-tag-select-label"
              id="prev-import-tag-select"
              value={vendor}
              onChange={(event) =>
                event.target && setVendor(event.target.value as string)
              }
            >
              <MenuItem value="">None</MenuItem>
              {vendorLookup &&
                vendorLookup.map((vendor, idx) => (
                  <MenuItem key={`vendor-sel-${idx}`} value={idx}>
                    {vendor}
                  </MenuItem>
                ))}
            </Select>
            <FormHelperText>
              <b>Optional.</b> All products with the vendor you select here will first
              be set as unavailable for order (<b>no_backorder</b>=<i>true</i>).
            </FormHelperText>
          </FormControl>)}

          <FormControl fullWidth className={classes.gridItem}>
            <FormControlLabel
              control={
                <Checkbox
                  onChange={(
                    event: React.ChangeEvent<HTMLInputElement>,
                    checked: boolean
                  ) => {
                    setDryrun(checked)
                  }}
                  checked={dryrun}
                />
              }
              label="Dry Run"
            />
            <FormHelperText>
              <i>note:</i> when <b>Dry Run</b> is checked no products in the database will be modified (useful for debugging .csv files).
            </FormHelperText>
          </FormControl>

          <FormControl fullWidth className={classes.gridItem}>
            <input
              id="UpdateProductsCSVFileInput"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={loading}
              className={classes.gridItem}
            />
            <FormHelperText>
              <i>note:</i> use .csv files (Comma Separated Values).
            </FormHelperText>
          </FormControl>

          <div className={classes.gridItem}>
            <Button
              disabled={loading || file === undefined}
              onClick={() => submitData()}
              variant="contained"
              color="primary"
              fullWidth
            >
              UPDATE PRODUCTS
            </Button>
          </div>

          <div className={classes.gridItem}>
            {loading && <Loading />}
            {error && (
              <div className={classes.gridItem}>
                <h3>Response Error!</h3>
                <p className={classes.preFormat}>{error}</p>
              </div>
            )}
            {response && (
              <div className={classes.gridItem}>
                <h3>Response</h3>
                <p className={classes.preFormat}>{response}</p>
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
              <dt>Product Identifier</dt>
              <dd>
                <b>unf</b> and <b>upc_code</b> columns are used
                to identify a unique product. some combination of these are
                required.
              </dd>

              <dt>Columns</dt>
              {priceUpdate ? (
                <dd>
                  <b>u_price</b>, <b>u_price_cost</b>, <b>ws_price</b>, <b>ws_price_cost</b>;
                  any other columns will be ignored.

                </dd>
              ) : (<dd>
                <i>example:</i> <b>plu</b>, <b>count_on_hand</b>,{' '}
                <b>no_backorder</b>, <b>featured</b>, <b>name</b>,{' '}
                <b>description_edit</b>; any product property except{' '}
                <b>unf</b>, <b>upc_code</b>, and <b>id</b> will get updated.
                <p>
                  <i>note:</i> use only whole integer numbers for{' '}
                  <b>count_on_hand</b> otherwise will round (so 0.4 would turn
                  into 0).
                </p>
                <p>
                  You probably don't want to update{' '}
                  <b>count_on_hand</b>, here.
                </p>
              </dd>)}
            </dl>
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  )
}
