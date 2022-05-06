import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ResponsiveAppBar from './components/ResponsiveAppBar'
// import './index.css'
// import 'bootstrap/dist/cssbootstrap.min.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Avatar from './components/Avatar';
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});



ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
    <ResponsiveAppBar />
    <App/>
    </ThemeProvider>
  </React.StrictMode>
)


