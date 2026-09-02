import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp"

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const { pathname } = useLocation()

  // 1. العودة للأعلى تلقائياً عند تغيير الصفحة (تغيير المسار)
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  // 2. مراقبة التمرير لإظهار الزر عند الحاجة
  useEffect(() => {
    const toggleVisibility = () => {
      // يظهر الزر بعد النزول لأسفل بمقدار 400 بكسل
      if (window.scrollY > 400) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 left-8 z-[999] w-14 h-14 rounded-2xl hidden lg:flex items-center justify-center transition-all duration-500 shadow-2xl border border-white/20 backdrop-blur-md bg-ink-500 text-white hover:bg-ink-600 hover:-translate-y-2 active:scale-90 shadow-brass/40 ${
        isVisible 
          ? "translate-y-0 opacity-100" 
          : "translate-y-28 opacity-0 pointer-events-none"
      }`}
    >
      <KeyboardArrowUpIcon sx={{ fontSize: 32 }} />
    </button>
  )
}