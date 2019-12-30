import React from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
// import Link from '@material-ui/core/Link'
import Orders from './Orders'

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2)
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
        {/* Chart */}
        <Grid item xs={12} md={8} lg={9} className={classes.item}>
          <Paper className={fixedHeightPaper}>
            <span style={{ marginLeft: '1em' }}>CHART</span>
          </Paper>
        </Grid>
        {/* Recent Deposits */}
        <Grid item xs={12} md={4} lg={3} className={classes.item}>
          <Paper className={fixedHeightPaper}>DEPOZ</Paper>
        </Grid>
        {/* Recent Orders */}
        <Grid item xs={12} className={classes.item}>
          <Paper className={classes.paper}>
            <Orders />
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}
