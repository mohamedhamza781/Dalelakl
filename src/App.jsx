import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Suspense, lazy } from 'react'
import Layout from '@/components/layout/Layout'
import HomePage from '@/pages/HomePage'
// ── Code splitting: باقي الصفحات تتحمل بس لما المستخدم يزورها فعلياً ──
// (بدل ما الكل يتحمل مسبقاً من أول زيارة حتى لو المستخدم بس زار الرئيسية)
const PropertiesPage       = lazy(() => import('@/pages/PropertiesPage'))
const PropertyDetailPage   = lazy(() => import('@/pages/PropertyDetailPage'))
const LoginPage            = lazy(() => import('@/pages/LoginPage'))
const RegisterPage         = lazy(() => import('@/pages/RegisterPage'))
const AccountPage          = lazy(() => import('@/pages/AccountPage'))
const AdminPage            = lazy(() => import('@/pages/AdminPage'))
const PropertyComparePage  = lazy(() => import('@/pages/PropertyComparePage'))
const ContactPage          = lazy(() => import('@/pages/ContactPage'))
const TeamPage             = lazy(() => import('@/pages/TeamPage'))
import Toast from '@/components/ui/Toast'
import ScrollToTop from '@/components/ui/ScrollToTop'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import OfflineScreen from '@/components/OfflineScreen'
import ManifestSwitcher from '@/components/ManifestSwitcher'

import { useScrollToHash } from './hooks/useScrollToHash';

// مؤشر تحميل بسيط لحظة تحميل صفحة جديدة (chunk) — نفس ستايل السبينر المستخدم بباقي الموقع
function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-cream-300 border-t-brass rounded-full animate-spin" />
    </div>
  )
}


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
      <OfflineScreen />
      <ManifestSwitcher />
      
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/properties" element={<Suspense fallback={<PageLoader />}><PropertiesPage /></Suspense>} />
          <Route path="/properties/:slug" element={<Suspense fallback={<PageLoader />}><PropertyDetailPage /></Suspense>} />
          <Route path="/login" element={<Suspense fallback={<PageLoader />}><LoginPage /></Suspense>} />
          <Route path="/register" element={<Suspense fallback={<PageLoader />}><RegisterPage /></Suspense>} />
          
          <Route path="/compare" element={<Suspense fallback={<PageLoader />}><PropertyComparePage /></Suspense>} />

          <Route path="/account" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><AccountPage /></Suspense></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Suspense fallback={<PageLoader />}><AdminPage /></Suspense></ProtectedRoute>} />
          
          <Route path="/contact" element={<Suspense fallback={<PageLoader />}><ContactPage /></Suspense>} />
          <Route path="/team" element={<Suspense fallback={<PageLoader />}><TeamPage /></Suspense>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route> 
      </Routes>
    </BrowserRouter>
  )
}