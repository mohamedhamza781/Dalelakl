import { useEffect, useState } from 'react'
import { settingsAPI } from '@/lib/api'
import SecurityIcon from '@mui/icons-material/Security'
import UpdateIcon from '@mui/icons-material/Update'
import ShieldIcon from '@mui/icons-material/Shield'

export default function PrivacyPage() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState(null)

  useEffect(() => {
    settingsAPI.getPublic()
      .then(d => setSettings(d.settings))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const sections = settings?.privacy_sections || []
  const intro    = settings?.privacy_intro    || 'تصف هذه السياسة كيفية جمع بياناتك واستخدامها وحمايتها على منصة دليلك العقاري.'
  const updated  = settings?.privacy_last_updated || ''

  const formatDate = (str) => {
    if (!str) return ''
    try { return new Date(str).toLocaleDateString('ar-PS', { year: 'numeric', month: 'long', day: 'numeric' }) }
    catch { return str }
  }

  return (
    <div className="bg-cream-100 min-h-screen py-20" dir="rtl">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-xl shadow-cream-300/50 border border-cream-200">
          <div className="flex items-center gap-4 mb-6 text-ink-500">
            <div className="w-16 h-16 bg-cream-200 rounded-2xl flex items-center justify-center">
              <SecurityIcon sx={{ fontSize: 35 }} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-ink-500">سياسة الخصوصية</h1>
              {updated && (
                <div className="flex items-center gap-1.5 text-xs text-ink-50 font-bold mt-1">
                  <UpdateIcon sx={{ fontSize: 14 }} />
                  آخر تحديث: {formatDate(updated)}
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1,2,3,4].map(i => <div key={i} className="h-16 bg-cream-200 rounded-2xl animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-6 text-ink-200 font-medium leading-relaxed">
              <div className="bg-cream-200 border border-cream-300 rounded-2xl p-6">
                <p className="text-base text-ink-500 font-semibold leading-relaxed">{intro}</p>
              </div>

              {sections.length > 0 && (
                <div className="space-y-3">
                  {sections.map((sec, idx) => (
                    <div key={sec.id || idx} className="border border-cream-200 rounded-2xl overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between px-6 py-5 bg-cream-100 hover:bg-cream-200/50 transition-colors text-right"
                        onClick={() => setOpenId(openId === (sec.id || idx) ? null : (sec.id || idx))}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-cream-300 text-ink-600 text-sm font-black flex items-center justify-center flex-shrink-0">{idx + 1}</span>
                          <span className="text-ink-400 font-black text-base">{sec.title}</span>
                        </div>
                        <span className={`text-brass-light text-lg transition-transform duration-200 ${openId === (sec.id || idx) ? 'rotate-180' : ''}`}>▾</span>
                      </button>
                      {openId === (sec.id || idx) && (
                        <div className="px-6 py-5 bg-white border-t border-cream-200">
                          <div className="flex gap-3">
                            <ShieldIcon sx={{ fontSize: 18, color: '#2563eb', marginTop: '2px', flexShrink: 0 }} />
                            <p className="text-ink-200 leading-loose text-sm font-medium">{sec.content}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {updated && (
                <div className="flex items-center gap-2 p-5 bg-cream-200 rounded-2xl text-sm text-ink-500 font-bold border border-cream-300">
                  <UpdateIcon sx={{ fontSize: 18 }} />
                  تاريخ آخر تحديث: {formatDate(updated)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
