import React, { useState, useEffect } from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

import Loading from '../Loading'
import {
  useWholesaleOrderService,
  useWholesaleOrderSaveService
} from './useWholesaleOrderService'
import {
  WholesaleOrder,
  WholesaleOrderRouterProps
} from '../types/WholesaleOrder'
import { OrderStatus, ShipmentStatus, PaymentStatus } from '../types/Order'
import {
  API_HOST,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  SHIPMENT_STATUSES
} from '../constants'
import EditMenu from './EditMenu'
import WholesaleOrderLineItems from './WholesaleOrderLineItems'
// import { LineItem } from '../types/Order'

const token = localStorage && localStorage.getItem('token')

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    vendor: {
      marginBottom: theme.spacing(2),
      marginRight: theme.spacing(2)
    },
    editMenu: {
      padding: `${theme.spacing(2)}px 0`,
      textAlign: 'right'
    }
  })
)

interface EditWholesaleOrderProps {
  setReloadOrders: React.Dispatch<React.SetStateAction<boolean>>
}

function EditWholesaleOrder(
  props: EditWholesaleOrderProps &
    RouteComponentProps<WholesaleOrderRouterProps>
) {
  const classes = useStyles()

  const [wholesaleOrderId, setWholesaleOrderId] = useState('')
  const [wholesaleOrder, setWholesaleOrder] = useState<WholesaleOrder>()
  const [loading, setLoading] = useState(true)
  const [doSave, setDoSave] = useState(false)

  const wholesaleOrderService = useWholesaleOrderService(
    wholesaleOrderId,
    setLoading
  )

  useEffect(() => {
    if (wholesaleOrderService.status === 'loaded') {
      if (wholesaleOrderService.payload) {
        setWholesaleOrder(wholesaleOrderService.payload)
      }
    }
  }, [wholesaleOrderService, wholesaleOrderId])

  const [snackOpen, setSnackOpen] = React.useState(false)
  const [snackMsg, setSnackMsg] = React.useState('')

  const handleOrderNotesChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setWholesaleOrder(prevOrder => {
      if (prevOrder) {
        return {
          ...prevOrder,
          notes: event.target.value
        }
      }
    })
  }

  const handleOrderVendorChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setWholesaleOrder(prevOrder => {
      if (prevOrder) {
        return {
          ...prevOrder,
          vendor: event.target.value
        }
      }
    })
  }

  const handleStatusChange = (
    event: React.ChangeEvent<{
      name?: string | undefined
      value: unknown
    }>
  ) => {
    setWholesaleOrder(prevOrder => {
      if (prevOrder) {
        return {
          ...prevOrder,
          status: event.target.value as OrderStatus
        }
      }
    })
  }

  const handlePaymentStatusChange = (
    event: React.ChangeEvent<{
      name?: string | undefined
      value: unknown
    }>
  ) => {
    setWholesaleOrder(prevOrder => {
      if (prevOrder) {
        return {
          ...prevOrder,
          payment_status: event.target.value as PaymentStatus
        }
      }
    })
  }

  const handleShipmentStatusChange = (
    event: React.ChangeEvent<{
      name?: string | undefined
      value: unknown
    }>
  ) => {
    setWholesaleOrder(prevOrder => {
      if (prevOrder) {
        return {
          ...prevOrder,
          shipment_status: event.target.value as ShipmentStatus
        }
      }
    })
  }

  const handleSnackClose = (
    event: React.SyntheticEvent | React.MouseEvent,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return
    }
    setSnackOpen(false)
  }

  const id = props.match.params.id

  useEffect(() => {
    if (id) {
      setWholesaleOrderId(id)
    }
  }, [id])

  const onSaveBtnClick = (): void => {
    if (wholesaleOrderId === 'new') {
      setWholesaleOrder(prevOrder => {
        if (prevOrder) {
          return {
            ...prevOrder,
            id: 'new'
          }
        }
      })
    }
    setDoSave(true)
    props.setReloadOrders(true)
  }

  useWholesaleOrderSaveService(
    wholesaleOrder,
    doSave,
    setDoSave,
    setSnackMsg,
    setSnackOpen
  )

  const onDeleteBtnClick = (): void => {
    wholesaleOrder &&
      fetch(`${API_HOST}/wholesaleorder`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id: wholesaleOrder.id })
      })
        .then(response => response.json())
        .then(response => {
          if (response.error) {
            setSnackMsg(response.msg)
            setSnackOpen(true)
          } else {
            props.history.replace('/wholesaleorders')
          }
        })
        .catch(error => {
          console.warn('delete wholesaleOrder fetch caught err:', error)
          setSnackMsg(`o noz! ${error}`)
          setSnackOpen(true)
        })
  }

  function valueFor(field: keyof WholesaleOrder) {
    return wholesaleOrder && wholesaleOrder[field] ? wholesaleOrder[field] : ''
  }

  return wholesaleOrder ? (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          <Grid
            container
            spacing={2}
            direction="row"
            justify="center"
            alignItems="flex-start"
          >
            <Grid item sm={5}>
              <TextField
                className={classes.vendor}
                label="vendor"
                fullWidth
                value={valueFor('vendor')}
                onChange={handleOrderVendorChange}
              />
              <FormControl fullWidth>
                <InputLabel id="order-status-select-label">status</InputLabel>
                <Select
                  labelId="order-status-select-label"
                  id="order-status-select"
                  value={valueFor('status')}
                  onChange={handleStatusChange}
                >
                  {Object.keys(ORDER_STATUSES).map(status => (
                    <MenuItem key={`os-sel-${status}`} value={status}>
                      {ORDER_STATUSES[status as OrderStatus]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="payment-status-select-label">
                  payment status
                </InputLabel>
                <Select
                  labelId="payment-status-select-label"
                  id="payment-status-select"
                  value={valueFor('payment_status')}
                  onChange={handlePaymentStatusChange}
                >
                  {Object.keys(PAYMENT_STATUSES).map(status => (
                    <MenuItem key={`ps-sel-${status}`} value={status}>
                      {PAYMENT_STATUSES[status as PaymentStatus]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="shipment-status-select-label">
                  shipment status
                </InputLabel>
                <Select
                  labelId="shipment-status-select-label"
                  id="shipment-status-select"
                  value={valueFor('shipment_status')}
                  onChange={handleShipmentStatusChange}
                >
                  {Object.keys(SHIPMENT_STATUSES).map(status => (
                    <MenuItem key={`ship-sel-${status}`} value={status}>
                      {SHIPMENT_STATUSES[status as ShipmentStatus]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item sm={7}>
              <TextField
                label="notes"
                multiline
                fullWidth
                rows={4}
                rowsMax={28}
                value={valueFor('notes')}
                onChange={handleOrderNotesChange}
              />
              <div className={classes.editMenu}>
                <EditMenu
                  wholesaleOrder={wholesaleOrder}
                  onSaveBtnClick={onSaveBtnClick}
                  onDeleteBtnClick={onDeleteBtnClick}
                />
              </div>
            </Grid>
          </Grid>
          <WholesaleOrderLineItems wholesaleOrder={wholesaleOrder} />
        </>
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
        message={<span id="message-id">{snackMsg}</span>}
        action={[
          <IconButton key="close" aria-label="close" onClick={handleSnackClose}>
            <CloseIcon />
          </IconButton>
        ]}
      />
    </>
  ) : (
    <Loading />
  )
}

export default withRouter(EditWholesaleOrder)
