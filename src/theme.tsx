import red from '@material-ui/core/colors/red'
import { createTheme } from '@material-ui/core/styles'

const darkTheme = createTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#556cd6'
    },
    secondary: {
      main: '#FF4081'
    },
    error: {
      main: red.A400
    }
  }
})

const lightTheme = createTheme({
  palette: {
    type: 'light',
    primary: {
      main: '#556cd6'
    },
    secondary: {
      main: '#FF4081'
    },
    error: {
      main: red.A400
    }
  }
})
export { darkTheme, lightTheme }
