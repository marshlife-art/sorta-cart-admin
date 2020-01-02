import React from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'

import Orders from './Orders'
import WholesaleOrders from './WholesaleOrders'
import Members from './Members'

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2),
    minHeight: '100vh'
  },
  item: {
    // zIndex: 1
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflowX: 'hidden',
    flexDirection: 'column'
  },
  fixedHeight: {
    height: 240
  }
}))

export default function Dashboard() {
  const classes = useStyles()
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight)

  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} className={classes.item}>
          <Paper className={fixedHeightPaper}>
            <WholesaleOrders />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} className={classes.item}>
          <Paper className={fixedHeightPaper}>
            <Members />
          </Paper>
        </Grid>
        <Grid item xs={12} className={classes.item}>
          <Paper className={classes.paper}>
            <Orders />
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}
