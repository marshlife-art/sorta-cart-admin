import React, { useState, useEffect } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

import Loading from '../Loading'
import { usePageService } from './usePageService'
import EditPageMenu from './EditPageMenu'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    row: {
      display: 'flex'
    },
    pageName: {
      marginBottom: theme.spacing(2),
      marginRight: theme.spacing(2)
    }
  })
)

export default function EditPage() {
  const classes = useStyles()

  const [pageName, setPageName] = useState('test')
  const [pageContent, setPageContent] = useState('')
  const [loading, setLoading] = useState(true)

  const pageService = usePageService(pageName, setLoading)

  useEffect(() => {
    if (pageService.status === 'loaded') {
      setPageName(pageService.payload.slug)
      setPageContent(pageService.payload.content)
    }
  }, [pageService])

  const [snackOpen, setSnackOpen] = React.useState(false)

  const handlePageContentChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPageContent(event.target.value)
  }

  const handlePageNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageName(event.target.value)
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

  return (
    <>
      <div className={classes.row}>
        <TextField
          className={classes.pageName}
          label="permalink"
          fullWidth
          value={pageName}
          onChange={handlePageNameChange}
        />

        <EditPageMenu />
      </div>

      {loading ? (
        <Loading />
      ) : (
        <TextField
          label="content"
          multiline
          fullWidth
          rows={4}
          rowsMax={28}
          value={pageContent}
          onChange={handlePageContentChange}
        />
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
        message={<span id="message-id">Page saved!</span>}
        action={[
          <IconButton
            key="close"
            aria-label="close"
            color="inherit"
            onClick={handleSnackClose}
          >
            <CloseIcon />
          </IconButton>
        ]}
      />
    </>
  )
}
