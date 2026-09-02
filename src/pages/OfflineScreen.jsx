import { useState, useEffect } from "react"
import WifiOffIcon from "@mui/icons-material/WifiOff"
import RefreshIcon from "@mui/icons-material/Refresh"
import Logo from "@/logo.png"

// يظهر شاشة كاملة بشعار الموقع + رسالة "لا يوجد اتصال بالإنترنت"
// كل ما النت يقطع (بدل ما يبين خطأ المتصفح الافتراضي البشع).
// يختفي تلقائياً لحظة ما النت يرجع.
export default function OfflineScreen() {
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' && !navigator.onLine)

  useEffect(() => {
    const goOffline = () => setIsOffline(true)
    const goOnline  = () => setIsOffline(false)
    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div className="fixed inset-0 z-[400] bg-cream-100 flex flex-col items-center justify-center px-6 text-center" dir="rtl">
      <img src={Logo} alt="دليلك العقاري" className="w-24 h-24 object-contain mb-8 opacity-90" />

      <div className="w-16 h-16 bg-ink-500 text-white rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-ink-500/20">
        <WifiOffIcon sx={{ fontSize: 30 }} />
      </div>

      <h1 className="text-2xl font-black text-ink-500 mb-3">لا يوجد اتصال بالإنترنت</h1>
      <p className="text-ink-100 font-medium max-w-sm mb-8 leading-relaxed">
        تأكد من اتصالك بالشبكة أو الواي فاي وحاول مرة أخرى.
      </p>

      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-2 bg-ink-500 text-white font-black px-6 py-3 rounded-2xl hover:bg-ink-400 transition-all shadow-lg active:scale-95"
      >
        <RefreshIcon sx={{ fontSize: 18 }} />
        إعادة المحاولة
      </button>
    </div>
  )
}