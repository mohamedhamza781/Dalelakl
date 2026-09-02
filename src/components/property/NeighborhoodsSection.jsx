import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { useTranslation } from "react-i18next"
import { setFilters } from "@/store/slices/propertiesSlice"
import { neighborhoodsAPI } from "@/lib/api"

import LocationCityIcon from "@mui/icons-material/LocationCity"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'



export default function NeighborhoodsSection() {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const isEn = i18n.language === "en"

  const [neighborhoods, setNeighborhoods] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    neighborhoodsAPI.getPublic()
      .then(res => {
        setNeighborhoods(res.neighborhoods || [])
      })
      .catch(() => setNeighborhoods([]))
      .finally(() => setLoading(false))
  }, [])

  const handleClick = (n) => {
    dispatch(setFilters({ city: n.city }))
    navigate("/properties")
  }

  const getImageSrc = (n) => {
    if (!n.image) return null
    if (n.image.startsWith('http')) return n.image
    return `${BASE_URL}${n.image}`
  }

  if (loading) {
    return (
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-[2rem] aspect-[3/4] bg-cream-300 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (neighborhoods.length === 0) return null

  return (
    <section className="py-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-ink-500 text-white text-[11px] font-black px-4 py-2 rounded-full mb-4">
              <LocationCityIcon sx={{ fontSize: 14 }} />
              {isEn ? "Explore by Neighborhood" : "استكشف حسب الحي"}
            </div>
            <h2 className="text-3xl font-black text-ink-500">
              {isEn ? "Top Neighborhoods" : "أبرز الأحياء"}
            </h2>
            <p className="text-ink-100 font-medium mt-2">
              {isEn ? "Discover the most sought-after areas in Palestine" : "اكتشف أكثر المناطق طلباً في فلسطين"}
            </p>
          </div>
          <button
            onClick={() => navigate("/properties")}
            className="inline-flex items-center gap-2 text-ink-200 hover:text-ink-500 font-black text-sm transition-colors"
          >
            {isEn ? "View All" : "عرض الكل"}
            <ArrowForwardIcon sx={{ fontSize: 18 }} className={isEn ? "" : "rotate-180"} />
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {neighborhoods.map((n) => {
            const imgSrc = getImageSrc(n)
            return (
              <button
                key={n._id || n.id || `${n.city}-${n.neighborhood}`}
                onClick={() => handleClick(n)}
                className="group relative rounded-[2rem] overflow-hidden aspect-[3/4] flex flex-col justify-end text-right shadow-sm hover:shadow-2xl hover:shadow-ink-500/10 hover:-translate-y-1 transition-all duration-500 cursor-pointer"
                style={{ background: imgSrc ? '#111' : (n.gradient || 'linear-gradient(135deg,#1a3a5c,#0D2B45)') }}
              >
                {/* صورة الحي */}
                {imgSrc && (
                  <img
                    src={imgSrc}
                    alt={n.neighborhood}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-all duration-500" />

                {/* Emoji (فقط لو ما في صورة) */}
                {!imgSrc && (
                  <div className="absolute top-5 right-5 text-3xl group-hover:scale-110 transition-transform duration-500">
                    {n.emoji || '🏘️'}
                  </div>
                )}

                {/* Tag */}
                {(n.tag || n.tagEn) && (
                  <div className="absolute top-5 left-5">
                    <span className="bg-white/20 backdrop-blur-sm text-white text-[9px] font-black px-2 py-1 rounded-xl border border-white/10">
                      {isEn ? (n.tagEn || n.tag) : (n.tag || n.tagEn)}
                    </span>
                  </div>
                )}

                {/* Content */}
                <div className="relative z-10 p-4 text-right">
                  <div className="text-white font-black text-sm leading-tight mb-1">
                    {isEn ? (n.neighborhoodEn || n.neighborhood) : n.neighborhood}
                  </div>
                  <div className="text-white/60 text-[10px] font-bold mb-2">
                    {isEn ? (n.cityEn || n.city) : n.city}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-white/50 text-[9px] font-bold">
                      {n.count} {isEn ? "listings" : "إعلان"}
                    </div>
                    <ArrowForwardIcon
                      sx={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}
                      className={`group-hover:translate-x-1 transition-transform ${isEn ? "" : "rotate-180"}`}
                    />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}