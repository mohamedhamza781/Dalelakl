import { useEffect, useState, useMemo } from 'react'
import { settingsAPI } from '@/lib/api'
import HelpOutlineIcon from '@mui/icons-material/Help'
import SearchIcon from '@mui/icons-material/Search'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ContactSupportIcon from '@mui/icons-material/ContactSupport'
import { Link } from 'react-router-dom'

const ICON_COLORS = { 1: '#6366f1', 2: '#0ea5e9', 3: '#f59e0b', 4: '#10b981' }

export default function HelpPage() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [openId, setOpenId] = useState(null)
  const [activeCat, setActiveCat] = useState(null)

  useEffect(() => {
    settingsAPI.getPublic()
      .then(d => { setSettings(d.settings); setActiveCat(d.settings?.help_categories?.[0]?.id || null) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const categories = settings?.help_categories || []
  const intro = settings?.help_intro || 'مرحباً بك في مركز المساعدة. ابحث عن إجابات لأسئلتك أو تصفح الموضوعات أدناه.'

  const searchResults = useMemo(() => {
    if (!search.trim()) return []
    const q = search.toLowerCase()
    const res = []
    categories.forEach(cat => {
      (cat.articles || []).forEach(art => {
        if (art.q.toLowerCase().includes(q) || art.a.toLowerCase().includes(q)) {
          res.push({ ...art, catTitle: cat.title, catColor: cat.color })
        }
      })
    })
    return res
  }, [search, categories])

  const activeCategory = categories.find(c => c.id === activeCat)

  return (
    <div className="bg-cream-100 min-h-screen py-20" dir="rtl">
      <div className="max-w-5xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <HelpOutlineIcon sx={{ fontSize: 42, color: '#10b981' }} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-ink-500 mb-3">مركز المساعدة والدعم</h1>
          <p className="text-ink-100 font-medium text-lg max-w-xl mx-auto">{intro}</p>
        </div>

        {/* Search */}
        <div className="relative max-w-xl mx-auto mb-12">
          <SearchIcon sx={{ fontSize: 22, color: '#94a3b8', position: 'absolute', top: '50%', right: '16px', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setOpenId(null) }}
            placeholder="ابحث عن سؤالك..."
            className="w-full bg-white border border-cream-300 rounded-2xl px-5 py-4 pr-12 text-ink-300 font-bold outline-none focus:border-emerald-400 shadow-sm transition-all text-base"
          />
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white rounded-3xl animate-pulse border border-cream-200" />)}
          </div>
        ) : search.trim() ? (
          /* Search Results */
          <div className="bg-white rounded-3xl border border-cream-200 shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-cream-100 bg-cream-100/50">
              <p className="font-black text-ink-300">نتائج البحث عن "{search}" — {searchResults.length} نتيجة</p>
            </div>
            {searchResults.length === 0 ? (
              <div className="py-16 text-center text-ink-50 font-bold">
                <SearchIcon sx={{ fontSize: 48, color: '#e2e8f0', display: 'block', margin: '0 auto 12px' }} />
                لم نجد نتائج، جرب كلمة أخرى
              </div>
            ) : (
              <div className="divide-y divide-cream-100">
                {searchResults.map(art => (
                  <div key={art.id} className="overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between px-8 py-5 hover:bg-cream-100 transition-colors text-right"
                      onClick={() => setOpenId(openId === art.id ? null : art.id)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-xs font-black px-2 py-1 rounded-xl flex-shrink-0" style={{ background: art.catColor + '20', color: art.catColor }}>{art.catTitle}</span>
                        <span className="font-bold text-ink-400 truncate text-sm">{art.q}</span>
                      </div>
                      <ExpandMoreIcon sx={{ fontSize: 20, color: '#94a3b8', transform: openId === art.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0, marginRight: '8px' }} />
                    </button>
                    {openId === art.id && (
                      <div className="px-8 pb-6 bg-emerald-50/30 border-t border-cream-200">
                        <p className="text-ink-200 leading-loose text-sm font-medium pt-4">{art.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Category Browser */
          <div className="flex flex-col md:flex-row gap-6">
            {/* Category Sidebar */}
            <div className="md:w-64 shrink-0 space-y-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCat(cat.id); setOpenId(null) }}
                  className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-right font-bold text-sm transition-all ${
                    activeCat === cat.id
                      ? 'text-white shadow-lg'
                      : 'bg-white border border-cream-200 text-ink-200 hover:border-cream-300'
                  }`}
                  style={activeCat === cat.id ? { background: cat.color || '#10b981' } : {}}
                >
                  <span className="font-black">{cat.title}</span>
                  <span className={`mr-auto text-xs font-bold px-2 py-0.5 rounded-xl ${activeCat === cat.id ? 'bg-white/20 text-white' : 'bg-cream-200 text-ink-50'}`}>
                    {cat.articles?.length || 0}
                  </span>
                </button>
              ))}
            </div>

            {/* Articles */}
            <div className="flex-1 bg-white rounded-3xl border border-cream-200 shadow-sm overflow-hidden">
              {activeCategory ? (
                <>
                  <div className="px-8 py-6 border-b border-cream-100" style={{ background: (activeCategory.color || '#10b981') + '10' }}>
                    <h2 className="font-black text-xl text-ink-500">{activeCategory.title}</h2>
                    <p className="text-sm text-ink-100 font-bold mt-1">{activeCategory.articles?.length || 0} مقالات</p>
                  </div>
                  <div className="divide-y divide-cream-100">
                    {(activeCategory.articles || []).map(art => (
                      <div key={art.id}>
                        <button
                          className="w-full flex items-center justify-between px-8 py-5 hover:bg-cream-100/80 transition-colors text-right"
                          onClick={() => setOpenId(openId === art.id ? null : art.id)}
                        >
                          <span className="font-bold text-ink-400 text-sm text-right flex-1">{art.q}</span>
                          <ExpandMoreIcon sx={{ fontSize: 20, color: '#94a3b8', transform: openId === art.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0, marginRight: '12px' }} />
                        </button>
                        {openId === art.id && (
                          <div className="px-8 pb-6 border-t border-cream-100" style={{ background: (activeCategory.color || '#10b981') + '06' }}>
                            <p className="text-ink-200 leading-loose text-sm font-medium pt-4">{art.a}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-16 text-center text-cream-400 font-bold">اختر موضوعاً من القائمة</div>
              )}
            </div>
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-12 bg-gradient-to-l from-emerald-600 to-teal-600 rounded-3xl p-8 text-white text-center">
          <ContactSupportIcon sx={{ fontSize: 40, marginBottom: '8px', opacity: 0.9 }} />
          <h3 className="text-xl font-black mb-2">لم تجد إجابتك؟</h3>
          <p className="text-emerald-100 font-medium text-sm mb-5">فريق الدعم جاهز لمساعدتك في أي وقت</p>
          <Link to="/contact" className="inline-block bg-white text-emerald-700 font-black px-8 py-3 rounded-xl hover:bg-emerald-50 transition-colors text-sm">
            تواصل مع الدعم
          </Link>
        </div>
      </div>
    </div>
  )
}
