import React from 'react'
import Link from '@material-ui/core/Link'
import { makeStyles } from '@material-ui/core/styles'
// import Table from '@material-ui/core/Table'
// import TableBody from '@material-ui/core/TableBody'
// import TableCell from '@material-ui/core/TableCell'
// import TableHead from '@material-ui/core/TableHead'
// import TableRow from '@material-ui/core/TableRow'
import Title from './Title'
import { RouteComponentProps, withRouter } from 'react-router-dom'

const useStyles = makeStyles(theme => ({
  seeMore: {
    marginTop: theme.spacing(3)
  }
}))

function Orders(props: RouteComponentProps) {
  const classes = useStyles()
  return (
    <React.Fragment>
      <Title>ORDERZ</Title>
      {/* <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Ship To</TableCell>
            <TableCell>Payment Method</TableCell>
            <TableCell align="right">Sale Amount</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(row => (
            <TableRow key={row.id}>
              <TableCell>{row.date}</TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.shipTo}</TableCell>
              <TableCell>{row.paymentMethod}</TableCell>
              <TableCell align="right">{row.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table> */}
      <div className={classes.seeMore}>
        <Link
          color="textPrimary"
          href="#"
          onClick={(event: any) => {
            event.preventDefault()
            props.history.push('/orders')
          }}
        >
          SEE MORE ORDERS
        </Link>
      </div>
    </React.Fragment>
  )
}

export default withRouter(Orders)
