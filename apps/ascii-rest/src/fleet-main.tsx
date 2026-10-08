import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Fleet } from '@/pages/Fleet'

createRoot(document.getElementById('root')!).render(<StrictMode><Fleet /></StrictMode>)
