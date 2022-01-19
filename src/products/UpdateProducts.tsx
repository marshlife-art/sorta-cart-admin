import React, { useState } from 'react'
import { makeStyles, Theme, createStyles } from '@material-ui/core'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

import Loading from '../Loading'
import parseProductUpdatesCSV from '../lib/parseProductUpdatesCSV'
import { updateProducts } from '../services/mutations'
import { productFetcher } from '../services/fetchers'

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

    const updateErrors = []
    let updateCount = 0
    for await (const product of result?.products) {
      const { data, error } = await productFetcher(product.id)

      if (error || !data) {
        updateErrors.push(`unable to find a product with id: ${product.id}`)
      } else if (!dryrun) {
        const { unf, upc_code, id, ...productUpdates } = product
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
        `${dryrun === true && 'Dry Run'} ${
          updateCount ? `Successfully imported ${updateCount} products!\n` : ''
        }. Products from csv: ${result.products.length}. \nThere were ${
          updateErrors.length
        } errors adding new products:\n${twentyErrors.join('\n ')} \n\n...and ${
          restOfTheErrors.length
        } more`
      )
    } else {
      setResponse(
        `${dryrun === true && 'Dry Run'} Success! \nProducts from csv: ${
          result.products.length
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
        justify="center"
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
                    setDryrun(checked)
                  }}
                  checked={dryrun}
                  value="dryrun"
                />
              }
              label="Dry Run"
            />
          </FormControl>

          <input
            id="UpdateProductsCSVFileInput"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={loading}
            className={classes.gridItem}
          />

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
                <b>unf</b>, <b>upc_code</b>, and/or <b>plu</b> columns are used
                to identify a unique product. some combination of these are
                required.
              </dd>

              <dt>Columns</dt>
              <dd>
                <b>unf</b>, <b>upc_code</b>, <b>plu</b>, <b>count_on_hand</b>,{' '}
                <b>no_backorder</b>, <b>featured</b>, <b>name</b>,{' '}
                <b>description_edit</b>, and <b>plu</b>; any other columns will
                be ignored.
                <p>
                  <i>note:</i> use only whole integer numbers for{' '}
                  <b>count_on_hand</b> otherwise will round (so 0.4 would turn
                  into 0). you probably don't want to update{' '}
                  <b>count_on_hand</b>, here.
                </p>
              </dd>

              <dt>Dry Run</dt>
              <dd>
                when checked, this will not modify inventory (useful for
                debugging .csv files).
              </dd>
            </dl>
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  )
}
