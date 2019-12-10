import React from 'react'
import { Container } from '@material-ui/core'
import Box from '@material-ui/core/Box'

export default function Loading() {
  return (
    <Container fixed>
      <Box pt={4} style={{ textAlign: 'center' }}>
        L O A D I N G . . .
      </Box>
    </Container>
  )
}
