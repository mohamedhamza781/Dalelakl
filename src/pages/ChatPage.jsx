import { useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import { useSearchParams, useNavigate } from "react-router-dom"
import { chatAPI } from "@/lib/api"

// Icons
import SendRoundedIcon from "@mui/icons-material/SendRounded"
import SearchRoundedIcon from "@mui/icons-material/SearchRounded"
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded"
import ForumRoundedIcon from "@mui/icons-material/ForumRounded"
import MoreVertIcon from "@mui/icons-material/MoreVert"

// ✅ نفس BASE اللي في PropertyDetailPage عشان نبني URLs الصور الناقصة
const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

// ✅ helper: يحول أي avatar (URL كامل أو path نسبي أو null) لـ URL صالح
const resolveAvatar = (avatar) => {
  if (!avatar || typeof avatar !== 'string') return null
  if (avatar.startsWith('http')) return avatar
  if (avatar.startsWith('/'))    return `${BASE}${avatar}`
  return null
}

export default function ChatPage() {
  const { i18n, t } = useTranslation()
  const navigate = useNavigate()
  const isEn = i18n.language === 'en'
  const [searchParams] = useSearchParams()
  const { user } = useSelector(s => s.auth)

  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showMobileChat, setShowMobileChat] = useState(false)

  const msgsRef = useRef(null)
  const pollRef = useRef(null)
  const activeConvRef = useRef(null)

  // ─── Helpers ──────────────────────────────────────────────

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleTimeString(isEn ? 'en-US' : 'ar-EG', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isMyMessage = (msg) => String(msg.senderId) === String(user?.id)

  const getInitials = (participant) => {
    if (!participant) return '؟'
    return participant.name?.slice(0, 2) || '؟'
  }

  // ✅ Avatar component مركزي — يعالج URL كامل، path نسبي، وfallback initials
  const Avatar = ({ participant, size = 'md' }) => {
    const avatarUrl = resolveAvatar(participant?.avatar)
    const initials  = getInitials(participant)
    const sizeClass = size === 'lg'
      ? 'w-14 h-14 rounded-2xl text-base'
      : 'w-12 h-12 rounded-2xl text-sm'

    if (avatarUrl) {
      return (
        <div className={`${sizeClass} bg-ink-500 flex items-center justify-center font-bold text-white shadow-md overflow-hidden shrink-0`}>
          <img
            src={avatarUrl}
            alt={participant?.name || ''}
            className="w-full h-full object-cover"
            onError={(e) => {
              // لو الصورة فشلت، بدّلها بـ initials
              e.target.parentElement.innerHTML = `<span class="font-bold text-white">${initials}</span>`
            }}
          />
        </div>
      )
    }

    return (
      <div className={`${sizeClass} bg-ink-500 flex items-center justify-center font-bold text-white shadow-md overflow-hidden shrink-0`}>
        {initials}
      </div>
    )
  }

  // ─── API Calls ────────────────────────────────────────────

  const loadConversations = async () => {
    try {
      const data = await chatAPI.getConversations()
      setConversations(data.conversations || [])
    } catch {
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (convId) => {
    try {
      const data = await chatAPI.getMessages(convId)
      setMessages(data.messages || [])
      setConversations(prev =>
        prev.map(c => c.id === convId ? { ...c, unread: 0 } : c)
      )
    } catch {
      setMessages([])
    }
  }

  const openConversation = async (conv) => {
    setActiveConv(conv)
    activeConvRef.current = conv
    setShowMobileChat(true)
    await loadMessages(conv.id)

    clearInterval(pollRef.current)
    pollRef.current = setInterval(() => {
      if (!document.hidden && activeConvRef.current?.id) {
        loadMessages(activeConvRef.current.id)
      }
    }, 5000)
  }

  const handleSend = async () => {
    if (!text.trim() || !activeConv || sending) return
    const currentText = text.trim()
    setText("")
    setSending(true)
    try {
      const data = await chatAPI.sendMessage(activeConv.id, currentText)
      setMessages(prev => [...prev, data.message])
      setConversations(prev => prev.map(c =>
        c.id === activeConv.id ? { ...c, lastMessage: data.message } : c
      ))
    } catch {
      setText(currentText)
    } finally {
      setSending(false)
    }
  }

  // ─── Effects ──────────────────────────────────────────────

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    const agentUserId = searchParams.get('agentId')
    loadConversations().then(() => {
      if (agentUserId) {
        chatAPI.getOrCreate(agentUserId).then(data => {
          const conv = data.conversation
          const other = conv.participants?.find(p => String(p.id) !== String(user?.id))
          openConversation({ id: conv.id, participant: other })
        })
      }
    })
    return () => clearInterval(pollRef.current)
  }, [])

  useEffect(() => {
    if (msgsRef.current) {
      msgsRef.current.scrollTo({ top: msgsRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [messages])

  const filtered = conversations.filter(c =>
    c.participant?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ─── Render ───────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-100px)] md:h-[85vh] md:my-6 flex bg-white md:rounded-[2rem] shadow-2xl shadow-cream-300/50 overflow-hidden border border-cream-200">

      {/* ── Sidebar ── */}
      <div className={`w-full md:w-[380px] flex flex-col border-e border-cream-200 bg-cream-100/50 ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 bg-white">
          <h1 className="text-2xl font-black text-ink-500 mb-6 flex items-center gap-2">
            {t('chat.title', 'المحادثات')}
            <span className="bg-cream-300 text-ink-500 text-xs py-1 px-2.5 rounded-full">{conversations.length}</span>
          </h1>

          <div className="relative group">
            <SearchRoundedIcon
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-50 group-focus-within:text-brass transition-colors"
              sx={{ fontSize: 20 }}
            />
            <input
              className="w-full bg-cream-200 border-none rounded-2xl py-3 pr-10 pl-4 text-sm outline-none focus:ring-2 focus:ring-brass/20 transition-all text-right"
              placeholder="ابحث عن شخص..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading ? (
            <div className="flex justify-center py-10 opacity-50">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-ink-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-ink-50 text-sm font-medium">لا توجد محادثات</div>
          ) : (
            filtered.map(conv => (
              <div
                key={conv.id}
                onClick={() => openConversation(conv)}
                className={`group flex items-center gap-4 p-4 cursor-pointer rounded-[1.5rem] transition-all ${
                  activeConv?.id === conv.id
                    ? 'bg-white shadow-md shadow-cream-300/50 translate-x-1'
                    : 'hover:bg-white/50'
                }`}
              >
                {/* ✅ Avatar مع مؤشر الاتصال */}
                <div className="relative shrink-0">
                  <div className="transition-transform group-hover:scale-105">
                    <Avatar participant={conv.participant} size="lg" />
                  </div>
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-green-500 border-4 border-white rounded-full" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-ink-500 truncate text-sm">
                      {conv.participant?.name || 'مستخدم'}
                    </h3>
                    <span className="text-[10px] text-ink-50 shrink-0">
                      {conv.lastMessage ? formatTime(conv.lastMessage.createdAt) : ''}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-xs truncate max-w-[150px] ${conv.unread > 0 ? 'text-ink-500 font-bold' : 'text-ink-100'}`}>
                      {conv.lastMessage?.text || 'ابدأ المحادثة الآن'}
                    </p>
                    {conv.unread > 0 && (
                      <span className="bg-ink-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Main Chat Area ── */}
      <div className={`flex-1 flex flex-col bg-white ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
        {activeConv ? (
          <>
            {/* Header */}
            <div className="h-20 flex items-center justify-between px-6 border-b border-cream-200 bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setShowMobileChat(false)
                    clearInterval(pollRef.current)
                    activeConvRef.current = null
                  }}
                  className="md:hidden p-2 hover:bg-cream-200 rounded-xl transition-colors"
                >
                  <ArrowBackIosNewRoundedIcon sx={{ fontSize: 20, transform: isEn ? '' : 'rotate(180deg)' }} />
                </button>

                {/* ✅ Avatar في الهيدر */}
                <Avatar participant={activeConv.participant} size="md" />

                <div>
                  <h2 className="font-black text-ink-500 leading-none">
                    {activeConv.participant?.name || 'مستخدم'}
                  </h2>
                  <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider">متصل الآن</span>
                </div>
              </div>
              <button className="p-2 text-ink-50 hover:text-ink-500 transition-colors">
                <MoreVertIcon />
              </button>
            </div>

            {/* Messages */}
            <div ref={msgsRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8fafc]">
              {messages.length === 0 ? (
                <div className="text-center py-16 text-ink-50 text-sm font-medium">لا توجد رسائل بعد</div>
              ) : (
                messages.map(msg => {
                  const isMe = isMyMessage(msg)
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-[80%] md:max-w-[70%] group">
                        <div className={`px-5 py-3 rounded-[1.5rem] shadow-sm text-[13px] leading-relaxed ${
                          isMe
                            ? 'bg-ink-500 text-white rounded-br-none shadow-cream-300'
                            : 'bg-white text-ink-400 rounded-bl-none border border-cream-200'
                        }`}>
                          {msg.text}
                        </div>
                        <p className={`text-[10px] mt-1.5 text-ink-50 font-medium ${isMe ? 'text-left' : 'text-right'}`}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Input */}
            <div className="p-6 bg-white border-t border-cream-200">
              <div className="flex gap-3 items-center bg-cream-100 p-2 rounded-[2rem] border border-cream-300 focus-within:border-brass-light focus-within:bg-white transition-all shadow-inner">
                <input
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="اكتب رسالة..."
                  className="flex-1 bg-transparent py-3 px-4 text-sm outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!text.trim() || sending}
                  className="bg-ink-500 hover:bg-ink-600 disabled:bg-cream-400 text-white w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg shadow-cream-400"
                >
                  <SendRoundedIcon sx={{ fontSize: 20, transform: isEn ? 'rotate(-30deg)' : 'rotate(210deg)' }} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-40">
            <ForumRoundedIcon sx={{ fontSize: 80, color: '#cbd5e1' }} />
            <h2 className="text-xl font-black text-ink-500 mt-4">ابدأ الدردشة الآن</h2>
            <p className="text-ink-100 text-sm mt-2 max-w-xs">
              اختر محادثة من القائمة الجانبية للتواصل مع الوكلاء أو العملاء.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}