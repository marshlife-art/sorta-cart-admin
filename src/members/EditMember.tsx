import React, { useState, useEffect } from 'react'
import { useNavigate, useMatch } from 'react-router-dom'
import { makeStyles, Theme, createStyles, Icon } from '@material-ui/core'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import Checkbox from '@material-ui/core/Checkbox'
import Select from '@material-ui/core/Select'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListSubheader from '@material-ui/core/ListSubheader'
import ListItemText from '@material-ui/core/ListItemText'

import Loading from '../Loading'
import { fetchStoreCredit } from '../orders/EditOrder'
import { SupaMember, SuperOrderAndAssoc as Order } from '../types/SupaTypes'
import { upsertMember } from '../services/mutations'
import { memberFetcher, ordersForMember } from '../services/fetchers'

type Member =
  | Omit<SupaMember, 'id' | 'data' | 'is_admin'> & {
      id?: string | number
      data: string | object
      is_admin?: boolean
    }

const blankMember: Member = {
  id: 'new',
  registration_email: '',
  name: '',
  phone: '',
  address: '',
  discount: 0,
  discount_type: '',
  fees_paid: 0,
  store_credit: 0,
  shares: 0,
  member_type: '',
  is_admin: false,
  data: {}
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      margin: theme.spacing(2),
      padding: theme.spacing(2)
    },
    gridItem: {
      margin: theme.spacing(2, 0)
    },
    sticky: {
      [theme.breakpoints.up('sm')]: {
        position: 'sticky',
        top: '0'
      },
      zIndex: 1,
      backgroundColor: theme.palette.background.paper,
      width: '100%'
    },
    ordersHeader: {
      fontSize: '1.25em',
      backgroundColor: theme.palette.background.paper
    }
  })
)

async function fetchMemberOrders(
  MemberId: string,
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>
) {
  const { data: orders, error } = await ordersForMember(Number(MemberId))
  if (error || !orders) {
    console.warn('fetchMemberOrders got error', error)
    setOrders([])
  } else {
    setOrders(orders as Order[])
  }
}

export default function EditMember() {
  const navigate = useNavigate()
  const match = useMatch('/members/:id')
  const classes = useStyles()
  const [loadingMember, setLoadingMember] = useState(true)
  const [loading, setLoading] = useState(false)

  const [error, setError] = useState('')
  const [response, setResponse] = useState('')
  const memberId = match?.params?.id

  const [member, setMember] = useState<Member>(blankMember)
  const [createNewUser, setCreateNewUser] = useState(false)
  const [storeCredit, setStoreCredit] = useState(0)
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    if (!memberId || memberId === 'undefined') {
      return
    }

    if (memberId === 'new') {
      setMember(blankMember)
      setLoadingMember(false)
    } else {
      memberFetcher(Number(memberId)).then(({ data: member }) => {
        setMember({
          ...member,
          data: member?.data ? JSON.parse(member.data) : {}
        })
        setLoadingMember(false)
      })

      if (!memberId) {
        return
      }
      fetchStoreCredit(memberId, setStoreCredit)
      fetchMemberOrders(memberId, setOrders)
    }
  }, [memberId])

  async function submitData() {
    setError('')
    setResponse('')
    setLoading(true)

    const { error } = await upsertMember({
      ...member,
      id: memberId === 'new' ? undefined : memberId,
      createdAt: memberId === 'new' ? undefined : member.createdAt,
      updatedAt: null,
      fts: undefined
    })

    if (error) {
      console.warn('upsert member caugher err:', error)
      setError(error.message)
    } else {
      setResponse('Success!')
    }
    setLoading(false)
  }

  return (
    <Paper className={classes.root}>
      {loadingMember ? (
        <Loading />
      ) : (
        <Grid
          container
          spacing={2}
          direction="row"
          justifyContent="center"
          alignItems="flex-start"
        >
          <Grid item sm={6}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                minHeight: '54px'
              }}
              className={classes.sticky}
            >
              <Tooltip title="BACK TO MEMBERS">
                <IconButton
                  aria-label="back to members"
                  onClick={() => navigate('/members')}
                >
                  <Icon>arrow_back</Icon>
                </IconButton>
              </Tooltip>

              <h2>{memberId === 'new' ? 'Create' : 'Edit'} Member</h2>
            </div>

            <TextField
              label="email"
              fullWidth
              value={member.registration_email}
              className={classes.gridItem}
              onChange={(
                event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
              ) => {
                event.persist()
                setMember((prevMember) => ({
                  ...prevMember,
                  registration_email: event.target.value
                }))
              }}
            />
            <TextField
              label="name"
              fullWidth
              value={member.name}
              className={classes.gridItem}
              onChange={(event) => {
                event.persist()
                setMember((prevMember) => ({
                  ...prevMember,
                  name: event.target.value
                }))
              }}
            />
            <TextField
              label="phone"
              fullWidth
              value={member.phone}
              className={classes.gridItem}
              onChange={(event) => {
                event.persist()
                setMember((prevMember) => ({
                  ...prevMember,
                  phone: event.target.value
                }))
              }}
            />
            <TextField
              label="address"
              fullWidth
              value={member.address}
              className={classes.gridItem}
              onChange={(event) => {
                event.persist()
                setMember((prevMember) => ({
                  ...prevMember,
                  address: event.target.value
                }))
              }}
            />
            <TextField
              label="discount"
              fullWidth
              value={member.discount}
              type="number"
              className={classes.gridItem}
              onChange={(event) => {
                event.persist()
                setMember((prevMember) => ({
                  ...prevMember,
                  discount: parseFloat(event.target.value)
                }))
              }}
            />
            <TextField
              label="discount type"
              fullWidth
              value={member.discount_type}
              className={classes.gridItem}
              onChange={(event) => {
                event.persist()
                setMember((prevMember) => ({
                  ...prevMember,
                  discount_type: event.target.value
                }))
              }}
            />

            <TextField
              label="fees paid"
              fullWidth
              value={member.fees_paid}
              type="number"
              className={classes.gridItem}
              onChange={(event) => {
                event.persist()
                setMember((prevMember) => ({
                  ...prevMember,
                  fees_paid: parseFloat(event.target.value)
                }))
              }}
            />

            <TextField
              label="store credit"
              fullWidth
              value={member.store_credit}
              className={classes.gridItem}
              type="number"
              helperText="note: depreciated, don't use this store_credit field anymore."
            />
            <TextField
              label="shares"
              fullWidth
              value={member.shares}
              className={classes.gridItem}
              type="number"
              onChange={(event) => {
                event.persist()
                setMember((prevMember) => ({
                  ...prevMember,
                  shares: parseFloat(event.target.value)
                }))
              }}
            />

            <FormControl fullWidth className={classes.gridItem}>
              <InputLabel id="prev-import-tag-select-label">Type</InputLabel>
              <Select
                labelId="prev-import-tag-select-label"
                id="prev-import-tag-select"
                value={member.member_type}
                onChange={(event) =>
                  event.target &&
                  event.target.value &&
                  setMember((prevMember) => ({
                    ...prevMember,
                    member_type: event.target.value as string
                  }))
                }
              >
                <MenuItem value="consumer-owners">consumer-owner</MenuItem>
                <MenuItem value="worker-owners">worker-owner</MenuItem>
                <MenuItem value="producer-owners">producer owner</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth className={classes.gridItem}>
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={(
                      event: React.ChangeEvent<HTMLInputElement>,
                      checked: boolean
                    ) => {
                      setCreateNewUser(checked)
                    }}
                    value="createNewUser"
                  />
                }
                label="Create User"
              />
            </FormControl>

            <div className={classes.gridItem}>
              <Button
                disabled={loading}
                onClick={() => submitData()}
                variant="contained"
                color="primary"
                fullWidth
              >
                {memberId === 'new' ? 'CREATE' : 'SAVE'}
              </Button>
            </div>
          </Grid>

          <Grid item sm={6} className={classes.sticky} zeroMinWidth>
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

            {member && member.data && (
              <dl>
                {Object.entries(member.data).map(([k, v]) => (
                  <React.Fragment key={`memberdata${k}`}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </React.Fragment>
                ))}
              </dl>
            )}

            {storeCredit !== 0 && (
              <Box color="info.main">
                <Typography variant="overline" display="block" gutterBottom>
                  Member has store credit: {storeCredit}
                </Typography>
              </Box>
            )}

            {orders.length > 0 && (
              <List
                component="nav"
                aria-label="member orders"
                subheader={
                  <ListSubheader
                    component="h2"
                    className={classes.ordersHeader}
                  >
                    Orders ({orders.length})
                  </ListSubheader>
                }
              >
                {orders.map((order) => (
                  <ListItem
                    key={order.id}
                    button
                    href={`/orders/edit/${order.id}`}
                    onClick={() => navigate(`/orders/edit/${order.id}`)}
                  >
                    <ListItemText
                      primary={`#${order.id} $${order.total} (${order.item_count})`}
                      secondary={
                        order.createdAt &&
                        new Date(order.createdAt).toLocaleString()
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Grid>
        </Grid>
      )}
    </Paper>
  )
}
