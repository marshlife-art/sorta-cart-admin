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
import { API_HOST } from '../constants'

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

export default function AddStock() {
  const classes = useStyles()
  const [loading, setLoading] = useState(false)
  const [dryrun, setDryrun] = useState(true)
  const [formData, setFormData] = useState<FormData>()
  const [error, setError] = useState('')
  const [response, setResponse] = useState('')

  function submitData() {
    setError('')
    setResponse('')
    setLoading(true)
    if (!formData) {
      setError('please select a file!')
      return
    }
    formData.delete('dryrun')
    formData.append('dryrun', `${dryrun}`)

    fetch(`${API_HOST}/products/add_stock`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.error) {
          setError(response.msg)
        } else {
          if (!dryrun) {
            const addStockCSVFileInput = document.getElementById(
              'AddStockCSVFileInput'
            ) as HTMLInputElement
            if (addStockCSVFileInput) {
              setFormData(undefined)
              addStockCSVFileInput.value = ''
            }
          }
          setResponse(response.msg)
        }
      })
      .catch((err) => {
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

  return (
    <Paper className={classes.root}>
      <h3>Add Stock Changes</h3>

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
            id="AddStockCSVFileInput"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={loading}
            className={classes.gridItem}
          />

          <div className={classes.gridItem}>
            <Button
              disabled={loading || formData === undefined}
              onClick={() => submitData()}
              variant="contained"
              color="primary"
              fullWidth
            >
              ADD STOCK
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
                <b>unf</b> and <b>upc_code</b> columns are used to identify a
                unique product.
              </dd>

              <dt>Columns</dt>
              <dd>
                <b>unf</b>, <b>upc_code</b>, <b>count_on_hand</b>,{' '}
                <b>count_on_hand_change</b>, and <b>no_backorder</b>; any other
                columns will be ignored.
                <p>
                  precedence: first will check if <b>count_on_hand</b> is a
                  number, and if so, will do a hard count set for the value
                  specified. if <b>count_on_hand</b> is not a number, then will
                  look for a number in <b>count_on_hand_change</b> (and add that
                  to the product <b>count_on_hand</b> value).
                </p>
                <p>
                  <i>note:</i> use whole integer numbers only (so 0.4 would turn
                  into 0), negative numbers would subtract.
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
