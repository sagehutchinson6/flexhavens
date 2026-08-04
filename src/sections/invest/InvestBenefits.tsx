import { Shield, TrendingUp, Home, Users, FileText, Clock, UserPlus, Wallet, LineChart, Bell } from "lucide-react";

const benefits = [
  {
    icon: Home,
    title: "Asset-Backed Security",
    text: "Every naira is deployed into real luxury property developments — tangible assets you can see, not abstract instruments.",
  },
  {
    icon: TrendingUp,
    title: "High Target Returns",
    text: "Earn up to 70% over 18 months as our developments sell and rent into Africa's fast-growing housing market.",
  },
  {
    icon: Shield,
    title: "Bank-Grade Protection",
    text: "Encrypted accounts, JWT-secured sessions, and verified withdrawal controls keep your capital safe at every step.",
  },
  {
    icon: Clock,
    title: "Short Lock-In Periods",
    text: "Terms from just 6 months mean your money is never tied up for years. Reinvest or withdraw at maturity — your choice.",
  },
  {
    icon: FileText,
    title: "Full Transparency",
    text: "Track project progress, earnings accrual, and every transaction in real time from your investor dashboard.",
  },
  {
    icon: Users,
    title: "Referral Rewards",
    text: "Earn a 5% bonus on the first deposit of every investor you refer — credited straight to your wallet.",
  },
];

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create Your Account",
    text: "Register in under two minutes with your name and email. Verify your account to unlock full access.",
  },
  {
    icon: Wallet,
    step: "02",
    title: "Fund Your Wallet",
    text: "Deposit by bank transfer, PayPal, card, or crypto. Funds are credited to your wallet after a quick compliance review.",
  },
  {
    icon: LineChart,
    step: "03",
    title: "Choose a Plan & Invest",
    text: "Pick Starter, Growth, or Premium and allocate your funds to curated development projects.",
  },
  {
    icon: Bell,
    step: "04",
    title: "Track & Withdraw",
    text: "Watch your earnings accrue with live progress updates, then withdraw principal and profits at maturity.",
  },
];

export default function InvestBenefits() {
  return (
    <>
      {/* Benefits */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[#c8956c] font-semibold uppercase tracking-widest text-sm mb-3">
              Why Invest With Us
            </p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#1e3a5f] mb-4">
              Built for Investor Confidence
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              We develop the properties ourselves — so your investment is backed by real
              estates, real margins, and real demand.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="group bg-[#faf8f5] rounded-2xl p-8 border border-transparent hover:border-[#c8956c]/30 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-14 h-14 bg-[#1e3a5f] rounded-xl flex items-center justify-center mb-5 group-hover:bg-[#c8956c] transition-colors duration-300">
                  <benefit.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#1e3a5f] mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{benefit.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-[#1e3a5f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[#c8956c] font-semibold uppercase tracking-widest text-sm mb-3">
              Getting Started
            </p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              From sign-up to payout in four simple steps.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item, index) => (
              <div key={item.step} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-[#c8956c]/50 to-transparent -translate-x-4"></div>
                )}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-[#c8956c]/40 transition h-full">
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 bg-[#c8956c] rounded-xl flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-4xl font-bold text-white/10 font-serif">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
