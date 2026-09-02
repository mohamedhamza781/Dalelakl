import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { logout } from '@/store/slices/authSlice'
import { showToast } from '@/store/slices/uiSlice'
import { settingsAPI } from '@/lib/api'
import { HashLink } from 'react-router-hash-link'

// Icons
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded'
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded'
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'

import DefaultLogo from '../../assets/logo-transparent.png'

export default function Navbar() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { isLoggedIn, role, user } = useSelector(s => s.auth)
  const lang = useSelector(s => s.ui.lang)

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [logoUrl, setLogoUrl] = useState('')

  // ── Load logo from settings ────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res = await settingsAPI.getPublic()
        const url = res.settings?.logo_url || ''
        setLogoUrl(url)
      } catch {
        // use default logo
      }
    }
    load()
  }, [])

  const logoSrc = logoUrl
    ? (logoUrl.startsWith('http') ? logoUrl : `http://localhost:5000${logoUrl}`)
    : DefaultLogo

  // ── Scroll effect ──────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // ── Scroll lock when mobile menu open ─────────────────────
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isMobileMenuOpen])

  // ── Close menu on route change ─────────────────────────────
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    dispatch(logout())
    dispatch(showToast(lang === 'ar' ? 'تم تسجيل الخروج' : 'Logged out'))
    navigate('/')
  }

  const navLinks = [
    { to: '/',           label: t('nav.home'),                               icon: <HomeRoundedIcon sx={{ fontSize: 19 }} />,          end: true },
    { to: '/properties', label: t('nav.properties'),                         icon: <ApartmentRoundedIcon sx={{ fontSize: 19 }} /> },
    { to: '/compare',    label: lang === 'ar' ? 'مقارنة العقارات' : 'Compare', icon: <CompareArrowsRoundedIcon sx={{ fontSize: 19 }} /> },
  ]

  if (role === 'admin') {
    navLinks.push({ to: '/admin', label: 'الإدارة', icon: <AdminPanelSettingsRoundedIcon sx={{ fontSize: 19 }} /> })
  }

  return (
    <nav className={`fixed top-0 inset-x-0 w-full z-[100] transition-all duration-300 ${
      isMobileMenuOpen
        ? 'bg-white shadow-md py-3'
        : isScrolled
          ? 'bg-white/85 backdrop-blur-md shadow-sm py-3 border-b border-slate-100'
          : 'bg-transparent py-4 md:py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">

          {/* 1. Left/Right Section: Logo */}
          <div className="flex items-center shrink-0">
            <HashLink
              smooth
              to="/#"
              onClick={() => window.scrollTo(0, 0)}
              className="flex items-center group cursor-pointer no-underline"
            >
              <div className="h-10 sm:h-11 flex items-center transition-transform duration-300 group-hover:scale-105">
                <img
                  src={logoSrc}
                  alt="دليلك العقاري"
                  className="h-full w-auto object-contain"
                  onError={e => { e.target.src = DefaultLogo }}
                />
              </div>
            </HashLink>
          </div>

          {/* 2. Middle Section: Desktop Tabs (Centering & Pill Style) */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="flex items-center gap-1.5 bg-slate-100/70 p-1.5 rounded-full border border-slate-200/60 shadow-inner">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className={({ isActive }) => `
                    flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 select-none
                    ${isActive 
                      ? 'bg-white text-ink-500 shadow-sm shadow-slate-200' 
                      : 'text-ink-200 hover:text-ink-500 hover:bg-white/60'}
                  `}
                >
                  <span className="opacity-80">{link.icon}</span>
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </div>
          </div>

          {/* 3. Action / User Profile Section */}
          <div className="hidden lg:flex items-center justify-end min-w-[120px]">
            {isLoggedIn ? (
              <div className="flex items-center gap-3 bg-white/60 border border-slate-200/70 py-1.5 px-3 rounded-full shadow-sm">
                <div className="text-right leading-tight">
                  <div className="text-xs font-bold text-ink-500 truncate max-w-[90px]">{user?.name || 'Admin'}</div>
                  <div className="text-[9px] font-bold text-ink-200/60 uppercase tracking-wider">{role}</div>
                </div>

                <div className="w-8 h-8 rounded-full border border-slate-200 overflow-hidden bg-ink-500 flex items-center justify-center shrink-0">
                  {user?.avatar && (user.avatar.startsWith('/') || user.avatar.startsWith('http')) ? (
                    <img
                      src={user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${user.avatar}`}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-xs">{user?.name?.slice(0, 2)}</span>
                  )}
                </div>

                <button 
                  onClick={handleLogout} 
                  title="تسجيل الخروج"
                  className="w-7 h-7 flex items-center justify-center rounded-full text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <LogoutRoundedIcon sx={{ fontSize: 17 }} />
                </button>
              </div>
            ) : (
              <div className="w-6" /> /* مساحة فارغة لحفظ توازن المركز */
            )}
          </div>

          {/* Mobile Menu Trigger Button */}
          <div className="flex items-center lg:hidden">
            <button
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-ink-500 hover:bg-slate-200 active:scale-95 transition-all"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="القائمة"
            >
              {isMobileMenuOpen ? <CloseRoundedIcon /> : <MenuRoundedIcon />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-ink-500/40 backdrop-blur-sm z-[110] lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div className={`fixed top-0 bottom-0 h-full w-72 bg-white z-[120] shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
        lang === 'ar'
          ? (isMobileMenuOpen ? 'right-0 translate-x-0' : 'right-0 translate-x-full')
          : (isMobileMenuOpen ? 'left-0 translate-x-0' : 'left-0 -translate-x-full')
      }`}>
        <div className="p-6 flex flex-col h-full overflow-y-auto">
          
          <div className="flex justify-between items-center pb-5 mb-5 border-b border-slate-100">
            <div className="h-8">
              <img src={logoSrc} alt="Logo" className="h-full w-auto object-contain" />
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-ink-200 hover:bg-slate-200 transition-all"
            >
              <CloseRoundedIcon sx={{ fontSize: 18 }} />
            </button>
          </div>

          {/* Mobile Links */}
          <div className="space-y-1.5 flex-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                  setIsMobileMenuOpen(false)
                }}
                className={({ isActive }) => `
                  flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold transition-all
                  ${isActive ? 'bg-slate-100 text-ink-500 font-black' : 'text-ink-200 hover:bg-slate-50 hover:text-ink-500'}
                `}
              >
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>

          {/* User Section in Mobile Drawer */}
          {isLoggedIn && (
            <div className="pt-4 mt-auto border-t border-slate-100">
              <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-10 h-10 rounded-full bg-ink-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {user?.name?.slice(0, 2) || 'A'}
                </div>
                <div className="overflow-hidden">
                  <div className="text-sm font-bold text-ink-500 truncate">{user?.name}</div>
                  <div className="text-xs text-ink-200/70 capitalize">{role}</div>
                </div>
              </div>
              
              <button 
                onClick={handleLogout} 
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-rose-600 bg-rose-50 text-xs font-bold hover:bg-rose-100 transition-all"
              >
                <LogoutRoundedIcon sx={{ fontSize: 16 }} />
                <span>{t('auth.logout') || 'تسجيل الخروج'}</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </nav>
  )
}