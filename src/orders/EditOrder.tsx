import React, { useState, useEffect } from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import Typography from '@material-ui/core/Typography'
import CloseIcon from '@material-ui/icons/Close'
import AddIcon from '@material-ui/icons/Add'
import ClearIcon from '@material-ui/icons/Clear'

import Loading from '../Loading'
import { useOrderService } from './useOrderService'
import { Order, OrderRouterProps } from '../types/Order'
import { LineItem } from '../types/Order'
import OrderLineItems from './OrderLineItems'
import LineItemAutocomplete from './LineItemAutocomplete'
import { Product } from '../types/Product'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(2),
      maxWidth: '100vw',
      minHeight: `calc(100vh - 64px)`
    },
    form: {
      marginBottom: theme.spacing(2)
    },
    formInput: {
      display: 'block',
      marginBottom: theme.spacing(2)
    },
    liHeader: {
      display: 'inline-block',
      marginRight: theme.spacing(2)
    }
  })
)

function EditOrder(props: RouteComponentProps<OrderRouterProps>) {
  const classes = useStyles()

  const [orderId, setOrderId] = useState('')
  const [order, setOrder] = useState<Order>()
  const [loading, setLoading] = useState(true)
  const [showLiAutocomplete, setShowLiAutocomplete] = useState(false)

  const orderService = useOrderService(orderId, setLoading)

  useEffect(() => {
    if (orderService.status === 'loaded') {
      if (orderService.payload) {
        setOrder(orderService.payload)
      } else {
        setOrder(undefined)
      }
    }
  }, [orderService])

  const [snackOpen, setSnackOpen] = React.useState(false)

  const handleSnackClose = (
    event: React.SyntheticEvent | React.MouseEvent,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return
    }
    setSnackOpen(false)
  }

  const pOrderId = props.match.params.id

  useEffect(() => {
    if (pOrderId) {
      setOrderId(pOrderId)
    }
  }, [pOrderId])

  function onAddLineitem(value: { name: string; product: Product }) {
    if (value && value.name) {
      const lineItem: LineItem = {
        description: value.name,
        quantity: 1,
        selected_unit: '',
        price: 0.0,
        total: 0.0,
        kind: 'product'
      }
      setOrder(order => {
        if (order) {
          return {
            ...order,
            OrderLineItems: [...order?.OrderLineItems, lineItem]
          }
        }
      })
    }
  }

  return loading ? (
    <Loading />
  ) : (
    <div className={classes.root}>
      {order ? (
        <Grid
          container
          spacing={2}
          direction="row"
          justify="center"
          alignItems="flex-start"
        >
          <Grid item sm={12} md={4}>
            <h2>
              EDIT ORDER <i>#{order.id}</i>
            </h2>
            {order.status !== 'new' && order.status !== 'needs_review' && (
              <Typography variant="overline" display="block" gutterBottom>
                warning: this order status is not "new" or "needs review" so
                editing is discouraged!
              </Typography>
            )}
            <form className={classes.form} noValidate autoComplete="off">
              <TextField
                label="name"
                type="text"
                className={classes.formInput}
                fullWidth
                value={order.name}
                onChange={(event: any) => {
                  event.persist()
                  setOrder(order => {
                    if (order !== undefined) {
                      return { ...order, name: event.target.value }
                    }
                  })
                }}
              />
              <TextField
                label="email"
                type="email"
                className={classes.formInput}
                fullWidth
                value={order.email}
                onChange={(event: any) => {
                  event.persist()
                  setOrder(order => {
                    if (order !== undefined) {
                      return { ...order, email: event.target.value }
                    }
                  })
                }}
              />
              <TextField
                label="phone"
                type="phone"
                className={classes.formInput}
                fullWidth
                value={order.phone}
                onChange={(event: any) => {
                  event.persist()
                  setOrder(order => {
                    if (order !== undefined) {
                      return { ...order, phone: event.target.value }
                    }
                  })
                }}
              />
              <TextField
                label="notes"
                className={classes.formInput}
                multiline
                rowsMax="4"
                fullWidth
                value={order.notes}
                onChange={(event: any) => {
                  event.persist()
                  setOrder(order => {
                    if (order !== undefined) {
                      return { ...order, notes: event.target.value }
                    }
                  })
                }}
              />
            </form>
            <p>
              Created on {new Date(order.createdAt).toLocaleString()}
              {order.createdAt !== order.updatedAt && (
                <>
                  <br />
                  <i>Last updated</i>{' '}
                  {new Date(order.updatedAt).toLocaleString()}
                </>
              )}
            </p>
            <Grid container spacing={6} direction="row" justify="flex-end">
              <Grid item>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => props.history.push('/orders')}
                >
                  Cancel
                </Button>
              </Grid>

              <Grid item>
                <Button variant="contained" color="primary" disabled>
                  Save
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item sm={12} md={8}>
            <div>
              {showLiAutocomplete ? (
                <div style={{ display: 'flex' }}>
                  <Tooltip title="close">
                    <IconButton
                      aria-label="close"
                      onClick={() => setShowLiAutocomplete(false)}
                    >
                      <ClearIcon fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                  <LineItemAutocomplete onItemSelected={onAddLineitem} />
                </div>
              ) : (
                <>
                  <Button
                    aria-label="add line items"
                    size="large"
                    onClick={() => setShowLiAutocomplete(true)}
                  >
                    <AddIcon />
                    LINE ITEMS
                  </Button>

                  <Button
                    aria-label="add adjustment"
                    size="large"
                    onClick={() =>
                      console.log('adda fuckin adjustment i guess')
                    }
                  >
                    <AddIcon />
                    ADJUSTMENT
                  </Button>
                  {/* <h4 className={classes.liHeader}>LINE ITEMS</h4> */}
                </>
              )}
            </div>
            <OrderLineItems
              line_items={order.OrderLineItems}
              onLineItemUpdated={() => {}}
              removeLineItem={() => {}}
              onTaxesChange={() => {}}
              onTotalChange={() => {}}
            />
          </Grid>
        </Grid>
      ) : (
        <div>order not found...</div>
      )}

      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        open={snackOpen}
        autoHideDuration={6000}
        onClose={handleSnackClose}
        ContentProps={{
          'aria-describedby': 'message-id'
        }}
        message={<span id="message-id">snackMsg</span>}
        action={[
          <IconButton key="close" aria-label="close" onClick={handleSnackClose}>
            <CloseIcon />
          </IconButton>
        ]}
      />
    </div>
  )
}

export default withRouter(EditOrder)
