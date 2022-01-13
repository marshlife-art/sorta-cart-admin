import React, { useState, useEffect } from 'react'
import { useNavigate, useMatch } from 'react-router-dom'
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
import AddIcon from '@material-ui/icons/Add'
import ClearIcon from '@material-ui/icons/Clear'
import { FormControlLabel, Checkbox, Button, Tooltip } from '@material-ui/core'
import { Parser } from 'json2csv'

import { LineItem } from '../types/Order'
import { Product } from '../types/Product'
import { SquareStatus, WholesaleOrder } from '../types/WholesaleOrder'
import { OrderStatus, ShipmentStatus, PaymentStatus } from '../types/Order'
import {
  API_HOST,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  SHIPMENT_STATUSES,
  SQUARE_STATUSES
} from '../constants'
import Loading from '../Loading'
import {
  useWholesaleOrderService,
  useWholesaleOrderSaveService
} from './useWholesaleOrderService'
import EditMenu from './EditMenu'
import WholesaleOrderLineItems from './WholesaleOrderLineItems'
import { supabase } from '../lib/supabaseClient'
import { formatDistance, formatRelative } from 'date-fns'
import LineItemAutocomplete from '../orders/LineItemAutocomplete'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    vendor: {
      marginBottom: theme.spacing(2),
      marginRight: theme.spacing(2)
    },
    editMenu: {
      padding: `${theme.spacing(2)}px 0`,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center'
    }
  })
)

export interface GroupedItem {
  qtySum: number
  qtyUnits: number
  qtyAdjustments: number
  totalSum: number
  product: Product | undefined
  vendor: string | undefined
  description: string
  line_items: LineItem[]
}

export interface LineItemData {
  groupedLineItems: {
    [key: string]: GroupedItem
  }
  orderTotal: number
  productTotal: number
  adjustmentTotal: number
}

interface EditWholesaleOrderProps {
  setReloadOrders: React.Dispatch<React.SetStateAction<boolean>>
}

export default function EditWholesaleOrder(props: EditWholesaleOrderProps) {
  const navigate = useNavigate()
  const match = useMatch('wholesaleorders/edit/:id')
  const classes = useStyles()

  const [wholesaleOrderId, setWholesaleOrderId] = useState('')
  const [wholesaleOrder, setWholesaleOrder] = useState<WholesaleOrder>()
  const [loading, setLoading] = useState(true)
  const [doSave, setDoSave] = useState(false)
  const [reload, setReload] = useState(true)
  const [showLiAutocomplete, setShowLiAutocomplete] = useState(false)

  const [lineItemData, setLineItemData] = useState<LineItemData>({
    groupedLineItems: {},
    productTotal: 0,
    adjustmentTotal: 0,
    orderTotal: 0
  })

  const wholesaleOrderService = useWholesaleOrderService(
    wholesaleOrderId,
    setLoading,
    reload,
    setReload
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

  const handleOrderNotesChange = (notes?: string) => {
    setWholesaleOrder((prevOrder) => {
      if (prevOrder) {
        return {
          ...prevOrder,
          notes
        }
      }
    })
  }

  const handleOrderVendorChange = (vendor: string) => {
    setWholesaleOrder((prevOrder) => {
      if (prevOrder) {
        return {
          ...prevOrder,
          vendor
        }
      }
    })
  }

  const handleStatusChange = (status: OrderStatus) => {
    setWholesaleOrder((prevOrder) => {
      if (prevOrder) {
        return {
          ...prevOrder,
          status
        }
      }
    })
  }

  const handlePaymentStatusChange = (payment_status: PaymentStatus) => {
    setWholesaleOrder((prevOrder) => {
      if (prevOrder) {
        return {
          ...prevOrder,
          payment_status
        }
      }
    })
  }

  const handleShipmentStatusChange = (shipment_status: ShipmentStatus) => {
    setWholesaleOrder((prevOrder) => {
      if (prevOrder) {
        return {
          ...prevOrder,
          shipment_status
        }
      }
    })
  }

  const handleCalcAdjustmentsChange = (calc_adjustments: boolean) => {
    setWholesaleOrder((prevOrder) => {
      if (prevOrder) {
        return {
          ...prevOrder,
          calc_adjustments
        }
      }
    })
  }

  const handleSquareStatusChange = (square_status: SquareStatus) => {
    setWholesaleOrder((prevOrder) => {
      if (prevOrder) {
        return {
          ...prevOrder,
          square_status
        }
      }
    })
  }

  const handleDataChange = (data: object) => {
    setWholesaleOrder((prevOrder) => {
      if (prevOrder) {
        return {
          ...prevOrder,
          data
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

  useEffect(() => {
    if (lineItemData) {
      handleDataChange(lineItemData)
    }
  }, [lineItemData])

  const id = match?.params?.id

  useEffect(() => {
    if (id) {
      setWholesaleOrderId(id)
    }
  }, [id])

  const onSaveBtnClick = (): void => {
    if (wholesaleOrderId === 'new') {
      setWholesaleOrder((prevOrder) => {
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

  const onDeleteBtnClick = async (): Promise<void> => {
    if (!wholesaleOrder) {
      return
    }

    const updateOLIResult = await supabase
      .from('OrderLineItems')
      .update({ WholesaleOrderId: null })
      .eq('WholesaleOrderId', wholesaleOrder.id)

    if (updateOLIResult.error && updateOLIResult.status !== 404) {
      console.warn(
        'delete wholesale firstUpdateOLI order caught error:',
        updateOLIResult
      )
      setSnackMsg(updateOLIResult.error.message)
      setSnackOpen(true)
      return
    }

    const result = await supabase
      .from('WholesaleOrders')
      .delete()
      .eq('id', wholesaleOrder.id)

    if (result.error) {
      console.warn('delete wholesale order caught error:', result.error)
      setSnackMsg(result.error.message)
      setSnackOpen(true)
    } else {
      navigate('/wholesaleorders')
    }
  }

  const saveStreamCSV = (filename: string, text: any) => {
    // lolol shoutout to https://stackoverflow.com/questions/37095233/downloading-and-saving-data-with-fetch-from-authenticated-rest

    // if (window.navigator.msSaveBlob) {
    //   // IE 10 and later, and Edge.
    //   const blobObject = new Blob([text], { type: 'text/csv' })
    //   window.navigator.msSaveBlob(blobObject, filename)
    // } else {
    // Everthing else (except old IE).
    // Create a dummy anchor (with a download attribute) to click.
    const anchor = document.createElement('a')
    anchor.download = filename
    if (window.URL.createObjectURL) {
      // Everything else new.
      const blobObject = new Blob([text], { type: 'text/csv' })
      anchor.href = window.URL.createObjectURL(blobObject)
    } else {
      // Fallback for older browsers (limited to 2MB on post-2010 Chrome).
      // Load up the data into the URI for "download."
      anchor.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(text)
    }
    // Now, click it.
    if (document.createEvent) {
      const event = document.createEvent('MouseEvents')
      event.initEvent('click', true, true)
      anchor.dispatchEvent(event)
    } else {
      anchor.click()
    }
    // }
  }

  const onProductsExportToCsv = (): void => {
    const vendor = wholesaleOrder && wholesaleOrder.vendor
    if (!vendor) {
      return
    }
    const json2csvParser = new Parser({
      fields: [
        { value: 'product.unf', label: 'unf' },
        { value: 'product.upc_code', label: 'upc_code' },
        { value: 'product.plu', label: 'plu' },
        { value: 'vendor', label: 'vendor' },
        { value: 'description', label: 'description' },
        { value: 'qtySum', label: 'qtySum' },
        { value: 'qtyUnits', label: 'units ordered' },
        { value: 'qtyAdjustments', label: 'on_hand_count_change' },
        { value: 'totalSum', label: 'totalSum' },
        { value: 'product.ws_price_cost', label: 'ws_price_cost' },
        { value: 'product.u_price_cost', label: 'u_price_cost' },
        { value: 'product.pk', label: 'pk' },
        { value: 'product.size', label: 'size' },
        { value: 'product.unit_type', label: 'unit_type' },
        { value: 'product.category', label: 'category' },
        { value: 'product.sub_category', label: 'sub_category' },
        { value: 'product.name', label: 'name' },
        { value: 'product.description', label: 'description' },
        { value: 'product.count_on_hand', label: 'count_on_hand' }
      ]
    })
    const csvout = json2csvParser.parse(
      Object.values(lineItemData.groupedLineItems)
    )
    saveStreamCSV(`${vendor}.csv`, csvout)
  }

  const onImportToSquare = (): void => {
    // handleSquareStatusChange('ready_to_import')
    // handleStatusChange('pending')
    setDoSave(true)
    props.setReloadOrders(true)
    // #TODO: call out to API_HOST, here? or can it be listening to this square_status change?

    fetch(`${API_HOST}/api/wholesaleorders/ready-to-import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ api_key: wholesaleOrder?.api_key })
    })
      .then((r) => r.json())
      .then((response) => {
        console.log('zomggg the response!')
      })
  }

  function valueFor(field: keyof WholesaleOrder) {
    return wholesaleOrder && wholesaleOrder[field] ? wholesaleOrder[field] : ''
  }

  async function onAddLineitem(value: { name: string; product: Product }) {
    const wsOrderId = parseInt(wholesaleOrderId)
    if (!value || !value.product || isNaN(wsOrderId)) {
      return
    }
    const { product } = value

    const lineItem: LineItem = {
      WholesaleOrderId: wsOrderId,
      description: `${product.name} ${product.description}`,
      quantity: 1,
      selected_unit: product.unit_type || 'CS',
      price: parseFloat(product.ws_price),
      total: parseFloat(product.ws_price),
      kind: 'product',
      vendor: product.vendor,
      data: { product }
    }

    const { error } = await supabase.from('OrderLineItems').insert(lineItem)
    if (error) {
      setSnackMsg(`error adding line item: ${error.message}`)
      setSnackOpen(true)
      return
    }
    setReload(true)
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
                onChange={(event) =>
                  handleOrderVendorChange(event.target.value)
                }
              />
              <FormControl fullWidth>
                <InputLabel id="order-status-select-label">status</InputLabel>
                <Select
                  labelId="order-status-select-label"
                  id="order-status-select"
                  value={valueFor('status')}
                  onChange={(event) =>
                    handleStatusChange(event.target.value as OrderStatus)
                  }
                >
                  {Object.keys(ORDER_STATUSES).map((status) => (
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
                  onChange={(event) =>
                    handlePaymentStatusChange(
                      event.target.value as PaymentStatus
                    )
                  }
                >
                  {Object.keys(PAYMENT_STATUSES).map((status) => (
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
                  onChange={(event) =>
                    handleShipmentStatusChange(
                      event.target.value as ShipmentStatus
                    )
                  }
                >
                  {Object.keys(SHIPMENT_STATUSES).map((status) => (
                    <MenuItem key={`ship-sel-${status}`} value={status}>
                      {SHIPMENT_STATUSES[status as ShipmentStatus]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="square-status-select-label">
                  square status
                </InputLabel>
                <Select
                  labelId="square-status-select-label"
                  id="square-status-select"
                  value={valueFor('square_status')}
                  onChange={(event) =>
                    handleSquareStatusChange(event.target.value as SquareStatus)
                  }
                  disabled={
                    !!wholesaleOrder.square_loaded_at ||
                    wholesaleOrder.square_status === 'ready_to_import' ||
                    wholesaleOrder.square_status === 'complete'
                  }
                >
                  {Object.keys(SQUARE_STATUSES).map((status) => (
                    <MenuItem key={`ship-sel-${status}`} value={status}>
                      {SQUARE_STATUSES[status as SquareStatus]}
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
                rows={9}
                rowsMax={28}
                value={valueFor('notes')}
                onChange={(event) => handleOrderNotesChange(event.target.value)}
              />
              <div>
                {wholesaleOrder.updatedAt && (
                  <div>
                    last updated:{' '}
                    {formatRelative(
                      new Date(wholesaleOrder.updatedAt),
                      Date.now()
                    )}
                  </div>
                )}
                {wholesaleOrder.square_loaded_at && (
                  <div>
                    square loaded:{' '}
                    {formatDistance(
                      new Date(wholesaleOrder.square_loaded_at),
                      Date.now(),
                      {
                        addSuffix: true
                      }
                    )}
                  </div>
                )}
              </div>
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
                <div className={classes.editMenu}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>,
                          checked: boolean
                        ) => {
                          handleCalcAdjustmentsChange(checked)
                        }}
                        checked={!!valueFor('calc_adjustments')}
                        value="calc_adjustments"
                        disabled={
                          !!wholesaleOrder.square_loaded_at ||
                          wholesaleOrder.status === 'pending' ||
                          wholesaleOrder.square_status === 'ready_to_import' ||
                          wholesaleOrder.square_status === 'complete'
                        }
                      />
                    }
                    label="Calculate Adjustments"
                  />
                  <Button
                    aria-label="add line items"
                    size="large"
                    onClick={() => setShowLiAutocomplete(true)}
                    disabled={isNaN(parseInt(wholesaleOrderId))}
                  >
                    <AddIcon />
                    LINE ITEMS
                  </Button>
                  <EditMenu
                    wholesaleOrder={wholesaleOrder}
                    onSaveBtnClick={onSaveBtnClick}
                    onDeleteBtnClick={onDeleteBtnClick}
                    onProductsExportToCsv={onProductsExportToCsv}
                    onImportToSquare={onImportToSquare}
                  />
                </div>
              )}
            </Grid>
          </Grid>
          <WholesaleOrderLineItems
            wholesaleOrder={wholesaleOrder}
            setReload={setReload}
            lineItemData={lineItemData}
            setLineItemData={setLineItemData}
            setSnackMsg={setSnackMsg}
            setSnackOpen={setSnackOpen}
            calcAdjustments={!!valueFor('calc_adjustments')}
          />
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
