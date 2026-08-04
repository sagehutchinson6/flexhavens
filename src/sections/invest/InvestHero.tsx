import { Link } from "react-router";
import { ArrowRight, Shield, TrendingUp, CheckCircle, Users, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const heroStats = [
  { value: "₦4.2M+", label: "Capital Deployed" },
  { value: "1,800+", label: "Active Investors" },
  { value: "Up to 70%", label: "Target Returns" },
  { value: "31", label: "Countries Served" },
];

export default function InvestHero() {
  const scrollToPlans = () => {
    document.getElementById("invest-plans")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="relative min-h-screen flex items-center pt-28"
      style={{
        backgroundImage: `linear-gradient(rgba(30, 58, 95, 0.93), rgba(30, 58, 95, 0.88)), url('/images/home-exterior-4.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div className="text-white space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium">FlexHavens Investment Portal</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight">
              Invest in Real Estate.
              <span className="text-[#c8956c]"> Build Wealth with Confidence.</span>
            </h1>

            <p className="text-xl text-gray-200 max-w-xl leading-relaxed">
              Join thousands of investors earning target returns of up to 70% by funding
              Nigerian luxury real estate developments — starting from just ₦1,000.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/invest/register">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#c8956c] to-[#b07d52] hover:shadow-xl transition text-lg px-8 py-6 w-full sm:w-auto"
                >
                  Start Investing
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                onClick={scrollToPlans}
                className="border-2 border-white/30 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 transition text-lg px-8 py-6"
              >
                <PlayCircle className="w-5 h-5 mr-2" />
                Learn More
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-sm">Bank-Grade Security</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm">Asset-Backed Projects</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#c8956c]" />
                <span className="text-sm">Referral Rewards</span>
              </div>
            </div>
          </div>

          {/* Right: Stats card */}
          <div className="hidden lg:block">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 bg-[#c8956c] rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-white">
                  <p className="text-sm text-[#c8956c] font-medium uppercase tracking-wide">Investor Performance</p>
                  <h3 className="text-xl font-bold">Real Projects, Real Returns</h3>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="bg-white/10 rounded-xl p-5 border border-white/10">
                    <p className="text-3xl font-bold text-white font-serif">{stat.value}</p>
                    <p className="text-sm text-gray-300 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 bg-white/10 rounded-xl p-5 border border-white/10">
                <div className="flex justify-between text-sm text-gray-300 mb-2">
                  <span>Austin ADU Expansion Program</span>
                  <span className="text-[#c8956c] font-semibold">65% funded</span>
                </div>
                <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full w-[65%] bg-gradient-to-r from-[#c8956c] to-[#e0b48c] rounded-full"></div>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  ₦312,000 raised of ₦480,000 target · Expected return up to 55%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
