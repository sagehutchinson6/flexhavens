import { Routes, Route, Navigate } from 'react-router'
import { CartProvider } from '@/hooks/use-cart'
import { InvestorProvider } from '@/hooks/use-investor'
import { Toaster } from '@/components/ui/sonner'
import AnnouncementBar from '@/components/AnnouncementBar'
import Home from './pages/Home'
import TrackOrder from './pages/TrackOrder'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import About from './pages/About'
import FAQ from './pages/FAQ'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsConditions from './pages/TermsConditions'
import Checkout from './pages/Checkout'
import InvestHome from './pages/invest/InvestHome'
import InvestorLogin from './pages/invest/InvestorLogin'
import InvestorRegister from './pages/invest/InvestorRegister'
import ForgotPassword from './pages/invest/ForgotPassword'
import ResetPassword from './pages/invest/ResetPassword'
import VerifyEmail from './pages/invest/VerifyEmail'
import ResendVerification from './pages/invest/ResendVerification'
import InvestorDashboard from './pages/invest/InvestorDashboard'
import UnifiedAdminDashboard from './pages/UnifiedAdminDashboard'
import AdminVerifyEmail from './pages/AdminVerifyEmail'
import MortgageApply from './pages/MortgageApply'
import Mortgage from './pages/Mortgage'

export default function App() {
  return (
    <CartProvider>
      <InvestorProvider>
        <AnnouncementBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<UnifiedAdminDashboard />} />
          <Route path="/admin/verify-email" element={<AdminVerifyEmail />} />
          <Route path="/mortgage" element={<Mortgage />} />
          <Route path="/mortgage/apply/:productId" element={<MortgageApply />} />
          <Route path="/admin/property" element={<AdminDashboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          {/* Investment Portal */}
          <Route path="/invest" element={<InvestHome />} />
          <Route path="/invest/login" element={<InvestorLogin />} />
          <Route path="/invest/register" element={<InvestorRegister />} />
          <Route path="/invest/forgot-password" element={<ForgotPassword />} />
          <Route path="/invest/reset-password" element={<ResetPassword />} />
          <Route path="/invest/verify-email" element={<VerifyEmail />} />
          <Route path="/invest/resend-verification" element={<ResendVerification />} />
          <Route path="/invest/dashboard" element={<InvestorDashboard />} />
          <Route path="/invest/admin" element={<Navigate to="/admin/dashboard?section=overview" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </InvestorProvider>
    </CartProvider>
  )
}
