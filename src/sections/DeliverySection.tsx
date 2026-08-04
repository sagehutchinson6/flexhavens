import { useState } from "react";
import { Link } from "react-router";
import { Search, CheckCircle, FileText, Scale, KeyRound, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function DeliverySection() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");

  const handleTrack = () => {
    if (!orderNumber || !email) {
      toast.error("Please enter both order number and email");
      return;
    }
    window.location.href = `/track-order?order=${orderNumber}&email=${email}`;
  };

  const steps = [
    { num: "1", title: "Purchase & Verification", desc: "Choose your property and buy outright or with a mortgage. Our team verifies your payment and issues your purchase agreement.", icon: FileText },
    { num: "2", title: "Legal Documentation", desc: "Our legal team prepares your contracts, allocates your property, and processes your title documents.", icon: Scale },
    { num: "3", title: "Final Inspection", desc: "A final inspection of your property is scheduled — walk through your home with our team before handover.", icon: Building2 },
    { num: "4", title: "Handover", desc: "Receive your keys and complete title documents at the official handover. Welcome home.", icon: KeyRound },
  ];

  const coverage = [
    { title: "Abuja, FCT — Our Home", desc: "Headquartered in Abuja with estates across Maitama, Guzape, Jabi, Katampe, Life Camp, Gwarinpa, Kado and Lokogoma." },
    { title: "Serving All of Africa", desc: "Buyers and investors across Nigeria and Africa are welcome — our team supports remote purchases, documentation, and handover." },
  ];

  return (
    <section id="delivery" className="py-20 bg-[#faf8f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif font-bold text-[#1e3a5f] mb-4">Purchase Process & Tracking</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            From your first enquiry to the day you receive your keys — a transparent, fully documented purchase journey.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Process */}
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold text-[#1e3a5f] mb-6">Purchase Process</h3>
            <div className="space-y-6">
              {steps.map((step) => (
                <div key={step.num} className="flex gap-4">
                  <div className="w-10 h-10 bg-[#1e3a5f] text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    {step.num}
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#1e3a5f] flex items-center gap-2">
                      <step.icon className="w-4 h-4" />
                      {step.title}
                    </h4>
                    <p className="text-gray-600 text-sm mt-1">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Track Order */}
          <div className="bg-[#1e3a5f] text-white p-8 rounded-2xl">
            <h3 className="text-2xl font-bold mb-6">Track Your Purchase</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Order Number</label>
                <Input
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="FH-NG-2026-XXXXX"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Email Address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              <Button
                onClick={handleTrack}
                className="w-full bg-[#c8956c] hover:bg-[#b8845b] text-white"
              >
                <Search className="w-4 h-4 mr-2" />
                Track Purchase
              </Button>
              <p className="text-xs text-gray-400 text-center mt-2">
                Or{" "}
                <Link to="/track-order" className="text-[#c8956c] hover:underline">
                  go to tracking page
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Coverage */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-[#1e3a5f] text-center mb-8">Where We Operate</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {coverage.map((c) => (
              <div key={c.title} className="bg-green-50 border-2 border-green-200 p-6 rounded-xl text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h4 className="font-bold text-green-800 mb-2">{c.title}</h4>
                <p className="text-sm text-green-700">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
