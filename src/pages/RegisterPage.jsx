import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { useTranslation } from "react-i18next"
import { registerUser } from "@/store/slices/authSlice"
import { showToast } from "@/store/slices/uiSlice"

import PersonAddIcon from "@mui/icons-material/PersonAdd"

export default function RegisterPage() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName]   = useState('')
  const [email, setEmail]         = useState('')
  const [phone, setPhone]         = useState('')
  const [password, setPassword]   = useState('')

  const handleRegister = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!firstName || !email || !password) {
      dispatch(showToast('يرجى تعبئة الاسم والبريد الإلكتروني وكلمة المرور'))
      return
    }
    if (password.length < 6) {
      dispatch(showToast('كلمة المرور يجب أن تكون 6 أحرف على الأقل'))
      return
    }
    setLoading(true)
    const result = await dispatch(registerUser({
      name: `${firstName} ${lastName}`.trim(),
      email,
      password,
      phone: phone || undefined,
    }))
    setLoading(false)
    if (registerUser.fulfilled.match(result)) {
      dispatch(showToast(t('auth.successRegister')))
      navigate('/')
    } else {
      dispatch(showToast(result.payload || 'فشل إنشاء الحساب'))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#F8FAFC]">
      <div className="bg-white p-8 w-full max-w-lg rounded-[2rem] border border-cream-300 shadow-xl shadow-cream-200/50">
        
        <div className="w-16 h-16 bg-ink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cream-300">
          <PersonAddIcon sx={{ fontSize: 28, color: '#FFFFFF' }} />
        </div>

        <h1 className="text-2xl font-black mb-2 text-center text-ink-500 tracking-tight">
          {t('auth.registerTitle')}
        </h1>
        <p className="text-ink-100 text-sm mb-8 text-center font-medium">
          {t('auth.registerSub')}
        </p>

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black text-ink-50 mb-1.5 uppercase tracking-wider">{t('auth.firstName')}</label>
              <input 
                value={firstName} 
                onChange={e => setFirstName(e.target.value)}
                className="w-full bg-cream-100 border border-cream-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-brass focus:ring-4 focus:ring-brass/5 transition-all" 
                placeholder="محمد" 
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-ink-50 mb-1.5 uppercase tracking-wider">{t('auth.lastName')}</label>
              <input 
                value={lastName} 
                onChange={e => setLastName(e.target.value)}
                className="w-full bg-cream-100 border border-cream-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-brass focus:ring-4 focus:ring-brass/5 transition-all" 
                placeholder="أحمد" 
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black text-ink-50 mb-1.5 uppercase tracking-wider">{t('auth.emailLabel', 'البريد الإلكتروني')}</label>
            <input 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-cream-100 border border-cream-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-brass focus:ring-4 focus:ring-brass/5 transition-all" 
              type="email" 
              placeholder="example@email.com" 
            />
          </div>

          <div>
            <label className="block text-[11px] font-black text-ink-50 mb-1.5 uppercase tracking-wider">{t('auth.phone')}</label>
            <input 
              value={phone} 
              onChange={e => setPhone(e.target.value)}
              className="w-full bg-cream-100 border border-cream-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-brass focus:ring-4 focus:ring-brass/5 transition-all text-left" 
              dir="ltr" 
              type="tel" 
              placeholder="+970 5X XXX XXXX" 
            />
          </div>

          <div>
            <label className="block text-[11px] font-black text-ink-50 mb-1.5 uppercase tracking-wider">{t('auth.password')}</label>
            <input 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-cream-100 border border-cream-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-brass focus:ring-4 focus:ring-brass/5 transition-all" 
              type="password" 
              placeholder="••••••••" 
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink-500 text-white py-4 rounded-2xl text-sm font-black mt-4 flex items-center justify-center gap-2 hover:bg-ink-400 shadow-xl shadow-cream-300 active:scale-[0.98] transition-all disabled:bg-ink-50"
          >
            <PersonAddIcon sx={{ fontSize: 20 }} /> 
            {loading ? 'جاري إنشاء الحساب...' : t('auth.registerBtn')}
          </button>
        </form>

        <div className="text-center mt-8 pt-6 border-t border-cream-100">
          <span className="text-sm text-ink-50 font-medium">{t('auth.hasAccount')}</span>{" "}
          <Link to="/login" className="text-sm text-brass-dark hover:text-brass font-bold transition-colors">
            {t('auth.loginLink')}
          </Link>
        </div>
      </div>
    </div>
  )
}