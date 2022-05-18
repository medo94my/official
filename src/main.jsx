import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ResponsiveAppBar from './components/ResponsiveAppBar'
// import './index.css'
// import 'bootstrap/dist/cssbootstrap.min.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const darkTheme = createTheme({
  palette: {
    mode: 'dark'
  },
  typography: {
    "fontFamily": `"Urbanist","Roboto", "Helvetica", "Arial", sans-serif`,
    "fontSize": 14,
    "fontWeightLight": 300,
    "fontWeightRegular": 400,
    "fontWeightMedium": 500
   }
});



ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
     <CssBaseline />
    <ResponsiveAppBar />
    <App/>
    </ThemeProvider>
  </React.StrictMode>
)


