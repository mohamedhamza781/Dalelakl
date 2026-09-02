import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// بيدور على العنصر ويعمل سكرول لما يلاقيه — حتى لو العنصر (متل قسم الأسئلة
// الشائعة) لسا ما ظهرش بالصفحة لأنه منتظر بيانات جايه من الباك اند (async).
// قبل هيك كان يجرب مرة وحدة بس بعد 100ms وإذا ما لقاش يسكت، فكان ينقلك
// لأعلى الصفحة الرئيسية بس بدون ما يوصلك للقسم المطلوب.
export const useScrollToHash = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = hash.replace('#', '');

    let attempts = 0;
    const maxAttempts = 40; // ~10 ثواني كحد أقصى (40 × 250ms)
    let timer;

    const tryScroll = () => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      attempts += 1;
      if (attempts < maxAttempts) {
        timer = setTimeout(tryScroll, 250);
      }
    };

    timer = setTimeout(tryScroll, 100);
    return () => clearTimeout(timer);
  }, [hash]);
};