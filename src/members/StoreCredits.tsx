import React, { useState, useEffect } from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import MuiExpansionPanel from '@material-ui/core/ExpansionPanel'
import MuiExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary'
import MuiExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Tooltip from '@material-ui/core/Tooltip'
import Button from '@material-ui/core/Button'
import ListSubheader from '@material-ui/core/ListSubheader'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'

import { API_HOST } from '../constants'
import { LineItem } from '../types/Order'
import { Member } from '../types/Member'
import { getStoreCreditReport } from '../lib/storeCredit'

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    margin: theme.spacing(2),
    maxWidth: '100vw',
    minHeight: '100vh'
  },
  header: {
    fontSize: '1.5em',
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper
  },
  row: {
    width: '100%',
    padding: '0 1em',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  nested: {
    paddingLeft: theme.spacing(4)
  },
  seeMore: {
    marginTop: theme.spacing(3)
  },
  rowHover: {
    '&:hover': {
      backgroundColor: theme.palette.background.paper
    }
  }
}))

const ExpansionPanel = withStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.default,
    border: '1px solid rgba(0, 0, 0, .125)',
    boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 0
    },
    '&:before': {
      display: 'none'
    },
    '&$expanded': {
      margin: 'auto'
    }
  },
  expanded: {}
}))(MuiExpansionPanel)

const ExpansionPanelSummary = withStyles({
  root: {
    backgroundColor: 'rgba(0, 0, 0, .03)',
    borderBottom: '1px solid rgba(0, 0, 0, .125)',
    marginBottom: -1,
    minHeight: 56,
    '&$expanded': {
      minHeight: 56
    }
  },
  content: {
    '&$expanded': {
      margin: '12px 0'
    }
  },
  expanded: {}
})(MuiExpansionPanelSummary)

const ExpansionPanelDetails = withStyles((theme) => ({
  root: {
    marginLeft: theme.spacing(2)
  }
}))(MuiExpansionPanelDetails)

type StoreCreditRow = Member & {
  credits: LineItem[]
  credits_sum: number
  adjustments: LineItem[]
  adjustments_sum: number
  store_credit: number
}

function StoreCredits(props: RouteComponentProps) {
  const classes = useStyles()
  // const tableRef = createRef<any>()

  const [members, setMembers] = useState<StoreCreditRow[]>([])
  useEffect(() => {
    getStoreCreditReport().then((result) => setMembers(result))
  }, [])

  return (
    <Paper className={classes.root}>
      <List
        component="nav"
        aria-labelledby="nested-list-subheader"
        subheader={
          <ListSubheader component="h1" className={classes.header}>
            Store Credits
          </ListSubheader>
        }
      >
        {members.map((member) => (
          <React.Fragment key={member.id}>
            <ListItem>
              <div className={classes.row}>
                <Tooltip title="edit member">
                  <Button
                    onClick={() => props.history.push(`/members/${member.id}`)}
                  >
                    {member.name}
                  </Button>
                </Tooltip>
                <Typography>{member.registration_email}</Typography>
                <Typography>$ {member.store_credit.toFixed(2)}</Typography>
              </div>
            </ListItem>
            <ExpansionPanel square>
              <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel${member.id}-content`}
                id={`panel${member.id}-header`}
              >
                <Typography>Order Line Items</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>createdAt</TableCell>
                      <TableCell>order#</TableCell>
                      <TableCell>description</TableCell>
                      <TableCell align="right">total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={2} align="center">
                        Credits ({member.credits.length})
                      </TableCell>
                      <TableCell align="right">SUM</TableCell>
                      <TableCell align="right">{member.credits_sum}</TableCell>
                    </TableRow>
                    {member.credits.map((li) => (
                      <TableRow
                        key={`${member.id}${li.id}`}
                        className={classes.rowHover}
                      >
                        <TableCell>
                          {li.createdAt &&
                            new Date(li.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="edit order">
                            <Button
                              onClick={() =>
                                props.history.push(`/orders/edit/${li.OrderId}`)
                              }
                            >
                              #{li.OrderId}
                            </Button>
                          </Tooltip>
                        </TableCell>
                        <TableCell>{li.description}</TableCell>
                        <TableCell align="right">{li.total}</TableCell>
                      </TableRow>
                    ))}

                    <TableRow>
                      <TableCell colSpan={2} align="center">
                        Adjustments ({member.adjustments.length})
                      </TableCell>
                      <TableCell align="right">SUM</TableCell>
                      <TableCell align="right">
                        {member.adjustments_sum}
                      </TableCell>
                    </TableRow>
                    {member.adjustments.map((li) => (
                      <TableRow
                        key={`${member.id}${li.id}`}
                        className={classes.rowHover}
                      >
                        <TableCell>
                          {li.createdAt &&
                            new Date(li.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="edit order">
                            <Button
                              onClick={() =>
                                props.history.push(`/orders/edit/${li.OrderId}`)
                              }
                            >
                              #{li.OrderId}
                            </Button>
                          </Tooltip>
                        </TableCell>
                        <TableCell>{li.description}</TableCell>
                        <TableCell align="right">{li.total}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </React.Fragment>
        ))}
      </List>
    </Paper>
  )
}

export default withRouter(StoreCredits)
