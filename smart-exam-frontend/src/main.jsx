import React from 'react'
import ReactDOM from 'react-dom/client'
// Make sure this line is present to import the CSS
import './index.css' 
import App from './App.jsx'

// This file is the entry point for your React application.
// It imports the main App component from App.jsx.
// It finds the HTML element with the id 'root' (in index.html).
// It tells React to render your App component inside that element.

ReactDOM.createRoot(document.getElementById('root')).render(
  // React.StrictMode helps find potential problems in the application during development.
  // It activates additional checks and warnings for its descendants.
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

