import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import SendIcon from '@mui/icons-material/Send'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { contactAPI, settingsAPI } from '@/lib/api'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    settingsAPI.getPublic()
      .then(d => setSettings(d.settings))
      .catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.message) {
      setError('يرجى تعبئة الاسم والبريد الإلكتروني والرسالة')
      return
    }
    setLoading(true)
    try {
      await contactAPI.submit(form)
      setSent(true)
    } catch (err) {
      setError(err.message || 'حدث خطأ، يرجى المحاولة لاحقاً')
    } finally {
      setLoading(false)
    }
  }

  const phone   = settings?.footer_phone   || '+970 59-XXXX-XXX'
  const email   = settings?.footer_email   || 'hello@dalelak.ps'
  const address = settings?.footer_address || 'فلسطين'
  const hours   = settings?.footer_hours   || '09:00 AM - 05:00 PM'

  const infoCards = [
    { icon: <PhoneIcon sx={{ fontSize: 22 }} />,      label: 'الهاتف',          val: phone,   color: 'bg-cream-200 text-ink-500',    href: `tel:${phone}` },
    { icon: <EmailIcon sx={{ fontSize: 22 }} />,      label: 'البريد الإلكتروني', val: email, color: 'bg-cream-200 text-ink-500', href: `mailto:${email}` },
    { icon: <LocationOnIcon sx={{ fontSize: 22 }} />, label: 'الموقع',           val: address, color: 'bg-emerald-50 text-emerald-600', href: null },
    { icon: <AccessTimeIcon sx={{ fontSize: 22 }} />, label: 'ساعات العمل',      val: hours,   color: 'bg-amber-50 text-amber-600',   href: null },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 bg-cream-100 min-h-screen" dir="rtl">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-4xl font-black text-ink-500 mb-3 tracking-tighter">تواصل معنا</h1>
          <p className="text-ink-100 max-w-xl mx-auto font-medium text-lg">
            فريقنا جاهز للمساعدة — أرسل لنا استفسارك وسنتواصل معك خلال 24 ساعة
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {infoCards.map(({ icon, label, val, color, href }, i) => (
            <div key={i} className="bg-white rounded-2xl border border-cream-200 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-all">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
              <div>
                <p className="text-[10px] font-black text-ink-50 uppercase tracking-widest mb-0.5">{label}</p>
                {href
                  ? <a href={href} className="text-sm font-bold text-ink-300 hover:text-ink-500 transition-colors break-all">{val}</a>
                  : <p className="text-sm font-bold text-ink-300">{val}</p>
                }
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="bg-white rounded-[2.5rem] border border-cream-200 shadow-xl shadow-cream-200/60 overflow-hidden">
          <div className="p-8 md:p-14">
            {sent ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircleIcon sx={{ fontSize: 44, color: '#10b981' }} />
                </div>
                <h2 className="text-2xl font-black text-ink-500 mb-2">تم إرسال رسالتك!</h2>
                <p className="text-ink-100 font-medium">سيتواصل معك فريقنا في أقرب وقت ممكن.</p>
                <button onClick={() => { setSent(false); setForm({ name:'', email:'', phone:'', subject:'', message:'' }) }}
                  className="mt-8 bg-ink-500 text-white font-black px-8 py-3 rounded-2xl hover:bg-ink-500 transition-all text-sm">
                  إرسال رسالة أخرى
                </button>
              </motion.div>
            ) : (
              <>
                <h2 className="text-2xl font-black text-ink-500 mb-8">أرسل رسالتك</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-[10px] font-black text-ink-50 uppercase block mb-1.5">الاسم الكامل *</label>
                      <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="محمد أحمد" dir="rtl"
                        className="w-full bg-cream-100 border border-cream-200 rounded-2xl px-4 py-3.5 text-sm font-bold outline-none focus:border-brass-light focus:bg-white transition-all" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-ink-50 uppercase block mb-1.5">البريد الإلكتروني *</label>
                      <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        placeholder="example@email.com" type="email" dir="ltr"
                        className="w-full bg-cream-100 border border-cream-200 rounded-2xl px-4 py-3.5 text-sm font-bold outline-none focus:border-brass-light focus:bg-white transition-all text-right" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-[10px] font-black text-ink-50 uppercase block mb-1.5">رقم الهاتف</label>
                      <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                        placeholder="+970 59-XXX-XXXX" dir="ltr"
                        className="w-full bg-cream-100 border border-cream-200 rounded-2xl px-4 py-3.5 text-sm font-bold outline-none focus:border-brass-light focus:bg-white transition-all text-right" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-ink-50 uppercase block mb-1.5">الموضوع</label>
                      <select value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                        className="w-full bg-cream-100 border border-cream-200 rounded-2xl px-4 py-3.5 text-sm font-bold outline-none focus:border-brass-light focus:bg-white transition-all appearance-none cursor-pointer">
                        <option value="">اختر الموضوع...</option>
                        <option value="استفسار عام">استفسار عام</option>
                        <option value="مشكلة تقنية">مشكلة تقنية</option>
                        <option value="شكوى">شكوى</option>
                        <option value="اقتراح">اقتراح</option>
                        <option value="باقات واشتراكات">باقات واشتراكات</option>
                        <option value="أخرى">أخرى</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-ink-50 uppercase block mb-1.5">الرسالة *</label>
                    <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                      placeholder="اكتب رسالتك هنا..." rows={5} dir="rtl"
                      className="w-full bg-cream-100 border border-cream-200 rounded-2xl px-4 py-3.5 text-sm font-bold outline-none focus:border-brass-light focus:bg-white transition-all resize-none" />
                  </div>

                  {error && (
                    <div className="bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold px-4 py-3 rounded-2xl">{error}</div>
                  )}

                  <button type="submit" disabled={loading}
                    className="w-full bg-ink-500 disabled:bg-cream-400 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-ink-500 transition-all text-sm">
                    {loading ? (
                      <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> جاري الإرسال...</span>
                    ) : (
                      <span className="flex items-center gap-2">إرسال الرسالة <SendIcon sx={{ fontSize: 18 }} /></span>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
