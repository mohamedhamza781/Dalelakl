import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function MapView({ properties }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    // تنظيف الخريطة السابقة لمنع تكرار الـ Instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    if (!mapRef.current) return

    // استيراد Leaflet ديناميكياً لتجنب مشاكل الـ SSR مع Vite
    import('leaflet').then(L => {
      const leaflet = L.default

      // إصلاح مشكلة مسارات الأيقونات الافتراضية
      delete leaflet.Icon.Default.prototype._getIconUrl
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      const validProps = properties.filter(p => p.lat && p.lng)
      if (validProps.length === 0) return

      // حساب مركز الخريطة بناءً على العقارات المتاحة
      const center = [
        validProps.reduce((s, p) => s + p.lat, 0) / validProps.length,
        validProps.reduce((s, p) => s + p.lng, 0) / validProps.length,
      ]

      const map = leaflet.map(mapRef.current, {
        center,
        zoom: 11,
        zoomControl: false,
        scrollWheelZoom: true,
      })
      mapInstanceRef.current = map

      // استخدام ثيم خريطة نظيف وعصري
      leaflet.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO',
        maxZoom: 20,
      }).addTo(map)

      // إضافة أزرار التحكم في الزوم بوضع احترافي
      leaflet.control.zoom({ position: 'topright' }).addTo(map)

      validProps.forEach(p => {
        const price = p.type === 'rent'
          ? `₪${p.price.toLocaleString()}/ش`
          : `₪${p.price.toLocaleString()}`

        // الألوان بناءً على نوع العقار (إيجار/بيع) لسهولة التمييز البصري
        const themeColor = p.type === 'sale' ? '#0f172a' : '#2563eb'

        const icon = leaflet.divIcon({
          className: '',
          html: `
            <div class="map-price-marker" style="background: ${themeColor};">
              ${price}
              <div class="marker-tip" style="border-top-color: ${themeColor};"></div>
            </div>
          `,
          iconAnchor: [40, 45],
          popupAnchor: [0, -45],
        })

        const marker = leaflet.marker([p.lat, p.lng], { icon }).addTo(map)

        // محتوى الـ Popup بتصميم متوافق مع باقي الموقع
        const popupContent = `
          <div dir="rtl" class="map-popup-card">
            <div class="popup-image" style="background-image: url('${p.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=400'}')"></div>
            <div class="popup-details">
              <div class="popup-title">${p.title}</div>
              <div class="popup-price">${price}</div>
              <div class="popup-info">
                <span>📏 ${p.area}م²</span>
                ${p.rooms ? `<span>🛏️ ${p.rooms} غرف</span>` : ''}
              </div>
              <button onclick="window.__mapNavigate('${p.slug}')" class="popup-btn">
                تفاصيل العقار
              </button>
            </div>
          </div>
        `

        marker.bindPopup(popupContent, {
          maxWidth: 260,
          className: 'custom-map-popup'
        })
      })

      // احتواء جميع العقارات في واجهة العرض تلقائياً
      if (validProps.length > 1) {
        const bounds = leaflet.latLngBounds(validProps.map(p => [p.lat, p.lng]))
        map.fitBounds(bounds, { padding: [50, 50] })
      }
    })

    // مساعد التنقل العالمي للأزرار داخل الـ Popup
    window.__mapNavigate = (slug) => navigate(`/properties/${slug}`)

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
      delete window.__mapNavigate
    }
  }, [properties, navigate])

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[2rem] border border-cream-300 shadow-inner">
      <style>{`
        /* تصميم علامة السعر على الخريطة */
        .map-price-marker {
          color: white;
          padding: 6px 12px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 900;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          position: relative;
          cursor: pointer;
          transition: transform 0.2s;
          border: 2px solid white;
        }
        .map-price-marker:hover { transform: scale(1.1); z-index: 999; }
        .marker-tip {
          position: absolute; bottom: -8px; left: 50%;
          transform: translateX(-50%); width: 0; height: 0;
          border-left: 7px solid transparent; border-right: 7px solid transparent;
          border-top: 8px solid;
        }

        /* تنسيق نافذة المعلومات (Popup) */
        .custom-map-popup .leaflet-popup-content-wrapper {
          padding: 0; overflow: hidden; border-radius: 20px;
        }
        .custom-map-popup .leaflet-popup-content { margin: 0; width: 260px !important; }
        .map-popup-card { font-family: 'Tajawal', sans-serif; }
        .popup-image { height: 120px; background-size: cover; background-position: center; }
        .popup-details { padding: 15px; }
        .popup-title { font-weight: 800; font-size: 14px; color: #0f172a; margin-bottom: 5px; }
        .popup-price { color: #2563eb; font-weight: 900; font-size: 16px; margin-bottom: 10px; }
        .popup-info { display: flex; gap: 10px; font-size: 11px; color: #64748b; margin-bottom: 12px; }
        .popup-btn {
          width: 100%; background: #0f172a; color: white; border: none;
          padding: 10px; border-radius: 10px; font-weight: 800; cursor: pointer;
          transition: background 0.2s;
        }
        .popup-btn:hover { background: #2563eb; }
        
        .leaflet-container { font-family: 'Tajawal', sans-serif !important; }
      `}</style>
      <div ref={mapRef} className="h-full w-full z-0" />
    </div>
  )
}