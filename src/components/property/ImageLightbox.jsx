import { useState, useEffect } from "react"
import CloseIcon from "@mui/icons-material/Close"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary"
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore"
import NavigateNextIcon from "@mui/icons-material/NavigateNext"
import { useTranslation } from "react-i18next"
import HomeIcon from "@mui/icons-material/Home"

export default function ImageLightbox({ onClose, propertyTitle, images = [], initialIndex = 0 }) {
  const { i18n } = useTranslation()
  const isEn = i18n.language === "en"
  const [imgIdx, setImgIdx] = useState(initialIndex)

  const hasImages = images.length > 0

  const goNext = () => setImgIdx(i => (i + 1) % images.length)
  const goPrev = () => setImgIdx(i => (i - 1 + images.length) % images.length)

  // دعم لوحة المفاتيح: أسهم للتنقل + Escape للإغلاق
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") isEn ? goNext() : goPrev()
      if (e.key === "ArrowRight") isEn ? goPrev() : goNext()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [images.length, isEn])

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between p-5 bg-black/30 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all shrink-0">
            <ArrowBackIcon sx={{ fontSize: 20 }} className={isEn ? "" : "rotate-180"} />
          </button>
          <div className="w-9 h-9 bg-ink-500 rounded-xl flex items-center justify-center text-white shadow-lg">
            <PhotoLibraryIcon sx={{ fontSize: 18 }} />
          </div>
          <div>
            <div className="text-white font-black text-sm">{propertyTitle}</div>
            {hasImages && (
              <div className="text-ink-50 text-[10px] font-bold">{imgIdx + 1} / {images.length}</div>
            )}
          </div>
        </div>
        <button onClick={onClose} className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-white/20 transition-all">
          <CloseIcon />
        </button>
      </div>

      {/* Main View */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-black select-none">
        {hasImages ? (
          <>
            <img
              key={imgIdx}
              src={images[imgIdx]}
              alt={`${propertyTitle} ${imgIdx + 1}`}
              draggable={false}
              className="w-full h-full object-contain animate-in fade-in duration-300"
            />

            {images.length > 1 && (
              <>
                <button onClick={goPrev}
                  className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white hover:bg-black/70 transition-all border border-white/10">
                  <NavigateNextIcon />
                </button>
                <button onClick={goNext}
                  className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white hover:bg-black/70 transition-all border border-white/10">
                  <NavigateBeforeIcon />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="text-center">
            <div className="text-8xl mb-6 text-white/40"><HomeIcon sx={{ fontSize: 80 }} /></div>
            <p className="text-ink-50 font-bold text-sm">
              {isEn ? "No images available for this property" : "لا توجد صور متاحة لهذا العقار"}
            </p>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="p-4 bg-black/40 backdrop-blur-sm shrink-0">
          <div className="flex gap-3 overflow-x-auto pb-1 justify-start sm:justify-center scroll-smooth snap-x">
            {images.map((img, i) => (
              <button key={i} onClick={() => setImgIdx(i)}
                className={`shrink-0 snap-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all ${
                  i === imgIdx ? "border-brass scale-105 shadow-lg shadow-ink-700/30" : "border-white/10 opacity-60 hover:opacity-100"
                }`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}