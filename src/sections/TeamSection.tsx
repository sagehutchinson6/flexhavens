import { trpc } from "@/providers/trpc";

// Original hardcoded roster — used only when no team members are stored in
// the database yet (or the query is unavailable), so the section always renders.
const FALLBACK_TEAM = [
  {
    name: "Sarah Mitchell",
    role: "CEO & Founder",
    image: "/images/agent-hero.png",
    bio: "With over 15 years in real estate development, Sarah founded FlexHavens to make luxury property with verified titles accessible across Africa.",
  },
  {
    name: "James Cooper",
    role: "Head of Operations",
    image: "/images/50 years old ceo 2.jpg",
    bio: "James oversees our Abuja developments, ensuring every residence meets our strict quality standards before handover.",
  },
  {
    name: "Elena Rodriguez",
    role: "African Client Relations Manager",
    image: "/images/woman ceo.jpg",
    bio: "Based in Nairobi, Elena supports our buyers and investors across the continent — from first enquiry to documentation and handover.",
  },
  {
    name: "David Kim",
    role: "Customer Success Lead",
    image: "/images/51 years old ceo 1.jpg",
    bio: "David and his team provide 24/7 support to our clients, from initial inquiry through documentation, handover, and beyond.",
  },
];

export default function TeamSection() {
  const { data: members } = trpc.products.teamMembers.useQuery(undefined, {
    retry: false,
    staleTime: 60_000,
  });

  const team =
    members && members.length > 0
      ? members.map((m) => ({
          name: m.name,
          role: m.role,
          image: m.photo || "/images/agent-hero.png",
          bio: m.bio ?? "",
        }))
      : FALLBACK_TEAM;

  return (
    <section className="py-20 bg-[#faf8f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif font-bold text-[#1e3a5f] mb-4">Meet Our Team</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Dedicated professionals committed to delivering your dream home with excellence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member) => (
            <div key={member.name} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
              <div className="h-48 overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-[#1e3a5f]">{member.name}</h3>
                <p className="text-[#c8956c] text-sm font-medium mb-2">{member.role}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>

              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
