import { Link } from "react-router";
import { MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import { formatCurrency } from "@/hooks/use-investor";

interface ProjectDisplay {
  id: number;
  name: string;
  location: string;
  category: string;
  description: string | null;
  image: string | null;
  targetAmount: string;
  raisedAmount: string;
  expectedReturn: number;
  durationMonths: number;
  status: string;
}

const fallbackProjects: ProjectDisplay[] = [
  {
    id: 1,
    name: "Lokogoma Garden Communities",
    location: "Lokogoma District, Abuja",
    category: "Luxury Residential Development",
    description: "A 24-unit luxury terrace community in Abuja's fast-growing Lokogoma corridor.",
    image: "/images/home-exterior-1.jpg",
    targetAmount: "250000.00",
    raisedAmount: "187500.00",
    expectedReturn: 42,
    durationMonths: 6,
    status: "funding",
  },
  {
    id: 2,
    name: "Abuja Premium Estates Program",
    location: "Abuja, FCT",
    category: "Luxury Estates",
    description: "Development of 40 premium residences across Abuja's high-demand metro districts.",
    image: "/images/home-exterior-2.jpg",
    targetAmount: "480000.00",
    raisedAmount: "312000.00",
    expectedReturn: 55,
    durationMonths: 12,
    status: "funding",
  },
  {
    id: 4,
    name: "West African Rental Portfolio",
    location: "Accra, Ghana",
    category: "Build-to-Rent",
    description: "18 luxury apartments across high-demand Accra suburbs with pre-secured tenants.",
    image: "/images/home-exterior-5.jpg",
    targetAmount: "620000.00",
    raisedAmount: "198400.00",
    expectedReturn: 52,
    durationMonths: 12,
    status: "open",
  },
];

export default function InvestProjects() {
  const projectsQuery = trpc.investor.projects.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const projects: ProjectDisplay[] =
    projectsQuery.data && projectsQuery.data.length > 0
      ? (projectsQuery.data as ProjectDisplay[])
      : fallbackProjects;

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-[#c8956c] font-semibold uppercase tracking-widest text-sm mb-3">
            Live Opportunities
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#1e3a5f] mb-4">
            Current Investment Projects
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Real developments your capital helps build. Funding progress updates in real time.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {projects.slice(0, 3).map((project) => {
            const target = Number(project.targetAmount);
            const raised = Number(project.raisedAmount);
            const pct = target > 0 ? Math.min(Math.round((raised / target) * 100), 100) : 0;
            return (
              <div
                key={project.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-52">
                  <img
                    src={project.image || "/images/home-exterior-1.jpg"}
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-4 left-4 bg-[#1e3a5f]/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                    {project.category}
                  </span>
                  <span className="absolute top-4 right-4 bg-[#c8956c] text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    up to {project.expectedReturn}%
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#1e3a5f] font-serif">{project.name}</h3>
                  <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-1.5">
                    <MapPin className="w-4 h-4 text-[#c8956c]" />
                    {project.location}
                  </p>
                  <p className="text-sm text-gray-600 mt-3 line-clamp-2">{project.description}</p>

                  <div className="mt-5">
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                      <span>{formatCurrency(raised).replace(".00", "")} raised</span>
                      <span className="font-semibold text-[#1e3a5f]">{pct}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#1e3a5f] to-[#c8956c] rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1.5">
                      <span>Target {formatCurrency(target).replace(".00", "")}</span>
                      <span>{project.durationMonths} months</span>
                    </div>
                  </div>

                  <Link to="/invest/register" className="block mt-5">
                    <Button
                      variant="outline"
                      className="w-full border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white"
                    >
                      Invest in This Project
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
