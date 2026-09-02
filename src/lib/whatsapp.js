// ============================================================
//  src/lib/whatsapp.js — بناء رابط واتساب صحيح من أي صيغة يدخلها الأدمن
// ============================================================
// واتساب (wa.me) يشترط إن الرقم بالرابط يكون أرقام بس (بدون + ولا
// مسافات ولا شرطات ولا أقواس) — أي رمز زيادة يخلي الرابط "لا يفتح".
// هاي الدالة توحّد أي صيغة يدخلها الأدمن (رقم عادي، رقم فيه +،
// رابط wa.me كامل، رابط ناقصو https://...) لرابط سليم دايماً.
//
// أمثلة تشتغل كلها صح:
//   "0599999999"                     → https://wa.me/970599999999
//   "+970599999999"                  → https://wa.me/970599999999
//   "https://wa.me/+970599999999"    → https://wa.me/970599999999
//   "wa.me/970599999999"             → https://wa.me/970599999999

export function buildWhatsAppUrl(rawValue, message = '') {
  if (!rawValue) return null
  const raw = String(rawValue).trim()
  if (!raw) return null

  // نطلع الأرقام بس من القيمة (بيشيل +, مسافات, http, wa.me, أي رمز غير رقم)
  let digits = raw.replace(/\D/g, '')
  if (!digits) return null

  // رقم محلي فلسطيني يبدأ بصفر → نبدله برمز الدولة 970
  if (digits.startsWith('0')) digits = '970' + digits.slice(1)

  const query = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${digits}${query}`
}