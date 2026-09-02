import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { showToast } from "@/store/slices/uiSlice"
import { useTranslation } from "react-i18next"
import { settingsAPI } from "@/lib/api"

import CheckIcon from "@mui/icons-material/Check"
import CloseIcon from "@mui/icons-material/Close"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import HomeWorkIcon from "@mui/icons-material/HomeWork"
import VerifiedIcon from "@mui/icons-material/Verified"
import PersonIcon from "@mui/icons-material/Person"
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome"

const AGENT_PLANS = [
  {
    id: "free",
    name: "الباقة المجانية",
    nameEn: "Free Agent",
    price: 0,
    subtitle: "ابدأ بدون أي تكلفة",
    subtitleEn: "Start at no cost",
    color: "from-ink-400 to-ink-600",
    accentColor: "text-brass-light",
    popular: false,
    features: [
      { text: "3 عقارات نشطة كحد أقصى", textEn: "Up to 3 active listings", included: true },
      { text: "صور أساسية للعقار", textEn: "Basic property photos", included: true },
      { text: "ظهور في نتائج البحث", textEn: "Appear in search results", included: true },
      { text: "تواصل مع العملاء عبر الدردشة", textEn: "Client chat messaging", included: true },
      { text: "إحصائيات متقدمة", textEn: "Advanced analytics", included: false },
      { text: "تمييز العقارات (Featured)", textEn: "Featured listings badge", included: false },
      { text: "جولة افتراضية 360°", textEn: "Virtual 360° tours", included: false },
      { text: "الأولوية في نتائج البحث", textEn: "Priority search ranking", included: false },
    ],
  },
  {
    id: "gold",
    name: "الباقة الذهبية",
    nameEn: "Gold Agent",
    price: 99,
    period: "/شهر",
    periodEn: "/month",
    subtitle: "للوكلاء الجادين والمكاتب",
    subtitleEn: "For serious agents & offices",
    color: "from-ink-400 via-ink-500 to-ink-600",
    accentColor: "text-cream-300",
    popular: true,
    features: [
      { text: "20 عقاراً نشطاً شهرياً", textEn: "20 active listings/month", included: true },
      { text: "معرض صور احترافي غير محدود", textEn: "Unlimited professional photos", included: true },
      { text: "ظهور مميز في نتائج البحث", textEn: "Priority search placement", included: true },
      { text: "تواصل مع العملاء عبر الدردشة", textEn: "Client chat messaging", included: true },
      { text: "إحصائيات متقدمة وتقارير", textEn: "Advanced analytics & reports", included: true },
      { text: "3 عقارات مميزة (Featured) شهرياً", textEn: "3 featured listings/month", included: true },
      { text: "جولة افتراضية 360°", textEn: "Virtual 360° tours", included: true },
      { text: "الأولوية القصوى في نتائج البحث", textEn: "Top search priority ranking", included: true },
    ],
  },
]

const FAQ = [
  {
    q: "من يستطيع الاشتراك في الباقات؟",
    qEn: "Who can subscribe to these plans?",
    a: "الباقات مخصصة حصرياً للوكلاء العقاريين والمكاتب. العملاء (الباحثون عن عقار) يستخدمون المنصة مجاناً بدون أي اشتراك.",
    aEn: "Plans are exclusively for real estate agents and offices. Clients (property seekers) use the platform completely free.",
  },
  {
    q: "ماذا يحدث إذا تجاوزت حد الـ 3 عقارات في الباقة المجانية؟",
    qEn: "What happens if I exceed 3 listings on the free plan?",
    a: "لن تتمكن من إضافة عقارات جديدة حتى تحذف إحدى العقارات الحالية أو تترقى إلى الباقة الذهبية.",
    aEn: "You won't be able to add new listings until you delete an existing one or upgrade to Gold.",
  },
  {
    q: "هل يمكنني الإلغاء في أي وقت؟",
    qEn: "Can I cancel anytime?",
    a: "نعم، يمكنك الإلغاء في أي وقت. يستمر وصولك لميزات الذهبية حتى نهاية الفترة المدفوعة.",
    aEn: "Yes, cancel anytime. Your Gold access continues until the end of the paid period.",
  },
]

export default function SubscriptionsPage() {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { role } = useSelector(s => s.auth)
  const isEn = i18n.language === "en"
  const [billing, setBilling] = useState("monthly")
  const [activeFaq, setActiveFaq] = useState(null)
  const [current] = useState("free")

  const getPrice = (p) => {
    if (p === 0) return 0
    return billing === "yearly" ? Math.round(p * 0.75) : p
  }

  return (
    <div className="bg-white min-h-screen pb-24" dir={isEn ? "ltr" : "rtl"}>

      {/* Hero Section */}
      <div className="relative bg-ink-600 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "radial-gradient(circle, #3b82f6 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-ink-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 pt-10 pb-20">

          <div className="flex items-center mb-4">
            <button onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-ink-100 hover:text-white text-sm font-bold transition-colors group">
              <ArrowBackIcon sx={{ fontSize: 18, transform: isEn ? '' : 'rotate(180deg)' }} className="group-hover:-translate-x-1 transition-transform" />
              {isEn ? "Back" : "رجوع"}
            </button>
          </div>

          <div className="text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-2 bg-ink-500/10 border border-ink-500/20 text-brass-light text-[10px] font-black px-4 py-2 rounded-full mb-6 tracking-widest uppercase shadow-[0_0_15px_rgba(59,130,246,0.1)]">
              <VerifiedIcon sx={{ fontSize: 13 }} />
              {isEn ? "Agent Exclusive" : "حصري للوكلاء"}
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
              {isEn ? "Scale Your Reach" : "وسّع نطاق عملك"}
              <br />
              <span className="text-brass">{isEn ? "Professional Plans" : "باقات احترافية"}</span>
            </h1>

            <div className="flex justify-center mt-6">
              <div className="inline-flex items-center bg-ink-500 border border-ink-400 rounded-2xl p-1.5 shadow-2xl">
                <button onClick={() => setBilling("monthly")}
                  className={`px-8 py-3 rounded-xl text-xs font-black transition-all ${billing === "monthly" ? "bg-ink-500 text-white shadow-lg shadow-ink-500/20" : "text-ink-50 hover:text-white"}`}>
                  {isEn ? "Monthly" : "شهري"}
                </button>
                <button onClick={() => setBilling("yearly")}
                  className={`px-8 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${billing === "yearly" ? "bg-ink-500 text-white shadow-lg shadow-ink-500/20" : "text-ink-50 hover:text-white"}`}>
                  {isEn ? "Yearly" : "سنوي"}
                  <span className="bg-emerald-500 text-[9px] px-2 py-0.5 rounded-xl font-black">SAVE 25%</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-10 relative z-10">

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {AGENT_PLANS.map((plan) => {
            const isCurrent = plan.id === current
            const price = getPrice(plan.price)
            const isGold = plan.id === "gold"

            return (
              <div key={plan.id}
                className={`flex flex-col bg-white rounded-[3rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border ${isGold ? "border-cream-300 shadow-xl shadow-brass/5" : "border-cream-200 shadow-xl shadow-cream-300/50"}`}>

                <div className={`p-10 bg-gradient-to-br ${plan.color} text-white`}>
                  {plan.popular && (
                    <div className="bg-white/20 backdrop-blur-md w-max px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 mb-6">
                      {isEn ? "Recommended" : "موصى به"}
                    </div>
                  )}
                  <h3 className="text-3xl font-black mb-2">{isEn ? plan.nameEn : plan.name}</h3>
                  <p className={`text-sm font-bold opacity-80 ${plan.accentColor}`}>{isEn ? plan.subtitleEn : plan.subtitle}</p>

                  <div className="mt-8 flex items-baseline gap-1">
                    <span className="text-5xl font-black">{price === 0 ? "0" : `₪${price}`}</span>
                    <span className="text-lg opacity-60 font-bold">{isEn ? plan.periodEn : plan.period}</span>
                  </div>
                </div>

                <div className="p-10 flex-1 flex flex-col">
                  <ul className="space-y-4 mb-10 flex-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className={`flex items-center gap-4 text-sm font-bold ${f.included ? "text-ink-300" : "text-cream-400"}`}>
                        <div className={`w-6 h-6 rounded-xl flex items-center justify-center shrink-0 ${f.included ? isGold ? "bg-cream-300 text-ink-500" : "bg-cream-200 text-ink-200" : "bg-cream-100 text-cream-400"}`}>
                          {f.included ? <CheckIcon sx={{ fontSize: 14 }} /> : <CloseIcon sx={{ fontSize: 14 }} />}
                        </div>
                        {isEn ? f.textEn : f.text}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => {
                      if (isCurrent) return;
                      if (plan.id === "gold") {
                        if (role !== "agent") {
                          dispatch(showToast(isEn ? "Login as Agent" : "سجل دخولك كوكيل أولاً"));
                          return;
                        }
                        navigate("/checkout", { state: { planName: plan.name, price: price, billing: billing } });
                      }
                    }}
                    className={`w-full py-5 rounded-2xl text-sm font-black transition-all active:scale-[0.98] shadow-xl 
                      ${isCurrent ? "bg-cream-200 text-ink-50 cursor-default shadow-none" :
                        isGold ? "bg-ink-500 text-white shadow-brass/30 hover:bg-ink-600" :
                        "bg-ink-600 text-white shadow-ink-500/20 hover:bg-ink-400"}`}
                  >
                    {isCurrent ? (isEn ? "Current Plan" : "باقتك الحالية") : (isEn ? "Upgrade Now" : "اشترك الآن")}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-ink-500 text-center mb-12">{isEn ? "Questions?" : "لديك استفسار؟"}</h2>
          <div className="grid gap-4">
            {FAQ.map((item, i) => (
              <div key={i} className="group">
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className={`w-full p-7 text-right flex items-center justify-between bg-white border rounded-[2rem] transition-all ${activeFaq === i ? "border-brass shadow-lg shadow-brass/5" : "border-cream-200 hover:border-cream-300"}`}
                >
                  <span className="font-black text-ink-400 text-base">{isEn ? item.qEn : item.q}</span>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${activeFaq === i ? "bg-ink-500 text-white rotate-45" : "bg-cream-100 text-ink-50"}`}>
                    <span className="text-xl font-bold">+</span>
                  </div>
                </button>
                {activeFaq === i && (
                  <div className="px-8 py-6 text-ink-100 text-[15px] font-medium leading-relaxed">
                    {isEn ? item.aEn : item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}