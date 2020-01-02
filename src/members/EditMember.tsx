import React, { useState, useEffect } from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { makeStyles, Theme, createStyles } from '@material-ui/core'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
// import FormHelperText from '@material-ui/core/FormHelperText'
import Select from '@material-ui/core/Select'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'

// import Menu from '@material-ui/core/Menu'
// import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import { Member, MemberRouterProps } from '../types/Member'

import Loading from '../Loading'
import { API_HOST } from '../constants'

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
      backgroundColor: theme.palette.background.paper
    }
  })
)

function EditMember(props: RouteComponentProps<MemberRouterProps>) {
  const classes = useStyles()
  const [loadingMember, setLoadingMember] = useState(true)
  const [loading, setLoading] = useState(false)

  const [error, setError] = useState('')
  const [response, setResponse] = useState('')
  const memberId = props.match.params.id

  const [member, setMember] = useState<Member>(blankMember)

  const token = localStorage && localStorage.getItem('token')

  useEffect(() => {
    if (!memberId || memberId === 'undefined') {
      return
    }

    if (memberId === 'new') {
      setMember(blankMember)
      setLoadingMember(false)
    } else {
      fetch(`${API_HOST}/members`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          filters: [
            {
              column: {
                field: 'id'
              },
              value: memberId
            }
          ]
        })
      })
        .then(response => response.json())
        .then(response => {
          // console.log('zomfg response:', response)
          setMember(response.data[0] as Member)
        })
        .catch(err => setMember(blankMember))
        .finally(() => setLoadingMember(false))
    }
  }, [memberId, token])

  function submitData() {
    setError('')
    setResponse('')
    setLoading(true)

    const path = memberId === 'new' ? '/create' : '/update'

    fetch(`${API_HOST}/member${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ member })
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

  return (
    <Paper className={classes.root}>
      {loadingMember ? (
        <Loading />
      ) : (
        <Grid
          container
          spacing={2}
          direction="row"
          justify="center"
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
                  onClick={() => props.history.push('/members')}
                >
                  <ArrowBackIcon />
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
                setMember(prevMember => ({
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
              onChange={event => {
                event.persist()
                setMember(prevMember => ({
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
              onChange={event => {
                event.persist()
                setMember(prevMember => ({
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
              onChange={event => {
                event.persist()
                setMember(prevMember => ({
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
              onChange={event => {
                event.persist()
                setMember(prevMember => ({
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
              onChange={event => {
                event.persist()
                setMember(prevMember => ({
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
              onChange={event => {
                event.persist()
                setMember(prevMember => ({
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
              onChange={event => {
                event.persist()
                setMember(prevMember => ({
                  ...prevMember,
                  store_credit: parseFloat(event.target.value)
                }))
              }}
            />
            <TextField
              label="shares"
              fullWidth
              value={member.shares}
              className={classes.gridItem}
              type="number"
              onChange={event => {
                event.persist()
                setMember(prevMember => ({
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
                onChange={event =>
                  event.target &&
                  event.target.value &&
                  setMember(prevMember => ({
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

          <Grid item sm={6} className={classes.sticky}>
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
          </Grid>
        </Grid>
      )}
    </Paper>
  )
}

export default withRouter(EditMember)
