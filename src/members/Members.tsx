import React, { createRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import MaterialTable from 'material-table'
import { formatRelative } from 'date-fns'

import { supabase } from '../lib/supabaseClient'
import { SupaMember as Member } from '../types/SupaTypes'

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
        supabase
          .from('Members')
          .delete({ returning: 'minimal' })
          .eq('id', id)
          .then(() => tableRef.current && tableRef.current.onQueryChange())
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
            let query = supabase
              .from<Member>('Members')
              .select('*', { count: 'exact' })
            //, users ( * ) i think need to use service role or otherwise setup rls for users relation?

            if (q.filters.length) {
              const or = q.filters
                .map((filter) => {
                  if (filter.column.field && filter.value) {
                    if (filter.value instanceof Array && filter.value.length) {
                      return filter.value.map((v) => {
                        // NOTE: ilike only seems to work on string fields
                        if (filter.column.field === 'member_type') {
                          return `${filter.column.field}.ilike."%${v}%"`
                        }
                        return `${filter.column.field}.eq.${v}`
                      })
                    } else if (filter.value.length) {
                      if (filter.column.field === 'member_type') {
                        return `${filter.column.field}.ilike."%${filter.value}%"`
                      } else {
                        return `${filter.column.field}.eq."${filter.value}"`
                      }
                    }
                  }
                })
                .join(',')

              query = query.or(or)
            }
            if (q.search) {
              query = query.or(
                ['name', 'phone', 'address', 'registration_email']
                  .map((f) => `${f}.ilike."%${q.search}%"`)
                  .join(',')
              )
            }
            if (q.page) {
              query = query.range(
                q.pageSize * q.page,
                q.pageSize * q.page + q.pageSize
              )
            }
            if (q.pageSize) {
              query = query.limit(q.pageSize)
            }
            if (q.orderBy && q.orderBy.field) {
              query = query.order(q.orderBy.field as keyof Member, {
                ascending: q.orderDirection === 'asc'
              })
            } else {
              query = query.order('createdAt', { ascending: false })
            }

            const { data, error, count: totalCount } = await query

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
