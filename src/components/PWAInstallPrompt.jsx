import { useState, useEffect } from "react"
import DownloadIcon from "@mui/icons-material/Download"
import CloseIcon from "@mui/icons-material/Close"
import IosShareIcon from "@mui/icons-material/IosShare"
import AddBoxIcon from "@mui/icons-material/AddBox"

// يكتشف سفاري (ماك أو آيفون) — المتصفح الوحيد اللي ما بيدعمش
// beforeinstallprompt أصلاً (قرار من آبل، مو قصور بالكود).
function detectSafari() {
  const ua = navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream
  const isSafariBrowser = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua)
  return isIOS || isSafariBrowser
}

function isStandalone() {
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
}

// زر عائم يظهر لما المتصفح يخبرنا إن التطبيق قابل للتنصيب (PWA).
// على كروم/إيدج: زر "تثبيت" مباشر عبر beforeinstallprompt.
// على سفاري (ما بيدعمش هالـ API أبداً): تعليمات يدوية بدل ما الزر يختفي بصمت.
export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [visible, setVisible] = useState(false)
  const [mode, setMode] = useState('chrome') // 'chrome' | 'safari'
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem('pwa_install_dismissed') === '1')

  useEffect(() => {
    if (isStandalone() || dismissed) return // مثبت أصلاً أو المستخدم صرفها قبل

    if (detectSafari()) {
      setMode('safari')
      setVisible(true)
      return // سفاري ما بيطلقش beforeinstallprompt أبداً
    }

    const onBeforeInstall = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setMode('chrome')
      setVisible(true)
    }
    const onInstalled = () => {
      setVisible(false)
      setDeferredPrompt(null)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [dismissed])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setVisible(false)
  }

  const handleDismiss = () => {
    setVisible(false)
    sessionStorage.setItem('pwa_install_dismissed', '1')
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:left-auto sm:max-w-sm z-[300] animate-in slide-in-from-bottom-4 duration-500" dir="rtl">
      <div className="bg-ink-500 text-white rounded-3xl shadow-2xl shadow-ink-500/40 p-5">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 shrink-0 bg-white/10 rounded-2xl flex items-center justify-center">
            {mode === 'safari' ? <IosShareIcon sx={{ fontSize: 20 }} /> : <DownloadIcon sx={{ fontSize: 22 }} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-sm">أضف دليلك العقاري لشاشتك الرئيسية</p>
            <p className="text-white/60 text-xs font-bold mt-0.5">وصول أسرع، وتصفّح بدون نت للمحتوى المحفوظ</p>
          </div>
          {mode === 'chrome' && (
            <button
              onClick={handleInstall}
              className="shrink-0 bg-white text-ink-500 text-xs font-black px-4 py-2.5 rounded-xl hover:bg-cream-200 transition-all"
            >
              تثبيت
            </button>
          )}
          <button onClick={handleDismiss} className="shrink-0 w-8 h-8 rounded-xl hover:bg-white/10 flex items-center justify-center transition-all">
            <CloseIcon sx={{ fontSize: 16 }} />
          </button>
        </div>

        {/* تعليمات يدوية لسفاري — ما فيه زر تلقائي أصلاً */}
        {mode === 'safari' && (
          <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white/80">
              <span className="w-5 h-5 shrink-0 bg-white/10 rounded-lg flex items-center justify-center text-[10px] font-black">١</span>
              اضغط أيقونة المشاركة <IosShareIcon sx={{ fontSize: 14 }} /> بشريط سفاري
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-white/80">
              <span className="w-5 h-5 shrink-0 bg-white/10 rounded-lg flex items-center justify-center text-[10px] font-black">٢</span>
              اختار "إضافة إلى الشاشة الرئيسية" <AddBoxIcon sx={{ fontSize: 14 }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}