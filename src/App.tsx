import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import { HomePage } from './pages/HomePage'
import PurchaseRequestPage from './pages/PurchaseRequestPage'
import VendorPage from './pages/VendorPage'
import ApprovalPage from './pages/ApprovalPage'
import PlafonPage from './pages/PlafonPage'
import ReportPage from './pages/ReportPage'
import SettingsPage from './pages/SettingsPage'
import ConfirmPOPage from './pages/ConfirmPOPage'
import POSuccessPage from './pages/POSuccessPage'
import BillPOPage from './pages/BillPOPage'
import Footer from './components/Footer'

function ProtectedLayout() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return (
    <>
      <Outlet />
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/pr" element={<PurchaseRequestPage />} />
          <Route path="/vendor" element={<VendorPage />} />
          <Route path="/approval" element={<ApprovalPage />} />
          {/* <Route path="/plafon" element={<PlafonPage />} /> */}
          <Route path="/report" element={<ReportPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/bill" element={<BillPOPage />} />
          <Route path="/confirm-po" element={<ConfirmPOPage />} />
          <Route path="/po-success" element={<POSuccessPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
