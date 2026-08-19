import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { ScanProvider } from './context/ScanContext'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import Findings from './pages/Findings'
import FindingDetail from './pages/FindingDetail'
import Priority from './pages/Priority'
import Tickets from './pages/Tickets'
import Reports from './pages/Reports'
import Targets from './pages/Targets'

function LayoutWrapper() {
  return (
    <ProtectedRoute>
      <Layout>
        <Outlet />
      </Layout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ScanProvider>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route element={<LayoutWrapper />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/upload"   element={<Upload />} />
                <Route path="/findings" element={<Findings />} />
                <Route path="/findings/:findingId" element={<FindingDetail />} />
                <Route path="/priority" element={<Priority />} />
                <Route path="/targets"  element={<Targets />} />
                <Route path="/tickets"  element={<Tickets />} />
                <Route path="/reports"  element={<Reports />} />
              </Route>
            </Routes>
          </ScanProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
