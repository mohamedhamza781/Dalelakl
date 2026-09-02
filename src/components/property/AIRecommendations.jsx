import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { propertiesAPI } from "@/lib/api"

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome"
import BedIcon from "@mui/icons-material/Bed"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import SquareFootIcon from "@mui/icons-material/SquareFoot"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import TuneIcon from "@mui/icons-material/Tune"
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import DiamondIcon from '@mui/icons-material/Diamond'
import SavingsIcon from '@mui/icons-material/Savings'
import ConstructionIcon from '@mui/icons-material/Construction'

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
const getImageUrl = (img) => {
  if (!img) return null
  if (img.startsWith('http')) return img
  return `${BASE}${img}`
}

const PREFERENCES = [
  { id: "family",     label: "عائلي",     labelEn: "Family",     icon: <FamilyRestroomIcon sx={{ fontSize: 20 }} /> },
  { id: "investment", label: "استثماري",  labelEn: "Investment", icon: <TrendingUpIcon sx={{ fontSize: 20 }} /> },
  { id: "luxury",     label: "فاخر",      labelEn: "Luxury",     icon: <DiamondIcon sx={{ fontSize: 20 }} /> },
  { id: "budget",     label: "اقتصادي",   labelEn: "Budget",     icon: <SavingsIcon sx={{ fontSize: 20 }} /> },
  { id: "new",        label: "جديد",      labelEn: "New Build",  icon: <ConstructionIcon sx={{ fontSize: 20 }} /> },
]

// منطق التسجيل بناءً على بيانات حقيقية من الداتابيز
function scoreProperty(p, selected) {
  let score = 0
  selected.forEach(pref => {
    if (pref === "family") {
      if (p.rooms >= 3) score += 2
      if (p.category === "apt" || p.category === "villa") score += 1
    }
    if (pref === "investment") {
      if (p.type === "sale") score += 2
      if (p.category === "land" || p.category === "commercial") score += 1
    }
    if (pref === "luxury") {
      if (p.price > 600000) score += 2
      if (p.category === "villa") score += 1
    }
    if (pref === "budget") {
      if (p.price < 400000) score += 2
      if (p.type === "rent") score += 1
    }
    if (pref === "new") {
      if (p.year && p.year >= 2022) score += 2
      if (p.year && p.year >= 2020) score += 1
    }
  })
  return score
}

export default function AIRecommendations() {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const isEn = i18n.language === "en"
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)

  const toggle = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    setResults(null)
  }

  const getRecommendations = async () => {
    if (!selected.length) return
    setLoading(true)
    try {
      // جيب كل العقارات من الداتابيز
      const data = await propertiesAPI.getAll({ limit: 50 })
      const all = data.properties || []

      // سجّل كل عقار بناءً على التفضيلات
      const scored = all
        .map(p => ({ ...p, score: scoreProperty(p, selected) }))
        .filter(p => p.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 4)

      // لو ما في نتائج، رجّع أول 4
      setResults(scored.length ? scored : all.slice(0, 4).map(p => ({ ...p, score: 1 })))
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-black text-ink-500">
              {isEn ? "Personalized Recommendations" : "توصيات مخصصة لك"}
            </h2>
            <p className="text-ink-100 font-medium mt-2 max-w-md">
              {isEn ? "Tell us your preferences and we'll find the best matches for you." : "أخبرنا بتفضيلاتك وسنجد لك أفضل العقارات المناسبة."}
            </p>
          </div>
          <div className="flex items-center gap-2 text-ink-50 text-sm font-bold">
            <TuneIcon sx={{ fontSize: 18 }} />
            {isEn ? "Select multiple" : "يمكنك اختيار أكثر من واحد"}
          </div>
        </div>

        {/* Preference Chips */}
        <div className="flex flex-wrap gap-3 mb-8">
          {PREFERENCES.map(pref => {
            const isSelected = selected.includes(pref.id)
            return (
              <button key={pref.id} onClick={() => toggle(pref.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all border ${
                  isSelected
                    ? "bg-ink-500 text-white border-ink-500 shadow-lg shadow-cream-300"
                    : "bg-white text-ink-200 border-cream-300 hover:border-ink-50"
                }`}>
                <span className={`flex items-center ${isSelected ? "text-white" : "text-ink-500"}`}>
                  {pref.icon}
                </span>
                {isEn ? pref.labelEn : pref.label}
              </button>
            )
          })}

          <button onClick={getRecommendations} disabled={!selected.length || loading}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all border ${
              selected.length
                ? "bg-ink-500 text-white border-ink-500 hover:bg-ink-600 shadow-lg shadow-cream-400 active:scale-95"
                : "bg-cream-200 text-ink-50 border-cream-200 cursor-not-allowed"
            }`}>
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {isEn ? "Analyzing..." : "جاري التحليل..."}
              </>
            ) : (
              <>
                <AutoAwesomeIcon sx={{ fontSize: 18 }} />
                {isEn ? "Get Recommendations" : "احصل على توصيات"}
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {results && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-ink-500 text-white rounded-xl flex items-center justify-center">
                <AutoAwesomeIcon sx={{ fontSize: 16 }} />
              </div>
              <p className="text-ink-300 font-black text-sm">
                {results.length === 0
                  ? (isEn ? "No matches found." : "لا توجد نتائج مطابقة.")
                  : (isEn ? `Found ${results.length} perfect matches for you!` : `وجدنا ${results.length} عقارات مثالية لك!`)}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {results.map((p, idx) => {
                const firstImage = Array.isArray(p.images) && p.images.length > 0
                  ? getImageUrl(p.images[0]) : null
                return (
                  <div key={p.id} onClick={() => navigate(`/properties/${p.slug}`)}
                    className="group bg-white rounded-2xl sm:rounded-[2rem] border border-cream-300 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-pointer">
                    <div className="relative">
                      <div className="h-24 sm:h-40 flex items-center justify-center text-3xl sm:text-5xl overflow-hidden"
                        style={{ background: p.gradient || 'linear-gradient(135deg, #f8fafc, #e2e8f0)' }}>
                        {firstImage ? (
                          <img src={firstImage} alt={p.title} className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                        ) : (
                          <span>{p.emoji || '🏠'}</span>
                        )}
                      </div>
                      <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                        <div className="bg-white/90 backdrop-blur-sm text-ink-500 text-[8px] sm:text-[9px] font-black px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg sm:rounded-xl flex items-center gap-1 shadow-sm">
                          <AutoAwesomeIcon sx={{ fontSize: 10, color: '#3b82f6' }} />
                          {idx === 0
                            ? (isEn ? "Best Match" : "الأنسب")
                            : `${Math.min(Math.round((p.score / (selected.length * 3)) * 100), 99)}% ${isEn ? "match" : "تطابق"}`}
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 sm:p-5">
                      <div className="font-black text-ink-500 text-xs sm:text-sm mb-1 line-clamp-1 group-hover:text-ink-500 transition-colors">
                        {isEn && p.titleEn ? p.titleEn : p.title}
                      </div>
                      <div className="flex items-center gap-1 text-ink-50 text-[10px] sm:text-[11px] font-bold mb-2 sm:mb-3">
                        <LocationOnIcon sx={{ fontSize: 12 }} /> {p.city}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-ink-500 font-black text-xs sm:text-sm">₪ {p.price?.toLocaleString()}</div>
                        <div className="flex items-center gap-2 text-ink-50 text-[10px] sm:text-[11px] font-bold">
                          {p.rooms > 0 && <><BedIcon sx={{ fontSize: 13 }} />{p.rooms}</>}
                          <SquareFootIcon sx={{ fontSize: 13 }} />{p.area}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="text-center mt-8">
              <button onClick={() => navigate("/properties")}
                className="inline-flex items-center gap-2 bg-ink-500 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-ink-500 transition-all shadow-xl shadow-cream-300 active:scale-95">
                {isEn ? "View All Properties" : "عرض جميع العقارات"}
                <ArrowForwardIcon sx={{ fontSize: 18 }} className={isEn ? "" : "rotate-180"} />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}