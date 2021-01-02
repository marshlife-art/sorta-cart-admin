import React, { useState, useEffect } from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Snackbar from '@material-ui/core/Snackbar'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import PreviewIcon from '@material-ui/icons/RemoveRedEye'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'

import { PageRouterProps } from '../types/PageRouterProps'
import Loading from '../Loading'
import { usePageService, usePageSaveService } from './usePageService'
import EditAnnouncementMenu from './EditAnnouncementMenu'
import { Page } from '../types/Page'
import renderers from './renderers'
import { API_HOST } from '../constants'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    row: {
      display: 'flex'
    },
    paper: {
      padding: theme.spacing(2),
      // textAlign: 'center',
      color: theme.palette.text.secondary,
      height: '100%'
    },
    preview: {
      marginTop: theme.spacing(2)
    },
    pageName: {
      marginBottom: theme.spacing(2),
      marginRight: theme.spacing(2)
    }
  })
)

function EditAnnouncement(props: RouteComponentProps<PageRouterProps>) {
  const { id, slug } = props.match.params
  const classes = useStyles()

  const [page, setPage] = useState<Page>({ slug: slug, content: '' })
  const [loading, setLoading] = useState(true)
  const [doSave, setDoSave] = useState(false)
  const [showPreview, setShowPreview] = useState(true)

  const pageService = usePageService(id, setLoading)

  useEffect(() => {
    if (pageService.status === 'loaded') {
      if (pageService.payload) {
        setPage(pageService.payload)
      }
    }
  }, [pageService])

  const [snackOpen, setSnackOpen] = React.useState(false)
  const [snackMsg, setSnackMsg] = React.useState('')

  const handlePageContentChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPage((prevPage) => ({ ...prevPage, content: event.target.value }))
  }

  const handlePageNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage((prevPage) => ({ ...prevPage, slug: event.target.value }))
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

  const onSaveBtnClick = (): void => {
    setDoSave(true)
  }

  const pageSaveService = usePageSaveService(
    page,
    doSave,
    setDoSave,
    setSnackMsg,
    setSnackOpen
  )

  useEffect(() => {
    if (pageSaveService.status === 'loaded') {
      const p = pageSaveService.payload
      // handy, no need parse URI here to compare slug string!
      if (id !== `${p.id}` || slug !== p.slug) {
        props.history.replace(`/announcements/edit/${p.slug}/${p.id}`)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSaveService])

  const onDeleteBtnClick = (): void => {
    fetch(`${API_HOST}/page`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(page)
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.error) {
          setSnackMsg(response.msg)
          setSnackOpen(true)
        } else {
          props.history.replace('/announcements')
        }
      })
      .catch((error) => {
        console.warn('delete page fetch caught err:', error)
        setSnackMsg(`o noz! ${error}`)
        setSnackOpen(true)
      })
  }

  return page ? (
    <>
      <Grid xs={6} sm={4} lg={5} item>
        <Paper className={classes.paper}>
          <div className={classes.row}>
            <TextField
              className={classes.pageName}
              label="title"
              fullWidth
              value={page.slug}
              onChange={handlePageNameChange}
            />
            <EditAnnouncementMenu
              page={page}
              onSaveBtnClick={onSaveBtnClick}
              onDeleteBtnClick={onDeleteBtnClick}
            />
            <Button
              variant={showPreview ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => setShowPreview(!showPreview)}
            >
              <PreviewIcon />
            </Button>
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
        </Paper>
      </Grid>

      <Grid xs={6} sm={4} lg={5} item>
        {showPreview && (
          <Paper className={classes.paper}>
            <ReactMarkdown plugins={[gfm]} renderers={renderers}>
              {page.content}
            </ReactMarkdown>
          </Paper>
        )}
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
    </>
  ) : (
    <Loading />
  )
}

export default withRouter(EditAnnouncement)
