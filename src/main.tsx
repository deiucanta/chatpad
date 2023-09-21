import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './components/App'
import './styles/markdown.scss'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
