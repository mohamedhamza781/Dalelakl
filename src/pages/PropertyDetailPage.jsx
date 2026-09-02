import { useParams, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { showToast } from "@/store/slices/uiSlice"
import { propertiesAPI, reportsAPI, settingsAPI } from "@/lib/api"
import { buildWhatsAppUrl } from "@/lib/whatsapp"

// Components
import PropertyCard from "@/components/property/PropertyCard"
import ImageLightbox from "@/components/property/ImageLightbox"

// Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import BedIcon from "@mui/icons-material/Bed"
import BathtubIcon from "@mui/icons-material/Bathtub"
import SquareFootIcon from "@mui/icons-material/SquareFoot"
import StairsIcon from "@mui/icons-material/Stairs"
import LocalParkingIcon from "@mui/icons-material/LocalParking"
import ShareIcon from "@mui/icons-material/Share"
import FlagIcon from "@mui/icons-material/Flag"
import CloseIcon from "@mui/icons-material/Close"
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred"
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap"
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore"
import NavigateNextIcon from "@mui/icons-material/NavigateNext"
import MapIcon from "@mui/icons-material/Map"
import WhatsAppIcon from "@mui/icons-material/WhatsApp"
import VerifiedIcon from "@mui/icons-material/Verified"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import HomeIcon from "@mui/icons-material/Home"

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

const getImageUrl = (src) => {
  if (!src || typeof src !== 'string') return null
  if (src.startsWith('http')) return src
  if (src.startsWith('/uploads')) return `${BASE}${src}`
  return null
}

export default function PropertyDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { t, i18n } = useTranslation()
  const { user, isLoggedIn } = useSelector(s => s.auth)
  const isEn = i18n.language === 'en'

  const [p, setP] = useState(null)
  const [loading, setLoading] = useState(true)
  const [related, setRelated] = useState([])
  const [imgIdx, setImgIdx] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDetails, setReportDetails] = useState('')
  const [reportSubmitting, setReportSubmitting] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [siteWhatsapp, setSiteWhatsapp] = useState('')

  useEffect(() => {
    settingsAPI.getPublic().then(d => setSiteWhatsapp(d.settings?.footer_whatsapp || '')).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    setImgIdx(0)
    propertiesAPI.getById(slug)
      .then(data => {
        setP(data.property)
        return propertiesAPI.getAll({ city: data.property.city, limit: 4 })
          .then(res => setRelated(res.properties.filter(x => x.id !== data.property.id).slice(0, 3)))
          .catch(() => {})
      })
      .catch(() => setP(null))
      .finally(() => setLoading(false))
  }, [slug])

  const handleMapClick = () => {
    setShowMap(true)
    dispatch(showToast(t('detail.mapClick')))
  }

  // ── إرسال طلب معاينة عبر واتساب مباشرة (رقم الموقع العام — الأدمن هو من يتحكم بالعقارات) ──
  const buildWhatsAppLink = () => {
    const propertyTitle = isEn && p?.titleEn ? p.titleEn : p?.title
    const msg = isEn
      ? `Hi, I'd like to book a viewing for: ${propertyTitle} (${window.location.href})`
      : `مرحباً، حاب أحجز معاينة لعقار: ${propertyTitle} (${window.location.href})`

    return buildWhatsAppUrl(siteWhatsapp, msg)
  }

  const handleBookingClick = () => {
    const link = buildWhatsAppLink()
    if (!link) {
      dispatch(showToast(isEn ? "WhatsApp number unavailable" : "رقم الواتساب غير متوفر حالياً"))
      return
    }
    window.open(link, '_blank', 'noopener,noreferrer')
  }

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-cream-300 border-t-ink-500 rounded-full animate-spin" />
    </div>
  )

  const handleSubmitReport = async () => {
    if (!reportReason) return
    setReportSubmitting(true)
    try {
      await reportsAPI.submit({ propertyId: p.id || p._id, reason: reportReason, details: reportDetails })
      dispatch(showToast('تم إرسال البلاغ بنجاح ✅'))
      setShowReportModal(false)
      setReportReason('')
      setReportDetails('')
    } catch (err) {
      dispatch(showToast(err.message || 'فشل إرسال البلاغ'))
    } finally {
      setReportSubmitting(false)
    }
  }

  if (!p) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-24 h-24 bg-cream-100 text-cream-400 rounded-full flex items-center justify-center mb-6">
        <HomeIcon sx={{ fontSize: 64 }} />
      </div>
      <h2 className="text-2xl font-black text-ink-500 mb-2">{t('detail.notFound')}</h2>
      <p className="text-ink-100 mb-6 text-sm">{isEn ? "The property you are looking for does not exist." : "العقار الذي تبحث عنه غير موجود."}</p>
      <button onClick={() => navigate("/properties")} className="bg-ink-500 text-white px-8 py-3 rounded-2xl font-bold hover:bg-ink-400 transition-all shadow-lg shadow-cream-300">
        {t('detail.backBtn')}
      </button>
    </div>
  )

  const rawImages = (() => {
    if (Array.isArray(p.images)) return p.images
    if (typeof p.images === 'string') {
      try { return JSON.parse(p.images) } catch { return [] }
    }
    return []
  })()
  const images = rawImages.map(getImageUrl).filter(Boolean)

  const featureGrid = [
    ...(p.rooms   ? [{ icon: <BedIcon sx={{ fontSize: 18 }} />,          val: p.rooms,   lbl: t('detail.room') }]    : []),
    ...(p.baths   ? [{ icon: <BathtubIcon sx={{ fontSize: 18 }} />,      val: p.baths,   lbl: t('detail.bath') }]    : []),
    {               icon: <SquareFootIcon sx={{ fontSize: 18 }} />,      val: p.area,    lbl: t('detail.sqm')  },
    ...(p.floor   ? [{ icon: <StairsIcon sx={{ fontSize: 18 }} />,       val: p.floor,   lbl: t('detail.floor') }]   : []),
    ...(p.parking ? [{ icon: <LocalParkingIcon sx={{ fontSize: 18 }} />, val: p.parking, lbl: t('detail.parking') }] : []),
  ]

  const mainContent = (
    <div className="bg-[#F8FAFC] min-h-screen pb-20">
      {showLightbox && (
        <ImageLightbox
          onClose={() => setShowLightbox(false)}
          propertyTitle={isEn && p.titleEn ? p.titleEn : p.title}
          images={images}
          initialIndex={imgIdx}
        />
      )}
      <div className="max-w-7xl mx-auto px-4 py-8">

        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-ink-100 hover:text-ink-500 text-sm font-bold mb-6 transition-colors">
          <ArrowBackIcon sx={{ fontSize: 18 }} className={isEn ? "" : "rotate-180"} /> {t('detail.back')}
        </button>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 items-start">

          {/* LEFT: Media & Description */}
          <div className="space-y-6 min-w-0">

            {/* Main image */}
            <div className="relative group">
              <div
                onClick={() => images.length > 0 && setShowLightbox(true)}
                className={`h-72 sm:h-80 md:h-[450px] rounded-[2.5rem] flex items-center justify-center overflow-hidden shadow-xl shadow-cream-300/50 ${images.length > 0 ? 'cursor-zoom-in' : ''}`}
                style={{ background: p.gradient || '#1a3a5c' }}
              >
                {images[imgIdx] ? (
                  <img loading="lazy"
                    key={imgIdx}
                    src={images[imgIdx]}
                    alt={p.title}
                    className="w-full h-full object-cover animate-in fade-in duration-300"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                ) : (
                  <span className="text-9xl">{p.emoji || '🏠'}</span>
                )}
              </div>

              <div className="absolute top-6 left-6 flex gap-2">
                <span className="bg-white/90 backdrop-blur-sm text-ink-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                  {p.type === "rent" ? t('detail.forRent') : t('detail.forSale')}
                </span>
                {p.verified && (
                  <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm">
                    <VerifiedIcon sx={{ fontSize: 12 }} /> {isEn ? "Verified" : "موثق"}
                  </span>
                )}
              </div>

              {images.length > 0 && (
                <button
                  onClick={() => setShowLightbox(true)}
                  className="absolute top-6 right-6 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center text-ink-500 shadow-sm hover:bg-white transition-all"
                  title={isEn ? "View fullscreen" : "عرض بالحجم الكامل"}
                >
                  <ZoomOutMapIcon sx={{ fontSize: 18 }} />
                </button>
              )}

              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setImgIdx(i => (i - 1 + images.length) % images.length) }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 bg-black/40 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white hover:bg-black/60 transition-all"
                  >
                    <NavigateNextIcon sx={{ fontSize: 20 }} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setImgIdx(i => (i + 1) % images.length) }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 bg-black/40 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white hover:bg-black/60 transition-all"
                  >
                    <NavigateBeforeIcon sx={{ fontSize: 20 }} />
                  </button>
                  <span className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white text-[10px] font-black px-3 py-1 rounded-full" dir="ltr">
                    {imgIdx + 1} / {images.length}
                  </span>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1 scroll-smooth snap-x">
                {images.map((img, i) => (
                  <div key={i} onClick={() => setImgIdx(i)}
                    className={`shrink-0 snap-start w-20 h-16 sm:w-24 sm:h-20 rounded-2xl overflow-hidden cursor-pointer transition-all border-4 ${i === imgIdx ? "border-ink-500" : "border-white hover:border-cream-300 shadow-sm"}`}
                    style={{ background: p.gradient || '#1a3a5c' }}>
                    <img loading="lazy" src={img} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none' }} />
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-[2rem] p-8 border border-cream-300 shadow-sm">
              <h3 className="font-black text-ink-500 mb-4 flex items-center gap-2 text-lg">
                <div className="w-1.5 h-6 bg-ink-500 rounded-full" /> {t('detail.descTitle')}
              </h3>
              <p className="text-ink-100 text-sm leading-8 font-medium">
                {p.description || (isEn ? "No description available." : "لا يوجد وصف متاح.")}
              </p>
              {p.features?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-cream-100">
                  {p.features.map((f, i) => (
                    <span key={i} className="bg-cream-100 text-ink-200 text-[11px] font-black px-4 py-2 rounded-xl border border-cream-200">{f}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Price & Contact */}
          <div className="lg:sticky lg:top-24 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 border border-cream-300 shadow-xl shadow-cream-200/50">
              <div className="mb-8">
                <div className="text-ink-500 text-4xl font-black tracking-tight">
                  ₪ {p.price?.toLocaleString()}
                  {p.type === "rent" && <span className="text-ink-50 text-sm font-bold ml-2">{t('detail.perMonth')}</span>}
                </div>
                <h1 className="font-black text-2xl mt-3 text-ink-500 leading-tight">
                  {isEn && p.titleEn ? p.titleEn : p.title}
                </h1>
                <div className="flex items-center gap-1.5 text-ink-50 text-xs font-bold mt-3">
                  <LocationOnIcon sx={{ fontSize: 16 }} /> {p.location}
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                {featureGrid.map((item, idx) => (
                  <div key={idx} className="bg-cream-100 rounded-2xl p-4 flex items-center gap-4 border border-cream-200 hover:bg-white hover:border-brass/20 transition-all">
                    <div className="text-ink-50">{item.icon}</div>
                    <div>
                      <div className="font-black text-ink-500 text-sm leading-none">{item.val}</div>
                      <div className="text-ink-50 text-[10px] font-bold mt-1 uppercase tracking-tighter">{item.lbl}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleBookingClick}
                  className="w-full bg-emerald-600 text-white py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2 hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all active:scale-[0.98]"
                >
                  <WhatsAppIcon sx={{ fontSize: 20 }} /> {t('detail.bookViewing')}
                </button>
                <div className={`grid ${isLoggedIn ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                  <button
                    onClick={() => { navigator.clipboard?.writeText(window.location.href); dispatch(showToast(isEn ? 'Link copied 🔗' : 'تم نسخ الرابط 🔗')) }}
                    className="h-12 rounded-2xl border border-cream-200 text-ink-50 hover:border-cream-300 hover:bg-cream-100 transition-all flex items-center justify-center gap-1 text-xs font-black"
                  >
                    <ShareIcon sx={{ fontSize: 16 }} /> {t('detail.share')}
                  </button>
                  {isLoggedIn && (
                    <button
                      onClick={() => setShowReportModal(true)}
                      className="h-12 rounded-2xl border border-cream-200 text-ink-50 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500 transition-all flex items-center justify-center gap-1 text-xs font-black"
                    >
                      <FlagIcon sx={{ fontSize: 16 }} /> بلاغ
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="bg-white rounded-[2rem] p-6 border border-cream-300 shadow-sm overflow-hidden group cursor-pointer" onClick={handleMapClick}>
            <h3 className="font-black text-ink-500 mb-4 flex items-center gap-2">
              <LocationOnIcon sx={{ fontSize: 20, color: '#64748b' }} /> {t('detail.mapTitle')}
            </h3>
            <div className="h-44 bg-cream-100 rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-2 border-2 border-dashed border-cream-300 group-hover:border-brass/40 transition-all relative">
              {showMap ? (
                <iframe width="100%" height="100%" frameBorder="0" scrolling="no"
                  title={p.location}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(p.location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                  className="absolute inset-0 w-full h-full" />
              ) : (
                <>
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <MapIcon sx={{ fontSize: 24, color: '#94a3b8' }} />
                  </div>
                  <span className="text-ink-50 text-xs font-bold px-4 text-center">{p.location}</span>
                  <span className="text-ink-500 font-black text-[10px] uppercase tracking-wider">{t('detail.mapClick')}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Related Properties */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-black text-ink-500 mb-8">{isEn ? "Similar Properties" : "عقارات مشابهة"}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map(rp => <PropertyCard key={rp.id} property={rp} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const ReportModal = () => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-500/60 backdrop-blur-sm" onClick={() => setShowReportModal(false)} />
      <div className="relative bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl" dir="rtl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-100 rounded-2xl flex items-center justify-center">
              <ReportGmailerrorredIcon sx={{ fontSize: 20, color: '#ef4444' }} />
            </div>
            <h3 className="font-black text-ink-500">الإبلاغ عن مشكلة</h3>
          </div>
          <button onClick={() => setShowReportModal(false)} className="w-8 h-8 rounded-xl hover:bg-cream-200 flex items-center justify-center text-ink-50">
            <CloseIcon sx={{ fontSize: 18 }} />
          </button>
        </div>
        <div className="space-y-3 mb-6">
          <label className="text-xs font-black text-ink-100 uppercase">سبب البلاغ *</label>
          {['سعر وهمي', 'صور مضللة', 'عقار غير موجود', 'محتوى مسيء', 'احتيال', 'أخرى'].map(r => (
            <button key={r} onClick={() => setReportReason(r)}
              className={`w-full text-right px-4 py-3 rounded-2xl border text-sm font-bold transition-all ${reportReason === r ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-cream-200 hover:border-cream-300 text-ink-200'}`}>
              {r}
            </button>
          ))}
        </div>
        <textarea
          value={reportDetails}
          onChange={e => setReportDetails(e.target.value)}
          placeholder="تفاصيل إضافية (اختياري)..."
          rows={3}
          className="w-full bg-cream-100 border border-cream-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-rose-400 resize-none mb-6"
        />
        <button
          onClick={handleSubmitReport}
          disabled={!reportReason || reportSubmitting}
          className="w-full py-4 bg-rose-600 disabled:bg-cream-300 disabled:text-ink-50 text-white font-black rounded-2xl hover:bg-rose-700 transition-all"
        >
          {reportSubmitting ? 'جاري الإرسال...' : 'إرسال البلاغ'}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {showReportModal && <ReportModal />}
      {mainContent}
    </>
  )
}