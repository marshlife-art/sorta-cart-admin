import React, { useState, useEffect } from 'react'
// import Link from '@material-ui/core/Link'
import Button from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Title from './Title'
import { RouteComponentProps, withRouter } from 'react-router-dom'

import { API_HOST } from '../constants'
import { Member } from '../types/Member'

interface MemberData {
  data: Member[]
  page: number
  totalCount: number
}

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3)
  },
  rowHover: {
    '&:hover': {
      backgroundColor: theme.palette.background.default,
      cursor: 'pointer'
    }
  }
}))

function Members(props: RouteComponentProps) {
  const classes = useStyles()

  const token = localStorage && localStorage.getItem('token')

  const [members, setMembers] = useState<MemberData>({
    data: [],
    page: 0,
    totalCount: 0
  })

  useEffect(() => {
    token &&
      setMembers &&
      fetch(`${API_HOST}/members`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ pageSize: 10 })
      })
        .then((response) => response.json())
        .then(setMembers)
        .catch((err) => {
          console.warn(err)
          return { data: [], page: 0, totalCount: 0 }
        })
  }, [token, setMembers])

  return (
    <React.Fragment>
      <Title>recent members</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>created</TableCell>
            <TableCell>name</TableCell>
            <TableCell>email</TableCell>
            <TableCell align="right">fees_paid</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {members.data.map((member) => (
            <TableRow
              key={member.id}
              className={classes.rowHover}
              onClick={() => props.history.push(`/members/${member.id}`)}
            >
              <TableCell>
                {member.createdAt &&
                  new Date(member.createdAt).toLocaleString()}
              </TableCell>
              <TableCell>{member.name}</TableCell>
              <TableCell>{member.registration_email}</TableCell>
              <TableCell align="right">{member.fees_paid}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className={classes.seeMore}>
        <Button
          variant="contained"
          color="primary"
          onClick={(event: any) => {
            props.history.push('/members')
          }}
        >
          SEE ALL MEMBERS
        </Button>
      </div>
    </React.Fragment>
  )
}

export default withRouter(Members)
