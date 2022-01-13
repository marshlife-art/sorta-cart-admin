import React from 'react'
import Button from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Title from './Title'
import { useNavigate } from 'react-router-dom'
import { formatDistance } from 'date-fns'
import useSWR from 'swr'

import { Member } from '../types/Member'
import { supabase } from '../lib/supabaseClient'

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

export default function Members() {
  const navigate = useNavigate()
  const classes = useStyles()

  const { data: members, error } = useSWR<MemberData>(
    'dashboard_members',
    async () => {
      const {
        data,
        error,
        count: totalCount
      } = await supabase
        .from<Member>('Members')
        .select('*', { count: 'exact' })
        .order('createdAt', { ascending: false })
        .limit(10)

      if (!error && data?.length && totalCount) {
        return {
          data,
          page: 0,
          totalCount
        }
      }

      return {
        data: [],
        page: 0,
        totalCount: 0
      }
    }
  )

  if (error) return <div>failed to load</div>
  if (!members) return <div>loading...</div>

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
              onClick={() => navigate(`/members/${member.id}`)}
            >
              <TableCell
                title={
                  member.createdAt &&
                  new Date(member.createdAt).toLocaleString()
                }
              >
                {member.createdAt &&
                  formatDistance(new Date(member.createdAt), Date.now(), {
                    addSuffix: true
                  })}
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
            navigate('/members')
          }}
        >
          ALL MEMBERS
        </Button>
      </div>
    </React.Fragment>
  )
}
