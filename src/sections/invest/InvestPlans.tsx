import { Link } from "react-router";
import { CheckCircle, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import { fallbackPlans, parsePlanFeatures, type PlanDisplay } from "@/lib/investment-plans";
import { formatCurrency } from "@/hooks/use-investor";

export default function InvestPlans() {
  const plansQuery = trpc.investor.plans.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const plans: PlanDisplay[] =
    plansQuery.data && plansQuery.data.length > 0
      ? (plansQuery.data as PlanDisplay[])
      : fallbackPlans;

  return (
    <section id="invest-plans" className="py-24 bg-[#faf8f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-[#c8956c] font-semibold uppercase tracking-widest text-sm mb-3">
            Investment Plans
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#1e3a5f] mb-4">
            Choose Your Path to Wealth
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Three carefully structured plans backed by real Nigerian luxury property
            developments. Pick the one that matches your goals.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const features = parsePlanFeatures(plan.features);
            const featured = plan.featured === "yes";
            return (
              <div
                key={plan.slug}
                className={`relative bg-white rounded-2xl p-8 flex flex-col transition-all duration-300 hover:-translate-y-2 ${
                  featured
                    ? "border-2 border-[#c8956c] shadow-2xl md:scale-105 z-10"
                    : "border border-gray-200 shadow-lg hover:shadow-xl"
                }`}
              >
                {featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#c8956c] to-[#b07d52] text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-[#1e3a5f] font-serif">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mt-2 min-h-[40px]">{plan.description}</p>
                </div>

                <div className="text-center mb-6 pb-6 border-b border-gray-100">
                  <div className="flex items-end justify-center gap-1">
                    <span className="text-gray-500 text-sm mb-2">up to</span>
                    <span className={`text-5xl font-bold font-serif ${featured ? "text-[#c8956c]" : "text-[#1e3a5f]"}`}>
                      {plan.targetReturn}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">target return</p>
                  <div className="flex items-center justify-center gap-4 mt-4 text-sm">
                    <span className="bg-[#1e3a5f]/5 text-[#1e3a5f] font-semibold px-3 py-1 rounded-full">
                      Min {formatCurrency(plan.minAmount).replace(".00", "")}
                    </span>
                    <span className="bg-[#c8956c]/10 text-[#b07d52] font-semibold px-3 py-1 rounded-full">
                      {plan.durationMonths} Months
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-gray-600">
                      <CheckCircle className={`w-5 h-5 shrink-0 ${featured ? "text-[#c8956c]" : "text-[#1e3a5f]"}`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link to={`/invest/register?plan=${plan.slug}`} className="block">
                  <Button
                    className={`w-full h-12 text-base font-semibold transition ${
                      featured
                        ? "bg-gradient-to-r from-[#c8956c] to-[#b07d52] hover:shadow-xl"
                        : "bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] hover:shadow-lg"
                    }`}
                  >
                    Invest Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-gray-500 mt-10 max-w-3xl mx-auto">
          Target returns are projections based on historical project performance and are not
          guaranteed. All investments carry risk. Please review the risk disclosure below
          before investing.
        </p>
      </div>
    </section>
  );
}
