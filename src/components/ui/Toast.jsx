import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { clearToast } from '@/store/slices/uiSlice'
import CheckCircleIcon from "@mui/icons-material/CheckCircle"

export default function Toast() {
  const dispatch = useDispatch()
  const toast = useSelector(s => s.ui.toast)

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        dispatch(clearToast())
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [toast, dispatch])

  if (!toast) return null

  const message = typeof toast === 'string' ? toast : toast.msg || toast.message || ''

  return (
    /* الحل الذهبي: inset-x-0 مع mx-auto يضمن السنتر في الـ RTL والـ LTR */
    <div className="fixed bottom-10 inset-x-0 z-[9999] flex justify-center pointer-events-none animate-fade-up">
      <div className="bg-ink-500/95 backdrop-blur-md text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 pointer-events-auto">
        
        <CheckCircleIcon sx={{ fontSize: 20, color: '#10b981' }} />
        
        <span className="text-sm font-bold tracking-tight whitespace-nowrap">
          {message}
        </span>

        <div className="w-[1px] h-4 bg-white/20 mx-1" />

        <button 
          onClick={() => dispatch(clearToast())} 
          className="text-white/40 hover:text-white transition-colors text-2xl leading-none p-1"
        >
          ×
        </button>
      </div>
    </div>
  )
}