import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Layout from '@/components/layout/Layout'
import HomePage from '@/pages/HomePage'
import PropertiesPage from '@/pages/PropertiesPage'
import PropertyDetailPage from '@/pages/PropertyDetailPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import AccountPage from '@/pages/AccountPage'
import AdminPage from '@/pages/AdminPage'
import Toast from '@/components/ui/Toast'
import ScrollToTop from '@/components/ui/ScrollToTop'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import PropertyComparePage from '@/pages/PropertyComparePage'

import PrivacyPage from '@/pages/PrivacyPage'
import TermsPage from '@/pages/TermsPage'
import HelpPage from '@/pages/HelpPage'

import { useScrollToHash } from './hooks/useScrollToHash';

import ContactPage from '@/pages/ContactPage';


import TeamPage from "@/pages/TeamPage"; // تأكد من أن المسار صحيح حسب مكان الملف عندك


// --- مكون صغير لمعالجة التمرير داخل نطاق الراوتر ---
function ScrollManager() {
  useScrollToHash();
  return null;
}

function ProtectedRoute({ children, roles }) {
  const { isLoggedIn, role, user } = useSelector(s => s.auth)
  
  // لو في توكن بس بيانات المستخدم لسا ما وصلت — انتظر
  const token = localStorage.getItem('token')
  if (token && isLoggedIn && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cream-300 border-t-brass rounded-full animate-spin" />
      </div>
    )
  }

  if (!isLoggedIn) return <Navigate to="/login" replace />
  if (roles && role && !roles.includes(role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  // تم حذف useScrollToHash من هنا لأنها كانت تسبب الشاشة البيضاء
  
  return (
    <BrowserRouter>
      {/* استدعاء المكون هنا ليعمل useLocation بشكل صحيح */}
      <ScrollManager />
      
      <Toast />
      <ScrollToTop /> 
      <PWAInstallPrompt />
      
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties/:slug" element={<PropertyDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/compare" element={<PropertyComparePage />} />

          <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminPage /></ProtectedRoute>} />
          
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/team" element={<TeamPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route> 
      </Routes>
    </BrowserRouter>
  )
}