import { useState } from "react";
import { Flag, Building2, KeyRound } from "lucide-react";

export default function FeaturesSection() {
  const [] = useState<string | null>(null);

  const features = [
    {
      icon: Flag,
      title: "Nigerian Quality",
      desc: "Every residence is developed in Abuja, FCT to international building standards using premium materials and finishes.",
    },
    {
      icon: Building2,
      title: "Prime Locations",
      desc: "From Maitama to Guzape and Jabi, our estates sit in Abuja's most prestigious and fastest-appreciating districts.",
    },
    {
      icon: KeyRound,
      title: "Secure Titles & Handover",
      desc: "Verified Certificates of Occupancy, full legal documentation, and a guided handover process — handled end to end by our team.",
    },
  ];


  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif font-bold text-[#1e3a5f] mb-4">Why Choose FlexHavens?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Quality development meets international standards. Built in Abuja, trusted across Nigeria and Africa.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-[#faf8f5] p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-14 h-14 bg-[#1e3a5f]/10 rounded-xl flex items-center justify-center mb-6 hover:rotate-6 transition-transform">
                <f.icon className="w-7 h-7 text-[#1e3a5f]" />
              </div>
              <h3 className="text-xl font-bold text-[#1e3a5f] mb-3">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
