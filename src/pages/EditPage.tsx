import React, { useState, useEffect } from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

import { PageRouterProps } from '../types/PageRouterProps'
import Loading from '../Loading'
import { usePageService, usePageSaveService } from './usePageService'
import EditPageMenu from './EditPageMenu'
import { Page } from '../types/Page'
import { API_HOST } from '../constants'

const token = localStorage && localStorage.getItem('token')

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

function EditPage(props: RouteComponentProps<PageRouterProps>) {
  const classes = useStyles()

  const [pageSlug, setPageSlug] = useState('')
  const [page, setPage] = useState<Page>({ slug: '', content: '' })
  const [loading, setLoading] = useState(true)
  const [doSave, setDoSave] = useState(false)

  const pageService = usePageService(pageSlug, setLoading)

  useEffect(() => {
    if (pageService.status === 'loaded') {
      if (pageService.payload) {
        setPage(pageService.payload)
      } else {
        setPage({ slug: pageSlug, content: '' })
      }
    }
  }, [pageService, pageSlug])

  const [snackOpen, setSnackOpen] = React.useState(false)
  const [snackMsg, setSnackMsg] = React.useState('')

  const handlePageContentChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPage(prevPage => ({ ...prevPage, content: event.target.value }))
  }

  const handlePageNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(prevPage => ({ ...prevPage, slug: event.target.value }))
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

  const slug = props.match.params.slug

  useEffect(() => {
    if (slug) {
      setPageSlug(slug)
    }
  }, [slug])

  const onSaveBtnClick = (): void => {
    setDoSave(true)
  }

  usePageSaveService(page, doSave, setDoSave, setSnackMsg, setSnackOpen)

  const onDeleteBtnClick = (): void => {
    fetch(`${API_HOST}/page`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(page)
    })
      .then(response => response.json())
      .then(response => {
        if (response.error) {
          setSnackMsg(response.msg)
          setSnackOpen(true)
        } else {
          props.history.replace('/pages')
        }
      })
      .catch(error => {
        console.warn('delete page fetch caught err:', error)
        setSnackMsg(`o noz! ${error}`)
        setSnackOpen(true)
      })
  }

  return page ? (
    <>
      <div className={classes.row}>
        <TextField
          className={classes.pageName}
          label="permalink"
          fullWidth
          value={page.slug}
          onChange={handlePageNameChange}
        />

        <EditPageMenu
          page={page}
          onSaveBtnClick={onSaveBtnClick}
          onDeleteBtnClick={onDeleteBtnClick}
        />
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
          value={page.content}
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

export default withRouter(EditPage)
