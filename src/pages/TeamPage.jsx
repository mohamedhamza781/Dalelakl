import { useState, useEffect } from 'react'
import { HashLink } from 'react-router-hash-link'
import { teamAPI } from '@/lib/api'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import TwitterIcon from '@mui/icons-material/Twitter'
import InstagramIcon from '@mui/icons-material/Instagram'
import FacebookIcon from '@mui/icons-material/Facebook'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import GroupsIcon from '@mui/icons-material/Groups'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

export default function TeamPage() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    teamAPI.getPublic()
      .then(res => setMembers(res.members || []))
      .catch(() => {})
      .finally(() => setLoading(false))
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-cream-100 pt-24 md:pt-32 pb-16 md:pb-20" dir="rtl">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 text-center mb-10 md:mb-20">
        {/* <div className="inline-flex items-center gap-2 bg-cream-200 text-ink-500 text-xs font-black px-4 py-2 rounded-full mb-6 border border-cream-300">
          <GroupsIcon sx={{ fontSize: 16 }} /> فريق العمل
        </div> */}
        <h1 className="text-3xl md:text-5xl font-black text-ink-500 mb-4 md:mb-6 leading-tight">
          تعرّف على <span className="text-ink-500">فريقنا</span>
        </h1>
        <p className="text-ink-100 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
          نخبة من المحترفين العقاريين يعملون بشغف لتقديم أفضل تجربة عقارية في فلسطين
        </p>
        <div className="mt-8">
          <HashLink
            smooth
            to="/#team"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-cream-300 text-ink-200 font-black text-sm rounded-2xl hover:border-cream-500 hover:text-ink-500 transition-all shadow-sm"
          >
            <ArrowForwardIcon sx={{ fontSize: 18 }} />
            العودة للصفحة الرئيسية
          </HashLink>
        </div>
      </div>

      {/* Members Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-[2.5rem] p-8 animate-pulse">
                <div className="w-24 h-24 bg-cream-200 rounded-full mx-auto mb-6" />
                <div className="h-4 bg-cream-200 rounded-full mb-3 mx-auto w-3/4" />
                <div className="h-3 bg-cream-200 rounded-full mx-auto w-1/2" />
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-24">
            <GroupsIcon sx={{ fontSize: 64, color: '#cbd5e1' }} />
            <p className="text-ink-50 font-black text-xl mt-4">لا يوجد أعضاء فريق بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {members.map((m, i) => (
              <div
                key={m.id}
                className="group bg-white rounded-[2.5rem] overflow-hidden border border-cream-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 flex flex-col"
                data-aos="fade-up"
                data-aos-delay={`${i * 100}`}
                data-aos-duration="600"
              >
                {/* Image */}
                <div className="relative h-44 md:h-56 bg-gradient-to-br from-cream-200 to-cream-300 overflow-hidden">
                  {m.image ? (
                    <img
                      src={m.image.startsWith('http') ? m.image : `${BASE}${m.image}`}
                      alt={m.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl font-black text-cream-400">{m.name?.slice(0, 2)}</span>
                    </div>
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Content */}
                <div className="p-4 md:p-6 text-right flex-1 flex flex-col justify-start">
                  <h3 className="font-black text-ink-500 text-lg mb-1">{m.name}</h3>
                  <p className="text-ink-500 text-xs font-black uppercase tracking-widest mb-3">{m.role}</p>
                  {m.bio && (
                    <p className="text-ink-100 text-sm font-medium leading-relaxed mb-4 line-clamp-3">{m.bio}</p>
                  )}

                  {/* Social Links */}
                  {m.social && Object.values(m.social).some(Boolean) && (
                    <div className="flex items-center gap-2 pt-4 border-t border-cream-100">
                      {m.social.linkedin  && <a href={m.social.linkedin}  target="_blank" rel="noreferrer" className="w-8 h-8 rounded-xl bg-cream-200 hover:bg-ink-500 hover:text-white flex items-center justify-center text-ink-50 transition-all"><LinkedInIcon sx={{ fontSize: 16 }} /></a>}
                      {m.social.twitter   && <a href={m.social.twitter}   target="_blank" rel="noreferrer" className="w-8 h-8 rounded-xl bg-cream-200 hover:bg-sky-500 hover:text-white flex items-center justify-center text-ink-50 transition-all"><TwitterIcon sx={{ fontSize: 16 }} /></a>}
                      {m.social.instagram && <a href={m.social.instagram} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-xl bg-cream-200 hover:bg-pink-600 hover:text-white flex items-center justify-center text-ink-50 transition-all"><InstagramIcon sx={{ fontSize: 16 }} /></a>}
                      {m.social.facebook  && <a href={m.social.facebook}  target="_blank" rel="noreferrer" className="w-8 h-8 rounded-xl bg-cream-200 hover:bg-ink-600 hover:text-white flex items-center justify-center text-ink-50 transition-all"><FacebookIcon sx={{ fontSize: 16 }} /></a>}
                      {m.social.whatsapp  && <a href={`https://wa.me/${m.social.whatsapp}`} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-xl bg-cream-200 hover:bg-emerald-500 hover:text-white flex items-center justify-center text-ink-50 transition-all"><WhatsAppIcon sx={{ fontSize: 16 }} /></a>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}