import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ResponsiveAppBar from './components/ResponsiveAppBar'
// import './index.css'
// import 'bootstrap/dist/cssbootstrap.min.css';
import { ThemeProvider } from './components/theme-provider'
// import { CssBaseline } from '@mui/material';
import './main.css'
// const darkTheme = createTheme({
//   palette: {
//     mode: 'dark'
//   },
//   typography: {
//     "fontFamily": `"Urbanist","Roboto", "Helvetica", "Arial", sans-serif`,
//     "fontSize": 14,
//     "fontWeightLight": 300,
//     "fontWeightRegular": 400,
//     "fontWeightMedium": 500
//    }
// });



ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
     {/* <CssBaseline /> */}
    <ResponsiveAppBar />
    <App/>
    </ThemeProvider>
  </React.StrictMode>
)


