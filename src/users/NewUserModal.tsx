import React, { useState, useEffect } from 'react'
import Modal from '@material-ui/core/Modal'
import Backdrop from '@material-ui/core/Backdrop'
import Fade from '@material-ui/core/Fade'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import InputLabel from '@material-ui/core/InputLabel'
import Box from '@material-ui/core/Box'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'

import { API_HOST } from '../constants'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    paper: {
      backgroundColor: theme.palette.background.paper,
      border: '2px solid #000',
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3)
    }
  })
)

const ROLES = ['admin', 'member', 'guest']

export default function NewUserModal(props: {
  open: boolean
  handleClose: () => void
  handleRefresh: () => void
}) {
  const classes = useStyles()

  const [email, setEmail] = useState('')
  const [role, setRole] = useState('guest')
  const [disabled, setDiabled] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (email && email.includes('@')) {
      setDiabled(false)
    } else {
      setDiabled(true)
    }
  }, [email])

  const createUser = () => {
    if (!email) {
      setError('type an email!')
      return
    } else {
      setError('')
    }
    fetch(`${API_HOST}/user/create`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ email, role })
    })
      .then((response) => response.json())
      .then((result) => {
        // console.log('result', result)
        if (result.error) {
          return setError(result.msg)
        } else {
          props.handleRefresh()
          props.handleClose()
        }
      })
      .catch((err) => {
        console.warn(err)
        return setError('o noz! there was an error creating user')
      })
      .finally(() => setDiabled(false))
  }

  return (
    <div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={props.open}
        onClose={props.handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500
        }}
      >
        <Fade in={props.open}>
          <div className={classes.paper}>
            <h2>Add New User</h2>
            <div>
              <TextField
                type="email"
                margin="dense"
                label="email"
                placeholder="email"
                value={email}
                onChange={(event: any) => setEmail(event.target.value)}
                autoFocus
                fullWidth
              />

              <FormControl fullWidth>
                <InputLabel id="role-select-label">Role</InputLabel>
                <Select
                  labelId="role-select-label"
                  id="role-select"
                  margin="dense"
                  value={role}
                  onChange={(event) =>
                    event.target &&
                    event.target.value &&
                    setRole(event.target.value as string)
                  }
                >
                  {ROLES.map((name) => (
                    <MenuItem value={name} key={`role-select${name}`}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                color="primary"
                onClick={createUser}
                disabled={disabled}
              >
                CREATE
              </Button>

              {error && (
                <Box color="error.main">
                  <Typography component="p">{error}</Typography>
                </Box>
              )}
            </div>
          </div>
        </Fade>
      </Modal>
    </div>
  )
}
