import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { showToast } from '@/store/slices/uiSlice'
import { settingsAPI } from '@/lib/api'
import { buildWhatsAppUrl } from '@/lib/whatsapp'

import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import FacebookIcon from '@mui/icons-material/Facebook'
import InstagramIcon from '@mui/icons-material/Instagram'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import SendIcon from '@mui/icons-material/Send'

import { HashLink } from 'react-router-hash-link'
import DefaultLogo from '../../assets/logo-transparent.png'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function Footer() {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const lang = useSelector(s => s.ui.lang)
  const isEn = lang === 'en'

  const [settings, setSettings] = useState({
    logo_url:          '',
    footer_phone:      '+970 59-XXXX-XXX',
    footer_email:      'hello@teryaq.ps',
    footer_address:    'رام الله، فلسطين',
    footer_address_en: 'Ramallah, Palestine',
    footer_hours:      '09:00 AM - 05:00 PM',
    footer_desc:       'شريكك الموثوق للعثور على منزلك المثالي في جميع أنحاء فلسطين.',
    footer_desc_en:    'Your trusted partner in finding the perfect home across Palestine.',
    footer_facebook:   '',
    footer_instagram:  '',
    footer_whatsapp:   '',
    footer_linkedin:   '',
  })

  useEffect(() => {
    settingsAPI.getPublic()
      .then(res => {
        const s = res.settings
        setSettings({
          logo_url:          s.logo_url          || '',
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
        })
      })
      .catch(() => {})
  }, [])

  // ── Newsletter subscribe ───────────────────────────────────
  const [nlEmail, setNlEmail]   = useState('')
  const [nlLoading, setNlLoading] = useState(false)

  const handleSubscribe = async () => {
    const email = nlEmail.trim()
    if (!email) return
    setNlLoading(true)
    try {
      const res = await fetch(`${API}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'فشل الاشتراك')
      dispatch(showToast(data.message || 'تم الاشتراك! ✅'))
      setNlEmail('')
    } catch (err) {
      dispatch(showToast(err.message || 'فشل الاشتراك'))
    } finally {
      setNlLoading(false)
    }
  }

  const logoSrc = settings.logo_url
    ? (settings.logo_url.startsWith('http') ? settings.logo_url : `http://localhost:5000${settings.logo_url}`)
    : DefaultLogo

  const footerLinks = {
    company: [
      { label: isEn ? 'About Us'       : 'من نحن',          to: '/#about-us' },
      { label: isEn ? 'Our Services'   : 'خدماتنا',         to: '/#services' },
    ],
    support: [
      { label: isEn ? 'Contact Support' : 'تواصل معنا',    to: '/contact' },
      { label: isEn ? 'FAQs'           : 'الأسئلة الشائعة', to: '/#faq' },
    ],
  }

  const socialLinks = [
    { Icon: FacebookIcon,  href: settings.footer_facebook,  color: 'hover:text-ink-500',   title: 'Facebook'  },
    { Icon: InstagramIcon, href: settings.footer_instagram, color: 'hover:text-pink-600',    title: 'Instagram' },
    { Icon: WhatsAppIcon,  href: buildWhatsAppUrl(settings.footer_whatsapp),  color: 'hover:text-emerald-500', title: 'WhatsApp'  },
    { Icon: LinkedInIcon,  href: settings.footer_linkedin,  color: 'hover:text-ink-600',    title: 'LinkedIn'  },
  ]

  const contactItems = [
    { Icon: PhoneIcon,      val: settings.footer_phone,                                        href: `tel:${settings.footer_phone}`    },
    { Icon: EmailIcon,      val: settings.footer_email,                                        href: `mailto:${settings.footer_email}` },
    { Icon: LocationOnIcon, val: isEn ? settings.footer_address_en : settings.footer_address, href: null                              },
    { Icon: AccessTimeIcon, val: settings.footer_hours,                                        href: null                              },
  ]

  return (
    <footer className="bg-white border-t border-cream-200 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand & Newsletter */}
          <div className="lg:col-span-1">
            <HashLink smooth to="/#" className="flex items-center group cursor-pointer mb-6 no-underline" onClick={() => window.scrollTo(0, 0)}>
              <div className="flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <img loading="lazy" src={logoSrc} alt="دليلك العقاري" className="h-16 w-auto object-contain" onError={e => { e.target.src = DefaultLogo }} />
              </div>
            </HashLink>

            {/* ← النص الديناميكي من الأدمن */}
            <p className="text-ink-100 text-sm leading-relaxed mb-6">
              {isEn ? settings.footer_desc_en : settings.footer_desc}
            </p>

            {/* Newsletter input */}
            <div className="relative group">
              <input
                type="email"
                value={nlEmail}
                onChange={e => setNlEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubscribe()}
                placeholder={isEn ? 'Your email...' : 'بريدك الإلكتروني...'}
                className="w-full bg-cream-100 border border-cream-200 rounded-xl py-3 px-4 text-xs font-bold focus:border-brass outline-none transition-all"
              />
              <button
                onClick={handleSubscribe}
                disabled={nlLoading}
                className="absolute left-1 top-1 bottom-1 px-3 bg-ink-500 text-white rounded-xl hover:bg-ink-500 transition-all disabled:opacity-60"
              >
                <SendIcon sx={{ fontSize: 16 }} />
              </button>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-black text-ink-500 mb-6 uppercase text-[10px] tracking-widest">
              {isEn ? 'Company' : 'الشركة'}
            </h4>
            <ul className="space-y-4">
              {footerLinks.company.map(link => (
                <li key={link.label}>
                  <HashLink smooth to={link.to} className="text-ink-100 hover:text-ink-500 text-sm font-bold transition-colors">
                    {link.label}
                  </HashLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-black text-ink-500 mb-6 uppercase text-[10px] tracking-widest">
              {isEn ? 'Support' : 'الدعم'}
            </h4>
            <ul className="space-y-4">
              {footerLinks.support.map(link => (
                <li key={link.label}>
                  <Link to={link.to} className="text-ink-100 hover:text-ink-500 text-sm font-bold transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-black text-ink-500 mb-6 uppercase text-[10px] tracking-widest">
              {isEn ? 'Contact' : 'اتصل بنا'}
            </h4>
            <ul className="space-y-4">
              {contactItems.map(({ Icon, val, href }, i) => {
                const inner = (
                  <li key={i} className="flex items-center gap-3 text-ink-100 text-sm font-bold leading-none">
                    <div className="w-8 h-8 rounded-xl bg-cream-100 flex items-center justify-center text-ink-50 flex-shrink-0">
                      <Icon sx={{ fontSize: 16 }} />
                    </div>
                    <span className="break-all">{val}</span>
                  </li>
                )
                return href ? (
                  <a key={i} href={href} className="no-underline hover:text-ink-500 transition-colors block">{inner}</a>
                ) : inner
              })}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-cream-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-ink-50 text-[10px] font-black uppercase tracking-widest text-center md:text-right">
            © 2026 Dalelak Aqari . {isEn ? 'All Rights Reserved.' : 'جميع الحقوق محفوظة.'}
          </p>
          <div className="flex items-center gap-3">
            {socialLinks.map(({ Icon, href, color, title }, i) => {
              const cls = `w-10 h-10 rounded-xl bg-cream-100 text-ink-50 ${href ? color : 'opacity-30 cursor-default'} transition-all duration-300 flex items-center justify-center hover:bg-white hover:shadow-xl hover:shadow-cream-300`
              return href ? (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer" title={title} className={cls}>
                  <Icon sx={{ fontSize: 20 }} />
                </a>
              ) : (
                <button key={i} disabled title={title} className={cls}>
                  <Icon sx={{ fontSize: 20 }} />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </footer>
  )
}