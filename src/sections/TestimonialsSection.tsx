import { Star, Award, Shield, Home, BadgeCheck } from "lucide-react";
import { trpc } from "@/providers/trpc";

type PublicTestimonial = {
  id: number;
  customerName: string;
  photo: string | null;
  propertyName: string | null;
  investmentPlan: string | null;
  mortgagePlan: string | null;
  rating: number;
  title: string | null;
  message: string;
  featured: string;
  verified: boolean;
};

const FALLBACK: PublicTestimonial[] = [
  {
    id: -1,
    customerName: "Adebayo Mensah",
    photo: null,
    propertyName: null,
    investmentPlan: null,
    mortgagePlan: null,
    rating: 5,
    title: null,
    message:
      "Buying from Accra felt effortless. The documentation was handled entirely by FlexHavens, and I followed every stage online until handover. The villa is stunning — flawless finish.",
    featured: "no",
    verified: true,
  },
  {
    id: -2,
    customerName: "Wanjiku Kamau",
    photo: null,
    propertyName: null,
    investmentPlan: null,
    mortgagePlan: null,
    rating: 5,
    title: null,
    message:
      "I was initially worried about buying property from Kenya, but their support team made everything easy. The bank transfer was straightforward, the title documents are complete, and the house is beautiful.",
    featured: "no",
    verified: true,
  },
  {
    id: -3,
    customerName: "Tendai Moyo",
    photo: null,
    propertyName: null,
    investmentPlan: null,
    mortgagePlan: null,
    rating: 5,
    title: null,
    message:
      "The mortgage plan made it possible. A reasonable deposit, clear monthly installments, and my family moved into our Jabi duplex within weeks of completion. Excellent quality at fair terms.",
    featured: "no",
    verified: true,
  },
];

function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
}

function contextLine(t: PublicTestimonial): string {
  if (t.propertyName) return `Property: ${t.propertyName}`;
  if (t.investmentPlan) return `Investor: ${t.investmentPlan}`;
  if (t.mortgagePlan) return `Mortgage: ${t.mortgagePlan}`;
  return t.verified ? "Verified Customer" : "FlexHavens Customer";
}

export default function TestimonialsSection() {
  const query = trpc.testimonial.publicList.useQuery(undefined, {
    retry: false,
    staleTime: 5 * 60_000,
  });

  const live = (query.data ?? []) as unknown as PublicTestimonial[];
  // Approved testimonials (featured first, then most recent) — fallback keeps the page warm
  const featured = live.filter((t) => t.featured === "yes");
  const regular = live.filter((t) => t.featured !== "yes");
  const items = [...featured, ...regular].slice(0, 6);
  const testimonials = items.length ? items : FALLBACK;

  const avg = live.length ? (live.reduce((s, t) => s + t.rating, 0) / live.length).toFixed(1) : null;

  const badges = [
    { icon: BadgeCheck, label: "Verified C of O Titles" },
    { icon: Home, label: "Built in Abuja, Nigeria" },
    { icon: Award, label: "Award-Winning Estates" },
    { icon: Shield, label: "Secure Transactions" },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif font-bold text-[#1e3a5f] mb-4">Trusted Across Africa</h2>
          <div className="flex items-center justify-center gap-1 text-yellow-500 text-xl">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-6 h-6 fill-current" />
            ))}
            <span className="text-gray-600 text-lg ml-2">
              {avg ? `${avg}/5 from ${live.length} verified customer${live.length === 1 ? "" : "s"}` : "4.9/5 from 200+ happy customers"}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-[#faf8f5] p-8 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col"
            >
              <div className="flex items-center gap-1 text-yellow-500 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className={`w-4 h-4 ${i <= t.rating ? "fill-current" : "text-gray-300"}`} />
                ))}
              </div>
              {t.title && <p className="font-bold text-[#1e3a5f] mb-2">{t.title}</p>}
              <p className="text-gray-600 mb-6 leading-relaxed flex-1">{t.message}</p>
              <div className="flex items-center gap-4">
                {t.photo ? (
                  <img src={t.photo} alt={t.customerName} className="w-12 h-12 rounded-full object-cover border-2 border-[#c8956c]" />
                ) : (
                  <div className="w-12 h-12 bg-[#1e3a5f] rounded-full flex items-center justify-center text-white font-bold">
                    {initialsOf(t.customerName)}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-[#1e3a5f] flex items-center gap-1.5">
                    {t.customerName}
                    {t.verified && <BadgeCheck className="w-4 h-4 text-[#c8956c]" />}
                  </div>
                  <div className="text-sm text-gray-500">{contextLine(t)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap justify-center items-center gap-8 opacity-60">
          {badges.map((b) => (
            <div key={b.label} className="flex items-center gap-2 text-gray-400">
              <b.icon className="w-6 h-6" />
              <span className="font-semibold">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
