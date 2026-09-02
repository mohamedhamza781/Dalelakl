import { useState, useEffect, useRef } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useDispatch } from "react-redux"
import { useTranslation } from "react-i18next"
import { setFilters, fetchFeatured, fetchProperties } from "@/store/slices/propertiesSlice"
import { settingsAPI, teamAPI, propertiesAPI } from "@/lib/api"

import PropertyCard from "@/components/property/PropertyCard"
import AIRecommendations from "@/components/property/AIRecommendations"
import NeighborhoodsSection from "@/components/property/NeighborhoodsSection"

import SearchIcon from "@mui/icons-material/Search"
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"
import HomeWorkIcon from "@mui/icons-material/HomeWork"
import KeyIcon from "@mui/icons-material/Key"
import CalculateIcon from "@mui/icons-material/Calculate"
import AccountBalanceIcon from "@mui/icons-material/AccountBalance"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import StarIcon from "@mui/icons-material/Star"
import FormatQuoteIcon from "@mui/icons-material/FormatQuote"
import ApartmentIcon from "@mui/icons-material/Apartment"
import GroupsIcon from "@mui/icons-material/Groups"
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser"
import PublicIcon from "@mui/icons-material/Public"
import LinkedInIcon from "@mui/icons-material/LinkedIn"
import TwitterIcon from "@mui/icons-material/Twitter"
import InstagramIcon from "@mui/icons-material/Instagram"
import FacebookIcon from "@mui/icons-material/Facebook"
import WhatsAppIcon from "@mui/icons-material/WhatsApp" 
import VerifiedIcon from "@mui/icons-material/Verified"
import PersonIcon   from "@mui/icons-material/Person"
import Person2Icon  from "@mui/icons-material/Person2"
import Person3Icon  from "@mui/icons-material/Person3"
import Person4Icon  from "@mui/icons-material/Person4"
import Face2Icon    from "@mui/icons-material/Face2"
import Face3Icon    from "@mui/icons-material/Face3"
import Face4Icon    from "@mui/icons-material/Face4"
import Face5Icon    from "@mui/icons-material/Face5"
import Face6Icon    from "@mui/icons-material/Face6"
import ManIcon      from "@mui/icons-material/Man"
import Man2Icon     from "@mui/icons-material/Man2"
import WomanIcon    from "@mui/icons-material/Woman"
import Woman2Icon   from "@mui/icons-material/Woman2"
import BoyIcon      from "@mui/icons-material/Boy"
import AccountCircleIcon from "@mui/icons-material/AccountCircle"

import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import BathtubIcon from '@mui/icons-material/Bathtub';
import BedIcon from '@mui/icons-material/Bed';

// أيقونات آراء العملاء — ذكور وإناث
const MALE_ICONS = {
  Person:   { Icon: PersonIcon,   color: '#2563eb', bg: 'bg-cream-200 group-hover:bg-cream-300' },
  Person2:  { Icon: Person2Icon,  color: '#0284c7', bg: 'bg-cream-200 group-hover:bg-cream-300' },
  Person3:  { Icon: Person3Icon,  color: '#7c3aed', bg: 'bg-violet-50 group-hover:bg-violet-100' },
  Person4:  { Icon: Person4Icon,  color: '#059669', bg: 'bg-emerald-50 group-hover:bg-emerald-100' },
  Man:      { Icon: ManIcon,      color: '#1d4ed8', bg: 'bg-cream-200 group-hover:bg-cream-300' },
  Man2:     { Icon: Man2Icon,     color: '#0369a1', bg: 'bg-cream-200 group-hover:bg-cream-300' },
  Boy:      { Icon: BoyIcon,      color: '#0891b2', bg: 'bg-cyan-50 group-hover:bg-cyan-100' },
}
const FEMALE_ICONS = {
  Face3:   { Icon: Face3Icon,    color: '#ec4899', bg: 'bg-pink-50 group-hover:bg-pink-100' },
  Face2:   { Icon: Face2Icon,    color: '#db2777', bg: 'bg-pink-50 group-hover:bg-pink-100' },
  Face4:   { Icon: Face4Icon,    color: '#9333ea', bg: 'bg-purple-50 group-hover:bg-purple-100' },
  Face5:   { Icon: Face5Icon,    color: '#e11d48', bg: 'bg-rose-50 group-hover:bg-rose-100' },
  Face6:   { Icon: Face6Icon,    color: '#c026d3', bg: 'bg-fuchsia-50 group-hover:bg-fuchsia-100' },
  Woman:   { Icon: WomanIcon,    color: '#be185d', bg: 'bg-pink-50 group-hover:bg-pink-100' },
  Woman2:  { Icon: Woman2Icon,   color: '#a21caf', bg: 'bg-fuchsia-50 group-hover:bg-fuchsia-100' },
}
const ALL_AVATAR_ICONS = { ...MALE_ICONS, ...FEMALE_ICONS }

function TestimonialAvatar({ icon, gender, size = 30, className = 'w-14 h-14 rounded-2xl' }) {
  const key = icon || (gender === 'female' ? 'Face3' : 'Person')
  const entry = ALL_AVATAR_ICONS[key] || (gender === 'female' ? FEMALE_ICONS.Face3 : MALE_ICONS.Person)
  const { Icon, color, bg } = entry
  return (
    <div className={`flex items-center justify-center transition-colors ${bg} ${className}`}>
      <Icon sx={{ fontSize: size, color }} />
    </div>
  )
}

// ── Animate on Scroll Hook ────────────────────────────────────
function useAOS(deps = []) {
  useEffect(() => {
    const timer = setTimeout(() => {
      const elements = document.querySelectorAll('[data-aos]')
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('aos-animate')
              observer.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.08, rootMargin: '0px 0px -50px 0px' }
      )
      elements.forEach(el => {
        el.classList.remove('aos-animate')
        observer.observe(el)
      })
      return () => observer.disconnect()
    }, 100)
    return () => clearTimeout(timer)
  }, deps)
}

const SERVICE_ICONS = {
  "HomeWork":       <HomeWorkIcon       sx={{ fontSize: 28, color: 'inherit' }} />,
  "Key":            <KeyIcon            sx={{ fontSize: 28, color: 'inherit' }} />,
  "Calculate":      <CalculateIcon      sx={{ fontSize: 28, color: 'inherit' }} />,
  "AccountBalance": <AccountBalanceIcon sx={{ fontSize: 28, color: 'inherit' }} />,
  "بيع العقارات":   <HomeWorkIcon       sx={{ fontSize: 28, color: 'inherit' }} />,
  "إيجار العقارات": <KeyIcon            sx={{ fontSize: 28, color: 'inherit' }} />,
  "التقييم العقاري":<CalculateIcon      sx={{ fontSize: 28, color: 'inherit' }} />,
  "تمويل عقاري":    <AccountBalanceIcon sx={{ fontSize: 28, color: 'inherit' }} />,
}

export default function HomePage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [tab, setTab] = useState("all")
  const [q, setQ] = useState("")

  const isEn = i18n.language === 'en'

  // ── Site Settings from backend ─────────────────────────────
  const [siteSettings, setSiteSettings] = useState(null)
  const [heroProperty, setHeroProperty] = useState(null)
  const [featuredProps, setFeaturedProps] = useState([])
  const [loadingFeatured, setLoadingFeatured] = useState(true)
  const [loadingSettings, setLoadingSettings] = useState(true)
  const [teamMembers, setTeamMembers] = useState([])

  useEffect(() => {
    const loadAll = async () => {
      try {
        const settingsRes = await settingsAPI.getPublic()

        teamAPI.getPublic()
          .then(res => setTeamMembers((res.members || []).slice(0, 4)))
          .catch(() => {})
        setSiteSettings(settingsRes.settings)
        setHeroProperty(settingsRes.settings?.hero_property || null)
      } catch {
        // تجاهل — الحقول هترجع فاضية والصفحة بتضل شغالة
      } finally {
        setLoadingSettings(false)
      }
    }
    loadAll()
  }, [])

  // ── تحميل العقارات المميزة من الداتابيز حسب التبويب المختار (كل/بيع/إيجار/شقق/فلل/أراضي) ──
  // كل تبويب بيسوي طلب منفصل للباك اند (فلترة حقيقية على الداتابيز)، مش فلترة على نسخة محلية قديمة.
  useEffect(() => {
    let cancelled = false
    const loadFeatured = async () => {
      setLoadingFeatured(true)
      try {
        const filters = {}
        if (tab === 'sale' || tab === 'rent') filters.type = tab
        if (tab === 'apt' || tab === 'villa' || tab === 'land') filters.category = tab

        const res = await propertiesAPI.getFeatured(filters)
        if (!cancelled) setFeaturedProps(res.properties || [])
      } catch {
        if (!cancelled) setFeaturedProps([])
      } finally {
        if (!cancelled) setLoadingFeatured(false)
      }
    }
    loadFeatured()
    return () => { cancelled = true }
  }, [tab])

  const services = Array.isArray(siteSettings?.services) && siteSettings.services.length > 0
    ? siteSettings.services
    : []
  
  const testimonials = siteSettings?.testimonials || []
  const faqs         = siteSettings?.faqs         || []

  // ── Hero text helpers ──────────────────────────────────────
  // ملاحظة: العنوان والوصف ما عندهم نص افتراضي مقصود — يضلوا فاضيين
  // (والـ skeleton بيغطيهم وقت التحميل) لحد ما الأدمن يحط نص حقيقي من لوحة التحكم.
  // البحث (placeholder/زر) بس محتفظين بنص افتراضي لأنه وظيفي مش تسويقي.
  const heroText = {
    badge:       isEn ? (siteSettings?.hero_badge_en              || '') : (siteSettings?.hero_badge              || ''),
    line1:       isEn ? (siteSettings?.hero_title_line1_en        || '') : (siteSettings?.hero_title_line1        || ''),
    line2:       isEn ? (siteSettings?.hero_title_line2_en        || '') : (siteSettings?.hero_title_line2        || ''),
    line3:       isEn ? (siteSettings?.hero_title_line3_en        || '') : (siteSettings?.hero_title_line3        || ''),
    subtitle:    isEn ? (siteSettings?.hero_subtitle_en           || '') : (siteSettings?.hero_subtitle           || ''),
    placeholder: isEn ? (siteSettings?.hero_search_placeholder_en || t('home.searchPh')) : (siteSettings?.hero_search_placeholder || t('home.searchPh')),
    searchBtn:   isEn ? (siteSettings?.hero_search_btn_en         || t('home.searchBtn')): (siteSettings?.hero_search_btn         || t('home.searchBtn')),
  }
  const hasHeroText = heroText.line1 || heroText.line2 || heroText.line3

  // ── About image helper ─────────────────────────────────────
  const aboutImageUrl = siteSettings?.about_image
    ? (siteSettings.about_image.startsWith('http')
        ? siteSettings.about_image
        : `http://localhost:5000${siteSettings.about_image}`)
    : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'

  const TABS = [
    { key: "all",   label: t('home.tabAll') },
    { key: "sale",  label: t('home.tabSale') },
    { key: "rent",  label: t('home.tabRent') },
    { key: "apt",   label: t('home.tabApt') },
    { key: "villa", label: t('home.tabVilla') },
    { key: "land",  label: t('home.tabLand') },
  ]

  const doSearch = () => {
    dispatch(setFilters({ search: q }))
    navigate("/properties")
  }

  const heroImg = heroProperty?.images?.[0]
  const heroImageUrl = heroImg
    ? (heroImg.startsWith('http') ? heroImg : `http://localhost:5000${heroImg}`)
    : null

  useAOS([featuredProps, teamMembers, loadingSettings])

  return (
    <div className="bg-[#F8FAFC]">

      {/* 1. HERO SECTION */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-white pb-20 pt-12 lg:pt-16">
        {heroImageUrl && (
          <div className="absolute inset-0 select-none pointer-events-none">
            <img loading="lazy"
              src={heroImageUrl}
              alt=""
              className="w-full h-full object-cover opacity-[0.04] scale-105 blur-md"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-slate-50/50 pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.18] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#CBD5E1 1.5px, transparent 1.5px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="absolute -top-32 -right-32 w-[30rem] h-[30rem] bg-slate-200/40 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-[30rem] h-[30rem] bg-ink-500/5 blur-[140px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 grid lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full">
          
          <div className="order-2 lg:order-1 lg:col-span-7 text-center lg:text-right">
            {loadingSettings ? (
              <div className="animate-pulse mb-6">
                <div className="h-12 sm:h-16 lg:h-20 bg-cream-200 rounded-2xl mb-3 mx-auto lg:mx-0 max-w-lg" />
                <div className="h-12 sm:h-16 lg:h-20 bg-cream-200 rounded-2xl mb-3 mx-auto lg:mx-0 max-w-md" />
                <div className="h-12 sm:h-16 lg:h-20 bg-cream-200 rounded-2xl mx-auto lg:mx-0 max-w-sm" />
              </div>
            ) : hasHeroText ? (
              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.18] mb-6 text-ink-500 tracking-tight">
                {heroText.line1}
                {heroText.line1 && <br />}
                <span className="relative inline-block my-1">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-l from-ink-500 via-ink-400 to-ink-300">
                    {heroText.line2}
                  </span>
                  <svg
                    className="absolute -bottom-2 right-0 w-full h-3.5 z-0"
                    viewBox="0 0 200 12"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M2 9 C 60 2, 140 2, 198 9"
                      stroke="#94A3B8"
                      strokeWidth="4"
                      fill="none"
                      strokeLinecap="round"
                      opacity="0.3"
                    />
                  </svg>
                </span>
                {heroText.line3 && <br />}
                {heroText.line3}
              </h1>
            ) : null}

            {loadingSettings ? (
              <div className="animate-pulse mb-10">
                <div className="h-5 bg-cream-200 rounded-full mb-2 mx-auto lg:mx-0 max-w-xl" />
                <div className="h-5 bg-cream-200 rounded-full mx-auto lg:mx-0 max-w-md" />
              </div>
            ) : heroText.subtitle ? (
              <p className="text-ink-200 text-base sm:text-lg lg:text-xl mb-10 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
                {heroText.subtitle}
              </p>
            ) : null}

            <div className="max-w-2xl mx-auto lg:mx-0 bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-2 sm:p-2.5 shadow-2xl shadow-ink-500/5 transition-all focus-within:border-slate-400 focus-within:shadow-slate-200/50">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && doSearch()}
                    placeholder={heroText.placeholder}
                    className="w-full bg-slate-50/80 border border-transparent text-ink-500 rounded-2xl py-4 pr-12 pl-4 focus:bg-white focus:border-slate-300 outline-none transition-all font-semibold text-sm sm:text-base placeholder:text-ink-200/50"
                  />
                  <SearchIcon
                    sx={{
                      fontSize: 22,
                      color: "#8A8580",
                      position: "absolute",
                      right: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  />
                </div>
                <button
                  onClick={doSearch}
                  className="bg-ink-500 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-ink-500/20 hover:bg-ink-400 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <span>{heroText.searchBtn}</span>
                </button>
              </div>
            </div>
          </div>

          {heroProperty && (
            <div className="order-1 lg:order-2 mb-10 lg:mb-0 lg:mt-0 lg:col-span-5 relative">
              <div className="relative group max-w-sm mx-auto lg:max-w-none">
                <div className="absolute -inset-1.5 bg-white/30 rounded-[2.5rem] blur-xl opacity-40 group-hover:opacity-60 transition duration-500" />

                <div className="relative bg-ink-500 rounded-[2.2rem] overflow-hidden border border-white/10 shadow-2xl shadow-ink-500/30">
                  <div className="h-64 sm:h-80 lg:h-[380px] relative overflow-hidden bg-ink-600">
                    {heroImageUrl ? (
                      <img
                        src={heroImageUrl}
                        alt={heroProperty.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-7xl bg-gradient-to-br from-ink-400 to-ink-600 text-white">
                        <span>{heroProperty.emoji || <HomeRoundedIcon sx={{ fontSize: 80 }} />}</span>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-500 via-transparent to-black/20" />

                    <div className="absolute top-4 inset-x-4 flex justify-between items-center pointer-events-none">
                      <span className="bg-white/90 backdrop-blur-md text-ink-500 text-[11px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                        {heroProperty.featured ? "Premium" : "عقار مميز"}
                      </span>

                      {heroProperty.verified && (
                        <span className="bg-white/90 backdrop-blur-md text-ink-500 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                          <VerifiedIcon sx={{ fontSize: 15, color: "#0F172A" }} />
                          موثق
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-b from-ink-500 to-ink-600 border-t border-white/10">
                    <div className="flex justify-between items-baseline mb-2">
                      <h3 className="font-bold text-lg text-white truncate max-w-[220px]">
                        {heroProperty.title}
                      </h3>
                      <div className="text-white font-black text-2xl tracking-tight">
                        <span className="text-xs font-bold ml-1 text-white/80">₪</span>
                        {heroProperty.price?.toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-ink-50/80 text-xs font-medium mb-4">
                      <LocationOnIcon sx={{ fontSize: 16, color: "#FFFFFF" }} />
                      <span className="truncate">{heroProperty.location}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-white/90 text-xs font-semibold">
                      {heroProperty.rooms > 0 && (
                        <div className="flex items-center justify-center gap-1.5 bg-white/5 py-2 rounded-xl border border-white/5">
                          <BedIcon sx={{ fontSize: 16, color: "#FFFFFF" }} />
                          <span>{heroProperty.rooms} غرف</span>
                        </div>
                      )}
                      {heroProperty.baths > 0 && (
                        <div className="flex items-center justify-center gap-1.5 bg-white/5 py-2 rounded-xl border border-white/5">
                          <BathtubIcon sx={{ fontSize: 16, color: "#FFFFFF" }} />
                          <span>{heroProperty.baths} حمام</span>
                        </div>
                      )}
                      {heroProperty.area > 0 && (
                        <div className="flex items-center justify-center gap-1.5 bg-white/5 py-2 rounded-xl border border-white/5">
                          <SquareFootIcon sx={{ fontSize: 16, color: "#FFFFFF" }} />
                          <span>{heroProperty.area} م²</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}
          
        </div>
      </section>

      {/* 2. SERVICES */}
      <section className="py-32 bg-white" id="services">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 data-aos="fade-up" data-aos-duration="700" className="text-4xl font-black text-ink-500 mb-4">{t('home.servicesTitle')}</h2>
            <p data-aos="fade-up" data-aos-delay="150" data-aos-duration="700" className="text-ink-100 text-lg max-w-2xl mx-auto font-medium">{t('home.servicesSub')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {services.map((s, i) => (
              <div key={s.id || i}
                className="group p-10 text-center cursor-pointer rounded-[3rem] border border-cream-200 bg-cream-100/30 hover:bg-white hover:shadow-2xl hover:shadow-brass/5 hover:-translate-y-2 transition-all duration-500">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-cream-200 text-ink-500 group-hover:bg-ink-500 group-hover:text-white flex items-center justify-center transition-all duration-500 shadow-sm group-hover:shadow-xl group-hover:shadow-cream-400">
                  {SERVICE_ICONS[s.icon] || SERVICE_ICONS[s.title] || <HomeWorkIcon sx={{ fontSize: 28, color: 'inherit' }} />}
                </div>
                <h3 className="text-lg font-black text-ink-500 mb-3 group-hover:text-ink-500 transition-colors">{isEn ? (s.titleEn || s.title) : s.title}</h3>
                <p className="text-ink-100 text-sm font-medium leading-relaxed">{isEn ? (s.descEn || s.desc) : s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURED PROPERTIES */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 data-aos="fade-up" data-aos-duration="700" className="text-4xl font-black text-ink-500 mb-4 tracking-tight">{t('home.featuredTitle')}</h2>
            <p data-aos="fade-up" data-aos-delay="150" data-aos-duration="700" className="text-ink-100 text-lg font-medium">{t('home.featuredSub')}</p>
          </div>
          <button onClick={() => navigate("/properties")} className="bg-white border border-cream-300 text-ink-500 px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-2 hover:shadow-lg transition-all">
            {t('home.viewAll')} {isEn ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mb-12 p-2 bg-cream-200 rounded-[2rem] w-fit">
          {TABS.map(tb => (
            <button key={tb.key} onClick={() => setTab(tb.key)}
              className={`px-8 py-3.5 rounded-[1.5rem] transition-all font-black text-xs uppercase tracking-wider ${
                tab === tb.key ? "bg-white text-ink-500 shadow-sm" : "text-ink-100 hover:text-ink-500"
              }`}>
              {tb.label}
            </button>
          ))}
        </div>

        {loadingFeatured ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-cream-200 rounded-2xl sm:rounded-[2.5rem] animate-pulse h-56 sm:h-80" />
            ))}
          </div>
        ) : featuredProps.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
            {featuredProps.map((p, i) => <div key={p.id} data-aos="fade-up" data-aos-delay={`${i * 100}`} data-aos-duration="600"><PropertyCard property={p} homeVariant /></div>)}
          </div>
        ) : (
          <div className="text-center py-20 text-ink-50 font-bold">لا توجد عقارات في هذه الفئة حالياً</div>
        )}
      </section>

      <AIRecommendations />
      <div data-aos="fade-up" data-aos-duration="800"><NeighborhoodsSection /></div>

      {/* 4. ABOUT US */}
      <section className="py-32 bg-white overflow-hidden" id="about-us" data-aos="fade-up" data-aos-duration="800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="relative z-10 rounded-[3.5rem] overflow-hidden shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-700">
                <img loading="lazy"
                  src={aboutImageUrl}
                  alt="About Us"
                  className="w-full h-[600px] object-cover"
                />
              </div>

              <div className="absolute -bottom-10 -right-10 z-20 bg-ink-500 p-8 rounded-[2.5rem] shadow-2xl shadow-brass/40 text-white hidden md:block">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <EmojiEventsIcon />
                  </div>
                  <div>
                    <div className="text-3xl font-black">
                      +{siteSettings?.about_experience_years || '15'}
                    </div>
                    <div className="text-xs font-bold uppercase opacity-80">سنة خبرة</div>
                  </div>
                </div>
                <p className="text-sm font-medium leading-relaxed opacity-90">
                  {isEn
                    ? (siteSettings?.about_experience_text_en || 'Providing the best real estate solutions for years.')
                    : (siteSettings?.about_experience_text    || 'نقدم أفضل الحلول العقارية في السوق الفلسطيني منذ سنوات.')}
                </p>
              </div>

              <div className="absolute -top-10 -left-10 w-40 h-40 bg-cream-300 rounded-full blur-3xl opacity-50" />
            </div>

            <div>
              <h2
                className="text-4xl md:text-5xl font-black text-ink-500 mb-8 leading-tight tracking-tight"
                dangerouslySetInnerHTML={{
                  __html: isEn
                    ? (siteSettings?.about_title_en || 'We Provide You the <span class="text-ink-500">Perfect Place</span> You Always Dreamed Of')
                    : (siteSettings?.about_title    || 'نحن نوفر لك <span class="text-ink-500">المكان المثالي</span> الذي تحلم به دوماً')
                }}
              />
              <p className="text-ink-100 text-lg mb-10 font-medium leading-relaxed">
                {isEn
                  ? (siteSettings?.about_subtitle_en || "At \"Dalelak Aqari\" we're not just a buy-sell platform — we're your partner in finding stability.")
                  : (siteSettings?.about_subtitle    || 'نحن في "دليلك العقاري" لسنا مجرد منصة للبيع والشراء، بل نحن شركاؤك في رحلة البحث عن الاستقرار.')}
              </p>

              <div className="space-y-6 mb-12">
                {[
                  {
                    icon: <VerifiedUserIcon />,
                    title: isEn ? (siteSettings?.about_point1_title_en || 'Full Reliability')   : (siteSettings?.about_point1_title || 'موثوقية كاملة'),
                    desc:  isEn ? (siteSettings?.about_point1_desc_en  || 'All listed properties undergo rigorous legal verification.') : (siteSettings?.about_point1_desc  || 'جميع العقارات المدرجة تخضع لتدقيق قانوني دقيق.'),
                  },
                  {
                    icon: <GroupsIcon />,
                    title: isEn ? (siteSettings?.about_point2_title_en || 'Expert Team')   : (siteSettings?.about_point2_title || 'فريق متخصص'),
                    desc:  isEn ? (siteSettings?.about_point2_desc_en  || 'Real estate experts to assist you at every step.') : (siteSettings?.about_point2_desc  || 'خبراء عقاريون لمساعدتك في كل خطوة.'),
                  },
                  {
                    icon: <PublicIcon />,
                    title: isEn ? (siteSettings?.about_point3_title_en || 'Full Coverage') : (siteSettings?.about_point3_title || 'تغطية شاملة'),
                    desc:  isEn ? (siteSettings?.about_point3_desc_en  || 'We cover all governorates with the best offers.') : (siteSettings?.about_point3_desc  || 'نغطي كافة محافظات الوطن بأفضل العروض.'),
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-5 group">
                    <div className="w-14 h-14 shrink-0 bg-cream-100 rounded-2xl flex items-center justify-center text-ink-500 group-hover:bg-ink-500 group-hover:text-white transition-all duration-300 shadow-sm">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-black text-ink-500 mb-1">{item.title}</h4>
                      <p className="text-ink-100 text-sm font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="py-32 bg-cream-100/50 border-y border-cream-200 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col items-center text-center mb-20">
              <h2 data-aos="fade-up" data-aos-duration="700" className="text-4xl md:text-5xl font-black text-ink-500 mb-6 leading-tight">
                {t('home.reviewsTitle') || 'ثقة عملائنا هي سر نجاحنا'}
              </h2>
              <div className="w-24 h-1.5 bg-ink-500 rounded-full mb-6" />
              <p className="text-ink-100 text-lg max-w-2xl font-medium leading-relaxed">بشهادة المئات من عملائنا السعداء في جميع أنحاء فلسطين.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 md:gap-10">
              {testimonials.map((item, i) => (
                <div key={item.id || i} className="bg-white p-3 sm:p-6 md:p-10 rounded-2xl sm:rounded-[2rem] md:rounded-[3rem] border border-cream-200 shadow-xl shadow-cream-300/30 relative group hover:-translate-y-3 transition-all duration-500">
                  <div className="absolute -top-3 sm:-top-4 md:-top-5 right-4 sm:right-6 md:right-10 w-7 h-7 sm:w-9 sm:h-9 md:w-12 md:h-12 bg-ink-500 text-white rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-cream-400">
                    <FormatQuoteIcon sx={{ fontSize: 16, transform: 'rotate(180deg)' }} className="sm:!text-xl md:!text-3xl" />
                  </div>
                  <div className="flex gap-0.5 sm:gap-1 mb-2 sm:mb-4 md:mb-6">
                    {[...Array(5)].map((_, i) => <StarIcon key={i} sx={{ fontSize: 12, color: '#f59e0b' }} className="sm:!text-base md:!text-lg" />)}
                  </div>
                  <p className="text-ink-200 text-xs sm:text-sm md:text-base font-bold leading-relaxed mb-3 sm:mb-6 md:mb-10 italic line-clamp-4 sm:line-clamp-none">"{item.text}"</p>
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-5 md:pt-8 border-t border-cream-100">
                    <TestimonialAvatar icon={item.icon} gender={item.gender} size={16} className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 rounded-lg sm:rounded-xl md:rounded-2xl shrink-0" />
                    <div className="min-w-0">
                      <h4 className="font-black text-ink-500 text-xs sm:text-sm md:text-base truncate">{item.name}</h4>
                      <p className="text-ink-50 text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-widest truncate">{item.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. FAQ */}
      {faqs.length > 0 && (
        <section id="faq" className="py-32 bg-cream-100">
          <div data-aos="fade-up" data-aos-duration="700" className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-ink-500 mb-4 tracking-tighter">الأسئلة الشائعة</h2>
              <p className="text-ink-100 font-bold uppercase text-[10px] tracking-[0.3em]">نحن هنا للإجابة على تساؤلاتك</p>
            </div>
            <div className="space-y-4 text-right">
              {faqs.map((faq, i) => (
                <div key={faq.id || i} className="group bg-white p-8 rounded-[2rem] border border-cream-200 hover:border-cream-400 transition-all cursor-pointer">
                  <h4 className="text-lg font-black text-ink-500 mb-3 group-hover:text-ink-500 transition-colors">{faq.q}</h4>
                  <p className="text-ink-100 leading-relaxed font-medium">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. TEAM SECTION */}
      {teamMembers.length > 0 && (
        <section className="py-32 bg-white" id="team">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <div data-aos="fade-up" data-aos-duration="600" className="inline-flex items-center gap-2 bg-cream-200 text-ink-500 text-xs font-black px-4 py-2 rounded-full mb-6 border border-cream-300">
                <GroupsIcon sx={{ fontSize: 16 }} /> فريق العمل
              </div>
              <h2 data-aos="fade-up" data-aos-delay="100" data-aos-duration="700" className="text-4xl font-black text-ink-500 mb-4">
                تعرّف على <span className="text-ink-500">فريقنا</span>
              </h2>
              <p data-aos="fade-up" data-aos-delay="200" data-aos-duration="700" className="text-ink-100 text-lg max-w-2xl mx-auto font-medium">
                نخبة من المحترفين يعملون بشغف لتقديم أفضل تجربة عقارية
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8 mb-12">
              {teamMembers.map((m, i) => (
                <div
                  key={m.id}
                  data-aos="fade-up"
                  data-aos-delay={`${i * 100}`}
                  data-aos-duration="600"
                  className="group bg-white rounded-2xl sm:rounded-[2.5rem] overflow-hidden border border-cream-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500"
                >
                  <div className="relative h-28 sm:h-48 bg-gradient-to-br from-cream-200 to-cream-300 overflow-hidden">
                    {m.image ? (
                      <img loading="lazy"
                        src={m.image.startsWith('http') ? m.image : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${m.image}`}
                        alt={m.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-2xl sm:text-5xl font-black text-cream-400">{m.name?.slice(0, 2)}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2.5 sm:p-5">
                    <h3 className="font-black text-ink-500 mb-1 text-xs sm:text-base line-clamp-1">{m.name}</h3>
                    <p className="text-ink-500 text-[8px] sm:text-[10px] font-black uppercase tracking-widest mb-2 sm:mb-3 line-clamp-1">{m.role}</p>
                    {m.social && (m.social.facebook || m.social.whatsapp || m.social.instagram) && (
                      <div className="flex items-center gap-1.5 sm:gap-2 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-cream-100">
                        {m.social.facebook  && <a href={m.social.facebook}  target="_blank" rel="noreferrer" className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-cream-200 hover:bg-ink-500 hover:text-white text-brass flex items-center justify-center transition-all"><FacebookIcon sx={{ fontSize: 13 }} className="sm:!text-sm" /></a>}
                        {m.social.whatsapp  && <a href={`https://wa.me/${m.social.whatsapp}`} target="_blank" rel="noreferrer" className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-emerald-50 hover:bg-emerald-500 hover:text-white text-emerald-500 flex items-center justify-center transition-all"><WhatsAppIcon sx={{ fontSize: 13 }} className="sm:!text-sm" /></a>}
                        {m.social.instagram && <a href={m.social.instagram} target="_blank" rel="noreferrer" className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-pink-50 hover:bg-pink-600 hover:text-white text-pink-500 flex items-center justify-center transition-all"><InstagramIcon sx={{ fontSize: 13 }} className="sm:!text-sm" /></a>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. CTA SECTION */}
      <section data-aos="zoom-in" data-aos-duration="800" className="max-w-7xl mx-auto px-6 pb-32">
        <div className="relative overflow-hidden rounded-[4rem] p-20 md:p-28 text-center bg-ink-600 shadow-2xl shadow-ink-700/20">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }} />
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-ink-500/10 blur-[150px] rounded-full" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <h3 className="text-4xl md:text-6xl font-black mb-8 text-white tracking-tight leading-tight">
              {isEn ? (siteSettings?.cta_title_en || t('home.ctaTitle')) : (siteSettings?.cta_title || t('home.ctaTitle'))}
            </h3>
            <p className="text-ink-50 text-xl mb-14 font-medium leading-relaxed">
              {isEn ? (siteSettings?.cta_sub_en || t('home.ctaSub')) : (siteSettings?.cta_sub || t('home.ctaSub'))}
            </p>
            <div className="flex justify-center">
              <button onClick={() => navigate("/properties")} className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-black px-14 py-5 rounded-2xl hover:bg-white/20 transition-all shadow-xl shadow-ink-700/40 active:scale-95">
                {isEn ? (siteSettings?.cta_browse_en || t('home.ctaBrowse')) : (siteSettings?.cta_browse || t('home.ctaBrowse'))}
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}