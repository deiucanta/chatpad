import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './components/App'
import './styles/markdown.scss'
import { loadConfig } from './utils/config'

loadConfig().then(() => {
    ReactDOM.createRoot(document.getElementById('root')!).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    )
})
