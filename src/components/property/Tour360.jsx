import { useState, useEffect, useRef } from "react"
import CloseIcon from "@mui/icons-material/Close"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import ViewInArIcon from "@mui/icons-material/ViewInAr"
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore"
import NavigateNextIcon from "@mui/icons-material/NavigateNext"
import { useTranslation } from "react-i18next"

import HomeIcon from '@mui/icons-material/Home';

export default function Tour360({ onClose, propertyTitle, images = [] }) {
  const { i18n } = useTranslation()
  const isEn = i18n.language === "en"
  const [imgIdx, setImgIdx] = useState(0)
  const [rotation, setRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [isAutoRotating, setIsAutoRotating] = useState(true)
  const animRef = useRef(null)




  // إذا مافي صور حقيقية نعرض رسالة
  const hasImages = images.length > 0

  // Auto-rotate effect
  useEffect(() => {
    if (!isAutoRotating) return
    animRef.current = setInterval(() => {
      setRotation(r => (r + 0.3) % 360)
    }, 30)
    return () => clearInterval(animRef.current)
  }, [isAutoRotating])

  const handleMouseDown = (e) => {
    setIsDragging(true)
    setStartX(e.clientX)
    setIsAutoRotating(false)
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    const delta = e.clientX - startX
    setRotation(r => (r + delta * 0.3) % 360)
    setStartX(e.clientX)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setTimeout(() => setIsAutoRotating(true), 2000)
  }

  const goNext = () => setImgIdx(i => (i + 1) % images.length)
  const goPrev = () => setImgIdx(i => (i - 1 + images.length) % images.length)

  // scale effect بناءً على الدوران
  const scale = 1 + Math.abs(Math.sin((rotation * Math.PI) / 180)) * 0.08

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between p-5 bg-black/30 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all shrink-0">
            <ArrowBackIcon sx={{ fontSize: 20 }} className={isEn ? "" : "rotate-180"} />
          </button>
          <div className="w-9 h-9 bg-ink-500 rounded-xl flex items-center justify-center text-white shadow-lg">
            <ViewInArIcon sx={{ fontSize: 20 }} />
          </div>
          <div>
            <div className="text-white font-black text-sm">{isEn ? "360° Virtual Tour" : "جولة افتراضية 360°"}</div>
            <div className="text-ink-50 text-[10px] font-bold">{propertyTitle}</div>
          </div>
        </div>
        <button onClick={onClose} className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-white/20 transition-all">
          <CloseIcon />
        </button>
      </div>

      {/* Main View */}
      <div
        className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing select-none flex items-center justify-center bg-black"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {hasImages ? (
          <>
            {/* الصورة الحقيقية مع تأثير zoom خفيف */}
            <img
              key={imgIdx}
              src={images[imgIdx]}
              alt={`صورة ${imgIdx + 1}`}
              draggable={false}
              className="w-full h-full object-contain transition-transform duration-100"
              style={{ transform: `scale(${scale})` }}
            />

            {/* تأثير خطوط الـ 360 فوق الصورة */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
              style={{
                backgroundImage: `repeating-linear-gradient(${rotation}deg, transparent, transparent 40px, rgba(255,255,255,0.5) 40px, rgba(255,255,255,0.5) 41px)`,
              }}
            />

            {/* مؤشر الدوران */}
            <div className="absolute bottom-6 right-6 bg-black/50 backdrop-blur-sm text-white text-[10px] font-black px-4 py-2 rounded-full border border-white/10 pointer-events-none">
              {Math.round(rotation % 360)}° — {isEn ? "Drag to explore" : "اسحب للاستكشاف"}
            </div>

            {/* أسهم التنقل - تظهر فقط إذا في أكثر من صورة */}
            {images.length > 1 && (
              <>
                <button onClick={goPrev}
                  className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white hover:bg-black/70 transition-all border border-white/10">
                  <NavigateNextIcon />
                </button>
                <button onClick={goNext}
                  className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white hover:bg-black/70 transition-all border border-white/10">
                  <NavigateBeforeIcon />
                </button>
              </>
            )}
          </>
        ) : (
          // لا توجد صور
          <div className="text-center">
            <div className="text-8xl mb-6"><HomeIcon /></div>
            <p className="text-ink-50 font-bold text-sm">
              {isEn ? "No images available for this property" : "لا توجد صور متاحة لهذا العقار"}
            </p>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="p-4 bg-black/40 backdrop-blur-sm shrink-0">
          <div className="flex gap-3 overflow-x-auto pb-1 justify-center">
            {images.map((img, i) => (
              <button key={i} onClick={() => setImgIdx(i)}
                className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                  i === imgIdx ? "border-brass scale-110 shadow-lg shadow-ink-700/30" : "border-white/10 opacity-60 hover:opacity-100"
                }`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <p className="text-center text-ink-100 text-[10px] font-bold mt-2">
            {imgIdx + 1} / {images.length}
          </p>
        </div>
      )}
    </div>
  )
}