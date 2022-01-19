import React, { createRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import MaterialTable from 'material-table'
import { formatRelative } from 'date-fns'

import { SupaMember as Member } from '../types/SupaTypes'
import { deleteMember } from '../services/mutations'
import { membersFetcher } from '../services/fetchers'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(2),
      maxWidth: '100vw',
      minHeight: '100vh'
    }
  })
)

export default function Members() {
  const navigate = useNavigate()
  const classes = useStyles()
  const tableRef = createRef<any>()

  const newMemberAction = {
    icon: 'add',
    tooltip: 'add new member',
    isFreeAction: true,
    onClick: () => navigate('/members/new')
  }

  const deleteAction = {
    tooltip: 'Remove Member',
    icon: 'delete',
    onClick: async (e: any, member: Member | Member[]) => {
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
        const { error } = await deleteMember(id)
        if (!error && tableRef.current) {
          tableRef.current.onQueryChange()
        }
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
      member.id && navigate(`/members/${member.id}`)
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
            render: (row) => (
              <div
                title={
                  row.createdAt && new Date(row.createdAt).toLocaleString()
                }
              >
                {row.createdAt &&
                  formatRelative(new Date(row.createdAt), Date.now())}
              </div>
            )
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
        data={(q) =>
          new Promise(async (resolve, reject) => {
            const { data, error, count: totalCount } = await membersFetcher(q)

            if (!error && data?.length && totalCount) {
              resolve({
                data,
                page: 0,
                totalCount
              })
              return
            }

            resolve({
              data: [],
              page: 0,
              totalCount: 0
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
