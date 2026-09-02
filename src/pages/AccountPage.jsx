import { useState, useEffect, useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { logout, fetchCurrentUser } from "@/store/slices/authSlice"
import { showToast } from "@/store/slices/uiSlice"
import { authAPI, favoritesAPI } from "@/lib/api"

// Components
import PropertyCard from "@/components/property/PropertyCard"

// Icons
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder"
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone"
import FavoriteIcon from "@mui/icons-material/Favorite"
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser"
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead" 
import SettingsIcon from "@mui/icons-material/Settings"
import LogoutIcon from "@mui/icons-material/Logout"
import PersonIcon from "@mui/icons-material/Person"
import CameraAltIcon from "@mui/icons-material/CameraAlt"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever" 
import HomeWorkIcon from "@mui/icons-material/HomeWork"
import PhoneIcon from "@mui/icons-material/Phone"
import EmailIcon from "@mui/icons-material/Email"
import VerifiedIcon from "@mui/icons-material/Verified"
import ShieldIcon from "@mui/icons-material/Shield"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"

export default function AccountPage() {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, favorites = [] } = useSelector(s => s.auth)
  const [activeTab, setActiveTab] = useState("profile")
  const isEn = i18n.language === 'en'

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarInputRef = useRef(null)

  // Profile edit state
  const [editName, setEditName] = useState(user?.name || '')
  const [editPhone, setEditPhone] = useState(user?.phone || '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [changingPass, setChangingPass] = useState(false)

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarUploading(true)
    try {
      setAvatarPreview(URL.createObjectURL(file))
      const res = await authAPI.uploadAvatar(file)
      const avatarUrl = res.url || res.path
      await authAPI.updateProfile({ avatar: avatarUrl })
      dispatch(fetchCurrentUser())
      dispatch(showToast('تم تحديث صورتك الشخصية ✅'))
    } catch (err) {
      dispatch(showToast(err.message || 'فشل رفع الصورة'))
      setAvatarPreview(null)
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!editName.trim()) return dispatch(showToast('الاسم مطلوب'))
    setSavingProfile(true)
    try {
      await authAPI.updateProfile({ name: editName, phone: editPhone })
      await dispatch(fetchCurrentUser())
      dispatch(showToast('تم تحديث البيانات الشخصية بنجاح ✅'))
    } catch (err) {
      dispatch(showToast(err.message || 'فشل التحديث'))
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (newPass !== confirmPass) return dispatch(showToast('كلمات المرور غير متطابقة'))
    if (newPass.length < 6) return dispatch(showToast('كلمة المرور يجب 6 أحرف على الأقل'))
    setChangingPass(true)
    try {
      await authAPI.changePassword({ currentPassword: currentPass, newPassword: newPass })
      dispatch(showToast('تم تغيير كلمة المرور بنجاح ✅'))
      setCurrentPass(''); setNewPass(''); setConfirmPass('')
    } catch (err) {
      dispatch(showToast(err.message || 'فشل تغيير كلمة المرور'))
    } finally {
      setChangingPass(false)
    }
  }

  const [favProps, setFavProps] = useState([])
  const [favLoading, setFavLoading] = useState(false)
  const [notifs, setNotifs] = useState([])
  const [notifsLoading, setNotifsLoading] = useState(false)

  useEffect(() => {
    if (activeTab !== 'notifs') return
    setNotifsLoading(true)
    const builtNotifs = []

    // إشعار توثيق الحساب
    builtNotifs.push({
      id: 'account-verified',
      title: user?.approved ? 'حسابك موثّق ✅' : 'حسابك قيد المراجعة',
      desc: user?.approved
        ? 'تم قبول حسابك من قِبل الإدارة، يمكنك الاستمتاع بكامل المميزات.'
        : 'حسابك تحت المراجعة من فريق الإدارة، سيتم إعلامك عند القبول.',
      time: 'عند التسجيل',
      unread: false,
      type: 'system',
      Icon: VerifiedUserIcon,
      color: user?.approved ? 'bg-emerald-500' : 'bg-amber-500',
    })

    // إشعار المفضلة
    const favCount = user?.favorites?.length || 0
    if (favCount > 0) {
      builtNotifs.push({
        id: 'favs',
        title: `لديك ${favCount} عقار في المفضلة`,
        desc: 'تصفح عقاراتك المفضلة وتواصل مع الوكلاء.',
        time: 'حسب آخر تحديث',
        unread: false,
        type: 'fav',
        Icon: FavoriteIcon,
        color: 'bg-rose-500',
      })
    }

    setNotifs(builtNotifs)
    setNotifsLoading(false)
  }, [activeTab])

  useEffect(() => {
    if (!user) return
    const loadFavs = async () => {
      setFavLoading(true)
      try {
        const data = await favoritesAPI.getAll()
        setFavProps(data.favorites || [])
      } catch {
        setFavProps([])
      } finally {
        setFavLoading(false)
      }
    }
    loadFavs()
  }, [user])

  const handleLogout = () => {
    dispatch(logout())
    dispatch(showToast(isEn ? "Logged out safely" : "تم تسجيل الخروج بنجاح"))
    navigate("/")
  }

 const tabs = [
    { id: "profile", label: "الملف الشخصي", icon: <PersonIcon sx={{ fontSize: 20 }} /> },
    { id: "favs", label: "المفضلة", icon: <FavoriteBorderIcon sx={{ fontSize: 20 }} /> },
    { id: "notifs", label: "الإشعارات", icon: <NotificationsNoneIcon sx={{ fontSize: 20 }} /> },
    { id: "settings", label: "الإعدادات", icon: <SettingsIcon sx={{ fontSize: 20 }} /> },
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Header مع خلفية بنمط شبكي خفيف */}
      <div className="h-56 bg-ink-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#3b82f6 1.5px, transparent 1.5px)", backgroundSize: "40px 40px" }} />
        <div className="max-w-6xl mx-auto px-6 h-full flex items-start pt-12">
           <button onClick={() => navigate(-1)} className="group flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white text-sm font-black transition-all">
              <ArrowBackIcon sx={{ fontSize: 18, transform: isEn ? '' : 'rotate(180deg)' }} /> {t('common.back')}
           </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-24">
        <div className="grid lg:grid-cols-[320px_1fr] gap-8">
          
          {/* الجانب الأيسر: بطاقة المستخدم */}
          <aside className="space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 border border-cream-200 shadow-2xl shadow-cream-300/40 relative overflow-hidden">
              {/* تأثير زخرفي */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-cream-200 rounded-full blur-3xl opacity-50" />
              
              <div className="relative z-10 text-center">
                <div className="relative w-28 h-28 mx-auto mb-6">
                  {/* صورة الأفاتار */}
                  {avatarPreview || (user?.avatar && (user.avatar.startsWith('/') || user.avatar.startsWith('http'))) ? (
                    <img
                      src={avatarPreview || (user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`)}
                      className="w-full h-full rounded-[2rem] object-cover border-4 border-white shadow-xl rotate-3 hover:rotate-0 transition-transform duration-500"
                      alt="Avatar"
                    />
                  ) : (
                    <div className="w-full h-full rounded-[2rem] bg-ink-500 border-4 border-white shadow-xl flex items-center justify-center rotate-3 hover:rotate-0 transition-transform duration-500">
                      <span className="text-white font-black text-2xl">{user?.name?.slice(0,2)}</span>
                    </div>
                  )}

                  {/* زر تغيير الصورة */}
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="absolute -bottom-2 -left-1 bg-ink-500 hover:bg-ink-600 text-white p-1.5 rounded-xl shadow-lg border-2 border-white transition-all"
                  >
                    {avatarUploading
                      ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <CameraAltIcon sx={{ fontSize: 18 }} />}
                  </button>
                  <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />

                  <div className="absolute -bottom-2 -right-1 bg-emerald-500 text-white p-1.5 rounded-xl shadow-lg border-2 border-white">
                    <VerifiedIcon sx={{ fontSize: 18 }} />
                  </div>
                </div>
                <h2 className="text-2xl font-black text-ink-500 mb-1">{user?.name}</h2>
                <span className="inline-block px-4 py-1 bg-cream-200 rounded-full text-[10px] font-black text-ink-100 uppercase tracking-[0.2em] mb-8">
                  {user?.role || 'CLIENT'}
                </span>
                
                <nav className="space-y-2 text-right">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black transition-all duration-300 ${
                        activeTab === tab.id 
                        ? "bg-ink-500 text-white shadow-xl shadow-cream-300 -translate-y-1" 
                        : "text-ink-100 hover:bg-cream-100 hover:text-ink-500"
                      }`}
                    >
                      <span className={`${activeTab === tab.id ? "text-white" : "text-brass"}`}>{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </nav>

                <div className="pt-6 mt-6 border-t border-cream-100">
                  <button onClick={handleLogout} className="w-full group flex items-center justify-center gap-2 text-rose-500 font-black text-sm hover:bg-rose-50 py-4 rounded-2xl transition-all">
                    <LogoutIcon sx={{ fontSize: 20 }} className="group-hover:-translate-x-1 transition-transform" /> {t('auth.logout')}
                  </button>
                </div>
              </div>
            </div>

            {/* بطاقة الحماية */}
            <div className="bg-ink-500 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-black text-sm mb-3 flex items-center gap-2">
                  <ShieldIcon className="text-brass-light" sx={{ fontSize: 20 }} /> {t('account.securityTitle')}
                </h3>
                <p className="text-ink-50 text-xs leading-relaxed">
                  حسابك محمي بموجب سياسات الخصوصية المتقدمة لضمان أمان بياناتك العقارية.
                </p>
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-brass/10 rounded-full -mr-10 -mt-10 blur-2xl" />
            </div>
          </aside>

          {/* المحتوى الرئيسي */}
          <main className="min-h-[600px]">
            {activeTab === "profile" && (
              <section className="bg-white rounded-[2.5rem] p-10 border border-cream-200 shadow-sm animate-in fade-in slide-in-from-bottom-5 duration-500">
                <div className="flex items-center gap-4 mb-10 pb-6 border-b border-cream-100">
                  <div className="w-12 h-12 bg-cream-200 rounded-2xl flex items-center justify-center text-ink-500">
                    <PersonIcon />
                  </div>
                  <h3 className="text-2xl font-black text-ink-500">{t('account.personalInfo')}</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 text-right">
                  <div>
                    <label className="text-[11px] font-black text-ink-50 uppercase tracking-widest mb-2 block">الاسم الكامل</label>
                    <input value={editName} onChange={e => setEditName(e.target.value)}
                      className="w-full bg-cream-100 border-2 border-cream-200 rounded-2xl px-5 py-4 font-bold text-ink-500 focus:border-brass focus:ring-4 focus:ring-brass/5 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-ink-50 uppercase tracking-widest mb-2 block">رقم الهاتف</label>
                    <input value={editPhone} onChange={e => setEditPhone(e.target.value)}
                      className="w-full bg-cream-100 border-2 border-cream-200 rounded-2xl px-5 py-4 font-bold text-ink-500 focus:border-brass focus:ring-4 focus:ring-brass/5 outline-none transition-all"
                      placeholder="+970 5X XXX XXXX" dir="ltr" />
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-ink-50 uppercase tracking-widest mb-2 block">البريد الإلكتروني</label>
                    <div className="flex items-center gap-4 p-5 bg-cream-100 rounded-2xl border-2 border-cream-200 opacity-60">
                      <EmailIcon fontSize="small" className="text-brass" />
                      <span className="font-bold text-ink-500">{user?.email}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-ink-50 uppercase tracking-widest mb-2 block">نوع الحساب</label>
                    <div className="flex items-center gap-4 p-5 bg-cream-100 rounded-2xl border-2 border-cream-200 opacity-60">
                      <HomeWorkIcon fontSize="small" className="text-brass" />
                      <span className="font-bold text-ink-500">{user?.role || 'CLIENT'}</span>
                    </div>
                  </div>
                  <div className="md:col-span-2 pt-2">
                    <button onClick={handleSaveProfile} disabled={savingProfile}
                      className="bg-ink-500 disabled:bg-ink-50 text-white font-black px-12 py-4 rounded-2xl hover:bg-ink-500 transition-all shadow-xl shadow-cream-300 active:scale-95">
                      {savingProfile ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </button>
                  </div>
                </div>
              </section>
            )}

            {activeTab === "favs" && (
              <section className="animate-in fade-in slide-in-from-bottom-5 duration-500">
                <div className="flex items-center justify-between mb-8 px-4 text-right">
                  <h3 className="text-2xl font-black text-ink-500">{t('account.favs')}</h3>
                  <span className="bg-ink-500 text-white px-5 py-1.5 rounded-full text-xs font-black shadow-lg shadow-cream-300">
                    {favProps.length} {t('common.items')}
                  </span>
                </div>
                {favLoading ? (
                  <div className="text-center py-20 text-ink-50 font-bold">جاري التحميل...</div>
                ) : favProps.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-6">
                    {favProps.map(p => <PropertyCard key={p.id} property={p} />)}
                  </div>
                ) : (
                  <div className="bg-white rounded-[3rem] p-24 text-center border-2 border-dashed border-cream-300">
                    <div className="w-20 h-20 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FavoriteBorderIcon sx={{ fontSize: 40 }} className="text-cream-300" />
                    </div>
                    <p className="text-ink-50 font-bold text-lg">{t('account.noFavs')}</p>
                    <button onClick={() => navigate('/properties')} className="mt-4 text-ink-500 font-black text-sm hover:underline">
                      استكشف العقارات الآن
                    </button>
                  </div>
                )}
              </section>
            )}

            {activeTab === "notifs" && (
  <section className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-cream-200 shadow-sm animate-in fade-in slide-in-from-bottom-5 duration-500 text-right">
    <div className="flex items-center justify-between mb-10 pb-6 border-b border-cream-100">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-ink-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-cream-300">
          <NotificationsNoneIcon />
        </div>
        <div>
          <h3 className="text-2xl font-black text-ink-500">{t('account.recentNotifs')}</h3>
          <p className="text-xs text-ink-50 font-bold uppercase tracking-tighter">ابقَ على اطلاع بأحدث التطورات</p>
        </div>
      </div>
      <span className="text-xs font-black text-ink-50 bg-cream-200 px-3 py-1.5 rounded-xl">
        {notifs.filter(n => n.unread).length} جديد
      </span>
    </div>

    {notifsLoading ? (
      <div className="py-16 text-center text-ink-50 font-bold">جاري التحميل...</div>
    ) : notifs.length === 0 ? (
      <div className="py-16 text-center">
        <MarkEmailReadIcon sx={{ fontSize: 48, color: '#cbd5e1' }} />
        <p className="text-ink-50 font-bold mt-4">لا توجد إشعارات حالياً</p>
      </div>
    ) : (
      <div className="space-y-4">
        {notifs.map((notif) => (
          <div
            key={notif.id}
            className={`group flex gap-5 p-6 rounded-[2rem] transition-all border-2 cursor-pointer ${
              notif.unread
              ? "bg-cream-200/30 border-cream-300/50 hover:bg-cream-200"
              : "bg-white border-transparent hover:bg-cream-100 hover:border-cream-200"
            }`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110 text-white ${notif.color || 'bg-ink-50'}`}>
              {notif.Icon ? <notif.Icon sx={{ fontSize: 22 }} /> : <NotificationsNoneIcon />}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-base font-black text-ink-500">{notif.title}</h4>
                {notif.unread && <span className="w-2 h-2 bg-ink-500 rounded-full animate-pulse" />}
              </div>
              <p className="text-sm text-ink-100 leading-relaxed font-medium mb-3">{notif.desc}</p>
              <div className="flex items-center gap-2 text-[10px] font-black text-ink-50 uppercase tracking-wide">
                <span>{notif.time}</span>
                <span>•</span>
                <span className={notif.unread ? 'text-brass' : 'text-ink-50'}>
                  {notif.unread ? 'جديد' : 'تم العرض'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
)}

 {activeTab === "settings" && (
  <section className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-cream-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 text-right">
    {/* عنوان القسم */}
    <div className="flex items-center gap-4 mb-10 pb-6 border-b border-cream-100">
      <div className="w-12 h-12 bg-ink-500 rounded-2xl flex items-center justify-center text-white">
        <SettingsIcon />
      </div>
      <div>
        <h3 className="text-2xl font-black text-ink-500">{t('account.settings')}</h3>
        <p className="text-xs text-ink-50 font-bold uppercase tracking-tighter">إدارة الحساب والأمان</p>
      </div>
    </div>

    <div className="space-y-10">
      {/* 1. نموذج تغيير كلمة المرور */}
      <div className="bg-cream-100/50 p-8 rounded-[2.5rem] border border-cream-200">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-ink-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-cream-300">
            <ShieldIcon sx={{ fontSize: 20 }} />
          </div>
          <h4 className="text-lg font-black text-ink-500">تغيير كلمة المرور</h4>
        </div>
        
        <form 
          className="space-y-6" 
          onSubmit={handleChangePassword}
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-ink-50 uppercase tracking-[0.1em] mr-1 block">كلمة المرور الحالية</label>
              <input 
                value={currentPass} onChange={e => setCurrentPass(e.target.value)}
                type="password" required
                className="w-full bg-white border-2 border-cream-200 rounded-2xl px-5 py-4 focus:border-brass focus:ring-4 focus:ring-brass/5 outline-none transition-all font-bold text-ink-500"
                placeholder="••••••••"
              />
            </div>
            <div className="hidden md:block"></div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-ink-50 uppercase tracking-[0.1em] mr-1 block">كلمة المرور الجديدة</label>
              <input 
                value={newPass} onChange={e => setNewPass(e.target.value)}
                type="password" required
                className="w-full bg-white border-2 border-cream-200 rounded-2xl px-5 py-4 focus:border-brass focus:ring-4 focus:ring-brass/5 outline-none transition-all font-bold text-ink-500"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-ink-50 uppercase tracking-[0.1em] mr-1 block">تأكيد الكلمة الجديدة</label>
              <input 
                value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                type="password" required
                className="w-full bg-white border-2 border-cream-200 rounded-2xl px-5 py-4 focus:border-brass focus:ring-4 focus:ring-brass/5 outline-none transition-all font-bold text-ink-500"
                placeholder="••••••••"
              />
            </div>
          </div>
          <div className="pt-4">
            <button type="submit" disabled={changingPass}
              className="bg-ink-500 disabled:bg-ink-50 text-white font-black px-12 py-4 rounded-2xl hover:bg-ink-500 transition-all shadow-xl shadow-cream-300 active:scale-95">
              {changingPass ? 'جاري التغيير...' : 'حفظ التغييرات'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. إعدادات اللغة والحساب */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* تبديل اللغة */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-ink-500 uppercase tracking-widest mr-1">اللغة المفضلة</h4>
          <button 
            onClick={() => i18n.changeLanguage(isEn ? 'ar' : 'en')}
            className="w-full flex items-center justify-between p-6 bg-white border-2 border-cream-200 rounded-[2rem] hover:border-cream-300 hover:bg-cream-200/20 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-cream-200 rounded-2xl flex items-center justify-center text-ink-500 group-hover:bg-ink-500 group-hover:text-white transition-all">
                <span className="font-black text-xs">{isEn ? 'AR' : 'EN'}</span>
              </div>
              <div className="text-right">
                <span className="block font-black text-ink-500">{isEn ? 'العربية' : 'English'}</span>
                <span className="text-[10px] text-ink-50 font-bold">لغة واجهة التطبيق</span>
              </div>
            </div>
            <div className="text-[11px] font-black text-brass underline uppercase tracking-tighter">تبديل</div>
          </button>
        </div>

        {/* حذف الحساب */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-rose-600 uppercase tracking-widest mr-1">منطقة الخطر</h4>
          <div className="p-6 bg-rose-50/30 border-2 border-rose-100/50 rounded-[2rem] flex flex-col items-center gap-4">
            <p className="text-[11px] text-rose-400 font-bold text-center leading-relaxed">
              بمجرد حذف الحساب، سيتم إزالة جميع بياناتك وعقاراتك المفضلة نهائياً.
            </p>
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="w-full py-4 bg-white border-2 border-rose-200 text-rose-600 font-black rounded-2xl hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all shadow-sm"
            >
              حذف حسابي نهائياً
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
)}

{/* نافذة التأكيد المنبثقة (Modal) - ضعه في نهاية الـ return */}
{showDeleteModal && (
  <div className="fixed inset-0 z-[10000] flex items-center justify-center px-6">
    <div 
      className="absolute inset-0 bg-ink-600/60 backdrop-blur-md animate-in fade-in duration-300"
      onClick={() => setShowDeleteModal(false)}
    ></div>
    
    <div className="relative bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300 text-right">
      <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
        <DeleteForeverIcon sx={{ fontSize: 35 }} />
      </div>
      
      <h3 className="text-2xl font-black text-ink-500 text-center mb-3">تأكيد حذف الحساب</h3>
      <p className="text-sm text-ink-100 text-center mb-10 leading-relaxed font-medium">
        هل أنت متأكد من رغبتك في حذف الحساب؟ <br/> <span className="text-rose-500">هذا الإجراء لا يمكن التراجع عنه مطلقاً.</span>
      </p>
      
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setShowDeleteModal(false)}
          className="py-4 bg-cream-200 text-ink-200 font-black rounded-2xl hover:bg-cream-300 transition-all"
        >
          تراجع
        </button>
        <button
          onClick={async () => {
            try {
              await authAPI.deleteAccount()
              dispatch(logout())
              dispatch(showToast(isEn ? 'Account deleted permanently' : 'تم حذف الحساب نهائياً'))
              navigate('/')
            } catch (err) {
              dispatch(showToast(err.message || 'فشل حذف الحساب'))
            }
            setShowDeleteModal(false)
          }}
          className="py-4 bg-rose-600 text-white font-black rounded-2xl hover:bg-rose-700 transition-all shadow-xl shadow-rose-100"
        >
          تأكيد الحذف
        </button>
      </div>
    </div>
  </div>
)}
          </main>
        </div>
      </div>
    </div>
  )
}