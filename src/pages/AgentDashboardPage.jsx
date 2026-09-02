import { useState, useRef, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { showToast } from "@/store/slices/uiSlice"
import { logout, fetchCurrentUser } from "@/store/slices/authSlice"
import { createProperty, deleteProperty, fetchProperties } from "@/store/slices/propertiesSlice"
import { uploadAPI, authAPI, propertiesAPI, subscriptionAPI, paymentAPI } from "@/lib/api"

import DashboardIcon from "@mui/icons-material/Dashboard"
import AddCircleIcon from "@mui/icons-material/AddCircle"
import HomeIcon from "@mui/icons-material/Home"
import AssignmentIcon from "@mui/icons-material/Assignment"
import BarChartIcon from "@mui/icons-material/BarChart"
import SettingsIcon from "@mui/icons-material/Settings"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"
import AttachMoneyIcon from "@mui/icons-material/AttachMoney"
import StarIcon from "@mui/icons-material/Star"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import VisibilityIcon from "@mui/icons-material/Visibility"
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"
import FileDownloadIcon from "@mui/icons-material/FileDownload"
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong"
import LogoutIcon from "@mui/icons-material/Logout"
import SecurityIcon from "@mui/icons-material/Security"
import PersonIcon from "@mui/icons-material/Person"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import StarBorderIcon from "@mui/icons-material/StarBorder"
import CloseIcon from "@mui/icons-material/Close"
import SaveIcon from "@mui/icons-material/Save"
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser"
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium"
import CardMembershipIcon from "@mui/icons-material/CardMembership"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CancelIcon from "@mui/icons-material/Cancel"
import ErrorIcon from "@mui/icons-material/Error"
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch"

const EMPTY_FORM = {
  title: "", price: "", location: "", city: "",
  type: "SALE", category: "APT", tag: "",
  rooms: "3", baths: "2", area: "120", floor: "1", parking: "1",
  description: "", features: [],
}

export default function AgentDashboardPage() {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("overview")
  const isEn = i18n.language === 'en'
  const fileInputRef = useRef(null)
  const { user } = useSelector(s => s.auth)

  // ── My Properties ──────────────────────────────────────────
  const [myProperties, setMyProperties] = useState([])
  const [propsLoading, setPropsLoading] = useState(false)

  const loadMyProperties = async () => {
    setPropsLoading(true)
    try {
      const data = await propertiesAPI.getMy()
      setMyProperties(data.properties || [])
    } catch (err) {
      dispatch(showToast('فشل تحميل العقارات'))
    } finally {
      setPropsLoading(false)
    }
  }

  useEffect(() => {
    if (user) loadMyProperties()
  }, [user])

  // ── Add Property Modal ─────────────────────────────────────
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState(null)
  const [newProperty, setNewProperty] = useState(EMPTY_FORM)
  const [uploadedImages, setUploadedImages] = useState([])
  const [primaryImageIdx, setPrimaryImageIdx] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [subData, setSubData]   = useState(null)
  const [payments, setPayments] = useState([])
  const [subLoading, setSubLoading] = useState(false)

  const openAddModal = () => {
    setEditingProperty(null)
    setNewProperty(EMPTY_FORM)
    setUploadedImages([])
    setPrimaryImageIdx(0)
    setIsAddModalOpen(true)
  }

  const openEditModal = (prop) => {
    setEditingProperty(prop)
    setNewProperty({
      title: prop.title || "",
      price: prop.price || "",
      location: prop.location || "",
      city: prop.city || "",
      type: prop.type?.toUpperCase() || "SALE",
      category: prop.category?.toUpperCase() || "APT",
      tag: prop.tag || "",
      rooms: String(prop.rooms || "3"),
      baths: String(prop.baths || "2"),
      area: String(prop.area || "120"),
      floor: String(prop.floor || "1"),
      parking: String(prop.parking || "1"),
      description: prop.description || "",
      features: prop.features || [],
    })
    const imgs = (prop.images || []).map(url => ({ url, name: url.split('/').pop() }))
    setUploadedImages(imgs)
    setPrimaryImageIdx(0)
    setIsAddModalOpen(true)
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    try {
      const results = await Promise.all(files.map(f => uploadAPI.uploadImage(f)))
      const newImgs = results.map((r, i) => ({ url: r.url, name: files[i].name }))
      setUploadedImages(prev => [...prev, ...newImgs])
      dispatch(showToast(`تم رفع ${files.length} صورة بنجاح`))
    } catch (err) {
      dispatch(showToast('فشل رفع الصور: ' + err.message))
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (idx) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== idx))
    if (primaryImageIdx >= idx && primaryImageIdx > 0) setPrimaryImageIdx(primaryImageIdx - 1)
  }

  const handleSubmitProperty = async (e) => {
    e.preventDefault()
    if (uploadedImages.length === 0) {
      dispatch(showToast('يرجى رفع صورة واحدة على الأقل'))
      return
    }
    setSubmitting(true)
    try {
      const orderedImages = [
        uploadedImages[primaryImageIdx]?.url,
        ...uploadedImages.filter((_, i) => i !== primaryImageIdx).map(img => img.url),
      ].filter(Boolean)

      const payload = {
        ...newProperty,
        city: newProperty.city || newProperty.location?.split('،')[0]?.trim() || 'رام الله',
        price: Number(newProperty.price),
        rooms: Number(newProperty.rooms),
        baths: Number(newProperty.baths),
        area: Number(newProperty.area),
        floor: Number(newProperty.floor),
        parking: Number(newProperty.parking),
        images: orderedImages,
        emoji: '🏠',
      }

      if (editingProperty) {
        // تعديل العقار
        const updated = await propertiesAPI.update(editingProperty.id, payload)
        setMyProperties(prev => prev.map(p => p.id === editingProperty.id ? updated.property : p))
        dispatch(showToast('تم تعديل العقار بنجاح ✅'))
      } else {
        // إضافة عقار جديد
        const result = await dispatch(createProperty(payload))
        if (createProperty.fulfilled.match(result)) {
          dispatch(showToast('تم إضافة العقار بنجاح ✅'))
          await loadMyProperties()
        } else {
          dispatch(showToast(result.payload || 'فشل إضافة العقار'))
          setSubmitting(false)
          return
        }
      }
      setIsAddModalOpen(false)
      setNewProperty(EMPTY_FORM)
      setUploadedImages([])
      setPrimaryImageIdx(0)
    } catch (err) {
      dispatch(showToast('حدث خطأ: ' + err.message))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteProperty = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العقار؟')) return
    try {
      const result = await dispatch(deleteProperty(id))
      if (deleteProperty.fulfilled.match(result)) {
        setMyProperties(prev => prev.filter(p => p.id !== id))
        dispatch(showToast('تم حذف العقار بنجاح'))
      } else {
        dispatch(showToast(result.payload || 'فشل حذف العقار'))
      }
    } catch {
      dispatch(showToast('حدث خطأ أثناء الحذف'))
    }
  }

  // ── Settings ───────────────────────────────────────────────
  const [profileName, setProfileName] = useState(user?.name || '')
  const [profilePhone, setProfilePhone] = useState(user?.phone || '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [changingPass, setChangingPass] = useState(false)

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '')
      setProfilePhone(user.phone || '')
    }
  }, [user])

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      const data = await authAPI.updateProfile({ name: profileName, phone: profilePhone })
      dispatch(fetchCurrentUser())
      dispatch(showToast('تم تحديث البيانات الشخصية بنجاح ✅'))
    } catch (err) {
      dispatch(showToast('فشل التحديث: ' + err.message))
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPass || !newPass) return dispatch(showToast('يرجى تعبئة كلمة المرور الحالية والجديدة'))
    if (newPass.length < 6) return dispatch(showToast('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'))
    setChangingPass(true)
    try {
      await authAPI.changePassword({ currentPassword: currentPass, newPassword: newPass })
      dispatch(showToast('تم تغيير كلمة المرور بنجاح ✅'))
      setCurrentPass('')
      setNewPass('')
    } catch (err) {
      dispatch(showToast(err.message || 'فشل تغيير كلمة المرور'))
    } finally {
      setChangingPass(false)
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  useEffect(() => {
    if (activeTab === 'subscriptions' || activeTab === 'billing') {
      setSubLoading(true)
      Promise.all([subscriptionAPI.getMy(), paymentAPI.getHistory()])
        .then(([subRes, payRes]) => {
          setSubData(subRes.subscription || null)
          setPayments(payRes.payments || [])
        })
        .catch(() => {})
        .finally(() => setSubLoading(false))
    }
  }, [activeTab])

  const stats = [
    { label: isEn ? "Total Listings" : "عقاراتي",  val: myProperties.length, icon: <HomeIcon />,       color: "bg-brass" },
    { label: isEn ? "Total Views"   : "المشاهدات", val: myProperties.reduce((s,p) => s + (p.views||0), 0), icon: <VisibilityIcon />, color: "bg-sky-500" },
    { label: isEn ? "Leads"         : "الطلبات",   val: "–",                 icon: <AssignmentIcon />, color: "bg-brass" },
    { label: isEn ? "Revenue"       : "الأرباح",   val: "–",                 icon: <AttachMoneyIcon />, color: "bg-emerald-500" },
  ]

  const menu = [
    { id: "overview",      label: isEn ? "Overview"      : "نظرة عامة",      icon: <DashboardIcon /> },
    { id: "listings",      label: isEn ? "My Listings"   : "إدارة العقارات", icon: <HomeIcon /> },
    { id: "analytics",     label: isEn ? "Analytics"     : "التحليلات",      icon: <BarChartIcon /> },
    { id: "subscriptions", label: isEn ? "Subscriptions" : "الاشتراكات",     icon: <ReceiptLongIcon /> },
    { id: "billing",       label: isEn ? "Billing"       : "الفواتير",       icon: <ReceiptLongIcon /> },
    { id: "settings",      label: isEn ? "Settings"      : "الإعدادات",      icon: <SettingsIcon /> },
  ]

  return (
    <div className={`min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row ${isEn ? 'font-sans' : 'font-arabic'}`} dir={isEn ? "ltr" : "rtl"}>

      {/* Sidebar */}
      <aside className="w-full lg:w-72 bg-ink-600 text-white p-6 flex flex-col shrink-0">
        <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-10 h-10 bg-ink-500 rounded-xl flex items-center justify-center font-black text-xl">D</div>
          <div className="font-black text-xl tracking-tight">Dalilek <span className="text-brass">Pro</span></div>
        </div>
        <nav className="flex-1 space-y-2">
          {menu.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-black transition-all ${
                activeTab === item.id ? "bg-ink-500 text-white shadow-lg shadow-ink-700/20" : "text-ink-50 hover:bg-white/5 hover:text-white"
              }`}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <button onClick={handleLogout} className="mt-auto flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-black text-rose-400 hover:bg-rose-500/10 transition-all border border-rose-500/20">
          <LogoutIcon /> {isEn ? "Logout" : "تسجيل الخروج"}
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">

        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-ink-500 tracking-tight">{menu.find(m => m.id === activeTab)?.label}</h1>
            <p className="text-ink-100 font-medium mt-1">{isEn ? "Manage your real estate performance" : "أدِر أداء عقاراتك باحترافية"}</p>
          </div>
          <button onClick={openAddModal}
            className="bg-ink-500 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-ink-500 shadow-xl shadow-cream-300 transition-all active:scale-95">
            <AddCircleIcon /> {isEn ? "Add Property" : "إضافة عقار جديد"}
          </button>
        </header>

        {/* Modal إضافة/تعديل عقار */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-ink-500/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
            <div className="relative bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-y-auto max-h-[92vh]">
              <div className="p-8 border-b border-cream-100 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-10">
                <div>
                  <h3 className="text-xl font-black text-ink-500">
                    {editingProperty ? 'تعديل العقار' : 'إنشاء إعلان عقاري'}
                  </h3>
                  <p className="text-[10px] text-brass font-bold uppercase tracking-widest">ستظهر البيانات في صفحة تفاصيل العقار</p>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-cream-200 text-ink-50">
                  <CloseIcon />
                </button>
              </div>

              <form onSubmit={handleSubmitProperty} className="p-8 space-y-8">
                {/* رفع الصور */}
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-ink-100 uppercase tracking-widest">
                    صور العقار <span className="text-rose-500">*</span>
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-cream-300 hover:border-brass-light rounded-[1.5rem] p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all bg-cream-100 hover:bg-cream-200/30"
                  >
                    {uploading ? (
                      <div className="w-8 h-8 border-4 border-cream-400 border-t-ink-500 rounded-full animate-spin" />
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-cream-300 text-ink-500 rounded-2xl flex items-center justify-center">
                          <CloudUploadIcon />
                        </div>
                        <p className="text-sm font-black text-ink-200">اضغط لرفع الصور</p>
                        <p className="text-[10px] text-ink-50 font-bold">JPG, PNG, WEBP — حتى 5MB للصورة</p>
                      </>
                    )}
                    <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </div>
                  {uploadedImages.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-ink-50 uppercase tracking-widest">اضغط على ⭐ لتحديد الصورة الأساسية</p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {uploadedImages.map((img, idx) => (
                          <div key={idx} className={`relative rounded-2xl overflow-hidden border-4 transition-all ${idx === primaryImageIdx ? 'border-brass shadow-lg shadow-cream-400' : 'border-cream-200'}`}>
                            <img 
                              src={img.url.startsWith('http') ? img.url : `http://localhost:5000${img.url}`} 
                              alt={img.name} 
                              className="w-full h-24 object-cover" 
                            />
                            <button type="button" onClick={() => setPrimaryImageIdx(idx)}
                              className={`absolute top-1 right-1 w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-sm ${idx === primaryImageIdx ? 'bg-brass text-white' : 'bg-white/80 text-ink-50 hover:text-yellow-500'}`}>
                              {idx === primaryImageIdx ? <StarIcon sx={{ fontSize: 14 }} /> : <StarBorderIcon sx={{ fontSize: 14 }} />}
                            </button>
                            <button type="button" onClick={() => removeImage(idx)}
                              className="absolute top-1 left-1 w-7 h-7 bg-white/80 hover:bg-rose-500 hover:text-white text-ink-50 rounded-full flex items-center justify-center transition-all shadow-sm">
                              <CloseIcon sx={{ fontSize: 14 }} />
                            </button>
                            {idx === primaryImageIdx && (
                              <div className="absolute bottom-0 left-0 right-0 bg-brass/80 text-white text-[9px] font-black text-center py-1 uppercase">الصورة الأساسية</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* العنوان والموقع */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-ink-100 uppercase">عنوان العقار</label>
                    <input required type="text" placeholder="شقة فاخرة — رام الله" value={newProperty.title}
                      onChange={e => setNewProperty({...newProperty, title: e.target.value})}
                      className="w-full bg-cream-100 border border-cream-200 rounded-2xl px-6 py-4 text-sm font-bold focus:border-brass outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-ink-100 uppercase">الموقع (حي، مدينة)</label>
                    <input required type="text" placeholder="رام الله، المصيون" value={newProperty.location}
                      onChange={e => setNewProperty({...newProperty, location: e.target.value, city: e.target.value.split('،').pop()?.trim() || e.target.value})}
                      className="w-full bg-cream-100 border border-cream-200 rounded-2xl px-6 py-4 text-sm font-bold focus:border-brass outline-none transition-all" />
                  </div>
                </div>

                {/* السعر والنوع */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-ink-100 uppercase">السعر (₪)</label>
                    <input required type="number" placeholder="850000" value={newProperty.price}
                      onChange={e => setNewProperty({...newProperty, price: e.target.value})}
                      className="w-full bg-cream-100 border border-cream-200 rounded-2xl px-6 py-4 text-sm font-bold focus:border-brass outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-ink-100 uppercase">الحالة</label>
                    <div className="flex bg-cream-100 p-1.5 rounded-2xl border border-cream-200">
                      {[['SALE','للبيع'],['RENT','للإيجار']].map(([val, lbl]) => (
                        <button key={val} type="button" onClick={() => setNewProperty({...newProperty, type: val})}
                          className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${newProperty.type === val ? "bg-white shadow-sm text-ink-500" : "text-ink-50 hover:text-ink-200"}`}>
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* التصنيف */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-ink-100 uppercase">نوع العقار</label>
                  <div className="flex flex-wrap gap-2">
                    {[['APT','شقة'],['VILLA','فيلا'],['LAND','أرض'],['OFFICE','مكتب'],['SHOP','محل تجاري']].map(([val, lbl]) => (
                      <button key={val} type="button" onClick={() => setNewProperty({...newProperty, category: val})}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black border transition-all ${newProperty.category === val ? "bg-ink-500 text-white border-ink-500" : "bg-white border-cream-300 text-ink-100 hover:border-ink-50"}`}>
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* المواصفات */}
                <div className="bg-ink-500 rounded-[2rem] p-8 text-white">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-brass-light mb-6 text-center">المواصفات الفنية</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      { label: "غرف",  key: "rooms",   val: newProperty.rooms },
                      { label: "حمام", key: "baths",   val: newProperty.baths },
                      { label: "م²",   key: "area",    val: newProperty.area },
                      { label: "طابق", key: "floor",   val: newProperty.floor },
                      { label: "موقف", key: "parking", val: newProperty.parking },
                    ].map(item => (
                      <div key={item.key} className="space-y-2">
                        <label className="text-[9px] font-black text-ink-50 block text-center uppercase">{item.label}</label>
                        <input type="number" value={item.val} min="0"
                          onChange={e => setNewProperty({...newProperty, [item.key]: e.target.value})}
                          className="w-full bg-white/10 border border-white/10 rounded-xl py-3 text-center font-black text-white outline-none focus:border-brass" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* الوصف */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-ink-100 uppercase">وصف العقار</label>
                  <textarea rows="4" placeholder="شقة فاخرة في قلب رام الله..." value={newProperty.description}
                    onChange={e => setNewProperty({...newProperty, description: e.target.value})}
                    className="w-full bg-cream-100 border border-cream-200 rounded-[1.5rem] px-6 py-4 text-sm font-medium focus:border-brass outline-none transition-all leading-relaxed" />
                </div>

                {/* المميزات */}
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-ink-100 uppercase">المميزات والخدمات</label>
                  <div className="flex flex-wrap gap-2">
                    {['تكييف مركزي','مصعد','موقف','أمن 24 ساعة','إنترنت فايبر','مدخل خاص','حديقة','مسبح','غرفة خادمة'].map(feature => (
                      <button key={feature} type="button"
                        onClick={() => {
                          const exists = newProperty.features.includes(feature)
                          setNewProperty({...newProperty, features: exists ? newProperty.features.filter(f => f !== feature) : [...newProperty.features, feature]})
                        }}
                        className={`px-4 py-2 rounded-full text-[10px] font-black border transition-all ${newProperty.features.includes(feature) ? "bg-ink-500 border-ink-500 text-white" : "bg-white border-cream-300 text-ink-100 hover:border-brass"}`}>
                        {feature}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-cream-100">
                  <button type="submit" disabled={submitting || uploading || uploadedImages.length === 0}
                    className="w-full py-5 bg-ink-500 disabled:bg-cream-400 text-white rounded-[1.5rem] font-black text-sm hover:bg-ink-600 shadow-xl shadow-cream-300 transition-all active:scale-95">
                    {submitting ? 'جاري الحفظ...' : editingProperty ? 'حفظ التعديلات' : 'تأكيد ونشر الإعلان'}
                  </button>
                  {uploadedImages.length === 0 && (
                    <p className="text-[11px] text-rose-500 font-bold text-center mt-2">⚠️ يرجى رفع صورة واحدة على الأقل</p>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {stats.map((s, i) => (
                <div key={i} className="bg-white p-6 rounded-[2rem] border border-cream-200 shadow-sm flex items-center gap-5 hover:border-cream-400 transition-all">
                  <div className={`w-14 h-14 ${s.color} text-white rounded-2xl flex items-center justify-center shadow-lg`}>{s.icon}</div>
                  <div>
                    <div className="text-ink-50 text-[10px] font-black uppercase tracking-widest">{s.label}</div>
                    <div className="text-2xl font-black text-ink-500">{s.val}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-cream-200 shadow-sm">
              <h3 className="font-black text-ink-500 flex items-center gap-2 mb-6"><TrendingUpIcon className="text-brass" /> أداء المشاهدات</h3>
              <div className="h-64 bg-cream-100 rounded-3xl border-2 border-dashed border-cream-300 flex items-end justify-between p-6">
                {[40,70,45,90,65,80,50].map((h, i) => (
                  <div key={i} className="w-8 bg-cream-300 rounded-t-lg hover:bg-ink-500 cursor-pointer transition-all" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Listings Tab */}
        {activeTab === "listings" && (
          <div className="bg-white rounded-[2.5rem] border border-cream-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
            <div className="p-8 border-b border-cream-100 flex justify-between items-center">
              <h3 className="font-black text-ink-500">قائمة عقاراتي ({myProperties.length})</h3>
            </div>
            {propsLoading ? (
              <div className="p-16 text-center text-ink-50 font-bold">جاري التحميل...</div>
            ) : myProperties.length === 0 ? (
              <div className="p-16 text-center">
                <p className="text-ink-50 font-bold mb-4">لا توجد عقارات بعد</p>
                <button onClick={openAddModal} className="bg-ink-500 text-white px-6 py-3 rounded-xl font-black text-sm">
                  إضافة أول عقار
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="bg-cream-100/50 text-ink-50 text-[10px] font-black uppercase tracking-widest">
                      <th className="px-8 py-4">العقار</th>
                      <th className="px-8 py-4">الحالة</th>
                      <th className="px-8 py-4">السعر</th>
                      <th className="px-8 py-4">المشاهدات</th>
                      <th className="px-8 py-4 text-center">العمليات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-100">
                    {myProperties.map(prop => (
                      <tr key={prop.id} className="hover:bg-cream-100/80 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-cream-200 flex-shrink-0">
                              {prop.images?.[0] ? (
                                <img src={prop.images[0].startsWith('http') ? prop.images[0] : `http://localhost:5000${prop.images[0]}`} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xl">{prop.emoji || '🏠'}</div>
                              )}
                            </div>
                            <div>
                              <div className="font-black text-ink-500 text-sm">{prop.title}</div>
                              <div className="text-[10px] text-ink-50 font-medium">{prop.location}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${
                            prop.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                          }`}>{prop.status === 'active' ? 'نشط' : prop.status}</span>
                        </td>
                        <td className="px-8 py-5 font-black text-ink-200">₪ {prop.price?.toLocaleString()}</td>
                        <td className="px-8 py-5 text-ink-100 font-bold">{prop.views || 0}</td>
                        <td className="px-8 py-5">
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => openEditModal(prop)}
                              className="p-2 hover:bg-cream-200 text-ink-500 rounded-xl" title="تعديل">
                              <EditIcon sx={{ fontSize: 18 }} />
                            </button>
                            <button 
                              onClick={() => handleDeleteProperty(prop.id)}
                              className="p-2 hover:bg-rose-50 text-rose-600 rounded-xl" title="حذف">
                              <DeleteIcon sx={{ fontSize: 18 }} />
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

        {/* Analytics Tab */}
        {activeTab === "analytics" && (() => {
          const totalViews   = myProperties.reduce((s, p) => s + (p.views || 0), 0)
          const totalActive  = myProperties.filter(p => p.status === 'active').length
          const totalValue   = myProperties.reduce((s, p) => s + (p.price || 0), 0)
          const verified     = myProperties.filter(p => p.verified).length
          const topProps     = [...myProperties].sort((a, b) => (b.views||0) - (a.views||0)).slice(0, 5)
          const maxViews     = Math.max(...myProperties.map(p => p.views || 0), 1)

          const catCount = myProperties.reduce((acc, p) => {
            const k = p.category || 'apt'
            acc[k] = (acc[k] || 0) + 1
            return acc
          }, {})
          const catLabels = { apt: 'شقة', villa: 'فيلا', land: 'أرض', office: 'مكتب', shop: 'محل' }

          return (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'إجمالي المشاهدات', val: totalViews.toLocaleString(), bg: 'bg-cream-200',    iconBg: 'bg-brass',    Icon: VisibilityIcon },
                  { label: 'عقارات نشطة',       val: totalActive,                 bg: 'bg-emerald-50', iconBg: 'bg-emerald-500', Icon: HomeIcon },
                  { label: 'عقارات موثّقة',     val: verified,                    bg: 'bg-cream-200',  iconBg: 'bg-brass',  Icon: VerifiedUserIcon },
                  { label: 'إجمالي القيمة',      val: `₪${(totalValue/1000).toFixed(0)}K`, bg: 'bg-amber-50', iconBg: 'bg-amber-500', Icon: AccountBalanceWalletIcon },
                ].map((s, i) => (
                  <div key={i} className={`rounded-[2rem] p-6 border border-cream-200 shadow-sm ${s.bg}`}>
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${s.iconBg}`}>
                      <s.Icon sx={{ fontSize: 20, color: 'white' }} />
                    </div>
                    <div className="text-2xl font-black text-ink-500 mb-1">{s.val}</div>
                    <div className="text-[10px] font-bold text-ink-100 uppercase tracking-widest">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Top Properties by Views */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-cream-200 shadow-sm">
                <h3 className="font-black text-ink-500 text-base mb-6 flex items-center gap-2">
                  <EmojiEventsIcon sx={{ fontSize: 20, color: '#f59e0b' }} />
                  أكثر العقارات مشاهدةً
                </h3>
                {topProps.length === 0 ? (
                  <p className="text-ink-50 text-sm font-bold text-center py-8">لا توجد عقارات بعد</p>
                ) : (
                  <div className="space-y-4">
                    {topProps.map((p, i) => (
                      <div key={p.id || i} className="flex items-center gap-4">
                        <span className="text-xs font-black text-cream-400 w-5">#{i+1}</span>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-black text-ink-400 line-clamp-1">{p.title}</span>
                            <span className="text-xs font-bold text-ink-50">{p.views || 0} مشاهدة</span>
                          </div>
                          <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-brass rounded-full transition-all duration-700"
                              style={{ width: `${((p.views || 0) / maxViews) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Category Breakdown */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-cream-200 shadow-sm">
                <h3 className="font-black text-ink-500 text-base mb-6 flex items-center gap-2">
                  <BarChartIcon sx={{ fontSize: 20, color: '#6366f1' }} />
                  توزيع العقارات حسب الفئة
                </h3>
                {Object.keys(catCount).length === 0 ? (
                  <p className="text-ink-50 text-sm font-bold text-center py-8">لا توجد بيانات</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(catCount).map(([cat, count]) => (
                      <div key={cat} className="flex items-center gap-4">
                        <span className="text-sm font-black text-ink-100 w-20 text-right">{catLabels[cat] || cat}</span>
                        <div className="flex-1 h-3 bg-cream-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brass rounded-full"
                            style={{ width: `${(count / myProperties.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-black text-ink-50">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )
        })()}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="max-w-4xl space-y-6 animate-in fade-in duration-500">
            <div className="bg-white rounded-[2.5rem] border border-cream-200 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-cream-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-cream-200 text-ink-500 rounded-2xl flex items-center justify-center"><PersonIcon /></div>
                <div>
                  <h3 className="font-black text-ink-500">المعلومات الشخصية</h3>
                  <p className="text-[10px] text-ink-50 font-bold uppercase">تعديل بيانات حسابك</p>
                </div>
              </div>
              <div className="p-8 grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-ink-100 uppercase">الاسم الكامل</label>
                  <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)}
                    className="w-full bg-cream-100 border border-cream-200 rounded-2xl px-6 py-4 text-sm font-bold focus:border-brass outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-ink-100 uppercase">رقم الهاتف</label>
                  <input type="text" value={profilePhone} onChange={e => setProfilePhone(e.target.value)}
                    className="w-full bg-cream-100 border border-cream-200 rounded-2xl px-6 py-4 text-sm font-bold focus:border-brass outline-none" />
                </div>
                <div className="md:col-span-2">
                  <button onClick={handleSaveProfile} disabled={savingProfile}
                    className="w-full py-4 bg-ink-500 disabled:bg-cream-400 text-white rounded-2xl text-xs font-black hover:bg-ink-600 transition-all flex items-center justify-center gap-2">
                    <SaveIcon sx={{ fontSize: 18 }} />
                    {savingProfile ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-cream-200 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center"><SecurityIcon /></div>
                <h4 className="font-black text-ink-500">تغيير كلمة المرور</h4>
              </div>
              <div className="space-y-4">
                <input type="password" placeholder="كلمة المرور الحالية" value={currentPass}
                  onChange={e => setCurrentPass(e.target.value)}
                  className="w-full bg-cream-100 border border-cream-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-brass outline-none" />
                <input type="password" placeholder="كلمة المرور الجديدة (6 أحرف على الأقل)" value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  className="w-full bg-cream-100 border border-cream-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-brass outline-none" />
                <button onClick={handleChangePassword} disabled={changingPass}
                  className="w-full py-4 bg-ink-500 disabled:bg-ink-50 text-white rounded-2xl text-xs font-black hover:bg-ink-500 transition-all">
                  {changingPass ? 'جاري التغيير...' : 'تحديث كلمة المرور'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Subscriptions Tab */}
        {activeTab === "subscriptions" && (
          <div className="max-w-4xl space-y-6 animate-in fade-in duration-500">
            {subLoading ? (
              <div className="py-16 text-center text-ink-50 font-bold">جاري التحميل...</div>
            ) : subData ? (
              <>
                <div className={`rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl ${subData.plan === 'GOLD' ? 'bg-gradient-to-br from-amber-500 to-yellow-600 shadow-amber-200' : 'bg-gradient-to-br from-ink-300 to-ink-500 shadow-cream-300'}`}>
                  <div>
                    <div className="text-white/70 text-xs font-black uppercase tracking-widest mb-2">الباقة الحالية</div>
                    <h2 className="text-3xl font-black mb-2 flex items-center gap-2">
                      {subData.plan === 'GOLD' ? <WorkspacePremiumIcon sx={{ fontSize: 28 }} /> : <CardMembershipIcon sx={{ fontSize: 28 }} />}
                      {subData.plan === 'GOLD' ? 'الباقة الذهبية' : 'الباقة المجانية'}
                    </h2>
                    <p className="text-white/70 text-sm font-medium">
                      <span className="flex items-center gap-1">
                        الحالة:
                        {subData.status === 'ACTIVE'
                          ? <><CheckCircleIcon sx={{ fontSize: 14 }} /> نشطة</>
                          : subData.status === 'CANCELLED'
                          ? <><CancelIcon sx={{ fontSize: 14 }} /> ملغاة</>
                          : <><ErrorIcon sx={{ fontSize: 14 }} /> منتهية</>}
                      </span>
                    </p>
                    {subData.endDate && (
                      <p className="text-white/60 text-xs font-bold mt-1">
                        تنتهي في: {new Date(subData.endDate).toLocaleDateString('ar-EG')}
                      </p>
                    )}
                  </div>
                  <div className="text-center bg-white/10 p-8 rounded-3xl border border-white/20 backdrop-blur-sm shrink-0">
                    <div className="text-5xl font-black mb-1">{subData.plan === 'GOLD' ? '₪99' : '₪0'}</div>
                    <div className="text-white/60 text-[10px] font-black uppercase">شهرياً</div>
                  </div>
                </div>
                {subData.plan === 'FREE' && (
                  <div className="bg-white rounded-[2rem] p-6 border border-amber-100 shadow-sm text-center">
                    <div className="flex items-center justify-center gap-2 font-black text-ink-400 mb-4">
                      <RocketLaunchIcon sx={{ fontSize: 20, color: '#f59e0b' }} />
                      قم بالترقية للباقة الذهبية للحصول على 25 عقاراً وميزات متقدمة
                    </div>
                    <button onClick={() => navigate('/contact')}
                      className="bg-amber-500 hover:bg-amber-600 text-white font-black px-8 py-3 rounded-2xl transition-all flex items-center gap-2 mx-auto">
                      <WorkspacePremiumIcon sx={{ fontSize: 18 }} />
                      تواصل معنا للترقية
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-16 text-center text-ink-50 font-bold">لا توجد بيانات اشتراك</div>
            )}
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === "billing" && (
          <div className="max-w-4xl space-y-6 animate-in fade-in duration-500">
            <div className="bg-white rounded-[2.5rem] border border-cream-200 shadow-sm p-8">
              <h3 className="font-black text-ink-500 mb-6 flex items-center gap-2">
                <ReceiptLongIcon sx={{ fontSize: 20 }} className="text-ink-50" /> سجل الفواتير
              </h3>
              {subLoading ? (
                <div className="py-10 text-center text-ink-50 font-bold">جاري التحميل...</div>
              ) : payments.length === 0 ? (
                <div className="py-10 text-center text-ink-50 font-bold">لا توجد فواتير بعد</div>
              ) : (
                <div className="space-y-3">
                  {payments.map((pay, i) => (
                    <div key={pay._id || i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-cream-100 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-cream-200 rounded-xl flex items-center justify-center text-ink-50">
                          <CalendarMonthIcon sx={{ fontSize: 18 }} />
                        </div>
                        <div>
                          <div className="text-sm font-black text-ink-500">
                            {new Date(pay.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </div>
                          <div className="text-[10px] text-ink-50 font-bold uppercase">
                            {pay.currency || 'ILS'} — {pay.plan === 'GOLD' ? 'الباقة الذهبية' : 'اشتراك'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-black text-ink-500">₪ {pay.amount}</span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-xl uppercase ${pay.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-600' : pay.status === 'PENDING' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'}`}>
                          {pay.status === 'SUCCESS' ? 'مدفوعة' : pay.status === 'PENDING' ? 'معلقة' : 'فشلت'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}