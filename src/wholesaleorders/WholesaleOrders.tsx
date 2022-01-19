import React, { useState, useEffect } from 'react'
import { useMatch, useNavigate } from 'react-router-dom'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import MUILink from '@material-ui/core/Link'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import { useSelector } from 'react-redux'
import { RootState } from '../redux'
import { UserService } from '../redux/session/reducers'
import EditWholesaleOrder from './EditWholesaleOrder'
import { useAllWholesaleOrdersService } from './useWholesaleOrderService'
import { SupaWholesaleOrder as WholesaleOrder } from '../types/SupaTypes'

import MuiExpansionPanel from '@material-ui/core/ExpansionPanel'
import MuiExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary'
import MuiExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails'
import { withStyles } from '@material-ui/core/styles'
import { OrderStatus } from '../types/Order'
import Loading from '../Loading'
import { ORDER_STATUSES } from '../constants'
import AddWholesaleOrderLineItems from './AddWholesaleOrderLineItems'
import Link from '@material-ui/core/Link'
import { Icon } from '@material-ui/core'

const ExpansionPanel = withStyles({
  root: {
    border: '1px solid rgba(0, 0, 0, .125)',
    boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 0
    },
    '&:before': {
      display: 'none'
    },
    '&$expanded': {
      margin: 'auto'
    }
  },
  expanded: {}
})(MuiExpansionPanel)

const ExpansionPanelSummary = withStyles({
  root: {
    backgroundColor: 'rgba(0, 0, 0, .03)',
    borderBottom: '1px solid rgba(0, 0, 0, .125)',
    marginBottom: -1,
    minHeight: 56,
    '&$expanded': {
      minHeight: 56
    }
  },
  content: {
    '&$expanded': {
      margin: '12px 0'
    }
  },
  expanded: {}
})(MuiExpansionPanelSummary)

const ExpansionPanelDetails = withStyles((theme) => ({
  root: {
    padding: 0 //theme.spacing(2)
  }
}))(MuiExpansionPanelDetails)

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(2),
      maxWidth: '100vw',
      minHeight: '100vh'
    },
    title: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      textAlign: 'left',
      marginLeft: theme.spacing(2),
      padding: theme.spacing(2)
    },
    titleText: {
      flexGrow: 1
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
      height: '100%'
    },
    paperNav: {
      textAlign: 'center',
      color: theme.palette.text.secondary,
      height: '100%'
    },
    list: {
      padding: 0,
      width: '90%'
    },
    selectedListItem: {
      borderLeft: `${theme.spacing(2)}px solid ${theme.palette.divider}`
    },
    noOrdersMsg: {
      padding: theme.spacing(2)
    }
  })
)

interface Props {
  userService?: UserService
}

export default function WholesaleOrders(props: Props) {
  const navigate = useNavigate()
  const match = useMatch('/wholesaleorders/edit/:id')
  const userService = useSelector<RootState, UserService>(
    (state) => state.session.userService
  )

  const classes = useStyles()

  const [wholesaleOrders, setWholesaleOrders] = useState<WholesaleOrder[]>([])
  const [reloadOrders, setReloadOrders] = useState(true)
  const [loading, setLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('new')
  const allWholesaleOrders = useAllWholesaleOrdersService(
    selectedStatus,
    setLoading,
    reloadOrders,
    setReloadOrders
  )

  useEffect(() => {
    allWholesaleOrders.status === 'loaded' &&
      setWholesaleOrders(allWholesaleOrders.payload)
  }, [allWholesaleOrders])

  const [snackOpen, setSnackOpen] = useState(false)
  const handleSnackClose = (
    event: React.SyntheticEvent | React.MouseEvent,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return
    }
    setSnackOpen(false)
  }

  function addWholesaleOrder() {
    navigate('/wholesaleorders/edit/new')
    setSnackOpen(true)
  }

  function loadOrdersForStatus(status: OrderStatus, expanded: boolean) {
    if (expanded) {
      setSelectedStatus(status)
      setReloadOrders(true)
    }
  }

  let id: string | number | undefined
  try {
    id = window.location.pathname.split('/').reverse()[0]
    if (isNaN(parseInt(id))) {
      id = undefined
    }
  } catch {
    /* wellfuck */
  }

  return userService ? (
    <>
      <Grid
        container
        direction="row"
        justify="space-between"
        alignItems="stretch"
        className={classes.root}
        spacing={2}
      >
        <Grid sm={12} md={3} lg={2} item>
          <Paper className={classes.paperNav}>
            <div className={classes.title}>
              <MUILink
                color="textPrimary"
                href="/wholesaleorders"
                onClick={(e: any) => {
                  e.preventDefault()
                  navigate('/wholesaleorders')
                }}
                className={classes.titleText}
              >
                WHOLESALE ORDERS
              </MUILink>
              <IconButton
                aria-label="add wholesale order"
                title="add wholeslae order"
                onClick={() => addWholesaleOrder()}
              >
                <Icon>add</Icon>
              </IconButton>
            </div>

            {Object.keys(ORDER_STATUSES).map((status) => (
              <ExpansionPanel
                square
                key={`EP${status}`}
                defaultExpanded={status === 'new'}
                expanded={selectedStatus === status}
                onChange={(event: any, expanded: boolean) =>
                  loadOrdersForStatus(status as OrderStatus, expanded)
                }
              >
                <ExpansionPanelSummary
                  expandIcon={<Icon>expand_more</Icon>}
                  aria-controls={`panel${status}-content`}
                  id={`panel${status}-header`}
                >
                  <Typography>
                    {ORDER_STATUSES[status as OrderStatus]}
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                  {loading ? (
                    <Loading />
                  ) : (
                    <List className={classes.list}>
                      {wholesaleOrders && wholesaleOrders.length ? (
                        wholesaleOrders.map(
                          (order: WholesaleOrder, idx: number) => (
                            <ListItem
                              button
                              key={`wsorder${idx}`}
                              className={
                                // eslint-disable-next-line
                                id == order.id
                                  ? classes.selectedListItem
                                  : undefined
                              }
                              component="a"
                              href={`/wholesaleorders/edit/${order.id}`}
                              onClick={(
                                event: React.MouseEvent<HTMLAnchorElement>
                              ) => {
                                event.preventDefault()
                                navigate(`/wholesaleorders/edit/${order.id}`)
                              }}
                            >
                              <ListItemText
                                primary={order.vendor}
                                secondary={new Date(
                                  order.createdAt || ''
                                ).toLocaleDateString()}
                              />
                            </ListItem>
                          )
                        )
                      ) : (
                        <div className={classes.noOrdersMsg}>
                          <i>No wholesale orders for this status...</i>
                        </div>
                      )}
                    </List>
                  )}
                </ExpansionPanelDetails>
              </ExpansionPanel>
            ))}
          </Paper>
        </Grid>

        <Grid sm={12} md={9} lg={10} item>
          {match?.params?.id ? (
            <Paper className={classes.paper}>
              <EditWholesaleOrder setReloadOrders={setReloadOrders} />
            </Paper>
          ) : (
            <AddWholesaleOrderLineItems setReloadOrders={setReloadOrders} />
          )}
        </Grid>
      </Grid>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        open={snackOpen}
        autoHideDuration={4000}
        onClose={handleSnackClose}
        ContentProps={{
          'aria-describedby': 'message-id'
        }}
        message={<span id="message-id">Created new Wholesale Order!</span>}
        action={[
          <IconButton key="close" aria-label="close" onClick={handleSnackClose}>
            <Icon>close</Icon>
          </IconButton>
        ]}
      />
    </>
  ) : null
}
