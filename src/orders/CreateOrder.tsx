import React, { useState } from 'react'
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
import TagFacesIcon from '@material-ui/icons/TagFaces'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'

import { Order } from '../types/Order'
import { LineItem } from '../types/Order'
import OrderLineItems from './OrderLineItems'
import LineItemAutocomplete from './LineItemAutocomplete'
import UserAutocomplete from './UserAutocomplete'
import { Product } from '../types/Product'
import { User } from '../types/User'
import { API_HOST } from '../constants'

const token = localStorage && localStorage.getItem('token')

const blankOrder: Order = {
  id: 666666,
  status: 'new',
  payment_status: 'balance_due',
  shipment_status: 'backorder',
  total: 0.0,
  name: '',
  email: '',
  phone: '',
  address: '',
  notes: '',
  createdAt: '',
  updatedAt: '',
  OrderLineItems: []
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(2),
      maxWidth: '100vw',
      minHeight: `calc(100vh - 64px)`
    },
    form: {
      marginBottom: theme.spacing(4)
    },
    formInput: {
      display: 'block',
      marginBottom: theme.spacing(2)
    },
    liHeader: {
      display: 'inline-block',
      marginRight: theme.spacing(2)
    },
    sticky: {
      [theme.breakpoints.up('md')]: {
        position: 'sticky',
        top: '72px'
      }
    }
  })
)

function CreateOrder(props: RouteComponentProps) {
  const classes = useStyles()

  const [order, setOrder] = useState<Order>(blankOrder)
  const [saving, setSaving] = useState(false)
  const [showLiAutocomplete, setShowLiAutocomplete] = useState(false)
  const [showUserAutocomplete, setShowUserAutocomplete] = useState(false)
  const [snackOpen, setSnackOpen] = React.useState(false)
  const [snackMsg, setSnackMsg] = React.useState('')

  const handleSnackClose = (
    event: React.SyntheticEvent | React.MouseEvent,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return
    }
    setSnackOpen(false)
  }

  function onAddLineitem(value: { name: string; product: Product }) {
    // console.log('onAddLineitem value:', value)
    if (!value) {
      return
    }
    const { product } = value
    if (value && value.name) {
      const lineItem: LineItem = {
        description: `${product.name} ${product.description}`,
        quantity: 1,
        selected_unit: 'CS',
        price: parseFloat(product.ws_price),
        total: parseFloat(product.ws_price),
        kind: 'product',
        vendor: product.vendor,
        data: { product }
      }
      setOrder(order => ({
        ...order,
        OrderLineItems: [...order.OrderLineItems, lineItem]
      }))
    }
  }

  function onLineItemUpdated(idx: number, line_item: LineItem) {
    setOrder(prevOrder => {
      let orderLineItems = prevOrder.OrderLineItems
      orderLineItems.splice(idx, 1, line_item)

      return {
        ...prevOrder,
        OrderLineItems: orderLineItems
      }
    })
  }
  function removeLineItem(idx: number) {
    setOrder(prevOrder => {
      let orderLineItems = prevOrder.OrderLineItems
      orderLineItems.splice(idx, 1)
      return {
        ...prevOrder,
        OrderLineItems: orderLineItems
      }
    })
  }

  function createAdjustment(event: any) {
    const adjustment: LineItem = {
      description: 'new adjustment',
      quantity: 1,
      price: 0.0,
      total: 0.0,
      kind: 'adjustment'
    }
    setOrder(prevOrder => ({
      ...prevOrder,
      OrderLineItems: [...prevOrder.OrderLineItems, adjustment]
    }))
  }

  function onUserItemSelected(value?: { name: string; user: User }) {
    // console.log('onUserItemSelected value:', value)
    if (value && value.user) {
      const { name, email, phone, address } = value.user
      setOrder(prevOrder => ({
        ...prevOrder,
        name: name || '',
        email: email || '',
        phone: phone || '',
        address: address || ''
      }))
    }
  }

  const onSaveBtnClick = (): void => {
    setSaving(true)
    fetch(`${API_HOST}/order/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(order)
    })
      .then(response => response.json())
      .then(response => {
        if (response.success) {
          setSnackOpen(true)
          setSnackMsg('Saved order!')
        }
      })
      .finally(() => setSaving(false))
  }

  function onTaxesChange(tax: number) {
    console.log('onTaxesChange tax:', tax)
  }

  function onTotalChange(total: number) {
    setOrder(prevOrder => ({
      ...prevOrder,
      total
    }))
  }

  return (
    <div className={classes.root}>
      <Grid
        container
        spacing={2}
        direction="row"
        justify="center"
        alignItems="flex-start"
      >
        <Grid item sm={12} md={4} className={classes.sticky}>
          {showUserAutocomplete ? (
            <div style={{ display: 'flex' }}>
              <Tooltip title="close">
                <IconButton
                  aria-label="close"
                  onClick={() => setShowUserAutocomplete(false)}
                >
                  <ClearIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
              <UserAutocomplete onItemSelected={onUserItemSelected} />
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                minHeight: '54px'
              }}
            >
              <div>
                <Tooltip title="BACK TO ORDERS">
                  <IconButton
                    aria-label="back to orders"
                    onClick={() => props.history.push('/orders')}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                </Tooltip>

                <h2 style={{ display: 'inline' }}>CREATE ORDER</h2>
              </div>
              <div>
                <Tooltip title="ADD USER DETAILS">
                  <IconButton
                    aria-label="add user details"
                    onClick={() => setShowUserAutocomplete(true)}
                  >
                    <TagFacesIcon />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          )}

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
                setOrder(order => ({ ...order, name: event.target.value }))
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
                setOrder(order => ({ ...order, email: event.target.value }))
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
                setOrder(order => ({ ...order, phone: event.target.value }))
              }}
            />
            <TextField
              label="address"
              type="text"
              className={classes.formInput}
              fullWidth
              value={order.address}
              onChange={(event: any) => {
                event.persist()
                setOrder(order => ({ ...order, address: event.target.value }))
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
                setOrder(order => ({ ...order, notes: event.target.value }))
              }}
            />
          </form>
          <Button
            variant="contained"
            color="primary"
            onClick={onSaveBtnClick}
            disabled={saving}
          >
            Save
          </Button>
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
                  onClick={createAdjustment}
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
            onLineItemUpdated={onLineItemUpdated}
            removeLineItem={removeLineItem}
            onTaxesChange={onTaxesChange}
            onTotalChange={onTotalChange}
          />
        </Grid>
      </Grid>

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
        message={<span id="message-id">{snackMsg}</span>}
        action={[
          <IconButton key="close" aria-label="close" onClick={handleSnackClose}>
            <CloseIcon />
          </IconButton>
        ]}
      />
    </div>
  )
}

export default withRouter(CreateOrder)