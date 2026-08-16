import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ScanProvider } from './context/ScanContext'
import { ThemeProvider } from './context/ThemeContext'
import { Layout } from './components/Layout'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import Findings from './pages/Findings'
import Priority from './pages/Priority'
import Tickets from './pages/Tickets'
import Reports from './pages/Reports'

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ScanProvider>
          <Layout>
            <Routes>
              <Route path="/"         element={<Dashboard />} />
              <Route path="/upload"   element={<Upload />} />
              <Route path="/findings" element={<Findings />} />
              <Route path="/priority" element={<Priority />} />
              <Route path="/tickets"  element={<Tickets />} />
              <Route path="/reports"  element={<Reports />} />
            </Routes>
          </Layout>
        </ScanProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
