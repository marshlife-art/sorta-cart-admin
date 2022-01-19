import React, { useEffect, useState } from 'react'

import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Typography,
  Tooltip,
  IconButton,
  Icon
} from '@material-ui/core'

import {
  IParseProductCatzCSV,
  parseProductsDistinctCatzCSV
} from '../lib/parseProductsCSV'
import { SupaCatmap } from '../types/SupaTypes'
import { useCatmap } from '../services/hooks/catmap'
import { deleteCatmap, upsertCatmap } from '../services/mutations'

export default function CatMapDialog(props: {
  file?: File
  buttonText: string
}) {
  const [open, setOpen] = useState(false)
  const [fileResult, setFileResult] = useState<IParseProductCatzCSV>()
  const [mappedCatz, setMappedCatz] = useState<SupaCatmap[]>([])

  const { catmap, isError, isLoading, mutate } = useCatmap()

  function getCatMap(from: string): string | undefined | null {
    return catmap && catmap.find((m) => m.from === from)?.to
  }

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleSave = async () => {
    const { error } = await upsertCatmap(mappedCatz.filter((m) => !!m.to))

    if (!error) {
      mutate()
    }
    setOpen(false)
  }

  function handleChange(from: string, to: string) {
    if (mappedCatz && mappedCatz.find((m) => m.from === from)) {
      setMappedCatz((prev) =>
        prev.map((m) => (m.from === from ? { from, to } : m))
      )
    } else {
      setMappedCatz((prev) => [...prev, { from, to }])
    }
  }

  async function handleDeleteMap(from: string) {
    await deleteCatmap(from)
    mutate()
  }

  useEffect(() => {
    if (open && props.file) {
      parseProductsDistinctCatzCSV(props.file)
        .then((result) => {
          setFileResult(result)
        })
        .catch(console.warn)
    }
  }, [open, props.file])

  if (isError) return <div>failed to load</div>
  if (isLoading) return <div>loading...</div>

  return (
    <div>
      <Button
        onClick={handleClickOpen}
        disabled={!props.file}
        variant="contained"
        color="primary"
        fullWidth
      >
        {props.buttonText}
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">MAP CATEGORIES</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Rename categories and sub categories during import. Categories
            listed here were found in the .csv sheet specified. Any existing
            mappings will be filled out. Adjust for any that need to be mapped
            (renamed).
            <br />
            <br />
            Leave the field blank if you don't want to rename a category (or sub
            category).
          </DialogContentText>
          {fileResult &&
            Object.keys(fileResult.catz).length > 0 &&
            `${Object.keys(fileResult.catz).length} Categories found.`}
          {fileResult &&
            Object.entries(fileResult.catz).map(([cat, sub_catz]) => (
              <>
                {sub_catz.length > 0 && <h2>Category</h2>}
                <div
                  key={`cat${cat}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <Typography>{cat}</Typography>
                  <Icon>arrow_right</Icon>
                  <div>
                    <TextField
                      label={`${getCatMap(cat) || 'New Category Name'}`}
                      // helperText={`will change to`}
                      onChange={(e) => handleChange(cat, e.target.value)}
                    />
                    {getCatMap(cat) !== undefined && (
                      <Tooltip title="delete mapping">
                        <IconButton
                          aria-label="delete mapping"
                          onClick={() => handleDeleteMap(cat)}
                        >
                          <Icon>clear</Icon>
                        </IconButton>
                      </Tooltip>
                    )}
                  </div>
                </div>
                {sub_catz.length > 0 && (
                  <h2>Sub Categories ({sub_catz.length})</h2>
                )}

                {sub_catz.map((subcat, idx) => (
                  <div
                    id={`subcat${subcat}${idx}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Typography>{subcat}</Typography>
                    <Icon>arrow_right</Icon>
                    <div>
                      <TextField
                        label={`${
                          getCatMap(subcat) || 'New Sub Category Name'
                        }`}
                        // helperText={`${subcat} will change to`}
                        onChange={(e) => handleChange(subcat, e.target.value)}
                      />
                      {getCatMap(subcat) !== undefined && (
                        <Tooltip title="delete mapping">
                          <IconButton
                            aria-label="delete mapping"
                            onClick={() => handleDeleteMap(subcat)}
                          >
                            <Icon>clear</Icon>
                          </IconButton>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                ))}
              </>
            ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} autoFocus>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
