import { useState, lazy, Suspense, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { setFilters, resetFilters, setSortBy, setViewMode, fetchProperties } from "@/store/slices/propertiesSlice"
import PropertyCard from "@/components/property/PropertyCard"
import { propertiesAPI } from "@/lib/api"

// Icons
import FilterListIcon from "@mui/icons-material/FilterList"
import GridViewIcon from "@mui/icons-material/GridView"
import ViewListIcon from "@mui/icons-material/ViewList"
import MapIcon from "@mui/icons-material/Map"
import RestartAltIcon from "@mui/icons-material/RestartAlt"
import SearchOffIcon from "@mui/icons-material/SearchOff"
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"

const MapView = lazy(() => import('@/components/property/MapView'))

const PER = 12

const CustomDropdown = ({ label, value, options, onChange, displayMap }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative text-right" dir="rtl">
      {label && (
        <label className="block text-[10px] font-black text-ink-50 mb-2 uppercase tracking-widest px-1">
          {label}
        </label>
      )}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-cream-100 border ${isOpen ? 'border-brass bg-white ring-4 ring-brass/5' : 'border-cream-200'} 
        rounded-2xl px-4 py-3 text-xs font-bold text-ink-300 cursor-pointer flex justify-between items-center transition-all shadow-sm hover:border-cream-300`}
      >
        <span className="truncate">{displayMap[value] || value}</span>
        <ExpandMoreIcon className={`transition-transform duration-300 text-ink-50 ${isOpen ? 'rotate-180' : ''}`} sx={{ fontSize: 18 }} />
      </div>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute z-20 w-full mt-2 bg-white border border-cream-200 rounded-2xl shadow-xl shadow-cream-300/50 overflow-hidden">
            <div className="max-h-60 overflow-y-auto">
              {options.map((opt) => (
                <div
                  key={opt}
                  onClick={() => { onChange(opt); setIsOpen(false) }}
                  className={`px-4 py-3 text-right text-xs font-bold transition-colors cursor-pointer ${
                    value === opt ? 'bg-ink-500 text-white' : 'text-ink-200 hover:bg-cream-200 hover:text-ink-500'
                  }`}
                >
                  {displayMap[opt] || opt}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function PropertiesPage() {
  const dispatch = useDispatch()
  const { filtered, filters, sortBy, viewMode, loading, total, pages } = useSelector(s => s.properties)

  const [page, setPage] = useState(1)
  const [showMap, setShowMap] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  // قيمة الـ slider محلية - ما بتبعت للباك إلا بعد debounce
  const [priceInput, setPriceInput] = useState(filters.maxPrice)

  // ── قائمة المدن الحقيقية المستخرجة من العقارات المخزّنة فعلياً ──
  const [cities, setCities] = useState([])
  useEffect(() => {
    propertiesAPI.getCities().then(res => {
      setCities(res?.cities || [])
    }).catch(() => {})
  }, [])

  // ── debounce للـ slider عشان ما يعمل request بكل حركة ──
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setFilters({ maxPrice: priceInput }))
      setPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [priceInput])

  // ── الـ fetch - JSON.stringify يمنع infinite re-render ──
  useEffect(() => {
    const params = { sortBy, page, limit: PER }
    if (filters.search)             params.search   = filters.search
    if (filters.category !== 'all') params.category = filters.category
    if (filters.type     !== 'all') params.type     = filters.type
    if (filters.city     !== 'all') params.city     = filters.city
    if (filters.rooms    !== 'all') params.rooms    = filters.rooms
    if (filters.maxPrice < 2000000) params.maxPrice = filters.maxPrice
    if (filters.minArea  > 0)       params.minArea  = filters.minArea
    dispatch(fetchProperties(params))
  }, [JSON.stringify({ ...filters, sortBy, page })])

  // إعادة الصفحة لـ 1 عند تغيير الفلاتر
  const F = (k, v) => {
    dispatch(setFilters({ [k]: v }))
    setPage(1)
  }

  const categoryMap = { all: "الكل", apt: "شقة", villa: "فيلا", land: "أرض", office: "مكتب", shop: "محل تجاري" }
  const typeMap     = { all: "الكل", sale: "للبيع", rent: "للإيجار" }
  const roomsMap    = { all: "الكل", "1": "1+ غرف", "3": "3+ غرف", "5": "5+ غرف" }
  const sortMap     = { newest: "الأحدث أولاً", "price-asc": "السعر (من الأقل)", "price-desc": "السعر (من الأعلى)", "area-desc": "المساحة (الأكبر)" }
  const cityMap     = Object.fromEntries([["all", "كل المدن"], ...cities.map(c => [c, c])])

  return (
    <div className="bg-[#F8FAFC] min-h-screen" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* SIDEBAR */}
          <aside className="w-full lg:w-72 shrink-0">
            {/* زر إظهار/إخفاء الفلتر — للموبايل فقط */}
            <button
              onClick={() => setShowFilters(v => !v)}
              className="lg:hidden w-full flex items-center justify-between gap-2 bg-white rounded-2xl px-5 py-3.5 border border-cream-300 shadow-sm mb-3 font-black text-ink-500 text-sm"
            >
              <span className="flex items-center gap-2">
                <FilterListIcon sx={{ fontSize: 18 }} />
                تصفية النتائج
              </span>
              <ExpandMoreIcon className={`transition-transform duration-300 text-ink-50 ${showFilters ? 'rotate-180' : ''}`} sx={{ fontSize: 18 }} />
            </button>

            <div className={`bg-white rounded-[2rem] p-6 lg:sticky lg:top-24 border border-cream-300 shadow-sm shadow-cream-200/50 text-right ${showFilters ? 'block' : 'hidden'} lg:block`}>
              <div className="font-black mb-6 hidden lg:flex items-center gap-2 text-ink-500 border-b border-cream-100 pb-4">
                <FilterListIcon sx={{ fontSize: 20 }} />
                تصفية النتائج
              </div>

              <div className="space-y-6">
                <CustomDropdown
                  label="نوع العقار"
                  value={filters.category}
                  options={['all', 'apt', 'villa', 'land', 'office', 'shop']}
                  displayMap={categoryMap}
                  onChange={(v) => F("category", v)}
                />
                <CustomDropdown
                  label="الغرض"
                  value={filters.type}
                  options={['all', 'sale', 'rent']}
                  displayMap={typeMap}
                  onChange={(v) => F("type", v)}
                />
                <CustomDropdown
                  label="المدينة"
                  value={filters.city}
                  options={['all', ...cities]}
                  displayMap={cityMap}
                  onChange={(v) => F("city", v)}
                />
                <CustomDropdown
                  label="عدد الغرف"
                  value={filters.rooms}
                  options={['all', '1', '3', '5']}
                  displayMap={roomsMap}
                  onChange={(v) => F("rooms", v)}
                />

                {/* السعر الأقصى - محلي مع debounce */}
                <div>
                  <div className="flex justify-between items-end mb-3 px-1">
                    <label className="block text-[10px] font-black text-ink-50 uppercase tracking-widest">السعر الأقصى</label>
                    <span className="text-ink-500 font-black text-sm">
                      {priceInput < 2000000 ? `₪${Number(priceInput).toLocaleString()}` : "بدون حد"}
                    </span>
                  </div>
                  <input
                    type="range" min={0} max={2000000} step={10000}
                    value={priceInput}
                    onChange={e => setPriceInput(Number(e.target.value))}
                    className="w-full h-1.5 bg-cream-200 rounded-xl appearance-none cursor-pointer accent-ink-500"
                  />
                </div>

                <button
                  onClick={() => {
                    dispatch(resetFilters())
                    setPriceInput(2000000)
                    setPage(1)
                  }}
                  className="w-full mt-6 flex items-center justify-center gap-2 py-4 rounded-2xl border border-cream-300 text-ink-100 text-xs font-black hover:bg-ink-500 hover:text-white transition-all shadow-sm"
                >
                  <RestartAltIcon sx={{ fontSize: 18 }} /> إعادة ضبط الفلاتر
                </button>
              </div>
            </div>
          </aside>

          {/* CONTENT */}
          <div className="flex-1 min-w-0 text-right">

            {/* شريط الترتيب والعرض */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-2xl border border-cream-300 shadow-sm">
              <div className="text-ink-50 text-xs font-bold px-2">
                {loading ? (
                  <span className="animate-pulse">جاري التحميل...</span>
                ) : (
                  <>عرض <strong className="text-ink-500">{filtered.length}</strong> من <strong className="text-ink-500">{total}</strong> عقار متاح</>
                )}
              </div>

              <div className="flex items-center gap-3">
                {!showMap && (
                  <div className="flex bg-cream-200 p-1 rounded-xl">
                    <button onClick={() => dispatch(setViewMode("grid"))} className={`w-9 h-9 rounded-xl transition-all flex items-center justify-center ${viewMode === "grid" ? "bg-white text-ink-500 shadow-sm" : "text-ink-50"}`}>
                      <GridViewIcon sx={{ fontSize: 18 }} />
                    </button>
                    <button onClick={() => dispatch(setViewMode("list"))} className={`w-9 h-9 rounded-xl transition-all flex items-center justify-center ${viewMode === "list" ? "bg-white text-ink-500 shadow-sm" : "text-ink-50"}`}>
                      <ViewListIcon sx={{ fontSize: 18 }} />
                    </button>
                  </div>
                )}

                <button onClick={() => setShowMap(!showMap)} className={`flex items-center gap-2 px-4 h-11 rounded-xl font-black text-xs transition-all border ${showMap ? "bg-ink-500 text-white" : "bg-white text-ink-200 border-cream-300"}`}>
                  {showMap ? <FormatListBulletedIcon sx={{ fontSize: 18 }} /> : <MapIcon sx={{ fontSize: 18 }} />}
                  {showMap ? "عرض كقائمة" : "عرض على الخريطة"}
                </button>

                {!showMap && (
                  <div className="w-44">
                    <CustomDropdown
                      value={sortBy}
                      options={['newest', 'price-asc', 'price-desc', 'area-desc']}
                      displayMap={sortMap}
                      onChange={(v) => { dispatch(setSortBy(v)); setPage(1) }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* المحتوى */}
            {showMap ? (
              <div className="bg-white rounded-[2rem] border border-cream-300 shadow-xl overflow-hidden mb-8" style={{ height: '600px' }}>
                <Suspense fallback={<div className="h-full flex items-center justify-center">جاري التحميل...</div>}>
                  <MapView properties={filtered} />
                </Suspense>
              </div>
            ) : loading ? (
              <div className={viewMode === "grid" ? "grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6" : "space-y-4"}>
                {Array.from({ length: PER }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl sm:rounded-[2rem] border border-cream-200 overflow-hidden animate-pulse">
                    <div className="h-28 sm:h-44 bg-cream-200" />
                    <div className="p-3 sm:p-5 space-y-2 sm:space-y-3">
                      <div className="h-3 sm:h-4 bg-cream-200 rounded-xl w-3/4" />
                      <div className="h-2.5 sm:h-3 bg-cream-200 rounded-xl w-1/2" />
                      <div className="h-4 sm:h-5 bg-cream-200 rounded-xl w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-[3rem] border-2 border-dashed border-cream-300 py-24 text-center">
                <SearchOffIcon sx={{ fontSize: 48, color: '#cbd5e1' }} />
                <div className="font-black text-ink-400 text-lg mt-4">لا توجد نتائج تطابق بحثك</div>
                <button
                  onClick={() => { dispatch(resetFilters()); setPriceInput(2000000); setPage(1) }}
                  className="mt-6 bg-ink-500 text-white px-8 py-3 rounded-2xl text-xs font-black"
                >
                  إلغاء الفلاتر
                </button>
              </div>
            ) : (
              <div className={viewMode === "grid" ? "grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6" : "space-y-4"}>
                {filtered.map((p, i) => (
  <div
    key={p.id}
    className="animate-fadeUp"
    style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
  >
    <PropertyCard property={p} />
  </div>
))}
              </div>
            )}

            {/* Pagination حقيقي من الباك */}
            {!showMap && pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12 pb-10">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-11 h-11 rounded-xl text-xs font-black border bg-white text-ink-50 disabled:opacity-30 hover:bg-cream-100 transition-all"
                >›</button>

                {Array.from({ length: pages }, (_, i) => i + 1)
                  .filter(pg => pg === 1 || pg === pages || Math.abs(pg - page) <= 1)
                  .reduce((acc, pg, idx, arr) => {
                    if (idx > 0 && pg - arr[idx - 1] > 1) acc.push('...')
                    acc.push(pg)
                    return acc
                  }, [])
                  .map((pg, idx) =>
                    pg === '...' ? (
                      <span key={`dots-${idx}`} className="w-11 h-11 flex items-center justify-center text-cream-400 font-black text-xs">...</span>
                    ) : (
                      <button
                        key={pg}
                        onClick={() => setPage(pg)}
                        className={`w-11 h-11 rounded-xl text-xs font-black border transition-all ${
                          pg === page ? "bg-ink-500 text-white border-ink-500" : "bg-white text-ink-50 border-cream-300 hover:bg-cream-100"
                        }`}
                      >{pg}</button>
                    )
                  )
                }

                <button
                  onClick={() => setPage(p => Math.min(pages, p + 1))}
                  disabled={page === pages}
                  className="w-11 h-11 rounded-xl text-xs font-black border bg-white text-ink-50 disabled:opacity-30 hover:bg-cream-100 transition-all"
                >‹</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}