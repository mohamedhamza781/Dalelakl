import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { showToast } from "@/store/slices/uiSlice"
import { logout } from "@/store/slices/authSlice"
import { adminAPI, propertiesAPI, neighborhoodsAPI, settingsAPI, uploadAPI, reportsAPI, teamAPI, contactAPI } from "@/lib/api"

import GavelIcon from "@mui/icons-material/Gavel"
import SecurityIcon from "@mui/icons-material/Security"
import HelpOutlineIcon from "@mui/icons-material/Help"
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings"
import PeopleIcon from "@mui/icons-material/People"
import ApartmentIcon from "@mui/icons-material/Apartment"
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"
import WarningAmberIcon from "@mui/icons-material/WarningAmber"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined"
import CancelIcon from "@mui/icons-material/Cancel"
import CloseIcon from "@mui/icons-material/Close"
import DeleteIcon from "@mui/icons-material/Delete"
import BarChartIcon from "@mui/icons-material/BarChart"
import HistoryIcon from "@mui/icons-material/History"
import GroupsIcon from "@mui/icons-material/Groups"
import LinkedInIcon from "@mui/icons-material/LinkedIn"
import TwitterIcon from "@mui/icons-material/Twitter"
import InstagramIcon from "@mui/icons-material/Instagram"
import FacebookIcon from "@mui/icons-material/Facebook"
import WhatsAppIcon from "@mui/icons-material/WhatsApp"
import HomeIcon from "@mui/icons-material/Home"
import SearchIcon from "@mui/icons-material/Search"
import LogoutIcon from "@mui/icons-material/Logout"
import GppGoodIcon from "@mui/icons-material/GppGood"
import BlockIcon from '@mui/icons-material/Block'
import LocationCityIcon from "@mui/icons-material/LocationCity"
import AddCircleIcon from "@mui/icons-material/AddCircle"
import EditIcon from "@mui/icons-material/Edit"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import SaveIcon from "@mui/icons-material/Save"
import StarIcon from "@mui/icons-material/Star"
import WebIcon from "@mui/icons-material/Web"
import CategoryIcon from "@mui/icons-material/Category"
import TitleIcon from "@mui/icons-material/Title"
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"
import ImageIcon from "@mui/icons-material/Image"
import ContactPhoneIcon from "@mui/icons-material/ContactPhone"
import PhoneIcon from "@mui/icons-material/Phone"
import EmailIcon from "@mui/icons-material/Email"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import PublicIcon from "@mui/icons-material/Public"
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser"
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead"

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function AdminPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector(s => s.auth)
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")

  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [properties, setProperties] = useState([])
  const [propsLoading, setPropsLoading] = useState(false)

  const [categories, setCategories] = useState([])
  const [regions, setRegions] = useState([])
  const [newCatName, setNewCatName] = useState("")
  const [newRegName, setNewRegName] = useState("")

  const [featuredNeighborhoods, setFeaturedNeighborhoods] = useState([])
  const [nbLoading, setNbLoading] = useState(false)
  const [nbForm, setNbForm] = useState({ city: '', cityEn: '', neighborhood: '', neighborhoodEn: '', tag: '', tagEn: '', emoji: '🏘️', gradient: 'linear-gradient(135deg,#1a3a5c,#0D2B45)', image: '' })
  const [nbImageFile, setNbImageFile] = useState(null)
  const [nbImagePreview, setNbImagePreview] = useState('')
  const [nbSaving, setNbSaving] = useState(false)
  const [nbEditId, setNbEditId] = useState(null)

  const [newsletter, setNewsletter] = useState([])
  const [nlLoading, setNlLoading] = useState(false)

  const loadNewsletter = async () => {
    setNlLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE}/newsletter/subscribers`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setNewsletter(data.subscribers || [])
    } catch {
      dispatch(showToast('فشل تحميل المشتركين'))
    } finally {
      setNlLoading(false)
    }
  }

  const deleteNewsletterSub = async (id) => {
    if (!window.confirm('حذف هذا المشترك؟')) return
    try {
      const token = localStorage.getItem('token')
      await fetch(`${API_BASE}/newsletter/subscribers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      setNewsletter(p => p.filter(s => s.id !== id))
      dispatch(showToast('تم الحذف'))
    } catch {
      dispatch(showToast('فشل الحذف'))
    }
  }

  useEffect(() => { if (activeTab === 'newsletter') loadNewsletter() }, [activeTab])
  useEffect(() => {
    if (activeTab !== 'activity') return
    setActivitiesLoading(true)
    adminAPI.getActivities({ limit: 50 })
      .then(res => setActivities(res.activities || []))
      .catch(() => {})
      .finally(() => setActivitiesLoading(false))
  }, [activeTab])

  useEffect(() => {
    if (activeTab !== 'team') return
    setTeamLoading(true)
    teamAPI.getAll()
      .then(res => setTeamMembers(res.members || []))
      .catch(() => {})
      .finally(() => setTeamLoading(false))
  }, [activeTab])

  useEffect(() => {
    if (activeTab !== 'reports') return
    setReportsLoading(true)
    reportsAPI.getAll({ limit: 50 })
      .then(res => setReports(res.reports || []))
      .catch(() => {})
      .finally(() => setReportsLoading(false))
  }, [activeTab])

  const loadNeighborhoods = async () => {
    setNbLoading(true)
    try {
      const res = await neighborhoodsAPI.getAll()
      setFeaturedNeighborhoods(res.neighborhoods || [])
    } catch {
      dispatch(showToast('فشل تحميل الأحياء'))
    } finally {
      setNbLoading(false)
    }
  }

  const handleNbImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setNbImageFile(file)
    setNbImagePreview(URL.createObjectURL(file))
  }

  const handleNbSave = async () => {
    if (!nbForm.city || !nbForm.neighborhood) {
      dispatch(showToast('المدينة والحي مطلوبان'))
      return
    }
    setNbSaving(true)
    try {
      let imageUrl = nbForm.image
      if (nbImageFile) {
        const upRes = await uploadAPI.uploadImage(nbImageFile)
        imageUrl = upRes.url || upRes.path || ''
      }
      const payload = { ...nbForm, image: imageUrl }
      if (nbEditId) {
        await neighborhoodsAPI.update(nbEditId, payload)
        dispatch(showToast('تم تحديث الحي بنجاح ✅'))
      } else {
        await neighborhoodsAPI.create(payload)
        dispatch(showToast('تم إضافة الحي بنجاح ✅'))
      }
      setNbForm({ city: '', cityEn: '', neighborhood: '', neighborhoodEn: '', tag: '', tagEn: '', emoji: '🏘️', gradient: 'linear-gradient(135deg,#1a3a5c,#0D2B45)', image: '' })
      setNbImageFile(null)
      setNbImagePreview('')
      setNbEditId(null)
      loadNeighborhoods()
    } catch (err) {
      dispatch(showToast(err.message || 'فشل الحفظ'))
    } finally {
      setNbSaving(false)
    }
  }

  const handleNbEdit = (n) => {
    setNbEditId(n.id)
    setNbForm({ city: n.city, cityEn: n.cityEn || '', neighborhood: n.neighborhood, neighborhoodEn: n.neighborhoodEn || '', tag: n.tag || '', tagEn: n.tagEn || '', emoji: n.emoji || '🏘️', gradient: n.gradient || '', image: n.image || '' })
    setNbImagePreview(n.image ? (n.image.startsWith('http') ? n.image : `http://localhost:5000${n.image}`) : '')
    setNbImageFile(null)
  }

  const handleNbDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الحي؟')) return
    try {
      await neighborhoodsAPI.delete(id)
      dispatch(showToast('تم حذف الحي'))
      loadNeighborhoods()
    } catch (err) {
      dispatch(showToast(err.message || 'فشل الحذف'))
    }
  }

  const handleNbToggle = async (n) => {
    try {
      await neighborhoodsAPI.update(n.id, { active: !n.active })
      loadNeighborhoods()
    } catch {
      dispatch(showToast('فشل تحديث الحي'))
    }
  }

  const [siteContent, setSiteContent] = useState({
    logo_url: '',
    hero_badge: '🏆 المنصة الأولى في فلسطين',
    hero_badge_en: "🏆 Palestine's #1 Platform",
    hero_title_line1: 'ابحث عن',
    hero_title_line1_en: 'Find Your',
    hero_title_line2: 'بيت أحلامك',
    hero_title_line2_en: 'Dream Home',
    hero_title_line3: 'في فلسطين',
    hero_title_line3_en: 'In Palestine',
    hero_subtitle: 'منصتك الأولى للبحث عن العقارات في فلسطين',
    hero_subtitle_en: 'Your #1 real-estate platform in Palestine',
    hero_search_placeholder: 'ابحث بالمنطقة أو نوع العقار...',
    hero_search_placeholder_en: 'Search by area or property type...',
    hero_search_btn: 'ابحث الآن',
    hero_search_btn_en: 'Search Now',
    hero_property_id: '',
    about_title: 'نحن نوفر لك <strong>المكان المثالي</strong> الذي تحلم به دوماً',
    about_title_en: 'We Provide You the <strong>Perfect Place</strong> You Always Dreamed Of',
    about_subtitle: 'نحن في "دليلك العقاري" لسنا مجرد منصة للبيع والشراء، بل نحن شركاؤك في رحلة البحث عن الاستقرار.',
    about_subtitle_en: "At \"Dalelak Aqari\" we're not just a buy-sell platform — we're your partner in finding stability.",
    about_point1_title: 'موثوقية كاملة',
    about_point1_title_en: 'Full Reliability',
    about_point1_desc: 'جميع العقارات المدرجة تخضع لتدقيق قانوني دقيق.',
    about_point1_desc_en: 'All listed properties undergo rigorous legal verification.',
    about_point2_title: 'فريق متخصص',
    about_point2_title_en: 'Expert Team',
    about_point2_desc: 'خبراء عقاريون لمساعدتك في كل خطوة.',
    about_point2_desc_en: 'Real estate experts to assist you at every step.',
    about_point3_title: 'تغطية شاملة',
    about_point3_title_en: 'Full Coverage',
    about_point3_desc: 'نغطي كافة محافظات الوطن بأفضل العروض.',
    about_point3_desc_en: 'We cover all governorates with the best offers.',
    about_image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    about_experience_years: '15',
    about_experience_text: 'نقدم أفضل الحلول العقارية في السوق الفلسطيني منذ سنوات.',
    about_experience_text_en: 'Providing the best real estate solutions in the Palestinian market for years.',
    footer_phone: '+970 59-XXXX-XXX',
    footer_email: 'hello@teryaq.ps',
    footer_address: 'رام الله، فلسطين',
    footer_address_en: 'Ramallah, Palestine',
    footer_hours: '09:00 AM - 05:00 PM',
    footer_desc: 'شريكك الموثوق للعثور على منزلك المثالي في جميع أنحاء فلسطين.',
    footer_desc_en: 'Your trusted partner in finding the perfect home across Palestine.',
    footer_facebook: '',
    footer_instagram: '',
    footer_whatsapp: '',
    footer_linkedin: '',
    cta_title: 'ابدأ رحلتك العقارية اليوم',
    cta_title_en: 'Start Your Real Estate Journey Today',
    cta_sub: 'انضم إلى آلاف المستخدمين الذين وجدوا عقاراتهم المثالية معنا',
    cta_sub_en: 'Join thousands of users who found their perfect property with us',
    cta_btn: 'ابدأ الآن مجاناً',
    cta_btn_en: 'Get Started Free',
    cta_browse: 'تصفح العقارات',
    cta_browse_en: 'Browse Properties',
    testimonials: [],
    faqs: [],
    services: [],
    subscription_plans: [],
  })

  const [contentLoading, setContentLoading]     = useState(false)
  const [savingContent, setSavingContent]         = useState(false)
  const [savingCta, setSavingCta]                 = useState(false)
  const [savingHero, setSavingHero]               = useState(false)
  const [savingFooter, setSavingFooter]           = useState(false)
  const [savingLogo, setSavingLogo]               = useState(false)
  const [savingAbout, setSavingAbout]             = useState(false)
  const [logoFile, setLogoFile]                   = useState(null)
  const [logoPreview, setLogoPreview]             = useState('')
  const [heroSearchQuery, setHeroSearchQuery]     = useState('')
  const [aboutImageFile, setAboutImageFile]       = useState(null)
  const [aboutImagePreview, setAboutImagePreview] = useState('')
  const [savingAboutImage, setSavingAboutImage]   = useState(false)

  // ── Legal Pages State ──────────────────────────────────────────────────────
  const [legalContent, setLegalContent] = useState({
    terms_last_updated: '',
    terms_intro: '',
    terms_sections: [],
    privacy_last_updated: '',
    privacy_intro: '',
    privacy_sections: [],
    help_intro: '',
    help_categories: [],
  })
  const [legalLoading, setLegalLoading] = useState(false)
  const [savingLegal, setSavingLegal]   = useState(false)
  const [legalTab, setLegalTab]         = useState('terms')
  const [legalOpenId, setLegalOpenId]   = useState(null)

  // ── Contact Messages State ───────────────────────────────────────────────
  const [contactMessages, setContactMessages]   = useState([])
  const [contactLoading, setContactLoading]     = useState(false)
  const [contactFilter, setContactFilter]       = useState('all')
  const [contactOpen, setContactOpen]           = useState(null)

  const loadSiteContent = async () => {
    setContentLoading(true)
    try {
      const res = await settingsAPI.getAll()
      const s = res.settings
      setSiteContent({
        logo_url: s.logo_url || '',
        hero_badge:                 s.hero_badge                 || '🏆 المنصة الأولى في فلسطين',
        hero_badge_en:              s.hero_badge_en              || "🏆 Palestine's #1 Platform",
        hero_title_line1:           s.hero_title_line1           || 'ابحث عن',
        hero_title_line1_en:        s.hero_title_line1_en        || 'Find Your',
        hero_title_line2:           s.hero_title_line2           || 'بيت أحلامك',
        hero_title_line2_en:        s.hero_title_line2_en        || 'Dream Home',
        hero_title_line3:           s.hero_title_line3           || 'في فلسطين',
        hero_title_line3_en:        s.hero_title_line3_en        || 'In Palestine',
        hero_subtitle:              s.hero_subtitle              || 'منصتك الأولى للبحث عن العقارات في فلسطين',
        hero_subtitle_en:           s.hero_subtitle_en           || 'Your #1 real-estate platform in Palestine',
        hero_search_placeholder:    s.hero_search_placeholder    || 'ابحث بالمنطقة أو نوع العقار...',
        hero_search_placeholder_en: s.hero_search_placeholder_en || 'Search by area or property type...',
        hero_search_btn:            s.hero_search_btn            || 'ابحث الآن',
        hero_search_btn_en:         s.hero_search_btn_en         || 'Search Now',
        hero_property_id:           s.hero_property_id           || '',
        about_title:           s.about_title           || 'نحن نوفر لك <strong>المكان المثالي</strong> الذي تحلم به دوماً',
        about_title_en:        s.about_title_en        || 'We Provide You the <strong>Perfect Place</strong> You Always Dreamed Of',
        about_subtitle:        s.about_subtitle        || 'نحن في "دليلك العقاري" لسنا مجرد منصة للبيع والشراء، بل نحن شركاؤك في رحلة البحث عن الاستقرار.',
        about_subtitle_en:     s.about_subtitle_en     || "We're not just a platform — we're your partner in finding stability.",
        about_point1_title:    s.about_point1_title    || 'موثوقية كاملة',
        about_point1_title_en: s.about_point1_title_en || 'Full Reliability',
        about_point1_desc:     s.about_point1_desc     || 'جميع العقارات المدرجة تخضع لتدقيق قانوني دقيق.',
        about_point1_desc_en:  s.about_point1_desc_en  || 'All listed properties undergo rigorous legal verification.',
        about_point2_title:    s.about_point2_title    || 'فريق متخصص',
        about_point2_title_en: s.about_point2_title_en || 'Expert Team',
        about_point2_desc:     s.about_point2_desc     || 'خبراء عقاريون لمساعدتك في كل خطوة.',
        about_point2_desc_en:  s.about_point2_desc_en  || 'Real estate experts to assist you at every step.',
        about_point3_title:    s.about_point3_title    || 'تغطية شاملة',
        about_point3_title_en: s.about_point3_title_en || 'Full Coverage',
        about_point3_desc:     s.about_point3_desc     || 'نغطي كافة محافظات الوطن بأفضل العروض.',
        about_point3_desc_en:  s.about_point3_desc_en  || 'We cover all governorates with the best offers.',
        about_image:              s.about_image              || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        about_experience_years:   s.about_experience_years   || '15',
        about_experience_text:    s.about_experience_text    || 'نقدم أفضل الحلول العقارية في السوق الفلسطيني منذ سنوات.',
        about_experience_text_en: s.about_experience_text_en || 'Providing the best real estate solutions for years.',
        footer_phone:      s.footer_phone      || '+970 59-XXXX-XXX',
        footer_email:      s.footer_email      || 'hello@teryaq.ps',
        footer_address:    s.footer_address    || 'رام الله، فلسطين',
        footer_address_en: s.footer_address_en || 'Ramallah, Palestine',
        footer_hours:      s.footer_hours      || '09:00 AM - 05:00 PM',
        footer_desc:       s.footer_desc       || 'شريكك الموثوق للعثور على منزلك المثالي في جميع أنحاء فلسطين.',
        footer_desc_en:    s.footer_desc_en    || 'Your trusted partner in finding the perfect home across Palestine.',
        footer_facebook:   s.footer_facebook   || '',
        footer_instagram:  s.footer_instagram  || '',
        footer_whatsapp:   s.footer_whatsapp   || '',
        footer_linkedin:   s.footer_linkedin   || '',
        cta_title:     s.cta_title     || 'ابدأ رحلتك العقارية اليوم',
        cta_title_en:  s.cta_title_en  || 'Start Your Real Estate Journey Today',
        cta_sub:       s.cta_sub       || 'انضم إلى آلاف المستخدمين الذين وجدوا عقاراتهم المثالية معنا',
        cta_sub_en:    s.cta_sub_en    || 'Join thousands of users who found their perfect property with us',
        cta_btn:       s.cta_btn       || 'ابدأ الآن مجاناً',
        cta_btn_en:    s.cta_btn_en    || 'Get Started Free',
        cta_browse:    s.cta_browse    || 'تصفح العقارات',
        cta_browse_en: s.cta_browse_en || 'Browse Properties',
        testimonials:       Array.isArray(s.testimonials)       ? s.testimonials       : [],
        faqs:               Array.isArray(s.faqs)               ? s.faqs               : [],
        services:           Array.isArray(s.services)           ? s.services           : [],
        subscription_plans: Array.isArray(s.subscription_plans) ? s.subscription_plans : [],
      })
      if (s.logo_url) setLogoPreview(s.logo_url.startsWith('http') ? s.logo_url : `http://localhost:5000${s.logo_url}`)
      if (s.about_image) setAboutImagePreview(s.about_image.startsWith('http') ? s.about_image : `http://localhost:5000${s.about_image}`)
    } catch {
      dispatch(showToast('فشل تحميل إعدادات الموقع'))
    } finally {
      setContentLoading(false)
    }
  }

  const handleSaveContent = async (key, value) => {
    setSavingContent(true)
    try {
      await settingsAPI.update(key, value)
      dispatch(showToast('تم الحفظ بنجاح ✅'))
      loadSiteContent()
    } catch (err) {
      dispatch(showToast(err.message || 'فشل الحفظ'))
    } finally {
      setSavingContent(false)
    }
  }

  const handleLogoFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleSaveLogo = async () => {
    if (!logoFile) { dispatch(showToast('يرجى اختيار صورة أولاً')); return }
    setSavingLogo(true)
    try {
      const upRes = await uploadAPI.uploadImage(logoFile)
      const url = upRes.url || upRes.path || ''
      await settingsAPI.update('logo_url', url)
      setSiteContent(prev => ({ ...prev, logo_url: url }))
      setLogoFile(null)
      dispatch(showToast('تم حفظ اللوجو بنجاح ✅'))
    } catch (err) {
      dispatch(showToast(err.message || 'فشل رفع اللوجو'))
    } finally {
      setSavingLogo(false)
    }
  }

  const handleSaveHero = async () => {
    setSavingHero(true)
    try {
      const keys = [
        'hero_badge','hero_badge_en',
        'hero_title_line1','hero_title_line1_en',
        'hero_title_line2','hero_title_line2_en',
        'hero_title_line3','hero_title_line3_en',
        'hero_subtitle','hero_subtitle_en',
        'hero_search_placeholder','hero_search_placeholder_en',
        'hero_search_btn','hero_search_btn_en',
      ]
      await Promise.all(keys.map(k => settingsAPI.update(k, siteContent[k] || '')))
      dispatch(showToast('تم حفظ نصوص الهيدر بنجاح ✅'))
    } catch {
      dispatch(showToast('فشل حفظ الهيدر'))
    } finally {
      setSavingHero(false)
    }
  }

  const handleSaveAbout = async () => {
    setSavingAbout(true)
    try {
      if (aboutImageFile) {
        setSavingAboutImage(true)
        const upRes = await uploadAPI.uploadImage(aboutImageFile)
        const url = upRes.url || upRes.path || ''
        await settingsAPI.update('about_image', url)
        setSiteContent(p => ({ ...p, about_image: url }))
        setAboutImageFile(null)
        setSavingAboutImage(false)
      }
      const keys = [
        'about_title','about_title_en',
        'about_subtitle','about_subtitle_en',
        'about_point1_title','about_point1_title_en','about_point1_desc','about_point1_desc_en',
        'about_point2_title','about_point2_title_en','about_point2_desc','about_point2_desc_en',
        'about_point3_title','about_point3_title_en','about_point3_desc','about_point3_desc_en',
        'about_experience_years','about_experience_text','about_experience_text_en',
      ]
      await Promise.all(keys.map(k => settingsAPI.update(k, siteContent[k] || '')))
      dispatch(showToast('تم حفظ قسم "من نحن" بنجاح ✅'))
    } catch {
      dispatch(showToast('فشل حفظ القسم'))
    } finally {
      setSavingAbout(false)
      setSavingAboutImage(false)
    }
  }

  const handleSaveFooter = async () => {
    setSavingFooter(true)
    try {
      const keys = [
        'footer_phone','footer_email',
        'footer_address','footer_address_en',
        'footer_hours',
        'footer_desc','footer_desc_en',
        'footer_facebook','footer_instagram',
        'footer_whatsapp','footer_linkedin',
      ]
      await Promise.all(keys.map(k => settingsAPI.update(k, siteContent[k] || '')))
      dispatch(showToast('تم حفظ إعدادات الفوتر بنجاح ✅'))
    } catch {
      dispatch(showToast('فشل حفظ الفوتر'))
    } finally {
      setSavingFooter(false)
    }
  }

  const handleSaveCta = async () => {
    setSavingCta(true)
    try {
      const keys = ['cta_title','cta_title_en','cta_sub','cta_sub_en','cta_btn','cta_btn_en','cta_browse','cta_browse_en']
      await Promise.all(keys.map(k => settingsAPI.update(k, siteContent[k])))
      dispatch(showToast('تم حفظ الـ CTA بنجاح ✅'))
    } catch {
      dispatch(showToast('فشل حفظ الـ CTA'))
    } finally {
      setSavingCta(false)
    }
  }

  const addTestimonial = () => setSiteContent(p => ({ ...p, testimonials: [...p.testimonials, { id: Date.now(), name: 'اسم العميل', role: 'الدور', text: 'نص التقييم...', gender: 'male' }] }))
  const removeTestimonial = (id) => setSiteContent(p => ({ ...p, testimonials: p.testimonials.filter(t => t.id !== id) }))
  const updateTestimonial = (id, field, value) => setSiteContent(p => ({ ...p, testimonials: p.testimonials.map(t => t.id === id ? { ...t, [field]: value } : t) }))

  const addFaq = () => setSiteContent(p => ({ ...p, faqs: [...p.faqs, { id: Date.now(), q: 'السؤال...', a: 'الإجابة...' }] }))
  const removeFaq = (id) => setSiteContent(p => ({ ...p, faqs: p.faqs.filter(f => f.id !== id) }))
  const updateFaq = (id, field, value) => setSiteContent(p => ({ ...p, faqs: p.faqs.map(f => f.id === id ? { ...f, [field]: value } : f) }))

  const addService = () => setSiteContent(p => ({ ...p, services: [...(p.services || []), { id: Date.now(), title: 'خدمة جديدة', titleEn: 'New Service', icon: 'HomeWork', desc: 'وصف الخدمة...', descEn: 'Service description...' }] }))
  const removeService = (idx) => setSiteContent(p => ({ ...p, services: p.services.filter((_, i) => i !== idx) }))
  const updateService = (idx, field, value) => setSiteContent(p => ({ ...p, services: p.services.map((s, i) => i === idx ? { ...s, [field]: value } : s) }))

  const updatePlanPrice = (planId, val) => setSiteContent(p => ({ ...p, subscription_plans: p.subscription_plans.map(pl => pl.id === planId ? { ...pl, price: Number(val) } : pl) }))
  const updatePlanMaxListings = (planId, val) => setSiteContent(p => ({ ...p, subscription_plans: p.subscription_plans.map(pl => pl.id === planId ? { ...pl, maxListings: Number(val) } : pl) }))

  // ── Legal Content Helpers ────────────────────────────────────────────────
  const loadLegalContent = async () => {
    setLegalLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE}/settings`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      const s = data.settings || {}
      setLegalContent({
        terms_last_updated: s.terms_last_updated || '',
        terms_intro:        s.terms_intro        || '',
        terms_sections:     Array.isArray(s.terms_sections) ? s.terms_sections : [],
        privacy_last_updated: s.privacy_last_updated || '',
        privacy_intro:        s.privacy_intro        || '',
        privacy_sections:     Array.isArray(s.privacy_sections) ? s.privacy_sections : [],
        help_intro:        s.help_intro        || '',
        help_categories:   Array.isArray(s.help_categories) ? s.help_categories : [],
      })
    } catch { dispatch(showToast('فشل تحميل الصفحات القانونية')) }
    finally { setLegalLoading(false) }
  }

  const handleSaveLegalSection = async (keys) => {
    setSavingLegal(true)
    try {
      const settings = {}
      keys.forEach(k => { settings[k] = typeof legalContent[k] === 'object' ? JSON.stringify(legalContent[k]) : legalContent[k] })
      await settingsAPI.updateMany(settings)
      dispatch(showToast('تم الحفظ بنجاح ✅'))
    } catch { dispatch(showToast('فشل الحفظ')) }
    finally { setSavingLegal(false) }
  }

  const addTermsSection = () => setLegalContent(p => ({ ...p, terms_sections: [...p.terms_sections, { id: Date.now(), title: 'عنوان البند الجديد', content: 'محتوى البند...' }] }))
  const removeTermsSection = (id) => setLegalContent(p => ({ ...p, terms_sections: p.terms_sections.filter(s => s.id !== id) }))
  const updateTermsSection = (id, field, val) => setLegalContent(p => ({ ...p, terms_sections: p.terms_sections.map(s => s.id === id ? { ...s, [field]: val } : s) }))

  const addPrivacySection = () => setLegalContent(p => ({ ...p, privacy_sections: [...p.privacy_sections, { id: Date.now(), title: 'عنوان البند الجديد', content: 'محتوى البند...' }] }))
  const removePrivacySection = (id) => setLegalContent(p => ({ ...p, privacy_sections: p.privacy_sections.filter(s => s.id !== id) }))
  const updatePrivacySection = (id, field, val) => setLegalContent(p => ({ ...p, privacy_sections: p.privacy_sections.map(s => s.id === id ? { ...s, [field]: val } : s) }))

  const addHelpCategory = () => setLegalContent(p => ({ ...p, help_categories: [...p.help_categories, { id: Date.now(), title: 'فئة جديدة', icon: 'HelpOutline', color: '#6366f1', articles: [] }] }))
  const removeHelpCategory = (id) => setLegalContent(p => ({ ...p, help_categories: p.help_categories.filter(c => c.id !== id) }))
  const updateHelpCategory = (id, field, val) => setLegalContent(p => ({ ...p, help_categories: p.help_categories.map(c => c.id === id ? { ...c, [field]: val } : c) }))
  const addHelpArticle = (catId) => setLegalContent(p => ({ ...p, help_categories: p.help_categories.map(c => c.id === catId ? { ...c, articles: [...(c.articles||[]), { id: Date.now(), q: 'السؤال الجديد؟', a: 'الإجابة هنا...' }] } : c) }))
  const removeHelpArticle = (catId, artId) => setLegalContent(p => ({ ...p, help_categories: p.help_categories.map(c => c.id === catId ? { ...c, articles: c.articles.filter(a => a.id !== artId) } : c) }))
  const updateHelpArticle = (catId, artId, field, val) => setLegalContent(p => ({ ...p, help_categories: p.help_categories.map(c => c.id === catId ? { ...c, articles: c.articles.map(a => a.id === artId ? { ...a, [field]: val } : a) } : c) }))

  // ── Contact Messages Helpers ─────────────────────────────────────────────
  const loadContactMessages = async () => {
    setContactLoading(true)
    try {
      const data = await contactAPI.getMessages()
      setContactMessages(data.messages || [])
    } catch { dispatch(showToast('فشل تحميل الرسائل')) }
    finally { setContactLoading(false) }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await contactAPI.markAsRead(id)
      setContactMessages(prev => prev.map(m => m._id === id ? { ...m, read: true } : m))
    } catch { dispatch(showToast('فشل تحديث الحالة')) }
  }

  useEffect(() => { if (activeTab === 'content') loadSiteContent() }, [activeTab])
  useEffect(() => { if (activeTab === 'neighborhoods') loadNeighborhoods() }, [activeTab])
  useEffect(() => { if (activeTab === 'legal') loadLegalContent() }, [activeTab])
  useEffect(() => { if (activeTab === 'contacts') loadContactMessages() }, [activeTab])

  const heroSearchFiltered = properties.filter(p =>
    p.title?.includes(heroSearchQuery) || p.location?.includes(heroSearchQuery)
  )

  const [reports, setReports] = useState([])
  const [reportsLoading, setReportsLoading] = useState(false)
  const [teamMembers, setTeamMembers] = useState([])
  const [teamLoading, setTeamLoading] = useState(false)
  const [teamForm, setTeamForm] = useState({ name: '', nameEn: '', role: '', roleEn: '', bio: '', bioEn: '', image: '', order: 0, social: { linkedin: '', twitter: '', instagram: '', facebook: '', whatsapp: '' } })
  const [editingMember, setEditingMember] = useState(null)
  const [showTeamForm, setShowTeamForm] = useState(false)
  const [activities, setActivities] = useState([])
  const [activitiesLoading, setActivitiesLoading] = useState(false)

  const loadStats = async () => {
    setStatsLoading(true)
    try {
      const data = await adminAPI.getStats()
      setStats(data.stats)
    } catch {
      dispatch(showToast('فشل تحميل الإحصائيات'))
    } finally {
      setStatsLoading(false)
    }
  }

  const loadUsers = async () => {
    setUsersLoading(true)
    try {
      const data = await adminAPI.getUsers({ limit: 50 })
      setUsers(data.users || [])
    } catch {
      dispatch(showToast('فشل تحميل المستخدمين'))
    } finally {
      setUsersLoading(false)
    }
  }

  const loadProperties = async () => {
    setPropsLoading(true)
    try {
      const data = await adminAPI.getAllProperties({ limit: 50 })
      setProperties(data.properties || [])
    } catch {
      dispatch(showToast('فشل تحميل العقارات'))
    } finally {
      setPropsLoading(false)
    }
  }

  useEffect(() => { loadStats(); loadUsers(); loadProperties(); loadCategoriesAndCities() }, [])

  // ── User Actions ───────────────────────────────────────────
  const handleDeleteUser = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return
    try {
      await adminAPI.deleteUser(id)
      setUsers(prev => prev.filter(u => u.id !== id))
      dispatch(showToast('تم حذف المستخدم بنجاح'))
      loadStats()
    } catch (err) {
      dispatch(showToast(err.message || 'فشل حذف المستخدم'))
    }
  }

  const handleBlockUser = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, blocked: !u.blocked } : u))
    dispatch(showToast('تم تحديث حالة المستخدم'))
  }

  // ── ✅ Approve User ────────────────────────────────────────
  const handleApproveUser = async (id) => {
    try {
      const token = localStorage.getItem('token')
      await fetch(`${API_BASE}/admin/users/${id}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      setUsers(prev => prev.map(u => u.id === id ? { ...u, approved: true } : u))
      dispatch(showToast('تم قبول المستخدم بنجاح ✅'))
    } catch {
      dispatch(showToast('فشل قبول المستخدم'))
    }
  }

  const handleToggleVerify = async (id, currentVerified) => {
    try {
      const newVerified = !currentVerified
      await adminAPI.updatePropertyFlags(id, { verified: newVerified })
      setProperties(prev => prev.map(p => p.id === id ? { ...p, verified: newVerified } : p))
      dispatch(showToast(newVerified ? 'تم توثيق العقار ✅' : 'تم إلغاء توثيق العقار'))
    } catch (err) {
      dispatch(showToast(err.message || 'فشل تحديث التوثيق'))
    }
  }

  const handleDeleteProperty = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العقار؟')) return
    try {
      await propertiesAPI.delete(id)
      setProperties(prev => prev.filter(p => p.id !== id))
      dispatch(showToast('تم حذف العقار'))
      loadStats()
    } catch (err) {
      dispatch(showToast(err.message || 'فشل حذف العقار'))
    }
  }

  const loadCategoriesAndCities = async () => {
    try {
      const data = await propertiesAPI.getStats()
      setCategories(data.categories || [])
      setRegions(data.cities || [])
    } catch {}
  }

  const addCategory    = () => dispatch(showToast("الفئات ثابتة ومرتبطة بنوع العقار في قاعدة البيانات"))
  const toggleCategory = () => {}
  const deleteCategory = () => {}
  const addRegion      = () => dispatch(showToast("المناطق تُستخرج تلقائياً من العقارات المدخلة"))
  const toggleRegion   = () => {}
  const deleteRegion   = () => {}

  const handleLogout = () => { dispatch(logout()); navigate('/') }

  const STATS_CARDS = [
    { label: "المستخدمين", val: statsLoading ? '...' : stats?.totalUsers,      icon: <PeopleIcon />,              color: "bg-ink-500"    },
    { label: "العقارات",   val: statsLoading ? '...' : stats?.totalProperties,  icon: <ApartmentIcon />,           color: "bg-ink-500"  },
    { label: "البلاغات",  val: statsLoading ? '...' : (stats?.pendingContacts ?? 0), icon: <WarningAmberIcon />,  color: "bg-rose-600"    },
    { label: "الإيرادات", val: statsLoading ? '...' : `₪ ${(stats?.totalRevenue||0).toLocaleString()}`, icon: <AccountBalanceWalletIcon />, color: "bg-emerald-600" },
  ]

  const menu = [
    { id: "overview",      label: "نظرة عامة",        icon: <BarChartIcon /> },
    { id: "users",         label: "المستخدمين",        icon: <PeopleIcon /> },
    { id: "properties",    label: "العقارات",          icon: <HomeIcon /> },
    { id: "categories",    label: "الفئات والمناطق",   icon: <CategoryIcon /> },
    { id: "neighborhoods", label: "أبرز الأحياء",      icon: <LocationCityIcon /> },
    { id: "content",       label: "محتوى الموقع",      icon: <WebIcon /> },
    { id: "legal",         label: "الصفحات القانونية", icon: <GavelIcon /> },
    { id: "contacts",      label: "رسائل التواصل",     icon: <ContactPhoneIcon /> },
    { id: "newsletter",    label: "النشرة البريدية",   icon: <MarkEmailReadIcon /> },
    { id: "reports",       label: "البلاغات",          icon: <WarningAmberIcon /> },
    { id: "activity",      label: "النشاطات",          icon: <HistoryIcon /> },
    { id: "team",          label: "فريق العمل",        icon: <GroupsIcon /> },
  ]

  const filteredUsers      = users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  const filteredProperties = properties.filter(p => p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || p.location?.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row font-sans" dir="rtl">

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="w-full lg:w-80 bg-ink-500 text-white p-8 flex flex-col shrink-0 z-20 shadow-2xl">
        <div className="flex items-center gap-4 mb-12 bg-white/5 p-5 rounded-[2rem] border border-white/10">
          <div className="w-12 h-12 bg-gradient-to-tr from-brass-light to-ink-600 rounded-2xl flex items-center justify-center shadow-lg">
            <AdminPanelSettingsIcon sx={{ fontSize: 28 }} />
          </div>
          <div>
            <div className="font-black text-lg tracking-tight">لوحة التحكم</div>
            <div className="text-[10px] font-bold text-brass-light uppercase tracking-widest text-left">Admin Panel</div>
          </div>
        </div>
        <nav className="flex-1 space-y-3">
          {menu.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black transition-all duration-300 ${
                activeTab === item.id ? "bg-ink-500 text-white shadow-xl shadow-ink-700/40" : "text-ink-50 hover:bg-white/5 hover:text-white"
              }`}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <button onClick={handleLogout} className="mt-8 flex items-center justify-center gap-4 px-5 py-4 rounded-2xl text-sm font-black bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
          <LogoutIcon sx={{ fontSize: 18 }} /> خروج
        </button>
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <main className="flex-1 p-6 lg:p-12 overflow-y-auto">

        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div className="relative flex-1 max-w-md">
            <SearchIcon sx={{ fontSize: 20, color: '#94a3b8', position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)' }} />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="ابحث عن مستخدم أو عقار..."
              className="w-full bg-white border border-cream-300 rounded-2xl py-4 pr-12 pl-6 text-sm font-bold shadow-sm focus:border-brass focus:ring-4 focus:ring-brass/5 outline-none transition-all text-right" />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs font-black text-ink-500 uppercase">{user?.name || 'Admin'}</div>
              <div className="text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-1">
                <GppGoodIcon sx={{ fontSize: 12 }} /> Verified Admin
              </div>
            </div>
            <div className="w-14 h-14 bg-cream-300 rounded-2xl border-4 border-white shadow-md overflow-hidden">
              <img loading="lazy" src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=0f172a&color=fff`} alt="admin" />
            </div>
          </div>
        </header>

        {/* ══ 1. OVERVIEW ══════════════════════════════════════ */}
        {activeTab === "overview" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
              {STATS_CARDS.map((s, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-cream-200 shadow-sm hover:shadow-xl transition-all group">
                  <div className={`w-14 h-14 ${s.color} text-white rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform`}>{s.icon}</div>
                  <div className="text-ink-50 text-[10px] font-black uppercase tracking-widest mb-1">{s.label}</div>
                  <div className="text-3xl font-black text-ink-500 tracking-tight">{s.val}</div>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-cream-200 shadow-sm">
                <h3 className="font-black text-ink-500 mb-4">إجمالي المستخدمين حسب النوع</h3>
                <div className="space-y-3">
                  {[
                    { label: 'عملاء', count: users.filter(u=>u.role==='CLIENT').length, color: 'bg-brass' },
                    { label: 'مدراء', count: users.filter(u=>u.role==='ADMIN').length,  color: 'bg-rose-500' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <div className="flex-1 text-sm font-bold text-ink-200">{item.label}</div>
                      <div className="font-black text-ink-500">{item.count}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-cream-200 shadow-sm">
                <h3 className="font-black text-ink-500 mb-4">حالة العقارات</h3>
                <div className="space-y-3">
                  {[
                    { label: 'نشط',    count: properties.filter(p=>p.status==='active').length,   color: 'bg-emerald-500' },
                    { label: 'انتظار', count: properties.filter(p=>p.status==='pending').length,  color: 'bg-amber-500' },
                    { label: 'مجمد',   count: properties.filter(p=>p.status==='inactive').length, color: 'bg-ink-50' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <div className="flex-1 text-sm font-bold text-ink-200">{item.label}</div>
                      <div className="font-black text-ink-500">{item.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ 2. USERS ══════════════════════════════════════════ */}
        {activeTab === "users" && (
          <div className="bg-white rounded-[3rem] border border-cream-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
            <div className="p-8 border-b border-cream-100 flex justify-between items-center bg-cream-100/50">
              <div>
                <h3 className="font-black text-ink-500">قائمة الأعضاء ({filteredUsers.length})</h3>
                <p className="text-[11px] text-ink-50 font-bold mt-1">
                  بانتظار الموافقة: {users.filter(u => !u.approved && u.role !== 'ADMIN').length}
                </p>
              </div>
              <button onClick={loadUsers} className="text-xs font-black text-ink-500 hover:underline">تحديث</button>
            </div>
            {usersLoading ? (
              <div className="p-16 text-center text-ink-50 font-bold">جاري التحميل...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="text-ink-50 text-[10px] font-black uppercase tracking-widest border-b border-cream-100">
                      <th className="px-10 py-6">المستخدِم</th>
                      <th className="px-10 py-6">الرتبة</th>
                      <th className="px-10 py-6">الحالة</th>
                      <th className="px-10 py-6">الاشتراك</th>
                      <th className="px-10 py-6">تاريخ التسجيل</th>
                      <th className="px-10 py-6 text-center">التحكم</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-100">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className={`hover:bg-cream-100/50 transition-colors ${u.blocked ? 'opacity-50' : ''}`}>
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 bg-cream-200 rounded-2xl overflow-hidden">
                              <img loading="lazy" src={`https://ui-avatars.com/api/?name=${u.name}&background=e2e8f0&color=0f172a&size=44`} alt="" />
                            </div>
                            <div>
                              <div className="text-sm font-black text-ink-400">{u.name}</div>
                              <div className="text-[10px] text-ink-50 font-bold">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <span className={`text-[9px] font-black px-3 py-1.5 rounded-xl ${
                            u.role === 'ADMIN' ? 'bg-rose-100 text-rose-600' : 'bg-cream-200 text-ink-200'
                          }`}>{u.role}</span>
                        </td>
                        {/* ── ✅ عمود الحالة — جديد ── */}
                        <td className="px-10 py-6">
                          {u.role === 'ADMIN' ? (
                            <span className="text-[9px] font-black px-3 py-1.5 rounded-xl bg-rose-100 text-rose-600">أدمن</span>
                          ) : u.approved ? (
                            <span className="text-[9px] font-black px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-600">مفعّل</span>
                          ) : (
                            <span className="text-[9px] font-black px-3 py-1.5 rounded-xl bg-amber-100 text-amber-600">بانتظار الموافقة</span>
                          )}
                        </td>
                        <td className="px-10 py-6"><span className="text-[9px] font-black text-ink-100">{u.subscription?.plan || 'FREE'}</span></td>
                        <td className="px-10 py-6 text-[10px] text-ink-50 font-bold">{new Date(u.createdAt).toLocaleDateString('ar')}</td>
                        <td className="px-10 py-6">
                          <div className="flex justify-center gap-3">
                            {/* ── ✅ زر الموافقة — يظهر فقط إذا مش approved ── */}
                            {!u.approved && u.role !== 'ADMIN' && (
                              <button onClick={() => handleApproveUser(u.id)}
                                className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"
                                title="قبول المستخدم">
                                <CheckCircleIcon sx={{ fontSize: 16 }} />
                              </button>
                            )}
                            <button onClick={() => handleBlockUser(u.id)}
                              className={`p-2.5 rounded-xl transition-all ${u.blocked ? 'bg-emerald-50 text-emerald-500 hover:bg-emerald-100' : 'bg-amber-50 text-amber-500 hover:bg-amber-100'}`}>
                              <BlockIcon sx={{ fontSize: 16 }} />
                            </button>
                            <button onClick={() => handleDeleteUser(u.id)}
                              className="p-2.5 bg-cream-100 text-ink-50 rounded-xl hover:bg-rose-600 hover:text-white transition-all">
                              <DeleteIcon sx={{ fontSize: 16 }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ══ 3. PROPERTIES ════════════════════════════════════ */}
        {activeTab === "properties" && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-ink-500 text-xl">العقارات ({filteredProperties.length})</h3>
              <button onClick={loadProperties} className="text-xs font-black text-ink-500 hover:underline">تحديث</button>
            </div>
            {propsLoading ? (
              <div className="py-16 text-center text-ink-50 font-bold">جاري التحميل...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProperties.map(p => (
                  <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border border-cream-200 shadow-sm hover:shadow-xl transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-14 h-14 bg-cream-100 rounded-2xl overflow-hidden">
                        {p.images?.[0] ? (
                          <img loading="lazy" src={p.images[0].startsWith('http') ? p.images[0] : `http://localhost:5000${p.images[0]}`} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">{p.emoji || '🏠'}</div>
                        )}
                      </div>
                      <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase ${
                        p.status === 'active' ? 'bg-emerald-100 text-emerald-600' :
                        p.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-cream-200 text-ink-100'
                      }`}>{p.status === 'active' ? 'نشط' : p.status === 'pending' ? 'انتظار' : p.status}</span>
                    </div>
                    <h4 className="font-black text-ink-500 mb-1 text-sm">{p.title}</h4>
                    <p className="text-[11px] text-ink-50 font-bold mb-4">{p.location}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-cream-100">
                      <span className="text-sm font-black text-ink-500">₪ {p.price?.toLocaleString()}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleVerify(p.id, p.verified)}
                          className={`p-2 rounded-xl transition-all ${p.verified ? 'bg-emerald-500 text-white hover:bg-cream-200 hover:text-ink-50' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}
                          title={p.verified ? 'إلغاء التوثيق' : 'توثيق العقار'}>
                          <CheckCircleIcon sx={{ fontSize: 20 }} />
                        </button>
                        <button onClick={() => handleDeleteProperty(p.id)}
                          className="p-2 bg-cream-100 text-ink-50 rounded-xl hover:bg-rose-600 hover:text-white transition-all">
                          <DeleteIcon sx={{ fontSize: 20 }} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ 4. CATEGORIES & REGIONS ══════════════════════════ */}
        {activeTab === "categories" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-cream-200 border border-cream-300 rounded-2xl px-5 py-3 text-sm font-bold text-ink-600">
              ℹ️ الفئات والمناطق تُستخرج تلقائياً من العقارات المدخلة في قاعدة البيانات — الأرقام حقيقية ومحدّثة.
            </div>
            <div className="grid md:grid-cols-2 gap-8">

              {/* CATEGORIES */}
              <div className="bg-white rounded-[2.5rem] border border-cream-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-cream-100 flex items-center justify-between bg-cream-100/30">
                  <div className="flex items-center gap-3"><CategoryIcon className="text-brass" /><h3 className="font-black text-ink-500">فئات العقارات</h3></div>
                  <span className="bg-cream-300 text-ink-500 text-[10px] font-black px-3 py-1 rounded-xl">{categories.length} فئة</span>
                </div>
                <div className="divide-y divide-cream-100">
                  {categories.length === 0 ? (
                    <div className="py-10 text-center text-ink-50 font-bold text-sm">جاري التحميل...</div>
                  ) : categories.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-4 hover:bg-cream-100/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cream-200 rounded-2xl flex items-center justify-center text-lg">{c.icon}</div>
                        <div>
                          <div className="font-black text-ink-500 text-sm">{c.name}</div>
                          <div className="text-[10px] text-ink-50 font-bold">{c.nameEn}</div>
                        </div>
                      </div>
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black ${c.count > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-cream-200 text-ink-50'}`}>
                        {c.count} عقار
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CITIES */}
              <div className="bg-white rounded-[2.5rem] border border-cream-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-cream-100 flex items-center justify-between bg-cream-100/30">
                  <div className="flex items-center gap-3"><LocationCityIcon className="text-brass" /><h3 className="font-black text-ink-500">المناطق والمدن</h3></div>
                  <span className="bg-cream-300 text-ink-500 text-[10px] font-black px-3 py-1 rounded-xl">{regions.length} منطقة</span>
                </div>
                <div className="divide-y divide-cream-100">
                  {regions.length === 0 ? (
                    <div className="py-10 text-center text-ink-50 font-bold text-sm">جاري التحميل...</div>
                  ) : regions.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-4 hover:bg-cream-100/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cream-200 rounded-2xl flex items-center justify-center">
                          <LocationCityIcon sx={{ fontSize: 18, color: '#6366f1' }} />
                        </div>
                        <div className="font-black text-ink-500 text-sm">{r.name}</div>
                      </div>
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black ${r.count > 0 ? 'bg-cream-300 text-ink-500' : 'bg-cream-200 text-ink-50'}`}>
                        {r.count} عقار
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ══ 5. NEIGHBORHOODS ═════════════════════════════════ */}
        {activeTab === "neighborhoods" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-[2.5rem] border border-cream-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-cream-100 bg-cream-200/30 flex items-center justify-between">
                  <div className="flex items-center gap-3"><LocationCityIcon className="text-brass" /><h3 className="font-black text-ink-500">{nbEditId ? 'تعديل الحي' : 'إضافة حي مميز'}</h3></div>
                  {nbEditId && (
                    <button onClick={() => { setNbEditId(null); setNbForm({ city:'',cityEn:'',neighborhood:'',neighborhoodEn:'',tag:'',tagEn:'',emoji:'🏘️',gradient:'linear-gradient(135deg,#1a3a5c,#0D2B45)',image:'' }); setNbImagePreview(''); setNbImageFile(null) }}
                      className="text-xs text-ink-50 hover:text-rose-500 font-black">إلغاء التعديل</button>
                  )}
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="text-xs font-black text-ink-100 mb-2 block">صورة الحي</label>
                    <div className="flex gap-3 items-center">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-cream-200 flex items-center justify-center flex-shrink-0 border border-cream-300">
                        {nbImagePreview ? <img loading="lazy" src={nbImagePreview} className="w-full h-full object-cover" alt="" /> : <span className="text-2xl">{nbForm.emoji || '🏘️'}</span>}
                      </div>
                      <label className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 bg-cream-100 border border-dashed border-cream-400 rounded-2xl px-4 py-3 hover:border-brass-light hover:bg-cream-200/30 transition-all">
                          <CloudUploadIcon sx={{ fontSize: 18 }} className="text-ink-50" />
                          <span className="text-sm font-bold text-ink-100">ارفع صورة للحي</span>
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={handleNbImageChange} />
                      </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key:'city',            label:'المدينة *',        dir:'rtl', placeholder:'مثال: نابلس' },
                      { key:'cityEn',          label:'City (EN)',         dir:'ltr', placeholder:'Nablus' },
                      { key:'neighborhood',    label:'الحي *',           dir:'rtl', placeholder:'مثال: رفيديا' },
                      { key:'neighborhoodEn',  label:'Neighborhood (EN)', dir:'ltr', placeholder:'Rafidya' },
                      { key:'tag',             label:'التاغ (عربي)',      dir:'rtl', placeholder:'راقي' },
                      { key:'tagEn',           label:'Tag (EN)',          dir:'ltr', placeholder:'Upscale' },
                    ].map(({ key, label, dir, placeholder }) => (
                      <div key={key}>
                        <label className="text-xs font-black text-ink-50 mb-1 block">{label}</label>
                        <input value={nbForm[key]} onChange={e => setNbForm(p => ({...p, [key]: e.target.value}))}
                          placeholder={placeholder} dir={dir}
                          className="w-full bg-cream-100 border border-cream-200 rounded-2xl px-3 py-2.5 text-sm font-bold outline-none focus:border-brass-light" />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-black text-ink-50 mb-1 block">الإيموجي</label>
                      <input value={nbForm.emoji} onChange={e => setNbForm(p => ({...p, emoji: e.target.value}))}
                        className="w-full bg-cream-100 border border-cream-200 rounded-2xl px-3 py-2.5 text-sm font-bold outline-none focus:border-brass-light text-center" />
                    </div>
                    <div>
                      <label className="text-xs font-black text-ink-50 mb-1 block">Gradient</label>
                      <input value={nbForm.gradient} onChange={e => setNbForm(p => ({...p, gradient: e.target.value}))}
                        className="w-full bg-cream-100 border border-cream-200 rounded-2xl px-3 py-2.5 text-xs font-bold outline-none focus:border-brass-light" dir="ltr" />
                    </div>
                  </div>
                  <button onClick={handleNbSave} disabled={nbSaving}
                    className="w-full bg-ink-500 hover:bg-ink-600 disabled:opacity-60 text-white font-black py-3 rounded-2xl flex items-center justify-center gap-2 transition-all">
                    <SaveIcon sx={{ fontSize: 18 }} />
                    {nbSaving ? 'جاري الحفظ...' : (nbEditId ? 'حفظ التعديلات' : 'إضافة الحي')}
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-[2.5rem] border border-cream-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-cream-100 bg-cream-100/30 flex items-center justify-between">
                  <div className="flex items-center gap-3"><LocationCityIcon className="text-ink-100" /><h3 className="font-black text-ink-500">الأحياء المميزة</h3></div>
                  <span className="bg-cream-300 text-ink-500 text-[10px] font-black px-3 py-1 rounded-xl">{featuredNeighborhoods.filter(n => n.active).length} نشط</span>
                </div>
                {nbLoading ? (
                  <div className="py-12 text-center text-ink-50 font-bold">جاري التحميل...</div>
                ) : featuredNeighborhoods.length === 0 ? (
                  <div className="py-12 text-center text-ink-50 font-bold">
                    <LocationCityIcon sx={{ fontSize: 36, opacity: 0.3 }} />
                    <p className="mt-2">لا توجد أحياء مميزة بعد</p>
                  </div>
                ) : (
                  <div className="divide-y divide-cream-100 max-h-[520px] overflow-y-auto">
                    {featuredNeighborhoods.map(n => (
                      <div key={n.id} className="flex items-center gap-3 p-4 hover:bg-cream-100/50">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0" style={{ background: n.gradient || 'linear-gradient(135deg,#1a3a5c,#0D2B45)' }}>
                          {n.image ? <img loading="lazy" src={n.image.startsWith('http') ? n.image : `http://localhost:5000${n.image}`} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-xl">{n.emoji || '🏘️'}</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-black text-ink-500 text-sm truncate">{n.neighborhood}</div>
                          <div className="text-[10px] text-ink-50 font-bold">{n.city} · {n.count ?? 0} إعلان</div>
                          {n.tag && <span className="text-[9px] bg-cream-200 text-brass font-black px-2 py-0.5 rounded-xl">{n.tag}</span>}
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleNbToggle(n)}
                            className={`px-2 py-1 rounded-xl text-[9px] font-black ${n.active ? 'bg-emerald-100 text-emerald-600' : 'bg-cream-200 text-ink-50'}`}>
                            {n.active ? 'نشط' : 'مخفي'}
                          </button>
                          <button onClick={() => handleNbEdit(n)} className="p-1.5 text-ink-50 hover:text-ink-500 hover:bg-cream-200 rounded-xl transition-all">
                            <EditIcon sx={{ fontSize: 15 }} />
                          </button>
                          <button onClick={() => handleNbDelete(n.id)} className="p-1.5 text-ink-50 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                            <DeleteIcon sx={{ fontSize: 15 }} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══ 6. SITE CONTENT ══════════════════════════════════ */}
        {activeTab === "content" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {contentLoading ? (
              <div className="py-16 text-center text-ink-50 font-bold">جاري تحميل الإعدادات...</div>
            ) : (
              <>
                {/* ── LOGO ── */}
                <div className="bg-white rounded-[2.5rem] border border-cream-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-cream-100 flex items-center justify-between bg-cream-100/40">
                    <div className="flex items-center gap-3">
                      <ImageIcon sx={{ color: '#6366f1' }} />
                      <div><h3 className="font-black text-ink-500">شعار الموقع (اللوجو)</h3><p className="text-[11px] text-ink-50 font-bold">PNG أو SVG بخلفية شفافة</p></div>
                    </div>
                    <button onClick={handleSaveLogo} disabled={savingLogo || !logoFile}
                      className="flex items-center gap-2 bg-ink-500 disabled:bg-cream-300 disabled:text-ink-50 text-white text-xs font-black px-4 py-2 rounded-xl hover:bg-ink-600 transition-all">
                      <SaveIcon sx={{ fontSize: 16 }} /> {savingLogo ? 'جاري الرفع...' : 'حفظ اللوجو'}
                    </button>
                  </div>
                  <div className="p-6 flex items-center gap-6">
                    <div className="w-32 h-32 rounded-3xl border-2 border-dashed border-cream-300 bg-cream-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {logoPreview ? <img loading="lazy" src={logoPreview} alt="logo" className="w-full h-full object-contain p-2" /> : <div className="text-center text-cream-400"><ImageIcon sx={{ fontSize: 40 }} /><p className="text-[10px] font-black mt-1">لا يوجد لوجو</p></div>}
                    </div>
                    <div className="flex-1 space-y-3">
                      <label className="block cursor-pointer">
                        <div className="flex items-center gap-3 bg-cream-100 border border-dashed border-cream-400 rounded-2xl px-5 py-4 hover:border-brass-light hover:bg-cream-200/20 transition-all">
                          <CloudUploadIcon sx={{ fontSize: 22 }} className="text-ink-50" />
                          <div><p className="text-sm font-black text-ink-300">{logoFile ? logoFile.name : 'اختر ملف اللوجو'}</p><p className="text-[10px] text-ink-50 font-bold">PNG, SVG, WEBP — أقل من 2MB</p></div>
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoFileChange} />
                      </label>
                      {siteContent.logo_url && (
                        <div className="flex items-center gap-2 text-[11px] text-emerald-600 font-black bg-emerald-50 px-3 py-2 rounded-xl">
                          <CheckCircleIcon sx={{ fontSize: 14 }} /> لوجو محفوظ: {siteContent.logo_url.split('/').pop()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── HERO TEXT ── */}
                <div className="bg-white rounded-[2.5rem] border border-cream-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-cream-100 flex items-center justify-between bg-violet-50/40">
                    <div className="flex items-center gap-3">
                      <TitleIcon sx={{ color: '#7c3aed' }} />
                      <div><h3 className="font-black text-ink-500">نصوص قسم الهيدر</h3><p className="text-[11px] text-ink-50 font-bold">العنوان الرئيسي · الشارة · زر البحث</p></div>
                    </div>
                    <button onClick={handleSaveHero} disabled={savingHero}
                      className="flex items-center gap-2 bg-violet-600 disabled:bg-cream-400 text-white text-xs font-black px-4 py-2 rounded-xl hover:bg-violet-700 transition-all">
                      <SaveIcon sx={{ fontSize: 16 }} /> {savingHero ? 'جاري الحفظ...' : 'حفظ الهيدر'}
                    </button>
                  </div>
                  <div className="p-6 grid md:grid-cols-2 gap-4">
                    {[
                      { key: 'hero_badge',                  label: 'الشارة (عربي)',               dir: 'rtl' },
                      { key: 'hero_badge_en',               label: 'Badge (EN)',                   dir: 'ltr' },
                      { key: 'hero_title_line1',            label: 'السطر الأول (عربي)',            dir: 'rtl' },
                      { key: 'hero_title_line1_en',         label: 'Line 1 (EN)',                  dir: 'ltr' },
                      { key: 'hero_title_line2',            label: 'السطر المميز (عربي)',           dir: 'rtl' },
                      { key: 'hero_title_line2_en',         label: 'Accent line (EN)',             dir: 'ltr' },
                      { key: 'hero_title_line3',            label: 'السطر الثالث (عربي)',           dir: 'rtl' },
                      { key: 'hero_title_line3_en',         label: 'Line 3 (EN)',                  dir: 'ltr' },
                      { key: 'hero_subtitle',               label: 'النص التوضيحي (عربي)',          dir: 'rtl' },
                      { key: 'hero_subtitle_en',            label: 'Subtitle (EN)',                dir: 'ltr' },
                      { key: 'hero_search_placeholder',     label: 'Placeholder البحث (عربي)',     dir: 'rtl' },
                      { key: 'hero_search_placeholder_en',  label: 'Search placeholder (EN)',      dir: 'ltr' },
                      { key: 'hero_search_btn',             label: 'زر البحث (عربي)',              dir: 'rtl' },
                      { key: 'hero_search_btn_en',          label: 'Search button (EN)',           dir: 'ltr' },
                    ].map(({ key, label, dir }) => (
                      <div key={key}>
                        <label className="text-[10px] font-black text-ink-50 uppercase block mb-1">{label}</label>
                        <input value={siteContent[key] || ''} onChange={e => setSiteContent(p => ({ ...p, [key]: e.target.value }))}
                          dir={dir} className="w-full bg-cream-100 border border-cream-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-violet-400 transition-all" />
                      </div>
                    ))}
                  </div>
                  <div className="mx-6 mb-6 rounded-3xl bg-ink-600 p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }} />
                    <div className="relative z-10">
                      <div className="inline-flex items-center gap-2 bg-brass/10 border border-brass-light/20 px-4 py-2 rounded-full text-brass-light text-xs font-black mb-5 uppercase">
                        <EmojiEventsIcon sx={{ fontSize: 14 }} />{siteContent.hero_badge}
                      </div>
                      <h1 className="text-xl font-black text-white mb-0.5">{siteContent.hero_title_line1}</h1>
                      <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-l from-brass-light to-brass-light mb-0.5">{siteContent.hero_title_line2}</h1>
                      <h1 className="text-xl font-black text-white mb-4">{siteContent.hero_title_line3}</h1>
                      <p className="text-ink-50 text-xs mb-5 max-w-sm mx-auto">{siteContent.hero_subtitle}</p>
                      <div className="flex gap-2 justify-center max-w-sm mx-auto">
                        <div className="flex-1 bg-ink-400/80 border border-ink-300 text-ink-50 text-xs px-4 py-2.5 rounded-xl text-right">{siteContent.hero_search_placeholder}</div>
                        <div className="bg-ink-500 text-white text-xs font-black px-5 py-2.5 rounded-xl whitespace-nowrap">{siteContent.hero_search_btn}</div>
                      </div>
                      <p className="text-ink-200 text-[10px] mt-3 font-black uppercase tracking-widest">— LIVE PREVIEW —</p>
                    </div>
                  </div>
                </div>

                {/* ── HERO PROPERTY ── */}
                <div className="bg-white rounded-[2.5rem] border border-cream-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-cream-100 flex items-center justify-between bg-amber-50/30">
                    <div className="flex items-center gap-3"><StarIcon className="text-amber-500" /><h3 className="font-black text-ink-500">عقار Hero (الواجهة الرئيسية)</h3></div>
                    <span className="text-[10px] font-black text-amber-600 bg-amber-100 px-3 py-1 rounded-xl">مسؤول: الأدمن</span>
                  </div>
                  <div className="p-6 space-y-4">
                    <p className="text-xs text-ink-50 font-bold">اختر العقار الذي سيظهر كبطاقة مميزة في الصفحة الرئيسية</p>
                    <input value={heroSearchQuery} onChange={e => setHeroSearchQuery(e.target.value)}
                      placeholder="ابحث عن عقار..." className="w-full bg-cream-100 border border-cream-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-brass" />
                    {siteContent.hero_property_id && (
                      <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                        <StarIcon className="text-amber-500" sx={{ fontSize: 20 }} />
                        <span className="text-sm font-black text-amber-700">العقار الحالي: #{siteContent.hero_property_id}</span>
                        <button onClick={() => handleSaveContent('hero_property_id', '')} className="mr-auto text-xs text-rose-500 font-black hover:underline">إزالة</button>
                      </div>
                    )}
                    <div className="max-h-60 overflow-y-auto space-y-2 border border-cream-200 rounded-2xl p-3">
                      {(heroSearchQuery ? heroSearchFiltered : properties).slice(0, 15).map(p => (
                        <div key={p.id} onClick={() => handleSaveContent('hero_property_id', String(p.id))}
                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                            siteContent.hero_property_id === String(p.id) ? 'bg-amber-100 border border-amber-300' : 'hover:bg-cream-100 border border-transparent'
                          }`}>
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-cream-200 flex-shrink-0">
                            {p.images?.[0] ? <img loading="lazy" src={p.images[0].startsWith('http') ? p.images[0] : `http://localhost:5000${p.images[0]}`} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-lg">{p.emoji || '🏠'}</div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-black text-ink-500 truncate">{p.title}</div>
                            <div className="text-[10px] text-ink-50 font-bold">{p.location} · ₪{p.price?.toLocaleString()}</div>
                          </div>
                          {siteContent.hero_property_id === String(p.id) && <StarIcon className="text-amber-500" sx={{ fontSize: 18 }} />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── ABOUT ── */}
                <div className="bg-white rounded-[2.5rem] border border-cream-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-cream-100 flex items-center justify-between bg-cream-200/30">
                    <div className="flex items-center gap-3">
                      <GroupsIcon sx={{ color: '#2563eb' }} />
                      <div>
                        <h3 className="font-black text-ink-500">قسم "نحن نوفر لك المكان المثالي"</h3>
                        <p className="text-[11px] text-ink-50 font-bold">الصورة · سنوات الخبرة · العنوان · النص · النقاط الثلاث</p>
                      </div>
                    </div>
                    <button onClick={handleSaveAbout} disabled={savingAbout}
                      className="flex items-center gap-2 bg-ink-500 disabled:bg-cream-400 text-white text-xs font-black px-4 py-2 rounded-xl hover:bg-ink-600 transition-all">
                      <SaveIcon sx={{ fontSize: 16 }} />
                      {savingAbout ? (savingAboutImage ? 'جاري رفع الصورة...' : 'جاري الحفظ...') : 'حفظ القسم'}
                    </button>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="bg-cream-100 rounded-2xl p-4 border border-cream-200">
                      <label className="text-[10px] font-black text-ink-100 uppercase mb-3 flex items-center gap-2 block">
                        <ImageIcon sx={{ fontSize: 14 }} /> صورة قسم "نحن نوفر لك"
                      </label>
                      <div className="flex gap-4 items-center">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-cream-300 flex-shrink-0 border border-cream-300">
                          {(aboutImagePreview || siteContent.about_image) ? (
                            <img loading="lazy" src={aboutImagePreview || (siteContent.about_image?.startsWith('http') ? siteContent.about_image : `http://localhost:5000${siteContent.about_image}`)} className="w-full h-full object-cover" alt="about preview" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-ink-50"><ImageIcon sx={{ fontSize: 32 }} /></div>
                          )}
                        </div>
                        <label className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-3 bg-white border border-dashed border-cream-400 rounded-2xl px-4 py-3 hover:border-brass-light hover:bg-cream-200/20 transition-all">
                            <CloudUploadIcon sx={{ fontSize: 20 }} className="text-ink-50" />
                            <div>
                              <p className="text-sm font-black text-ink-300">{aboutImageFile ? aboutImageFile.name : 'ارفع صورة القسم'}</p>
                              <p className="text-[10px] text-ink-50 font-bold">PNG, JPG, WEBP — أقل من 5MB</p>
                            </div>
                          </div>
                          <input type="file" accept="image/*" className="hidden" onChange={e => { const file = e.target.files[0]; if (!file) return; setAboutImageFile(file); setAboutImagePreview(URL.createObjectURL(file)) }} />
                        </label>
                      </div>
                      {siteContent.about_image && !aboutImageFile && (
                        <div className="flex items-center gap-2 text-[11px] text-emerald-600 font-black bg-emerald-50 px-3 py-2 rounded-xl mt-3">
                          <CheckCircleIcon sx={{ fontSize: 14 }} /> صورة محفوظة حالياً
                        </div>
                      )}
                      {aboutImageFile && (
                        <div className="flex items-center gap-2 text-[11px] text-ink-500 font-black bg-cream-200 px-3 py-2 rounded-xl mt-3">
                          <CloudUploadIcon sx={{ fontSize: 14 }} /> صورة جديدة جاهزة للرفع — اضغط "حفظ القسم"
                        </div>
                      )}
                    </div>
                    <div className="bg-cream-100 rounded-2xl p-4 border border-cream-200">
                      <label className="text-[10px] font-black text-ink-100 uppercase mb-3 flex items-center gap-2 block">
                        <EmojiEventsIcon sx={{ fontSize: 14 }} /> بطاقة سنوات الخبرة (الزرقاء)
                      </label>
                      <div className="grid md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] font-black text-ink-50 block mb-1">الرقم (سنوات)</label>
                          <input value={siteContent.about_experience_years || ''} onChange={e => setSiteContent(p => ({ ...p, about_experience_years: e.target.value }))} placeholder="15" className="w-full bg-white border border-cream-200 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:border-brass-light text-center" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-ink-50 block mb-1">النص (عربي)</label>
                          <input value={siteContent.about_experience_text || ''} onChange={e => setSiteContent(p => ({ ...p, about_experience_text: e.target.value }))} dir="rtl" placeholder="نقدم أفضل الحلول العقارية..." className="w-full bg-white border border-cream-200 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:border-brass-light" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-ink-50 block mb-1">Text (EN)</label>
                          <input value={siteContent.about_experience_text_en || ''} onChange={e => setSiteContent(p => ({ ...p, about_experience_text_en: e.target.value }))} dir="ltr" placeholder="Providing the best solutions..." className="w-full bg-white border border-cream-200 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:border-brass-light" />
                        </div>
                      </div>
                      <div className="mt-3 bg-ink-500 p-4 rounded-2xl text-white w-fit">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center"><EmojiEventsIcon sx={{ fontSize: 18 }} /></div>
                          <div>
                            <div className="text-xl font-black">+{siteContent.about_experience_years || '15'}</div>
                            <div className="text-[10px] font-bold uppercase opacity-80">سنة خبرة</div>
                          </div>
                        </div>
                        <p className="text-xs opacity-90 max-w-[200px] leading-relaxed">{siteContent.about_experience_text || 'نقدم أفضل الحلول العقارية...'}</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-ink-50 uppercase block mb-1">العنوان (عربي) — استخدم &lt;strong&gt; للكلمة المميزة بالأزرق</label>
                        <input value={siteContent.about_title || ''} onChange={e => setSiteContent(p => ({ ...p, about_title: e.target.value }))} dir="rtl" className="w-full bg-cream-100 border border-cream-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-brass-light transition-all" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-ink-50 uppercase block mb-1">Title (EN) — use &lt;strong&gt; for blue accent</label>
                        <input value={siteContent.about_title_en || ''} onChange={e => setSiteContent(p => ({ ...p, about_title_en: e.target.value }))} dir="ltr" className="w-full bg-cream-100 border border-cream-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-brass-light transition-all" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-ink-50 uppercase block mb-1">النص التوضيحي (عربي)</label>
                        <textarea value={siteContent.about_subtitle || ''} onChange={e => setSiteContent(p => ({ ...p, about_subtitle: e.target.value }))} dir="rtl" rows={3} className="w-full bg-cream-100 border border-cream-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-brass-light transition-all resize-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-ink-50 uppercase block mb-1">Subtitle (EN)</label>
                        <textarea value={siteContent.about_subtitle_en || ''} onChange={e => setSiteContent(p => ({ ...p, about_subtitle_en: e.target.value }))} dir="ltr" rows={3} className="w-full bg-cream-100 border border-cream-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-brass-light transition-all resize-none" />
                      </div>
                    </div>
                    {[1, 2, 3].map(n => (
                      <div key={n} className="bg-cream-100 rounded-2xl p-4 border border-cream-200">
                        <div className="flex items-center gap-2 mb-3">
                          {n === 1 && <VerifiedUserIcon sx={{ fontSize: 18, color: '#2563eb' }} />}
                          {n === 2 && <GroupsIcon sx={{ fontSize: 18, color: '#2563eb' }} />}
                          {n === 3 && <PublicIcon sx={{ fontSize: 18, color: '#2563eb' }} />}
                          <p className="text-[10px] font-black text-ink-100 uppercase">النقطة {n}</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          {[
                            { key: `about_point${n}_title`,    label: 'العنوان (عربي)', dir: 'rtl' },
                            { key: `about_point${n}_title_en`, label: 'Title (EN)',      dir: 'ltr' },
                            { key: `about_point${n}_desc`,     label: 'الوصف (عربي)',   dir: 'rtl' },
                            { key: `about_point${n}_desc_en`,  label: 'Description (EN)', dir: 'ltr' },
                          ].map(({ key, label, dir }) => (
                            <div key={key}>
                              <label className="text-[10px] font-black text-ink-50 block mb-1">{label}</label>
                              <input value={siteContent[key] || ''} onChange={e => setSiteContent(p => ({ ...p, [key]: e.target.value }))} dir={dir} className="w-full bg-white border border-cream-200 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:border-brass-light transition-all" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="rounded-3xl bg-cream-100 border border-cream-200 p-6">
                      <p className="text-[10px] font-black text-ink-50 uppercase tracking-widest mb-3 text-center">— معاينة العنوان —</p>
                      <h2 className="text-2xl font-black text-ink-500 mb-2 text-right" dangerouslySetInnerHTML={{ __html: (siteContent.about_title || '').replace(/<strong>/g, '<span style="color:#2563eb">').replace(/<\/strong>/g, '</span>') }} />
                      <p className="text-ink-100 text-sm text-right">{siteContent.about_subtitle}</p>
                    </div>
                  </div>
                </div>

                {/* ── SERVICES ── */}
                <div className="bg-white rounded-[2.5rem] border border-cream-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-cream-100 flex items-center justify-between bg-cream-200/30">
                    <div className="flex items-center gap-3">
                      <CategoryIcon sx={{ color: '#6366f1' }} />
                      <div><h3 className="font-black text-ink-500">إدارة الخدمات</h3><p className="text-[11px] text-ink-50 font-bold">خدمات قسم "خدماتنا" في الصفحة الرئيسية</p></div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={addService} className="flex items-center gap-2 bg-ink-500 text-white text-xs font-black px-4 py-2 rounded-xl hover:bg-ink-600 transition-all">
                        <AddCircleIcon sx={{ fontSize: 16 }} /> إضافة
                      </button>
                      <button onClick={() => handleSaveContent('services', siteContent.services)} disabled={savingContent} className="flex items-center gap-2 bg-emerald-600 disabled:bg-cream-400 text-white text-xs font-black px-4 py-2 rounded-xl transition-all">
                        <SaveIcon sx={{ fontSize: 16 }} /> حفظ
                      </button>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    {(siteContent.services || []).length === 0 && (
                      <div className="text-center py-8 text-ink-50 font-bold text-sm">لا توجد خدمات — اضغط "إضافة" لإضافة خدمة</div>
                    )}
                    {(siteContent.services || []).map((s, idx) => (
                      <div key={s.id || idx} className="bg-cream-100 rounded-2xl p-4 border border-cream-200 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-ink-50 uppercase">خدمة #{idx + 1}</span>
                          <button onClick={() => removeService(idx)} className="text-rose-500 text-xs font-black hover:underline">حذف</button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          {[
                            { field: 'title',   label: 'الاسم (عربي)',     dir: 'rtl' },
                            { field: 'titleEn', label: 'Name (EN)',         dir: 'ltr' },
                            { field: 'desc',    label: 'الوصف (عربي)',     dir: 'rtl' },
                            { field: 'descEn',  label: 'Description (EN)', dir: 'ltr' },
                          ].map(({ field, label, dir }) => (
                            <div key={field}>
                              <label className="text-[10px] font-black text-ink-50 block mb-1">{label}</label>
                              <input value={s[field] || ''} onChange={e => updateService(idx, field, e.target.value)} dir={dir} className="w-full bg-white border border-cream-200 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:border-brass-light transition-all" />
                            </div>
                          ))}
                          <div className="md:col-span-2">
                            <label className="text-[10px] font-black text-ink-50 block mb-1">الأيقونة: HomeWork | Key | Calculate | AccountBalance</label>
                            <input value={s.icon || ''} onChange={e => updateService(idx, 'icon', e.target.value)} dir="ltr" placeholder="HomeWork" className="w-full bg-white border border-cream-200 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:border-brass-light transition-all" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── FOOTER SETTINGS ── */}
                <div className="bg-white rounded-[2.5rem] border border-cream-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-cream-100 flex items-center justify-between bg-emerald-50/30">
                    <div className="flex items-center gap-3">
                      <ContactPhoneIcon sx={{ color: '#059669' }} />
                      <div><h3 className="font-black text-ink-500">إعدادات الفوتر</h3><p className="text-[11px] text-ink-50 font-bold">النص · التواصل · ساعات العمل · السوشيال</p></div>
                    </div>
                    <button onClick={handleSaveFooter} disabled={savingFooter} className="flex items-center gap-2 bg-emerald-600 disabled:bg-cream-400 text-white text-xs font-black px-4 py-2 rounded-xl hover:bg-emerald-700 transition-all">
                      <SaveIcon sx={{ fontSize: 16 }} /> {savingFooter ? 'جاري الحفظ...' : 'حفظ الفوتر'}
                    </button>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <h4 className="text-[11px] font-black text-ink-100 uppercase tracking-widest mb-3">النص تحت الشعار</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black text-ink-50 block mb-1">النص (عربي)</label>
                          <textarea value={siteContent.footer_desc || ''} onChange={e => setSiteContent(p => ({ ...p, footer_desc: e.target.value }))} dir="rtl" rows={3} placeholder="شريكك الموثوق..." className="w-full bg-cream-100 border border-cream-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-emerald-400 transition-all resize-none" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-ink-50 block mb-1">Description (EN)</label>
                          <textarea value={siteContent.footer_desc_en || ''} onChange={e => setSiteContent(p => ({ ...p, footer_desc_en: e.target.value }))} dir="ltr" rows={3} placeholder="Your trusted partner..." className="w-full bg-cream-100 border border-cream-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-emerald-400 transition-all resize-none" />
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-cream-200" />
                    <div>
                      <h4 className="text-[11px] font-black text-ink-100 uppercase tracking-widest mb-3 flex items-center gap-2"><PhoneIcon sx={{ fontSize: 14 }} /> معلومات التواصل</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {[
                          { key: 'footer_phone',      label: 'رقم الهاتف',         Icon: PhoneIcon,      dir: 'ltr', placeholder: '+970 59-XXXX-XXX' },
                          { key: 'footer_email',      label: 'البريد الإلكتروني',  Icon: EmailIcon,      dir: 'ltr', placeholder: 'hello@example.ps' },
                          { key: 'footer_address',    label: 'الموقع (عربي)',       Icon: LocationOnIcon, dir: 'rtl', placeholder: 'رام الله، فلسطين' },
                          { key: 'footer_address_en', label: 'Location (EN)',       Icon: LocationOnIcon, dir: 'ltr', placeholder: 'Ramallah, Palestine' },
                        ].map(({ key, label, Icon, dir, placeholder }) => (
                          <div key={key}>
                            <label className="text-[10px] font-black text-ink-50 uppercase block mb-1 flex items-center gap-1"><Icon sx={{ fontSize: 12 }} /> {label}</label>
                            <input value={siteContent[key] || ''} onChange={e => setSiteContent(p => ({ ...p, [key]: e.target.value }))} dir={dir} placeholder={placeholder} className="w-full bg-cream-100 border border-cream-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-emerald-400 transition-all" />
                          </div>
                        ))}
                        <div className="md:col-span-2">
                          <label className="text-[10px] font-black text-ink-50 uppercase block mb-1 flex items-center gap-1"><AccessTimeIcon sx={{ fontSize: 12 }} /> ساعات العمل</label>
                          <input value={siteContent.footer_hours || ''} onChange={e => setSiteContent(p => ({ ...p, footer_hours: e.target.value }))} dir="ltr" placeholder="09:00 AM - 05:00 PM" className="w-full bg-cream-100 border border-cream-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-emerald-400 transition-all" />
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-cream-200" />
                    <div>
                      <h4 className="text-[11px] font-black text-ink-100 uppercase tracking-widest mb-3">روابط السوشيال ميديا</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {[
                          { key: 'footer_facebook',  label: 'Facebook',  Icon: FacebookIcon,  placeholder: 'https://facebook.com/yourpage',   color: 'focus:border-brass' },
                          { key: 'footer_instagram', label: 'Instagram', Icon: InstagramIcon, placeholder: 'https://instagram.com/yourhandle', color: 'focus:border-pink-500' },
                          { key: 'footer_whatsapp',  label: 'WhatsApp',  Icon: WhatsAppIcon,  placeholder: '0599XXXXXX أو https://wa.me/970599XXXXXX',       color: 'focus:border-emerald-500' },
                          { key: 'footer_linkedin',  label: 'LinkedIn',  Icon: LinkedInIcon,  placeholder: 'https://linkedin.com/company/...',  color: 'focus:border-ink-600' },
                        ].map(({ key, label, Icon, placeholder, color }) => (
                          <div key={key}>
                            <label className="text-[10px] font-black text-ink-50 uppercase block mb-1 flex items-center gap-1.5"><Icon sx={{ fontSize: 14 }} /> {label}</label>
                            <input value={siteContent[key] || ''} onChange={e => setSiteContent(p => ({ ...p, [key]: e.target.value }))} dir="ltr" placeholder={placeholder} className={`w-full bg-cream-100 border border-cream-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none ${color} transition-all text-left`} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-3xl bg-cream-100 border border-cream-200 p-6">
                      <p className="text-[10px] font-black text-ink-50 uppercase tracking-widest mb-4 text-center">— معاينة الفوتر —</p>
                      <p className="text-ink-100 text-sm text-center mb-4 font-bold">{siteContent.footer_desc}</p>
                      <div className="flex flex-wrap gap-4 justify-center">
                        {[
                          { Icon: PhoneIcon,      val: siteContent.footer_phone },
                          { Icon: EmailIcon,      val: siteContent.footer_email },
                          { Icon: LocationOnIcon, val: siteContent.footer_address },
                          { Icon: AccessTimeIcon, val: siteContent.footer_hours },
                        ].map(({ Icon, val }, i) => (
                          <div key={i} className="flex items-center gap-2 text-ink-200 text-xs font-bold">
                            <div className="w-7 h-7 bg-white rounded-xl border border-cream-300 flex items-center justify-center"><Icon sx={{ fontSize: 14, color: '#94a3b8' }} /></div>
                            {val || '—'}
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-center gap-3 mt-4">
                        {[
                          { Icon: FacebookIcon,  val: siteContent.footer_facebook,  color: 'text-ink-500' },
                          { Icon: InstagramIcon, val: siteContent.footer_instagram, color: 'text-pink-500' },
                          { Icon: WhatsAppIcon,  val: siteContent.footer_whatsapp,  color: 'text-emerald-500' },
                          { Icon: LinkedInIcon,  val: siteContent.footer_linkedin,  color: 'text-ink-600' },
                        ].map(({ Icon, val, color }, i) => (
                          <div key={i} className={`w-9 h-9 rounded-xl bg-white border border-cream-300 flex items-center justify-center ${val ? color : 'text-cream-400'}`}>
                            <Icon sx={{ fontSize: 18 }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── CTA ── */}
                <div className="bg-white rounded-[2.5rem] border border-cream-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-cream-100 flex items-center justify-between bg-cream-200/30">
                    <div className="flex items-center gap-3"><WebIcon className="text-brass" /><div><h3 className="font-black text-ink-500">قسم الـ CTA</h3><p className="text-[11px] text-ink-50 font-bold">العنوان والنص وأزرار الدعوة للتسجيل</p></div></div>
                    <button onClick={handleSaveCta} disabled={savingCta} className="flex items-center gap-2 bg-ink-500 disabled:bg-cream-400 text-white text-xs font-black px-4 py-2 rounded-xl hover:bg-ink-600 transition-all">
                      <SaveIcon sx={{ fontSize: 16 }} /> {savingCta ? 'جاري الحفظ...' : 'حفظ الـ CTA'}
                    </button>
                  </div>
                  <div className="p-6 grid md:grid-cols-2 gap-4">
                    {[
                      { key: 'cta_title',     label: 'العنوان (عربي)',           dir: 'rtl' },
                      { key: 'cta_title_en',  label: 'العنوان (إنجليزي)',        dir: 'ltr' },
                      { key: 'cta_sub',       label: 'النص التوضيحي (عربي)',     dir: 'rtl' },
                      { key: 'cta_sub_en',    label: 'النص التوضيحي (إنجليزي)', dir: 'ltr' },
                      { key: 'cta_btn',       label: 'زر التسجيل (عربي)',        dir: 'rtl' },
                      { key: 'cta_btn_en',    label: 'زر التسجيل (إنجليزي)',     dir: 'ltr' },
                      { key: 'cta_browse',    label: 'زر التصفح (عربي)',         dir: 'rtl' },
                      { key: 'cta_browse_en', label: 'زر التصفح (إنجليزي)',      dir: 'ltr' },
                    ].map(({ key, label, dir }) => (
                      <div key={key}>
                        <label className="text-[10px] font-black text-ink-50 uppercase block mb-1">{label}</label>
                        <input value={siteContent[key] || ''} onChange={e => setSiteContent(p => ({ ...p, [key]: e.target.value }))} dir={dir} className="w-full bg-cream-100 border border-cream-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-brass-light transition-all" />
                      </div>
                    ))}
                  </div>
                  <div className="mx-6 mb-6 rounded-3xl bg-ink-600 p-8 text-center relative overflow-hidden">
                    <div className="relative z-10">
                      <h4 className="text-white font-black text-xl mb-2">{siteContent.cta_title}</h4>
                      <p className="text-ink-50 text-sm mb-4">{siteContent.cta_sub}</p>
                      <div className="flex gap-3 justify-center flex-wrap">
                        <span className="bg-ink-500 text-white text-xs font-black px-6 py-2 rounded-xl">{siteContent.cta_btn}</span>
                        <span className="bg-white/10 text-white text-xs font-black px-6 py-2 rounded-xl border border-white/10">{siteContent.cta_browse}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── TESTIMONIALS ── */}
                <div className="bg-white rounded-[2.5rem] border border-cream-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-cream-100 flex items-center justify-between">
                    <h3 className="font-black text-ink-500">آراء العملاء</h3>
                    <div className="flex gap-3">
                      <button onClick={addTestimonial} className="flex items-center gap-2 bg-ink-500 text-white text-xs font-black px-4 py-2 rounded-xl hover:bg-ink-600"><AddCircleIcon sx={{ fontSize: 16 }} /> إضافة</button>
                      <button onClick={() => handleSaveContent('testimonials', siteContent.testimonials)} disabled={savingContent} className="flex items-center gap-2 bg-emerald-600 disabled:bg-cream-400 text-white text-xs font-black px-4 py-2 rounded-xl"><SaveIcon sx={{ fontSize: 16 }} /> حفظ</button>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    {siteContent.testimonials.map(t => (
                      <div key={t.id} className="bg-cream-100 rounded-2xl p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <input value={t.name} onChange={e => updateTestimonial(t.id, 'name', e.target.value)} placeholder="الاسم" className="bg-white border border-cream-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-brass" />
                          <input value={t.role} onChange={e => updateTestimonial(t.id, 'role', e.target.value)} placeholder="الدور" className="bg-white border border-cream-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-brass" />
                        </div>
                        <textarea value={t.text} onChange={e => updateTestimonial(t.id, 'text', e.target.value)} rows={2} placeholder="نص التقييم..." className="w-full bg-white border border-cream-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-brass resize-none" />
                        <div className="flex justify-between items-center">
                          <select value={t.gender || 'male'} onChange={e => updateTestimonial(t.id, 'gender', e.target.value)}
                            className="w-32 bg-white border border-cream-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-brass cursor-pointer">
                            <option value="male">👨 ذكر</option>
                            <option value="female">👩 أنثى</option>
                          </select>
                          <button onClick={() => removeTestimonial(t.id)} className="text-rose-500 hover:text-rose-700 text-xs font-black">حذف</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── FAQS ── */}
                <div className="bg-white rounded-[2.5rem] border border-cream-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-cream-100 flex items-center justify-between">
                    <h3 className="font-black text-ink-500">الأسئلة الشائعة</h3>
                    <div className="flex gap-3">
                      <button onClick={addFaq} className="flex items-center gap-2 bg-ink-500 text-white text-xs font-black px-4 py-2 rounded-xl hover:bg-ink-600"><AddCircleIcon sx={{ fontSize: 16 }} /> إضافة</button>
                      <button onClick={() => handleSaveContent('faqs', siteContent.faqs)} disabled={savingContent} className="flex items-center gap-2 bg-emerald-600 disabled:bg-cream-400 text-white text-xs font-black px-4 py-2 rounded-xl"><SaveIcon sx={{ fontSize: 16 }} /> حفظ</button>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    {siteContent.faqs.map(f => (
                      <div key={f.id} className="bg-cream-100 rounded-2xl p-4 space-y-2">
                        <input value={f.q} onChange={e => updateFaq(f.id, 'q', e.target.value)} placeholder="السؤال..." className="w-full bg-white border border-cream-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-brass" />
                        <textarea value={f.a} onChange={e => updateFaq(f.id, 'a', e.target.value)} rows={2} placeholder="الإجابة..." className="w-full bg-white border border-cream-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-brass resize-none" />
                        <div className="flex justify-end">
                          <button onClick={() => removeFaq(f.id)} className="text-rose-500 text-xs font-black hover:underline">حذف</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── SUBSCRIPTION PLANS ── */}
                <div className="bg-white rounded-[2.5rem] border border-cream-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-cream-100 flex items-center justify-between">
                    <h3 className="font-black text-ink-500">إدارة الباقات والأسعار</h3>
                    <button onClick={() => handleSaveContent('subscription_plans', siteContent.subscription_plans)} disabled={savingContent} className="flex items-center gap-2 bg-emerald-600 disabled:bg-cream-400 text-white text-xs font-black px-4 py-2 rounded-xl">
                      <SaveIcon sx={{ fontSize: 16 }} /> حفظ الأسعار
                    </button>
                  </div>
                  <div className="p-6 grid md:grid-cols-2 gap-6">
                    {siteContent.subscription_plans.map(plan => (
                      <div key={plan.id} className="bg-cream-100 rounded-2xl p-6 border border-cream-200">
                        <h4 className="font-black text-ink-500 mb-4">{plan.name || plan.id}</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-[10px] font-black text-ink-50 uppercase block mb-1">السعر الشهري (₪)</label>
                            <input type="number" value={plan.price} onChange={e => updatePlanPrice(plan.id, e.target.value)} className="w-full bg-white border border-cream-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-brass" />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-ink-50 uppercase block mb-1">حد العقارات النشطة</label>
                            <input type="number" value={plan.maxListings} onChange={e => updatePlanMaxListings(plan.id, e.target.value)} className="w-full bg-white border border-cream-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-brass" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ══ LEGAL PAGES ══════════════════════════════════════ */}
        {activeTab === "legal" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Sub Tabs */}
            <div className="flex gap-3 bg-white rounded-2xl p-2 border border-cream-200 shadow-sm">
              {[
                { id: 'terms',   label: 'شروط الاستخدام',   icon: <GavelIcon sx={{ fontSize: 18 }} />,       color: 'bg-ink-500' },
                { id: 'privacy', label: 'سياسة الخصوصية',   icon: <SecurityIcon sx={{ fontSize: 18 }} />,    color: 'bg-ink-500' },
                { id: 'help',    label: 'مركز المساعدة',     icon: <HelpOutlineIcon sx={{ fontSize: 18 }} />, color: 'bg-emerald-600' },
              ].map(t => (
                <button key={t.id} onClick={() => setLegalTab(t.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all ${legalTab === t.id ? `${t.color} text-white shadow-md` : 'text-ink-50 hover:text-ink-200'}`}>
                  {t.icon}{t.label}
                </button>
              ))}
            </div>

            {legalLoading ? (
              <div className="py-16 text-center text-ink-50 font-bold">جاري التحميل...</div>
            ) : (
              <>
                {/* ── شروط الاستخدام ── */}
                {legalTab === 'terms' && (
                  <div className="space-y-5">
                    <div className="bg-white rounded-[2.5rem] border border-cream-200 shadow-sm overflow-hidden">
                      <div className="p-6 border-b border-cream-100 flex items-center justify-between bg-cream-200/30">
                        <div className="flex items-center gap-3"><GavelIcon sx={{ color: '#6366f1' }} /><h3 className="font-black text-ink-500">معلومات أساسية — شروط الاستخدام</h3></div>
                        <button onClick={() => handleSaveLegalSection(['terms_last_updated','terms_intro'])} disabled={savingLegal}
                          className="flex items-center gap-2 bg-ink-500 disabled:bg-cream-400 text-white text-xs font-black px-4 py-2 rounded-xl hover:bg-ink-600">
                          <SaveIcon sx={{ fontSize: 16 }} /> {savingLegal ? 'جاري...' : 'حفظ'}
                        </button>
                      </div>
                      <div className="p-6 space-y-4">
                        <div>
                          <label className="text-[10px] font-black text-ink-50 uppercase block mb-1">تاريخ آخر تحديث</label>
                          <input type="date" value={legalContent.terms_last_updated}
                            onChange={e => setLegalContent(p => ({ ...p, terms_last_updated: e.target.value }))}
                            className="bg-cream-100 border border-cream-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-brass-light transition-all" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-ink-50 uppercase block mb-1">مقدمة الصفحة</label>
                          <textarea value={legalContent.terms_intro} rows={3}
                            onChange={e => setLegalContent(p => ({ ...p, terms_intro: e.target.value }))}
                            dir="rtl" className="w-full bg-cream-100 border border-cream-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-brass-light resize-none" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-[2.5rem] border border-cream-200 shadow-sm overflow-hidden">
                      <div className="p-6 border-b border-cream-100 flex items-center justify-between">
                        <h3 className="font-black text-ink-500">بنود شروط الاستخدام</h3>
                        <div className="flex gap-2">
                          <button onClick={addTermsSection} className="flex items-center gap-2 bg-ink-500 text-white text-xs font-black px-4 py-2 rounded-xl hover:bg-ink-600">
                            <AddCircleIcon sx={{ fontSize: 16 }} /> إضافة بند
                          </button>
                          <button onClick={() => handleSaveLegalSection(['terms_sections'])} disabled={savingLegal} className="flex items-center gap-2 bg-emerald-600 disabled:bg-cream-400 text-white text-xs font-black px-4 py-2 rounded-xl">
                            <SaveIcon sx={{ fontSize: 16 }} /> حفظ البنود
                          </button>
                        </div>
                      </div>
                      <div className="p-6 space-y-4">
                        {legalContent.terms_sections.map((sec, idx) => (
                          <div key={sec.id} className="bg-cream-100 rounded-2xl p-4 border border-cream-200 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-ink-50 uppercase">البند {idx + 1}</span>
                              <button onClick={() => removeTermsSection(sec.id)} className="text-rose-500 text-xs font-black hover:underline">حذف</button>
                            </div>
                            <div>
                              <label className="text-[10px] font-black text-ink-50 block mb-1">العنوان</label>
                              <input value={sec.title} onChange={e => updateTermsSection(sec.id, 'title', e.target.value)}
                                dir="rtl" className="w-full bg-white border border-cream-200 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:border-brass-light" />
                            </div>
                            <div>
                              <label className="text-[10px] font-black text-ink-50 block mb-1">المحتوى</label>
                              <textarea value={sec.content} onChange={e => updateTermsSection(sec.id, 'content', e.target.value)}
                                rows={3} dir="rtl" className="w-full bg-white border border-cream-200 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:border-brass-light resize-none" />
                            </div>
                          </div>
                        ))}
                        {legalContent.terms_sections.length === 0 && (
                          <div className="text-center py-8 text-ink-50 font-bold text-sm">لا توجد بنود — اضغط "إضافة بند"</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── سياسة الخصوصية ── */}
                {legalTab === 'privacy' && (
                  <div className="space-y-5">
                    <div className="bg-white rounded-[2.5rem] border border-cream-200 shadow-sm overflow-hidden">
                      <div className="p-6 border-b border-cream-100 flex items-center justify-between bg-cream-200/30">
                        <div className="flex items-center gap-3"><SecurityIcon sx={{ color: '#2563eb' }} /><h3 className="font-black text-ink-500">معلومات أساسية — سياسة الخصوصية</h3></div>
                        <button onClick={() => handleSaveLegalSection(['privacy_last_updated','privacy_intro'])} disabled={savingLegal}
                          className="flex items-center gap-2 bg-ink-500 disabled:bg-cream-400 text-white text-xs font-black px-4 py-2 rounded-xl hover:bg-ink-600">
                          <SaveIcon sx={{ fontSize: 16 }} /> {savingLegal ? 'جاري...' : 'حفظ'}
                        </button>
                      </div>
                      <div className="p-6 space-y-4">
                        <div>
                          <label className="text-[10px] font-black text-ink-50 uppercase block mb-1">تاريخ آخر تحديث</label>
                          <input type="date" value={legalContent.privacy_last_updated}
                            onChange={e => setLegalContent(p => ({ ...p, privacy_last_updated: e.target.value }))}
                            className="bg-cream-100 border border-cream-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-brass-light transition-all" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-ink-50 uppercase block mb-1">مقدمة الصفحة</label>
                          <textarea value={legalContent.privacy_intro} rows={3}
                            onChange={e => setLegalContent(p => ({ ...p, privacy_intro: e.target.value }))}
                            dir="rtl" className="w-full bg-cream-100 border border-cream-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-brass-light resize-none" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-[2.5rem] border border-cream-200 shadow-sm overflow-hidden">
                      <div className="p-6 border-b border-cream-100 flex items-center justify-between">
                        <h3 className="font-black text-ink-500">بنود سياسة الخصوصية</h3>
                        <div className="flex gap-2">
                          <button onClick={addPrivacySection} className="flex items-center gap-2 bg-ink-500 text-white text-xs font-black px-4 py-2 rounded-xl hover:bg-ink-600">
                            <AddCircleIcon sx={{ fontSize: 16 }} /> إضافة بند
                          </button>
                          <button onClick={() => handleSaveLegalSection(['privacy_sections'])} disabled={savingLegal} className="flex items-center gap-2 bg-emerald-600 disabled:bg-cream-400 text-white text-xs font-black px-4 py-2 rounded-xl">
                            <SaveIcon sx={{ fontSize: 16 }} /> حفظ البنود
                          </button>
                        </div>
                      </div>
                      <div className="p-6 space-y-4">
                        {legalContent.privacy_sections.map((sec, idx) => (
                          <div key={sec.id} className="bg-cream-100 rounded-2xl p-4 border border-cream-200 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-ink-50 uppercase">البند {idx + 1}</span>
                              <button onClick={() => removePrivacySection(sec.id)} className="text-rose-500 text-xs font-black hover:underline">حذف</button>
                            </div>
                            <div>
                              <label className="text-[10px] font-black text-ink-50 block mb-1">العنوان</label>
                              <input value={sec.title} onChange={e => updatePrivacySection(sec.id, 'title', e.target.value)}
                                dir="rtl" className="w-full bg-white border border-cream-200 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:border-brass-light" />
                            </div>
                            <div>
                              <label className="text-[10px] font-black text-ink-50 block mb-1">المحتوى</label>
                              <textarea value={sec.content} onChange={e => updatePrivacySection(sec.id, 'content', e.target.value)}
                                rows={3} dir="rtl" className="w-full bg-white border border-cream-200 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:border-brass-light resize-none" />
                            </div>
                          </div>
                        ))}
                        {legalContent.privacy_sections.length === 0 && (
                          <div className="text-center py-8 text-ink-50 font-bold text-sm">لا توجد بنود — اضغط "إضافة بند"</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── مركز المساعدة ── */}
                {legalTab === 'help' && (
                  <div className="space-y-5">
                    <div className="bg-white rounded-[2.5rem] border border-cream-200 shadow-sm overflow-hidden">
                      <div className="p-6 border-b border-cream-100 flex items-center justify-between bg-emerald-50/30">
                        <div className="flex items-center gap-3"><HelpOutlineIcon sx={{ color: '#10b981' }} /><h3 className="font-black text-ink-500">مقدمة مركز المساعدة</h3></div>
                        <button onClick={() => handleSaveLegalSection(['help_intro'])} disabled={savingLegal}
                          className="flex items-center gap-2 bg-emerald-600 disabled:bg-cream-400 text-white text-xs font-black px-4 py-2 rounded-xl hover:bg-emerald-700">
                          <SaveIcon sx={{ fontSize: 16 }} /> {savingLegal ? 'جاري...' : 'حفظ'}
                        </button>
                      </div>
                      <div className="p-6">
                        <label className="text-[10px] font-black text-ink-50 uppercase block mb-1">نص المقدمة</label>
                        <textarea value={legalContent.help_intro} rows={2}
                          onChange={e => setLegalContent(p => ({ ...p, help_intro: e.target.value }))}
                          dir="rtl" className="w-full bg-cream-100 border border-cream-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-emerald-400 resize-none" />
                      </div>
                    </div>
                    <div className="bg-white rounded-[2.5rem] border border-cream-200 shadow-sm overflow-hidden">
                      <div className="p-6 border-b border-cream-100 flex items-center justify-between">
                        <h3 className="font-black text-ink-500">فئات ومقالات مركز المساعدة</h3>
                        <div className="flex gap-2">
                          <button onClick={addHelpCategory} className="flex items-center gap-2 bg-emerald-600 text-white text-xs font-black px-4 py-2 rounded-xl hover:bg-emerald-700">
                            <AddCircleIcon sx={{ fontSize: 16 }} /> فئة جديدة
                          </button>
                          <button onClick={() => handleSaveLegalSection(['help_categories'])} disabled={savingLegal} className="flex items-center gap-2 bg-ink-300 disabled:bg-cream-400 text-white text-xs font-black px-4 py-2 rounded-xl">
                            <SaveIcon sx={{ fontSize: 16 }} /> حفظ الكل
                          </button>
                        </div>
                      </div>
                      <div className="p-6 space-y-6">
                        {legalContent.help_categories.map((cat, catIdx) => (
                          <div key={cat.id} className="border border-cream-200 rounded-3xl overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 bg-cream-100">
                              <div className="flex items-center gap-3 flex-1">
                                <span className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white text-sm" style={{ background: cat.color || '#6366f1' }}>{catIdx + 1}</span>
                                <input value={cat.title} onChange={e => updateHelpCategory(cat.id, 'title', e.target.value)}
                                  className="flex-1 bg-white border border-cream-300 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-emerald-400" placeholder="اسم الفئة" dir="rtl" />
                                <input value={cat.color || '#6366f1'} onChange={e => updateHelpCategory(cat.id, 'color', e.target.value)}
                                  type="color" className="w-9 h-9 rounded-xl border border-cream-300 cursor-pointer p-0.5" title="لون الفئة" />
                              </div>
                              <div className="flex gap-2 mr-3">
                                <button onClick={() => addHelpArticle(cat.id)} className="text-xs text-emerald-600 font-black hover:underline">+ مقال</button>
                                <button onClick={() => removeHelpCategory(cat.id)} className="text-xs text-rose-500 font-black hover:underline">حذف الفئة</button>
                              </div>
                            </div>
                            <div className="p-4 space-y-3">
                              {(cat.articles || []).map((art, artIdx) => (
                                <div key={art.id} className="bg-cream-100 rounded-2xl p-3 border border-cream-200 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-ink-50">مقال {artIdx + 1}</span>
                                    <button onClick={() => removeHelpArticle(cat.id, art.id)} className="text-rose-400 text-[10px] font-black hover:underline">حذف</button>
                                  </div>
                                  <input value={art.q} onChange={e => updateHelpArticle(cat.id, art.id, 'q', e.target.value)}
                                    placeholder="السؤال؟" dir="rtl" className="w-full bg-white border border-cream-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-emerald-400" />
                                  <textarea value={art.a} onChange={e => updateHelpArticle(cat.id, art.id, 'a', e.target.value)}
                                    rows={2} placeholder="الإجابة..." dir="rtl" className="w-full bg-white border border-cream-200 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:border-emerald-400 resize-none" />
                                </div>
                              ))}
                              {(cat.articles || []).length === 0 && (
                                <div className="text-center py-4 text-ink-50 text-xs font-bold">لا توجد مقالات — اضغط "+ مقال"</div>
                              )}
                            </div>
                          </div>
                        ))}
                        {legalContent.help_categories.length === 0 && (
                          <div className="text-center py-8 text-ink-50 font-bold text-sm">لا توجد فئات — اضغط "فئة جديدة"</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ══ CONTACT MESSAGES ═════════════════════════════════ */}
        {activeTab === "contacts" && (
          <div className="space-y-5 animate-in fade-in duration-500">
            <div className="bg-white rounded-[2.5rem] border border-cream-200 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-cream-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-cream-200/30">
                <div className="flex items-center gap-3">
                  <ContactPhoneIcon sx={{ color: '#2563eb' }} />
                  <div>
                    <h3 className="font-black text-ink-500">رسائل التواصل</h3>
                    <p className="text-[11px] text-ink-50 font-bold mt-0.5">
                      {contactMessages.filter(m => !m.read).length} رسالة غير مقروءة من أصل {contactMessages.length}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['all','unread','read'].map(f => (
                    <button key={f} onClick={() => setContactFilter(f)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${contactFilter === f ? 'bg-ink-500 text-white shadow' : 'bg-white border border-cream-200 text-ink-100 hover:border-cream-300'}`}>
                      {f === 'all' ? `الكل (${contactMessages.length})` : f === 'unread' ? `غير مقروء (${contactMessages.filter(m=>!m.read).length})` : `مقروء (${contactMessages.filter(m=>m.read).length})`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Messages List */}
              {contactLoading ? (
                <div className="divide-y divide-cream-100">
                  {[1,2,3,4].map(i => <div key={i} className="h-20 m-4 bg-cream-200 rounded-2xl animate-pulse" />)}
                </div>
              ) : (
                <div className="divide-y divide-cream-100">
                  {contactMessages
                    .filter(m => contactFilter === 'all' ? true : contactFilter === 'unread' ? !m.read : m.read)
                    .length === 0 ? (
                    <div className="py-16 text-center text-ink-50 font-bold">
                      <ContactPhoneIcon sx={{ fontSize: 48, color: '#e2e8f0', display: 'block', margin: '0 auto 12px' }} />
                      لا توجد رسائل
                    </div>
                  ) : (
                    contactMessages
                      .filter(m => contactFilter === 'all' ? true : contactFilter === 'unread' ? !m.read : m.read)
                      .map(msg => (
                        <div key={msg._id} className={`transition-colors ${!msg.read ? 'bg-cream-200/30' : ''}`}>
                          {/* Row */}
                          <button className="w-full flex items-center gap-4 px-6 py-4 hover:bg-cream-100/80 text-right transition-colors"
                            onClick={() => setContactOpen(contactOpen === msg._id ? null : msg._id)}>
                            {/* Unread dot */}
                            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${!msg.read ? 'bg-brass' : 'bg-transparent'}`} />
                            {/* Avatar */}
                            <div className="w-10 h-10 bg-gradient-to-br from-brass to-ink-500 rounded-xl flex items-center justify-center text-white font-black text-base flex-shrink-0">
                              {msg.name?.charAt(0) || '؟'}
                            </div>
                            {/* Info */}
                            <div className="flex-1 min-w-0 text-right">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-black text-ink-400 text-sm">{msg.name}</span>
                                {msg.subject && (
                                  <span className="text-[10px] bg-cream-200 text-ink-100 font-black px-2 py-0.5 rounded-xl">{msg.subject}</span>
                                )}
                                {!msg.read && <span className="text-[10px] bg-cream-300 text-ink-500 font-black px-2 py-0.5 rounded-xl">جديد</span>}
                              </div>
                              <p className="text-xs text-ink-50 font-bold truncate mt-0.5">{msg.email}</p>
                              <p className="text-xs text-ink-100 font-medium truncate mt-0.5">{msg.message}</p>
                            </div>
                            {/* Date */}
                            <div className="text-right flex-shrink-0">
                              <p className="text-[10px] text-ink-50 font-bold">
                                {new Date(msg.createdAt).toLocaleDateString('ar-PS', { month: 'short', day: 'numeric' })}
                              </p>
                              <p className="text-[10px] text-cream-400 font-bold">
                                {new Date(msg.createdAt).toLocaleTimeString('ar-PS', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </button>

                          {/* Expanded Detail */}
                          {contactOpen === msg._id && (
                            <div className="mx-4 mb-4 bg-white border border-cream-200 rounded-2xl p-5 space-y-4">
                              <div className="grid sm:grid-cols-3 gap-3 text-sm">
                                <div className="bg-cream-100 rounded-xl p-3">
                                  <p className="text-[10px] font-black text-ink-50 uppercase mb-1">الاسم</p>
                                  <p className="font-bold text-ink-400">{msg.name}</p>
                                </div>
                                <div className="bg-cream-100 rounded-xl p-3">
                                  <p className="text-[10px] font-black text-ink-50 uppercase mb-1">البريد</p>
                                  <a href={`mailto:${msg.email}`} className="font-bold text-ink-500 hover:underline break-all">{msg.email}</a>
                                </div>
                                {msg.phone && (
                                  <div className="bg-cream-100 rounded-xl p-3">
                                    <p className="text-[10px] font-black text-ink-50 uppercase mb-1">الهاتف</p>
                                    <a href={`tel:${msg.phone}`} className="font-bold text-ink-500 hover:underline">{msg.phone}</a>
                                  </div>
                                )}
                              </div>
                              <div className="bg-cream-100 rounded-xl p-4">
                                <p className="text-[10px] font-black text-ink-50 uppercase mb-2">الرسالة</p>
                                <p className="text-sm text-ink-300 font-medium leading-loose">{msg.message}</p>
                              </div>
                              {!msg.read && (
                                <button onClick={() => handleMarkAsRead(msg._id)}
                                  className="flex items-center gap-2 bg-emerald-600 text-white text-xs font-black px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors">
                                  <CheckCircleOutlinedIcon sx={{ fontSize: 16 }} />
                                  تعليم كمقروء
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ 7. NEWSLETTER ════════════════════════════════════ */}
        {activeTab === "newsletter" && (
          <div className="animate-in fade-in duration-500">
            <div className="bg-white rounded-[2.5rem] border border-cream-200 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-cream-100 flex items-center justify-between bg-cream-200/30">
                <div className="flex items-center gap-3">
                  <MarkEmailReadIcon sx={{ color: '#2563eb', fontSize: 28 }} />
                  <div>
                    <h3 className="font-black text-ink-500 text-lg">المشتركون في النشرة البريدية</h3>
                    <p className="text-[11px] text-ink-50 font-bold">الإيميلات المسجلة من فوتر الموقع</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center bg-ink-500 text-white px-4 py-2 rounded-2xl">
                    <div className="text-2xl font-black">{newsletter.length}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest">مشترك</div>
                  </div>
                  <button onClick={loadNewsletter} className="text-xs font-black text-ink-500 hover:underline bg-cream-200 px-4 py-2 rounded-xl">تحديث</button>
                </div>
              </div>
              {nlLoading ? (
                <div className="py-20 text-center text-ink-50 font-bold">جاري التحميل...</div>
              ) : newsletter.length === 0 ? (
                <div className="py-20 text-center text-ink-50 font-bold">
                  <MarkEmailReadIcon sx={{ fontSize: 48, opacity: 0.2 }} />
                  <p className="mt-4 text-lg">لا يوجد مشتركون بعد</p>
                  <p className="text-xs mt-1">سيظهرون هنا بعد اشتراكهم من الفوتر</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="text-ink-50 text-[10px] font-black uppercase tracking-widest border-b border-cream-100 bg-cream-100/50">
                        <th className="px-8 py-5">#</th>
                        <th className="px-8 py-5">البريد الإلكتروني</th>
                        <th className="px-8 py-5">تاريخ الاشتراك</th>
                        <th className="px-8 py-5 text-center">حذف</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cream-100">
                      {newsletter.map((sub, i) => (
                        <tr key={sub.id} className="hover:bg-cream-100/50 transition-colors">
                          <td className="px-8 py-4 text-ink-50 text-xs font-bold">{i + 1}</td>
                          <td className="px-8 py-4">
                            <a href={`mailto:${sub.email}`} className="text-sm font-black text-ink-500 hover:text-ink-500 transition-colors flex items-center gap-2">
                              <div className="w-8 h-8 bg-cream-200 rounded-xl flex items-center justify-center"><EmailIcon sx={{ fontSize: 16, color: '#2563eb' }} /></div>
                              {sub.email}
                            </a>
                          </td>
                          <td className="px-8 py-4 text-[11px] text-ink-50 font-bold">
                            {new Date(sub.createdAt).toLocaleDateString('ar', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </td>
                          <td className="px-8 py-4 text-center">
                            <button onClick={() => deleteNewsletterSub(sub.id)} className="p-2.5 bg-cream-100 text-ink-50 rounded-xl hover:bg-rose-600 hover:text-white transition-all">
                              <DeleteIcon sx={{ fontSize: 16 }} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ 8. REPORTS ═══════════════════════════════════════ */}
        {activeTab === "reports" && (
          <div className="space-y-4 animate-in slide-in-from-left duration-500">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-ink-500 text-xl">البلاغات الواردة</h3>
              <span className="bg-rose-100 text-rose-600 text-xs font-black px-3 py-1.5 rounded-xl">
                {reports.filter(r => r.status === 'pending').length} معلّق
              </span>
            </div>
            {reportsLoading ? (
              <div className="py-16 text-center text-ink-50 font-bold">جاري التحميل...</div>
            ) : reports.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[2.5rem] border border-cream-200">
                <WarningAmberIcon sx={{ fontSize: 48, color: '#cbd5e1' }} />
                <p className="text-ink-50 font-black text-xl mt-4">لا توجد بلاغات حالياً 🎉</p>
              </div>
            ) : reports.map(r => (
              <div key={r.id} className="bg-white p-6 rounded-3xl border border-cream-200 shadow-sm hover:border-rose-200 transition-all">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${r.status === 'pending' ? 'bg-rose-100 text-rose-600' : 'bg-cream-200 text-ink-50'}`}>
                      <WarningAmberIcon />
                    </div>
                    <div className="text-right">
                      <h4 className="font-black text-ink-500">{r.property?.title || 'عقار محذوف'}</h4>
                      <p className="text-xs text-rose-500 font-bold mt-0.5">{r.reason}</p>
                      {r.details && <p className="text-xs text-ink-50 font-bold mt-1">{r.details}</p>}
                      <div className="text-[10px] text-ink-50 mt-1 font-bold">
                        بواسطة: {r.user?.name || 'مجهول'} • {new Date(r.createdAt).toLocaleDateString('ar-EG')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-xl ${r.status === 'pending' ? 'bg-amber-100 text-amber-600' : r.status === 'reviewed' ? 'bg-emerald-100 text-emerald-600' : 'bg-cream-200 text-ink-50'}`}>
                      {r.status === 'pending' ? 'معلّق' : r.status === 'reviewed' ? 'تمت المراجعة' : 'مرفوض'}
                    </span>
                    {r.status === 'pending' && (
                      <button onClick={async () => {
                        await reportsAPI.updateStatus(r.id, 'reviewed')
                        setReports(prev => prev.map(x => x.id === r.id ? { ...x, status: 'reviewed' } : x))
                        dispatch(showToast('تمت المراجعة ✅'))
                      }} className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-black text-xs hover:bg-emerald-600 hover:text-white transition-all">
                        تمت المراجعة
                      </button>
                    )}
                    <button onClick={async () => {
                      if (!window.confirm('حذف البلاغ؟')) return
                      await reportsAPI.delete(r.id)
                      setReports(prev => prev.filter(x => x.id !== r.id))
                      dispatch(showToast('تم حذف البلاغ'))
                    }} className="p-2 bg-cream-100 text-ink-50 rounded-xl hover:bg-rose-600 hover:text-white transition-all">
                      <DeleteIcon sx={{ fontSize: 18 }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══ 10. TEAM ════════════════════════════════════════ */}
        {activeTab === "team" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-ink-500 text-xl">فريق العمل</h3>
              <button onClick={() => { setEditingMember(null); setTeamForm({ name: '', nameEn: '', role: '', roleEn: '', bio: '', bioEn: '', image: '', order: 0, social: { linkedin: '', twitter: '', instagram: '', facebook: '', whatsapp: '' } }); setShowTeamForm(true) }}
                className="flex items-center gap-2 px-5 py-3 bg-ink-500 text-white font-black text-xs rounded-2xl hover:bg-ink-600 transition-all">
                <AddCircleIcon sx={{ fontSize: 18 }} /> إضافة عضو
              </button>
            </div>

            {/* Form */}
            {showTeamForm && (
              <div className="bg-white rounded-[2.5rem] border border-cream-200 shadow-sm p-8 space-y-4">
                <h4 className="font-black text-ink-500 mb-4">{editingMember ? 'تعديل العضو' : 'إضافة عضو جديد'}</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {[['name','الاسم *'],['nameEn','Name EN'],['role','المنصب *'],['roleEn','Role EN']].map(([key, label]) => (
                    <div key={key} className="space-y-1">
                      <label className="text-[10px] font-black text-ink-50 uppercase">{label}</label>
                      <input value={teamForm[key]} onChange={e => setTeamForm(p => ({ ...p, [key]: e.target.value }))}
                        className="w-full bg-cream-100 border border-cream-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-brass-light" />
                    </div>
                  ))}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-ink-50 uppercase">الوصف</label>
                    <textarea value={teamForm.bio} onChange={e => setTeamForm(p => ({ ...p, bio: e.target.value }))} rows={3}
                      className="w-full bg-cream-100 border border-cream-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-brass-light resize-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-ink-50 uppercase">Bio EN</label>
                    <textarea value={teamForm.bioEn} onChange={e => setTeamForm(p => ({ ...p, bioEn: e.target.value }))} rows={3}
                      className="w-full bg-cream-100 border border-cream-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-brass-light resize-none" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-ink-50 uppercase">صورة العضو</label>
                  <div className="flex items-center gap-3">
                    {teamForm.image && (
                      <img loading="lazy"
                        src={teamForm.image.startsWith('http') ? teamForm.image : `${import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:5000'}${teamForm.image}`}
                        className="w-14 h-14 rounded-2xl object-cover border border-cream-200"
                        alt="preview"
                      />
                    )}
                    <label className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 bg-cream-100 border border-cream-200 border-dashed rounded-2xl px-4 py-3 hover:border-brass-light transition-all">
                        <CloudUploadIcon sx={{ fontSize: 20, color: '#94a3b8' }} />
                        <span className="text-sm font-bold text-ink-50">
                          {teamForm.image ? 'تغيير الصورة' : 'اختر صورة من جهازك'}
                        </span>
                      </div>
                      <input type="file" accept="image/*" className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files[0]
                          if (!file) return
                          try {
                            const formData = new FormData()
                            formData.append('image', file)
                            const token = localStorage.getItem('token')
                            const res = await fetch(`${import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:5000'}/api/upload/image`, {
                              method: 'POST',
                              headers: { Authorization: `Bearer ${token}` },
                              body: formData,
                            })
                            const data = await res.json()
                            setTeamForm(p => ({ ...p, image: data.url || data.path }))
                            dispatch(showToast('تم رفع الصورة ✅'))
                          } catch {
                            dispatch(showToast('فشل رفع الصورة'))
                          }
                        }}
                      />
                    </label>
                    {teamForm.image && (
                      <button onClick={() => setTeamForm(p => ({ ...p, image: '' }))}
                        className="p-2 text-ink-50 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                        <CloseIcon sx={{ fontSize: 18 }} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[['linkedin','LinkedIn'],['twitter','Twitter'],['instagram','Instagram'],['facebook','Facebook'],['whatsapp','WhatsApp']].map(([key, label]) => (
                    <div key={key} className="space-y-1">
                      <label className="text-[10px] font-black text-ink-50 uppercase">{label}</label>
                      <input value={teamForm.social[key]} onChange={e => setTeamForm(p => ({ ...p, social: { ...p.social, [key]: e.target.value } }))}
                        className="w-full bg-cream-100 border border-cream-200 rounded-2xl px-3 py-2.5 text-xs font-bold outline-none focus:border-brass-light" />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={async () => {
                    if (!teamForm.name || !teamForm.role) { dispatch(showToast('الاسم والمنصب مطلوبان')); return }
                    try {
                      if (editingMember) {
                        const res = await teamAPI.update(editingMember, teamForm)
                        setTeamMembers(prev => prev.map(m => m.id === editingMember ? { ...res.member } : m))
                        dispatch(showToast('تم التحديث ✅'))
                      } else {
                        const res = await teamAPI.create(teamForm)
                        setTeamMembers(prev => [...prev, res.member])
                        dispatch(showToast('تم الإضافة ✅'))
                      }
                      setShowTeamForm(false)
                    } catch (err) { dispatch(showToast(err.message || 'فشلت العملية')) }
                  }} className="flex-1 py-3 bg-ink-500 text-white font-black rounded-2xl hover:bg-ink-600 transition-all text-sm">
                    <SaveIcon sx={{ fontSize: 16 }} /> {editingMember ? 'حفظ التعديلات' : 'إضافة'}
                  </button>
                  <button onClick={() => setShowTeamForm(false)} className="px-6 py-3 bg-cream-200 text-ink-200 font-black rounded-2xl hover:bg-cream-300 transition-all text-sm">إلغاء</button>
                </div>
              </div>
            )}

            {/* Members List */}
            {teamLoading ? (
              <div className="py-16 text-center text-ink-50 font-bold">جاري التحميل...</div>
            ) : teamMembers.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-[2.5rem] border border-cream-200">
                <GroupsIcon sx={{ fontSize: 48, color: '#cbd5e1' }} />
                <p className="text-ink-50 font-black text-lg mt-4">لا يوجد أعضاء بعد</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamMembers.map(m => (
                  <div key={m.id} className="bg-white rounded-[2rem] border border-cream-200 shadow-sm overflow-hidden">
                    <div className="h-32 bg-cream-200 relative overflow-hidden">
                      {m.image ? (
                        <img loading="lazy" src={m.image.startsWith('http') ? m.image : `${import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:5000'}${m.image}`}
                          className="w-full h-full object-cover object-top" alt={m.name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl font-black text-cream-400">{m.name?.slice(0,2)}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h4 className="font-black text-ink-500">{m.name}</h4>
                      <p className="text-ink-500 text-[10px] font-black uppercase tracking-widest mb-2">{m.role}</p>
                      {m.bio && <p className="text-ink-100 text-xs font-medium line-clamp-2 mb-3">{m.bio}</p>}
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingMember(m.id); setTeamForm({ name: m.name||'', nameEn: m.nameEn||'', role: m.role||'', roleEn: m.roleEn||'', bio: m.bio||'', bioEn: m.bioEn||'', image: m.image||'', order: m.order||0, social: { linkedin: m.social?.linkedin||'', twitter: m.social?.twitter||'', instagram: m.social?.instagram||'', facebook: m.social?.facebook||'', whatsapp: m.social?.whatsapp||'' } }); setShowTeamForm(true) }}
                          className="flex-1 py-2 bg-cream-100 text-ink-200 font-black text-xs rounded-xl hover:bg-cream-200 transition-all">
                          تعديل
                        </button>
                        <button onClick={async () => { if (!window.confirm('حذف العضو؟')) return; await teamAPI.delete(m.id); setTeamMembers(prev => prev.filter(x => x.id !== m.id)); dispatch(showToast('تم الحذف')) }}
                          className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white transition-all">
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ 9. ACTIVITY ══════════════════════════════════════ */}
        {activeTab === "activity" && (
          <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-cream-200 animate-in fade-in duration-700 text-right">
            <h3 className="font-black text-xl text-ink-500 mb-10 border-r-4 border-ink-500 pr-4">سجل عمليات النظام</h3>
            {activitiesLoading ? (
              <div className="py-16 text-center text-ink-50 font-bold">جاري التحميل...</div>
            ) : activities.length === 0 ? (
              <div className="text-center py-20">
                <HistoryIcon sx={{ fontSize: 48, color: '#cbd5e1' }} />
                <p className="text-ink-50 font-black text-xl mt-4">لا توجد عمليات مسجّلة بعد</p>
                <p className="text-cream-400 text-sm font-bold mt-2">ستظهر هنا العمليات تلقائياً عند قبول مستخدم أو حذف عقار وغيرها</p>
              </div>
            ) : (
              <div className="relative space-y-8 before:absolute before:inset-y-0 before:right-6 before:w-0.5 before:bg-cream-200">
                {activities.map(act => (
                  <div key={act.id} className="relative flex items-start gap-8 group">
                    <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transition-transform group-hover:scale-110 shrink-0 ${
                      act.type === 'success' ? 'bg-emerald-500 text-white' :
                      act.type === 'danger'  ? 'bg-rose-500 text-white'   :
                      act.type === 'warning' ? 'bg-amber-500 text-white'  : 'bg-brass text-white'
                    }`}>
                      {act.type === 'success' ? <CheckCircleIcon /> :
                       act.type === 'danger'  ? <CancelIcon />      :
                       act.type === 'warning' ? <WarningAmberIcon /> : <HistoryIcon />}
                    </div>
                    <div className="flex-1 bg-cream-100 p-5 rounded-[2rem] border border-transparent group-hover:border-cream-300 group-hover:bg-white transition-all shadow-sm">
                      <div className="flex justify-between items-center mb-1">
                        <h5 className={`font-black text-sm ${act.type === 'danger' ? 'text-rose-600' : 'text-ink-400'}`}>{act.action}</h5>
                        <span className="text-[10px] font-black text-ink-50 bg-white px-3 py-1 rounded-full shadow-sm shrink-0 mr-2">
                          {new Date(act.createdAt).toLocaleString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-[11px] text-ink-100 font-bold">بواسطة: <span className="text-ink-500">{act.userName || 'النظام'}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  )
}