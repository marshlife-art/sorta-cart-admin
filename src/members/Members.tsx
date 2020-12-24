import React, { createRef } from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import MaterialTable from 'material-table'

import { MemberRouterProps } from '../types/Member'
import { Member } from '../types/Member'
import { API_HOST } from '../constants'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(2),
      maxWidth: '100vw',
      minHeight: '100vh'
    }
  })
)

function Members(props: RouteComponentProps<MemberRouterProps>) {
  const classes = useStyles()
  const tableRef = createRef<any>()

  const newMemberAction = {
    icon: 'add',
    tooltip: 'add new member',
    isFreeAction: true,
    onClick: () => props.history.push('/members/new')
  }

  const deleteAction = {
    tooltip: 'Remove Member',
    icon: 'delete',
    onClick: (e: any, member: Member | Member[]) => {
      let members: Member[]
      if (Array.isArray(member)) {
        members = member
      } else {
        members = [member]
      }

      if (!members || members.length === 0) {
        return
      }
      const id = members[0].id
      if (window.confirm(`Are you sure you want to delete this member?`)) {
        fetch(`${API_HOST}/member`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ id })
        })
          .then((response) => response.json())
          .then(() => tableRef.current && tableRef.current.onQueryChange())
          .catch((err) => console.warn('members deleteAction caught err', err))
      }
    }
  }

  const editAction = {
    icon: 'edit',
    tooltip: 'edit member',
    onClick: (e: any, members: Member | Member[]) => {
      let member: Member
      if (Array.isArray(members)) {
        member = members[0]
      } else {
        member = members
      }
      member.id && props.history.push(`/members/${member.id}`)
    }
  }

  return (
    <div className={classes.root}>
      <MaterialTable
        tableRef={tableRef}
        columns={[
          {
            title: 'created',
            field: 'createdAt',
            type: 'datetime',
            filtering: false,
            render: (row) =>
              row.createdAt && new Date(row.createdAt).toLocaleString()
          },
          {
            title: 'registration email',
            field: 'registration_email',
            type: 'string',
            filtering: false
          },
          { title: 'name', field: 'name', type: 'string', filtering: false },
          { title: 'phone', field: 'phone', type: 'string', filtering: false },
          {
            title: 'address',
            field: 'address',
            type: 'string',
            filtering: false
          },
          { title: 'discount', field: 'discount', type: 'string' },
          { title: 'discount type', field: 'discount_type', type: 'string' },
          { title: 'fees paid', field: 'fees_paid', type: 'string' },
          { title: 'shares', field: 'shares', type: 'string' },
          { title: 'type', field: 'member_type', type: 'string' },

          {
            title: 'updated',
            field: 'updatedAt',
            type: 'datetime',
            hidden: true
          },
          { title: 'id', field: 'id', type: 'string', hidden: true }
        ]}
        data={(query) =>
          new Promise((resolve, reject) => {
            fetch(`${API_HOST}/members`, {
              method: 'post',
              headers: {
                'Content-Type': 'application/json'
              },
              credentials: 'include',
              body: JSON.stringify(query)
            })
              .then((response) => response.json())
              .then((result) => {
                resolve(result)
              })
              .catch((err) => {
                console.warn(err)
                return resolve({ data: [], page: 0, totalCount: 0 })
              })
          })
        }
        title="Members"
        options={{
          headerStyle: { position: 'sticky', top: 0 },
          maxBodyHeight: 'calc(100vh - 121px - 28px)',
          pageSize: 50,
          pageSizeOptions: [50, 100, 500],
          debounceInterval: 750,
          filtering: true,
          search: true,
          emptyRowsWhenPaging: false
        }}
        actions={[newMemberAction, deleteAction, editAction]}
      />
    </div>
  )
}

export default withRouter(Members)
