import { useEffect } from "react"
import { useLocation } from "react-router-dom"

// سفاري (بالنسخ الحديثة) بيقرا ملف الـ manifest المرتبط بالصفحة لحظة ما تضغط
// "Add to Home Screen" ويستخدم start_url منه كنقطة انطلاق الاختصار — بدل
// الرابط الحالي مباشرة. عشان اختصار لوحة التحكم يفتح فعلاً على /admin
// (ومو على الصفحة الرئيسية العامة)، لازم نبدّل ملف الـ manifest المرتبط
// اعتماداً على الصفحة الحالية قبل ما المستخدم يضيف الاختصار.
const DEFAULT_MANIFEST = "/manifest.webmanifest"
const ADMIN_MANIFEST = "/admin-manifest.webmanifest"

export default function ManifestSwitcher() {
  const { pathname } = useLocation()

  useEffect(() => {
    const link = document.querySelector('link[rel="manifest"]')
    if (!link) return
    link.setAttribute('href', pathname.startsWith('/admin') ? ADMIN_MANIFEST : DEFAULT_MANIFEST)
  }, [pathname])

  return null
}