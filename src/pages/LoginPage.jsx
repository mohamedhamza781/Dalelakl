import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { useTranslation } from "react-i18next"
import { loginUser } from "@/store/slices/authSlice"
import { showToast } from "@/store/slices/uiSlice"

import EmailIcon from "@mui/icons-material/Email"
import KeyIcon from "@mui/icons-material/Key"
import VisibilityIcon from "@mui/icons-material/Visibility"
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff"
import Logo from "@/assets/logo-transparent.png"

export default function LoginPage() {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [pass, setPass] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const isEn = i18n.language === 'en'

  const handleRealLogin = async (e) => {
    e.preventDefault()
    if (!email || !pass) return dispatch(showToast('يرجى إدخال البريد الإلكتروني وكلمة المرور'))
    setLoading(true)
    const result = await dispatch(loginUser({ email, password: pass }))
    setLoading(false)
    if (loginUser.fulfilled.match(result)) {
      dispatch(showToast(t('auth.successLogin')))
      const role = result.payload.role?.toLowerCase()
      if (role === 'admin') navigate('/admin')
      else navigate('/')
    } else {
      dispatch(showToast(result.payload || 'فشل تسجيل الدخول'))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#F8FAFC]">
      <div className="bg-white p-8 w-full max-w-md rounded-[2.5rem] border border-cream-300 shadow-xl shadow-cream-200/50">
        
        <div className="w-20 h-20 bg-white border border-cream-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cream-300 transition-transform hover:scale-110 p-3">
          <img loading="lazy" src={Logo} alt="دليلك العقاري" className="w-full h-full object-contain" />
        </div>

        <h1 className="text-2xl font-black mb-2 text-center text-ink-500 tracking-tight">
          {t('auth.loginTitle')}
        </h1>
        <p className="text-ink-100 text-sm mb-8 text-center font-medium">
          {t('auth.loginSub')}
        </p>

        <form onSubmit={handleRealLogin}>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-black text-ink-50 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <EmailIcon sx={{ fontSize: 14 }} /> {t('auth.emailLabel')}
              </label>
              <input 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                type="email" 
                placeholder="example@email.com" 
                className="w-full bg-cream-100 border border-cream-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-brass focus:ring-4 focus:ring-brass/5 transition-all" 
              />
            </div>

            <div className="relative">
              <label className="block text-[11px] font-black text-ink-50 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <KeyIcon sx={{ fontSize: 14 }} /> {t('auth.passLabel')}
              </label>
              <input 
                value={pass} 
                onChange={e => setPass(e.target.value)} 
                type={showPass ? "text" : "password"} 
                placeholder="••••••••" 
                className={`w-full bg-cream-100 border border-cream-200 rounded-xl py-3 text-sm outline-none focus:bg-white focus:border-brass focus:ring-4 focus:ring-brass/5 transition-all ${isEn ? 'pr-10 pl-4' : 'pl-10 pr-4'}`} 
              />
              <button 
                type="button" 
                onClick={() => setShowPass(!showPass)} 
                className={`absolute bottom-3 text-ink-50 hover:text-ink-200 transition-colors ${isEn ? 'right-3' : 'left-3'}`}
              >
                {showPass ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-6 py-3 bg-ink-500 hover:bg-ink-400 disabled:bg-ink-50 text-white font-black rounded-xl transition-all active:scale-[0.98]"
          >
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>

          <div className="flex justify-between items-center mt-4 px-1">
            <label className="flex items-center gap-2 text-ink-50 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-cream-400 accent-ink-500 cursor-pointer" /> 
              <span className="text-xs font-bold group-hover:text-ink-200 transition-colors">{t('auth.remember')}</span>
            </label>
            <button type="button" className="text-ink-500 hover:text-ink-600 text-xs font-black transition-colors">{t('auth.forgot')}</button>
          </div>
        </form>
      </div>
    </div>
  )
}