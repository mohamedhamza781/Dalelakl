import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { 
  Elements, 
  CardElement, 
  useStripe, 
  useElements 
} from "@stripe/react-stripe-js";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import SecurityIcon from "@mui/icons-material/Security";
import { showToast } from "@/store/slices/uiSlice";

// مفتاح التجربة (pk_test)
const stripePromise = loadStripe("pk_test_51PXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");

function CheckoutForm({ price, isEn }) {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    try {
      // 1. اطلب PaymentIntent من الباك إند
      const { paymentAPI } = await import('@/lib/api');
      const { clientSecret } = await paymentAPI.createIntent('GOLD', {});

      // 2. أكّد الدفع مع Stripe
      const cardElement = elements.getElement(CardElement);
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (error) {
        dispatch(showToast(error.message));
      } else if (paymentIntent.status === 'succeeded') {
        dispatch(showToast(isEn ? 'Payment Successful!' : 'تمت عملية الدفع بنجاح!'));
      }
    } catch (err) {
      dispatch(showToast(err.message || 'حدث خطأ في الدفع'));
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    style: {
      base: {
        color: "#0f172a", // نص أسود للحقول
        fontFamily: 'Inter, sans-serif',
        fontSize: "16px",
        "::placeholder": { color: "#94a3b8" }
      },
      invalid: { color: "#ef4444" }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-3">
        <label className="block text-[11px] font-black text-ink-50 uppercase tracking-widest px-1">
          {isEn ? "Card Information" : "معلومات البطاقة"}
        </label>
        <div className="bg-white border-2 border-cream-200 rounded-2xl p-5 focus-within:border-ink-500 transition-all shadow-sm">
          <CardElement options={cardStyle} />
        </div>
      </div>

      <button
        disabled={!stripe || loading}
        className={`w-full py-4 rounded-2xl font-black text-white transition-all shadow-lg flex justify-center items-center gap-3
          ${loading ? 'bg-cream-400' : 'bg-ink-600 hover:bg-ink-600 active:scale-[0.98]'}`}
      >
        {loading ? (isEn ? "Processing..." : "جاري المعالجة...") : (isEn ? `Pay ₪${price}` : `دفع ₪${price}`)}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isEn } = useSelector((s) => s.ui);

  const { planName, price } = location.state || { planName: "Premium Plan", price: 99 };

  return (
    <div className="min-h-screen bg-white text-ink-500" dir={isEn ? "ltr" : "rtl"}>
      
      {/* Header */}
      <div className="max-w-6xl mx-auto p-6 flex justify-between items-center border-b border-cream-100">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center hover:bg-cream-100 rounded-full transition-all border border-cream-200 text-ink-200">
          <ArrowBackIcon sx={{ fontSize: 20, transform: isEn ? "" : "rotate(180deg)" }} />
        </button>
        {/* <div className="font-black text-2xl tracking-tighter text-ink-500">
          دليلك
        </div> */}
        <div className="w-10"></div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Payment Column */}
        <div className="lg:col-span-7 space-y-8">
          <div className="px-2">
            <h1 className="text-3xl font-black tracking-tight text-ink-500 mb-2">
              {isEn ? "Secure Checkout" : "الدفع الآمن"}
            </h1>
            <p className="text-ink-100 text-sm font-medium">
              {isEn ? "All transactions are encrypted and secure." : "جميع المعاملات مشفرة وآمنة تماماً."}
            </p>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-cream-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
            <h2 className="text-xl font-black mb-8 flex items-center gap-3 text-ink-400">
              <CreditCardIcon className="text-ink-500" />
              {isEn ? "Payment Method" : "وسيلة الدفع"}
            </h2>
            
            <Elements stripe={stripePromise}>
              <CheckoutForm price={price} isEn={isEn} />
            </Elements>
          </div>

          <div className="flex justify-center items-center gap-4 text-cream-400">
             <SecurityIcon sx={{ fontSize: 20 }} />
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">{isEn ? "PCI DSS Compliant" : "متوافق مع معايير PCI"}</span>
          </div>
        </div>

        {/* Summary Column */}
        <div className="lg:col-span-5">
          <div className="bg-ink-600 rounded-[3rem] p-10 text-white shadow-2xl sticky top-24 overflow-hidden relative">
            {/* لمسة زرقاء خفيفة في الخلفية */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-ink-500/20 blur-[60px] rounded-full"></div>
            
            <h3 className="font-black text-xl mb-10 relative z-10">{isEn ? "Order Summary" : "ملخص الطلب"}</h3>
            
            <div className="space-y-8 relative z-10">
              <div className="flex items-center gap-5 bg-white/5 p-5 rounded-3xl border border-white/10">
                <div className="w-14 h-14 bg-ink-500 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-ink-500/30">
                  {planName ? planName.charAt(0) : "P"}
                </div>
                <div>
                  <div className="font-black text-lg">{planName}</div>
                  <div className="text-xs text-white/40 font-bold uppercase tracking-wider">
                    {isEn ? "Full Experience" : "تجربة كاملة"}
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/10">
                <div className="flex justify-between items-center mb-4 font-bold text-white/50">
                  <span>{isEn ? "Service price" : "سعر الخدمة"}</span>
                  <span>₪{price}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="font-black text-xl">{isEn ? "Total due" : "الإجمالي"}</span>
                  <div className="text-right">
                    <span className="text-5xl font-black tracking-tighter text-brass">₪{price}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}