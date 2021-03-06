import React, { ReactNode } from 'react'
import { withStyles, Theme } from '@material-ui/core/styles'
import Typography, { TypographyProps } from '@material-ui/core/Typography'
import Link from '@material-ui/core/Link'
import Table from '@material-ui/core/Table'
import Paper from '@material-ui/core/Paper'
import {
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  StyledComponentProps,
  WithStyles
} from '@material-ui/core'

// mostly ripped from https://gist.github.com/boganegru/a4da0b0da0b1233d30b10063b10efa8a

const styles = (theme: Theme) => ({
  listItem: {
    marginTop: theme.spacing(1)
  },
  header: {
    marginTop: theme.spacing(2)
  }
})

interface WSProps extends WithStyles<typeof styles> {
  children: ReactNode
}

function MarkdownParagraph(props: { children: ReactNode }) {
  return <Typography>{props.children}</Typography>
}

interface MdHeadingProps {
  level: number
}

const MarkdownHeading = withStyles(styles)(
  ({
    classes,
    ...props
  }: StyledComponentProps & TypographyProps & MdHeadingProps) => {
    let variant: TypographyProps['variant']
    switch (props.level) {
      case 1:
        variant = 'h5'
        break
      case 2:
        variant = 'h6'
        break
      case 3:
        variant = 'subtitle1'
        break
      case 4:
        variant = 'subtitle2'
        break
      default:
        variant = 'h6'
        break
    }
    return (
      <Typography className={classes?.header} gutterBottom variant={variant}>
        {props.children}
      </Typography>
    )
  }
)

const MarkdownListItem = withStyles(styles)(
  ({ classes, ...props }: WSProps) => {
    return (
      <li className={classes.listItem}>
        <Typography component="span">{props.children}</Typography>
      </li>
    )
  }
)

function MarkdownTable(props: { children: ReactNode }) {
  return (
    <Paper>
      <Table size="small" aria-label="a dense table">
        {props.children}
      </Table>
    </Paper>
  )
}

function MarkdownTableCell(props: { children: ReactNode }) {
  return (
    <TableCell>
      <Typography>{props.children}</Typography>
    </TableCell>
  )
}

function MarkdownTableRow(props: { children: ReactNode }) {
  return <TableRow>{props.children}</TableRow>
}

function MarkdownTableBody(props: { children: ReactNode }) {
  return <TableBody>{props.children}</TableBody>
}

function MarkdownTableHead(props: { children: ReactNode }) {
  return <TableHead>{props.children}</TableHead>
}

const renderers = {
  heading: MarkdownHeading,
  paragraph: MarkdownParagraph,
  link: Link,
  listItem: MarkdownListItem,
  table: MarkdownTable,
  tableHead: MarkdownTableHead,
  tableBody: MarkdownTableBody,
  tableRow: MarkdownTableRow,
  tableCell: MarkdownTableCell
}

export default renderers
