import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'

// Icons
import BedIcon from '@mui/icons-material/Bed'
import BathtubIcon from '@mui/icons-material/Bathtub'
import SquareFootIcon from '@mui/icons-material/SquareFoot'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

const getImageUrl = (img) => {
  if (!img) return null
  if (img.startsWith('http')) return img
  return `${BASE}${img}`
}

export default function PropertyCard({ property, className }) {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const isEn = i18n.language === 'en'

  const { id, slug, title, titleEn, location, price, emoji, rooms, baths, area, images } = property
  const firstImage = Array.isArray(images) && images.length > 0 ? getImageUrl(images[0]) : null

  return (
    <Link 
      to={`/properties/${slug}`} 
      className={clsx(
        'group bg-white rounded-2xl sm:rounded-[2.5rem] p-2 sm:p-4 border border-cream-200 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 flex flex-col w-full',
        className
      )}
    >
      {/* 1. Media Area - Clean Look */}
      <div className="relative h-28 sm:h-56 lg:h-72 rounded-xl sm:rounded-[2rem] overflow-hidden bg-cream-100 shrink-0">
        {firstImage ? (
          <img src={firstImage} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={title} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl sm:text-6xl bg-cream-100">{emoji || '🏠'}</div>
        )}
      </div>

      {/* 2. Content Area */}
      <div className="px-1 sm:px-2 py-2.5 sm:py-6 flex flex-col flex-1">
        <div className="flex items-center gap-1 text-ink-50 mb-1 sm:mb-2">
          <LocationOnIcon sx={{ fontSize: 12 }} className="sm:!text-base" />
          <span className="text-[10px] sm:text-[12px] font-medium truncate">{location}</span>
        </div>

        <h3 className="text-xs sm:text-xl font-bold text-ink-400 mb-1 sm:mb-2 line-clamp-1">
          {isEn && titleEn ? titleEn : title}
        </h3>

        <div className="text-sm sm:text-2xl font-black text-ink-500 mb-2 sm:mb-8">
          <span className="text-xs sm:text-lg mr-1">₪</span>{price?.toLocaleString()}
        </div>

        {/* 3. Features Footer - الترتيب المستوحى من صورتك لقطة شاشة 2026-05-06 150019.png */}
        <div className="mt-auto pt-2 sm:pt-5 border-t border-cream-100 flex items-center justify-between">
          
          {/* زر المقارنة - بسيط وواضح */}
          <button
            onClick={(e) => { e.preventDefault(); navigate(`/compare?add=${id}`) }}
            className="w-7 h-7 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-ink-500 text-white flex items-center justify-center shadow-lg hover:bg-ink-500 transition-all shrink-0"
          >
            <CompareArrowsIcon sx={{ fontSize: 14 }} className="sm:!text-2xl" />
          </button>

          {/* قسم المواصفات - Simple Icons */}
          <div className="flex items-center gap-1.5 sm:gap-6">
            
            {/* المساحة */}
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="flex flex-col items-end -space-y-1">
                <span className="text-[10px] sm:text-sm font-bold text-ink-300">{area}</span>
                <span className="hidden sm:block text-[9px] font-bold text-ink-50">M²</span>
              </div>
              <SquareFootIcon sx={{ fontSize: 12 }} className="sm:!text-lg" style={{ color: '#94a3b8' }} />
            </div>

            {/* حمام */}
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-[10px] sm:text-sm font-bold text-ink-300">{baths || 0}</span>
              <BathtubIcon sx={{ fontSize: 12 }} className="sm:!text-lg" style={{ color: '#94a3b8' }} />
            </div>

            {/* غرف */}
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-[10px] sm:text-sm font-bold text-ink-300">{rooms || 0}</span>
              <BedIcon sx={{ fontSize: 12 }} className="sm:!text-lg" style={{ color: '#94a3b8' }} />
            </div>

          </div>
        </div>
      </div>
    </Link>
  )
}