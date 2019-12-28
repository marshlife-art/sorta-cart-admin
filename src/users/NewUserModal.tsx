import React, { useState, useEffect } from 'react'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import Modal from '@material-ui/core/Modal'
import Backdrop from '@material-ui/core/Backdrop'
import Fade from '@material-ui/core/Fade'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'

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

export default function NewUserModal(props: {
  open: boolean
  handleClose: () => void
  handleRefresh: () => void
}) {
  const classes = useStyles()

  const [email, setEmail] = useState('')
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
    fetch(`${API_HOST}/register`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    })
      .then(response => response.json())
      .then(result => {
        // console.log('result', result)
        props.handleRefresh()
        props.handleClose()
      })
      .catch(err => {
        console.warn(err)
        return setError(err)
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

              <Button
                variant="contained"
                color="primary"
                onClick={createUser}
                disabled={disabled}
              >
                Send Invite
              </Button>

              {error && (
                <Typography component="p" color="primary">
                  {error}
                </Typography>
              )}
            </div>
          </div>
        </Fade>
      </Modal>
    </div>
  )
}
