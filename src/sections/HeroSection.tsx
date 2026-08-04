import { Link } from "react-router";
import { ArrowRight, Shield, Globe, CheckCircle, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-28"
      style={{
        backgroundImage: `linear-gradient(rgba(30, 58, 95, 0.92), rgba(30, 58, 95, 0.88)), url('/images/hero-home.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div className="text-white space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium">Luxury Living, Africa-Wide Reach</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight">
              Luxury Homes in Abuja,
              <span className="text-[#c8956c]"> Built for Generations</span>
            </h1>

            <p className="text-xl text-gray-200 max-w-xl leading-relaxed">
              Completed luxury residences in Abuja's finest districts, from ₦38,500,000. Premium Nigerian craftsmanship with verified titles — outright purchase and mortgage plans available.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#catalog">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] hover:shadow-xl transition text-lg px-8 py-6"
                >
                  Browse Properties
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </a>
              <Link to="/track-order">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white/30 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 transition text-lg px-8 py-6"
                >
                  Track Your Purchase
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#c8956c]" />
                <span className="text-sm">Headquartered in Abuja, FCT</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-sm">SSL Secured</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm">NDPR Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-green-400" />
                <span className="text-sm">Verified Titles & Handover</span>
              </div>
            </div>
          </div>

          {/* Right: Agent + Home Images */}
          <div className="hidden lg:grid grid-cols-2 gap-4">
            {/* Agent Image */}
            <div className="col-span-2 relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-4">
                  <img
                    src="/images/agent-hero.png"
                    alt="Professional Real Estate Agent"
                    className="w-28 h-36 object-cover rounded-xl shadow-lg"
                  />
                  <div className="text-white">
                    <p className="text-sm text-[#c8956c] font-medium uppercase tracking-wide">Your Personal Consultant</p>
                    <h3 className="text-xl font-bold mt-1">Expert Guidance</h3>
                    <p className="text-sm text-gray-300 mt-2 leading-relaxed">
                      Our experienced consultants will help you find the perfect luxury property. From viewing to documentation and handover, we are with you every step.
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      <span className="text-xs text-green-300">Available Now</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Home Images */}
            <div className="space-y-4">
              <img src="/images/interior-1.jpg" alt="Interior" className="rounded-2xl shadow-2xl w-full h-[27rem] object-cover" />
            </div>
            <div className="space-y-4 pt-8">
              <img src="/images/home-exterior-2.jpg" alt="Luxury property" className="rounded-2xl shadow-2xl w-full h-60 object-cover" />
              <img src="/images/interior-2.jpg" alt="Kitchen" className="rounded-2xl shadow-2xl w-full h-44 object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
