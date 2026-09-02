import { useState, useEffect } from "react"
import DownloadIcon from "@mui/icons-material/Download"
import CloseIcon from "@mui/icons-material/Close"

// زر عائم يظهر لما المتصفح يخبرنا إن التطبيق قابل للتنصيب (PWA).
// ملاحظة: سفاري بالآيفون ما يدعمش beforeinstallprompt أصلاً، فهذا الزر
// بيبان بس على أندرويد/كروم/إيدج. مستخدمي آيفون يضيفوا الاختصار يدوياً
// من قائمة المشاركة (Share) → "Add to Home Screen".
export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem('pwa_install_dismissed') === '1')

  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      if (!dismissed) setVisible(true)
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
      <div className="bg-ink-500 text-white rounded-3xl shadow-2xl shadow-ink-500/40 p-5 flex items-center gap-4">
        <div className="w-11 h-11 shrink-0 bg-white/10 rounded-2xl flex items-center justify-center">
          <DownloadIcon sx={{ fontSize: 22 }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-sm">أضف دليلك العقاري لشاشتك الرئيسية</p>
          <p className="text-white/60 text-xs font-bold mt-0.5">وصول أسرع، وتصفّح بدون نت للمحتوى المحفوظ</p>
        </div>
        <button
          onClick={handleInstall}
          className="shrink-0 bg-white text-ink-500 text-xs font-black px-4 py-2.5 rounded-xl hover:bg-cream-200 transition-all"
        >
          تثبيت
        </button>
        <button onClick={handleDismiss} className="shrink-0 w-8 h-8 rounded-xl hover:bg-white/10 flex items-center justify-center transition-all">
          <CloseIcon sx={{ fontSize: 16 }} />
        </button>
      </div>
    </div>
  )
}