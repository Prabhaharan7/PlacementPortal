import React from 'react'
console.log("Main.jsx is executing - attempting to modify DOM");
const root = document.getElementById('root');
if (root) {
    root.innerHTML = "<h1>JS is executing!React is starting...</h1>";
} else {
    console.error("Root element not found!");
}

import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './App.css'

import ErrorBoundary from './ErrorBoundary.jsx'

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </React.StrictMode>,
)