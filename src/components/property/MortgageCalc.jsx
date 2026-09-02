import { useState } from "react"
import { useTranslation } from "react-i18next"
import CalculateIcon from "@mui/icons-material/Calculate"
import AttachMoneyIcon from "@mui/icons-material/AttachMoney"
import PercentIcon from "@mui/icons-material/Percent"
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"
import AccountBalanceIcon from "@mui/icons-material/AccountBalance"

export default function MortgageCalc({ price }) {
  const { t } = useTranslation()
  const [down, setDown] = useState(20)
  const [rate, setRate] = useState(4.5)
  const [years, setYears] = useState(20)

  // الحسابات الرياضية
  const principal = price * (1 - down / 100)
  const monthly = rate > 0
    ? (principal * (rate / 100 / 12)) / (1 - Math.pow(1 + rate / 100 / 12, -years * 12))
    : principal / (years * 12)

  return (
    <div className="bg-white rounded-3xl border border-cream-200 shadow-xl shadow-cream-200/50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-black text-ink-500 flex items-center gap-2">
          <div className="w-8 h-8 bg-cream-200 text-ink-500 rounded-xl flex items-center justify-center">
            <CalculateIcon sx={{ fontSize: 20 }} />
          </div>
          {t('detail.mortgage')}
        </h3>
        {/* <span className="text-[10px] font-black bg-cream-200 text-ink-100 px-2 py-1 rounded-xl uppercase tracking-wider">
          {t('detail.estimate')}
        </span> */}
      </div>

      {/* Sliders Area */}
      <div className="space-y-6">
        {/* الدفعة الأولى */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <label className="flex items-center gap-2 text-xs font-bold text-ink-100 uppercase tracking-tight">
              <PercentIcon sx={{ fontSize: 14, color: '#94a3b8' }} /> {t('detail.downPct')}
            </label>
            <span className="text-sm font-black text-ink-500 bg-cream-200 px-2 py-0.5 rounded-xl">{down}%</span>
          </div>
          <input 
            type="range" min={10} max={50} step={5} value={down}
            onChange={e => setDown(+e.target.value)} 
            className="w-full h-1.5 bg-cream-200 rounded-xl appearance-none cursor-pointer accent-ink-500" 
          />
        </div>

        {/* نسبة الفائدة */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <label className="flex items-center gap-2 text-xs font-bold text-ink-100 uppercase tracking-tight">
              <AccountBalanceIcon sx={{ fontSize: 14, color: '#94a3b8' }} /> {t('detail.interestRate')}
            </label>
            <span className="text-sm font-black text-ink-500">{rate}%</span>
          </div>
          <input 
            type="range" min={2} max={10} step={0.5} value={rate}
            onChange={e => setRate(+e.target.value)} 
            className="w-full h-1.5 bg-cream-200 rounded-xl appearance-none cursor-pointer accent-ink-500" 
          />
        </div>

        {/* مدة القرض */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <label className="flex items-center gap-2 text-xs font-bold text-ink-100 uppercase tracking-tight">
              <CalendarMonthIcon sx={{ fontSize: 14, color: '#94a3b8' }} /> {t('detail.loanYears')}
            </label>
            <span className="text-sm font-black text-ink-500">{years} {t('detail.yearLabel')}</span>
          </div>
          <input 
            type="range" min={5} max={30} step={5} value={years}
            onChange={e => setYears(+e.target.value)} 
            className="w-full h-1.5 bg-cream-200 rounded-xl appearance-none cursor-pointer accent-ink-500" 
          />
        </div>
      </div>

      {/* Result Card */}
      <div className="mt-8 p-5 rounded-2xl bg-gradient-to-br from-ink-500 to-ink-400 text-center relative overflow-hidden shadow-lg shadow-cream-300">
        {/* Decorative Background Icon */}
        <AttachMoneyIcon className="absolute -right-4 -bottom-4 text-white/5" sx={{ fontSize: 120 }} />
        
        <div className="relative z-10">
          <div className="text-[10px] font-black text-ink-50 uppercase tracking-[0.2em] mb-2">
            {t('detail.monthlyPayment')}
          </div>
          <div className="text-3xl font-black text-white mb-3">
            <span className="text-sm font-normal text-ink-50 ml-1">₪</span>
            {Math.round(monthly).toLocaleString()}
          </div>
          <div className="flex items-center justify-center gap-2 py-2 px-3 bg-white/5 rounded-xl border border-white/10">
             <div className="text-[11px] text-cream-400 font-medium">
               {t('detail.loanLabel')}: <span className="text-white font-bold">₪{Math.round(principal).toLocaleString()}</span>
             </div>
             <div className="w-1 h-1 bg-ink-200 rounded-full" />
             <div className="text-[11px] text-cream-400 font-medium">{years} {t('detail.yearLabel')}</div>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-ink-50 text-center mt-4 leading-relaxed">
        * {t('detail.mortgageDisclaimer', 'هذا الحساب تقريبي وقد يختلف حسب سياسات البنك والرسوم الإضافية.')}
      </p>
    </div>
  )
}