import { Link } from "react-router";
import { ArrowLeft, Lock, TrendingUp, CheckCircle, ShieldCheck, Home } from "lucide-react";

interface InvestAuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function InvestAuthShell({ title, subtitle, children }: InvestAuthShellProps) {
  return (
    <div className="min-h-screen flex bg-[#faf8f5]">
      {/* Scoped entrance + float animations */}
      <style>{`
        @keyframes auth-fade-up {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes auth-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .auth-fade { opacity: 0; animation: auth-fade-up 0.7s ease forwards; }
        .auth-float { animation: auth-float 5.5s ease-in-out infinite; }
      `}</style>

      {/* ── Left promotional panel ─────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[46%] xl:w-1/2 relative overflow-hidden flex-col p-12 xl:p-16 text-white"
        style={{
          background: "linear-gradient(140deg, #16293f 0%, #1e3a5f 45%, #2d5a87 100%)",
        }}
      >
        {/* Decorative copper glows */}
        <div className="absolute -top-32 -left-32 w-[26rem] h-[26rem] rounded-full bg-[#c8956c]/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-24 w-[30rem] h-[30rem] rounded-full bg-[#c8956c]/10 blur-3xl" />
        {/* Subtle dot texture */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />

        {/* Logo */}
        <Link to="/" className="relative z-10 flex items-center gap-3 group auth-fade w-fit">
          <div className="w-11 h-11 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center group-hover:rotate-3 transition relative overflow-hidden">
            <Home className="w-5 h-5 text-[#c8956c]" />
            <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full border-2 border-[#1e3a5f]"></div>
          </div>
          <div>
            <p className="text-2xl font-bold font-serif tracking-tight">FlexHavens</p>
            <p className="text-[11px] text-white/50 -mt-1 tracking-widest uppercase">Invest</p>
          </div>
        </Link>

        {/* Headline + illustration */}
        <div className="relative z-10 my-auto py-10">
          <h1
            className="font-serif text-4xl xl:text-[2.9rem] leading-[1.15] auth-fade"
            style={{ animationDelay: "120ms" }}
          >
            Grow Your Wealth Through{" "}
            <span className="text-[#c8956c]">Smart Real Estate</span> Investments
          </h1>
          <p
            className="mt-5 text-white/70 text-lg leading-relaxed max-w-md auth-fade"
            style={{ animationDelay: "260ms" }}
          >
            Invest confidently in premium real estate opportunities while tracking your
            portfolio through your secure investor dashboard.
          </p>

          <div className="auth-fade" style={{ animationDelay: "400ms" }}>
            <img
              src="/images/invest-auth-illustration-v2.png"
              alt="Real estate investment growth illustration"
              className="auth-float w-full max-w-md xl:max-w-lg mx-auto mt-6 drop-shadow-2xl"
            />
          </div>

          {/* Trust indicators */}
          <div
            className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/60 auth-fade"
            style={{ animationDelay: "540ms" }}
          >
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#c8956c]" /> Monthly ROI payouts
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#c8956c]" /> Bank-grade security
            </span>
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#c8956c]" /> Premium projects
            </span>
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/40 auth-fade" style={{ animationDelay: "640ms" }}>
          Abuja headquarters · Africa-wide investment opportunities
        </p>
      </div>

      {/* ── Right form panel ───────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-10 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Compact promo header on mobile/tablet */}
          <div className="lg:hidden flex flex-col items-center mb-6 auth-fade">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-[#1e3a5f] rounded-xl flex items-center justify-center group-hover:rotate-3 transition relative overflow-hidden">
                <Home className="w-6 h-6 text-[#c8956c]" />
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1e3a5f] font-serif tracking-tight">FlexHavens</p>
                <p className="text-[11px] text-gray-400 -mt-1 tracking-widest uppercase">Invest</p>
              </div>
            </Link>
          </div>

          <div
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-7 sm:p-9 auth-fade"
            style={{ animationDelay: "120ms" }}
          >
            <div className="mb-7">
              <h2 className="text-2xl sm:text-[1.7rem] font-bold text-[#1e3a5f] font-serif">{title}</h2>
              <p className="text-sm text-gray-500 mt-1.5">{subtitle}</p>
            </div>

            {children}

            <div className="mt-6 pt-6 border-t text-center">
              <Link
                to="/invest"
                className="inline-flex items-center gap-2 text-sm text-[#1e3a5f] hover:text-[#2d5a87] font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Investment Portal
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6 flex items-center justify-center gap-2">
            <Lock className="w-3 h-3" />
            Secured with 256-bit SSL encryption
          </p>
        </div>
      </div>
    </div>
  );
}
