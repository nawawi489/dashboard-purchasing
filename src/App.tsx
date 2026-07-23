import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import { HomePage } from './pages/HomePage'
import PurchaseRequestPage from './pages/PurchaseRequestPage'
import VendorPage from './pages/VendorPage'
import ApprovalPage from './pages/ApprovalPage'
import ReportPage from './pages/ReportPage'
import SettingsPage from './pages/SettingsPage'
import ConfirmPOPage from './pages/ConfirmPOPage'
import POSuccessPage from './pages/POSuccessPage'
import BillPOPage from './pages/BillPOPage'
import BillInventoryPage from './pages/BillInventoryPage'
import StrukPage from './pages/StrukPage'
import InventoryRequestPage from './pages/InventoryRequestPage'
import ConfirmInventoryRequestPage from './pages/ConfirmInventoryRequestPage'
import InventoryRequestSuccessPage from './pages/InventoryRequestSuccessPage'
import InventoryApprovalPage from './pages/InventoryApprovalPage'
import PerlengkapanRequestPage from './pages/PerlengkapanRequestPage'
import ConfirmPerlengkapanPage from './pages/ConfirmPerlengkapanPage'
import PerlengkapanSuccessPage from './pages/PerlengkapanSuccessPage'
import PerlengkapanApprovalPage from './pages/PerlengkapanApprovalPage'
import BillPerlengkapanPage from './pages/BillPerlengkapanPage'
import Footer from './components/Footer'

function ProtectedLayout() {
  const { isAuthenticated, isInitialized } = useAuth()
  const location = useLocation()

  if (!isInitialized) {
    return (
      <div className="container">
        <section className="hero">
          <h1>Memuat sesi</h1>
          <p>Harap tunggu sebentar…</p>
        </section>
      </div>
    )
  }

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
          <Route path="/report" element={<ReportPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/bill" element={<BillPOPage />} />
          <Route path="/struk" element={<StrukPage />} />
          <Route path="/confirm-po" element={<ConfirmPOPage />} />
          <Route path="/po-success" element={<POSuccessPage />} />
          <Route path="/inventory-request" element={<InventoryRequestPage />} />
            <Route path="/confirm-inventory-request" element={<ConfirmInventoryRequestPage />} />
            <Route path="/inventory-request-success" element={<InventoryRequestSuccessPage />} />
            <Route path="/approval-inventory" element={<InventoryApprovalPage />} />
            <Route path="/bill-inventory" element={<BillInventoryPage />} />
            <Route path="/perlengkapan" element={<PerlengkapanRequestPage />} />
            <Route path="/confirm-perlengkapan" element={<ConfirmPerlengkapanPage />} />
            <Route path="/perlengkapan-success" element={<PerlengkapanSuccessPage />} />
            <Route path="/approval-perlengkapan" element={<PerlengkapanApprovalPage />} />
            <Route path="/bill-perlengkapan" element={<BillPerlengkapanPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
