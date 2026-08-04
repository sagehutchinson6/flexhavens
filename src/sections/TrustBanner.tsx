import { Globe, Award } from "lucide-react";

export default function TrustBanner() {
  const items = [
    { icon: Globe, title: "Headquartered in Abuja, FCT", desc: "Nigeria — serving all of Africa" },
    { icon: Globe, title: "Buyers Across Africa", desc: "Purchases and investments from every African country" },
    { icon: Award, title: "ISO Certified", desc: "International Building Standards" },
  ];

  return (
    <section className="py-12 bg-[#faf8f5] border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center">
          {items.map((item, idx) => (
            <div key={item.title} className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#1e3a5f] rounded-full flex items-center justify-center flex-shrink-0">
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="font-bold text-[#1e3a5f]">{item.title}</div>
                <div className="text-sm text-gray-600">{item.desc}</div>
              </div>
              {idx < items.length - 1 && (
                <div className="hidden md:block w-px h-12 bg-gray-300 ml-4" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
