import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { propertiesAPI } from "@/lib/api"

// Icons
import CompareArrowsIcon from "@mui/icons-material/CompareArrows"
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlined"
import CloseIcon from "@mui/icons-material/Close"
import CheckIcon from "@mui/icons-material/Check"
import BedIcon from "@mui/icons-material/Bed"
import BathtubIcon from "@mui/icons-material/Bathtub"
import SquareFootIcon from "@mui/icons-material/SquareFoot"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import VerifiedIcon from "@mui/icons-material/Verified"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"

const MAX = 3

// ── Helper: بناء رابط الصورة الكامل ─────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

const getImageUrl = (img) => {
  if (!img) return null
  if (img.startsWith('http')) return img
  return `${BASE_URL}${img}`
}

export default function PropertyComparePage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isEn = i18n.language === "en"
  const [selected, setSelected] = useState([])
  const [search, setSearch] = useState("")
  const [showPicker, setShowPicker] = useState(false)
  const [allProperties, setAllProperties] = useState([])

  useEffect(() => {
    propertiesAPI.getAll({ limit: 100 }).then(res => {
      if (res?.properties?.length) setAllProperties(res.properties)
    }).catch(() => {})
  }, [])

  const addProperty = (p) => {
    if (selected.length >= MAX) return
    if (selected.find(x => x.id === p.id)) return
    setSelected([...selected, p])
    setShowPicker(false)
    setSearch("")
  }

  const removeProperty = (id) => {
    setSelected(selected.filter(x => x.id !== id))
  }

  const filtered = allProperties.filter(p =>
    !selected.find(s => s.id === p.id) &&
    (p.title.includes(search) || p.location.includes(search) || p.city.includes(search))
  )

  const rows = [
    { label: isEn ? "Price" : "السعر", key: "price", render: (p) => `₪ ${p.price.toLocaleString()}${p.type === "rent" ? (isEn ? "/mo" : "/شهر") : ""}` },
    { label: isEn ? "Type" : "النوع", key: "type", render: (p) => p.type === "rent" ? (isEn ? "For Rent" : "للإيجار") : (isEn ? "For Sale" : "للبيع") },
    { label: isEn ? "Category" : "الفئة", key: "category", render: (p) => ({ apt: isEn ? "Apartment" : "شقة", villa: isEn ? "Villa" : "فيلا", land: isEn ? "Land" : "أرض", shop: isEn ? "Shop" : "محل" }[p.category] || p.category) },
    { label: isEn ? "City" : "المدينة", key: "city", render: (p) => p.city },
    { label: isEn ? "Area" : "المساحة", key: "area", render: (p) => `${p.area} م²` },
    { label: isEn ? "Rooms" : "الغرف", key: "rooms", render: (p) => p.rooms || "—" },
    { label: isEn ? "Bathrooms" : "الحمامات", key: "baths", render: (p) => p.baths || "—" },
    { label: isEn ? "Floor" : "الطابق", key: "floor", render: (p) => p.floor || "—" },
    { label: isEn ? "Year Built" : "سنة البناء", key: "year", render: (p) => p.year || "—" },
    { label: isEn ? "Parking" : "موقف", key: "parking", render: (p) => p.parking ? <CheckIcon sx={{ fontSize: 18, color: '#22c55e' }} /> : <CloseIcon sx={{ fontSize: 18, color: '#ef4444' }} /> },
    { label: isEn ? "Verified" : "موثق", key: "verified", render: (p) => p.verified ? <CheckIcon sx={{ fontSize: 18, color: '#22c55e' }} /> : <CloseIcon sx={{ fontSize: 18, color: '#ef4444' }} /> },
  ]

  // highlight best price
  const bestPrice = selected.length > 1
    ? Math.min(...selected.filter(p => p.type === "sale").map(p => p.price))
    : null

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-ink-50 hover:text-ink-500 text-sm font-bold transition-colors">
            <ArrowBackIcon sx={{ fontSize: 18 }} className={isEn ? "" : "rotate-180"} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-ink-500 flex items-center gap-3">
              <div className="w-10 h-10 bg-ink-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-cream-400">
                <CompareArrowsIcon sx={{ fontSize: 22 }} />
              </div>
              {isEn ? "Compare Properties" : "مقارنة العقارات"}
            </h1>
            <p className="text-ink-50 text-sm font-medium mt-1 mr-[52px]">
              {isEn ? `Add up to ${MAX} properties to compare side by side` : `أضف حتى ${MAX} عقارات للمقارنة جنباً إلى جنب`}
            </p>
          </div>
        </div>

        {/* Property Slots */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {Array.from({ length: MAX }).map((_, i) => {
            const p = selected[i]
            if (p) {
              const hasImage = p.images?.[0]
              return (
                <div key={`selected-${p.id}`} className="bg-white rounded-[2rem] border border-cream-300 shadow-sm overflow-hidden relative group">
                  <button
                    onClick={() => removeProperty(p.id)}
                    className="absolute top-4 left-4 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-ink-50 hover:text-rose-600 hover:bg-rose-50 transition-all shadow-sm border border-cream-200"
                  >
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </button>

                  {/* ── صورة العقار الحقيقية أو الـ fallback ── */}
                  <div className="h-40 relative overflow-hidden bg-cream-200">
                    {hasImage ? (
                      <img
                        src={getImageUrl(p.images[0])}
                        alt={p.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none"
                          e.target.nextElementSibling.style.display = "flex"
                        }}
                      />
                    ) : null}
                    {/* Fallback: emoji + gradient */}
                    <div
                      className="w-full h-full flex items-center justify-center text-5xl"
                      style={{
                        background: p.gradient || "#e2e8f0",
                        display: hasImage ? "none" : "flex",
                      }}
                    >
                      {p.emoji || "🏠"}
                    </div>

                    {p.verified && (
                      <span className="absolute bottom-3 right-3 bg-ink-500 text-white text-[9px] font-black px-2 py-1 rounded-xl flex items-center gap-1 shadow-lg z-10">
                        <VerifiedIcon sx={{ fontSize: 11 }} /> {isEn ? "Verified" : "موثق"}
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="font-black text-ink-500 text-sm mb-1 line-clamp-1">
                      {isEn && p.titleEn ? p.titleEn : p.title}
                    </div>
                    <div className="flex items-center gap-1 text-ink-50 text-[11px] font-bold mb-3">
                      <LocationOnIcon sx={{ fontSize: 13 }} /> {p.location}
                    </div>
                    <div className={`text-lg font-black ${p.type === "sale" && p.price === bestPrice ? "text-emerald-600" : "text-ink-500"}`}>
                      ₪ {p.price.toLocaleString()}
                      {p.type === "sale" && p.price === bestPrice && selected.length > 1 && (
                        <span className="mr-2 bg-emerald-100 text-emerald-600 text-[9px] font-black px-2 py-0.5 rounded-xl">
                          {isEn ? "Best Price" : "أفضل سعر"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            }
            return (
              <button
                key={`empty-${i}`}
                onClick={() => setShowPicker(true)}
                className="border-2 border-dashed border-cream-300 rounded-[2rem] h-52 flex flex-col items-center justify-center gap-3 text-ink-50 hover:border-brass-light hover:text-brass hover:bg-cream-200/50 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-cream-200 group-hover:bg-cream-300 flex items-center justify-center transition-all">
                  <AddCircleOutlineIcon sx={{ fontSize: 28 }} />
                </div>
                <span className="text-sm font-black">{isEn ? "Add Property" : "إضافة عقار"}</span>
              </button>
            )
          })}
        </div>

        {/* Property Picker Modal */}
        {showPicker && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPicker(false)}>
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-cream-100 flex items-center justify-between">
                <h3 className="font-black text-ink-500">{isEn ? "Select a Property" : "اختر عقاراً"}</h3>
                <button onClick={() => setShowPicker(false)} className="w-9 h-9 rounded-xl bg-cream-200 flex items-center justify-center text-ink-100 hover:bg-cream-300 transition-all">
                  <CloseIcon sx={{ fontSize: 18 }} />
                </button>
              </div>
              <div className="p-4 border-b border-cream-100">
                <input
                  autoFocus
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={isEn ? "Search by name or city..." : "ابحث بالاسم أو المدينة..."}
                  className="w-full bg-cream-100 border border-cream-200 rounded-2xl px-5 py-3 text-sm font-bold outline-none focus:border-brass transition-all"
                />
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-cream-100">
                {filtered.length === 0 ? (
                  <div className="py-12 text-center text-ink-50 font-bold text-sm">
                    {isEn ? "No properties found" : "لا توجد نتائج"}
                  </div>
                ) : filtered.map(p => (
                  <button
                    key={p.id}
                    onClick={() => addProperty(p)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-cream-100 transition-colors text-right"
                  >
                    {/* ── Thumbnail في الـ Picker ── */}
                    <div
                      className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 bg-cream-200"
                      style={!p.images?.[0] ? { background: p.gradient || "#e2e8f0" } : {}}
                    >
                      {p.images?.[0] ? (
                        <img
                          src={getImageUrl(p.images[0])}
                          alt={p.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none"
                            e.target.parentElement.style.background = p.gradient || "#e2e8f0"
                            e.target.parentElement.style.display = "flex"
                            e.target.parentElement.style.alignItems = "center"
                            e.target.parentElement.style.justifyContent = "center"
                            e.target.parentElement.innerHTML = `<span style="font-size:1.5rem">${p.emoji || "🏠"}</span>`
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          {p.emoji || "🏠"}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-black text-ink-500 text-sm truncate">{isEn && p.titleEn ? p.titleEn : p.title}</div>
                      <div className="text-ink-50 text-[11px] font-bold truncate">{p.location}</div>
                    </div>
                    <div className="text-ink-500 font-black text-sm shrink-0">₪ {p.price.toLocaleString()}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Comparison Table */}
        {selected.length >= 2 && (
          <div className="bg-white rounded-[2.5rem] border border-cream-300 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-cream-100">
              <h3 className="font-black text-ink-500">{isEn ? "Detailed Comparison" : "المقارنة التفصيلية"}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cream-100">
                    <th className="p-5 text-right text-[10px] font-black text-ink-50 uppercase tracking-widest w-32">
                      {isEn ? "Feature" : "الخاصية"}
                    </th>
                    {selected.map(p => (
                      <th key={p.id} className="p-5 text-center">
                        <div className="font-black text-ink-500 text-sm line-clamp-1">
                          {isEn && p.titleEn ? p.titleEn : p.title}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={row.key} className={`border-b border-cream-100 ${idx % 2 === 0 ? "" : "bg-cream-100/50"}`}>
                      <td className="px-5 py-4 text-[11px] font-black text-ink-100 uppercase tracking-wider">
                        {row.label}
                      </td>
                      {selected.map(p => (
                        <td key={p.id} className="px-5 py-4 text-center font-bold text-ink-400 text-sm">
                          {row.render(p)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {/* Features row */}
                  <tr className="border-b border-cream-100">
                    <td className="px-5 py-4 text-[11px] font-black text-ink-100 uppercase tracking-wider">
                      {isEn ? "Features" : "المميزات"}
                    </td>
                    {selected.map(p => (
                      <td key={p.id} className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          {(p.features || []).map(f => (
                            <span key={f} className="bg-cream-200 text-ink-200 text-[10px] font-black px-2 py-1 rounded-xl">
                              {f}
                            </span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                  {/* CTA row */}
                  <tr>
                    <td className="p-5" />
                    {selected.map(p => (
                      <td key={p.id} className="p-5 text-center">
                        <button
                          onClick={() => navigate(`/properties/${p.slug}`)}
                          className="bg-ink-500 text-white px-6 py-3 rounded-2xl text-xs font-black hover:bg-ink-500 transition-all shadow-lg shadow-cream-300"
                        >
                          {isEn ? "View Details" : "عرض التفاصيل"}
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selected.length < 2 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-cream-200 rounded-full flex items-center justify-center mx-auto mb-4 text-cream-400">
              <CompareArrowsIcon sx={{ fontSize: 40 }} />
            </div>
            <p className="text-ink-50 font-bold text-sm">
              {isEn ? "Add at least 2 properties to start comparing" : "أضف عقارَين على الأقل لبدء المقارنة"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}