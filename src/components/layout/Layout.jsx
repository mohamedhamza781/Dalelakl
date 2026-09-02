import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

const NO_FOOTER = ['/admin', '/login', '/register']
const NO_NAVBAR = ['/login', '/register', '/admin']

export default function Layout() {
  const { pathname } = useLocation()
  const showFooter = !NO_FOOTER.some(p => pathname.startsWith(p))
  const showNavbar = !NO_NAVBAR.some(p => pathname.startsWith(p))

  return (
    // توحيد الخلفية للموقع بالكامل بلون ناعم ومريح
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      
      {/* الـ Navbar الآن يسكن فوق الخلفية الموحدة */}
      {showNavbar && <Navbar />}

      <main className="flex-1 flex flex-col">
        {/* إضافة حشوة علوية (Padding Top) تساوي ارتفاع الـ Navbar 
            لضمان أن يبدأ محتوى الصفحة (مثل صفحة العقارات) من تحت النبار مباشرة 
            دون وجود فجوة لونية أو مساحة سوداء.
            (بدون Navbar — متل صفحة تسجيل الدخول — ما في داعي للحشوة)
        */}
        <div className={`${showNavbar ? 'pt-20' : ''} flex-1 flex flex-col`}>
          
          {/* ملاحظة بصرية: قمت بإزالة الخط المتدرج (Opacity 10) 
              لأنه قد يظهر كـ "فرق لون" غير مقصود. 
              إذا أردت استعادته، تأكد أنه يندمج مع خلفية الصفحة. 
          */}

          <Outlet />
        </div>
      </main>

      {showFooter && <Footer />}
    </div>
  )
}