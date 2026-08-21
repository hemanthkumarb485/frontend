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
import TargetDetail from './pages/TargetDetail'
import Profile from './pages/Profile'
import SessionHistory from './pages/SessionHistory'

// Scanning a file and viewing its results needs no account — only
// account-scoped features (storing a report, GitHub tickets, target
// history, profile) require login. Both wrappers share the same Layout.
function LayoutWrapper() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

function ProtectedLayoutWrapper() {
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

              {/* No login required — scanning and viewing results is open to anyone */}
              <Route element={<LayoutWrapper />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/upload"   element={<Upload />} />
                <Route path="/findings" element={<Findings />} />
                <Route path="/findings/:findingId" element={<FindingDetail />} />
                <Route path="/priority" element={<Priority />} />
                <Route path="/reports"  element={<Reports />} />
              </Route>

              {/* Login required — these are inherently tied to a stored account */}
              <Route element={<ProtectedLayoutWrapper />}>
                <Route path="/targets"  element={<Targets />} />
                <Route path="/targets/:host" element={<TargetDetail />} />
                <Route path="/tickets"  element={<Tickets />} />
                <Route path="/profile"  element={<Profile />} />
                <Route path="/history"  element={<SessionHistory />} />
              </Route>
            </Routes>
          </ScanProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
