import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Calculator, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { trpc } from "@/providers/trpc";
import { fallbackPlans, type PlanDisplay } from "@/lib/investment-plans";
import { formatCurrency } from "@/hooks/use-investor";

export default function InvestCalculator() {
  const plansQuery = trpc.investor.plans.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const plans: PlanDisplay[] =
    plansQuery.data && plansQuery.data.length > 0
      ? (plansQuery.data as PlanDisplay[])
      : fallbackPlans;

  const [planSlug, setPlanSlug] = useState("premium");
  const selectedPlan = plans.find((p) => p.slug === planSlug) ?? plans[plans.length - 1];
  const min = Number(selectedPlan?.minAmount ?? 1000);

  const [amount, setAmount] = useState(10000);

  const effectiveAmount = Math.max(amount, min);
  const projectedEarnings = useMemo(
    () => (effectiveAmount * (selectedPlan?.targetReturn ?? 0)) / 100,
    [effectiveAmount, selectedPlan],
  );
  const totalValue = effectiveAmount + projectedEarnings;
  const monthlyEarnings = projectedEarnings / (selectedPlan?.durationMonths || 1);

  return (
    <section id="invest-calculator" className="py-24 bg-[#faf8f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: controls */}
          <div>
            <p className="text-[#c8956c] font-semibold uppercase tracking-widest text-sm mb-3">
              Investment Calculator
            </p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#1e3a5f] mb-6">
              See What Your Money Could Earn
            </h2>
            <p className="text-gray-600 text-lg mb-10">
              Adjust the amount and plan to project your potential returns over the investment term.
            </p>

            {/* Plan selector */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {plans.map((plan) => (
                <button
                  key={plan.slug}
                  onClick={() => {
                    setPlanSlug(plan.slug);
                    setAmount((prev) => Math.max(prev, Number(plan.minAmount)));
                  }}
                  className={`p-4 rounded-xl border-2 text-left transition ${
                    selectedPlan?.slug === plan.slug
                      ? "border-[#1e3a5f] bg-white shadow-lg"
                      : "border-gray-200 bg-white/60 hover:border-gray-300"
                  }`}
                >
                  <p className="font-bold text-[#1e3a5f]">{plan.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    up to {plan.targetReturn}% · {plan.durationMonths} mo
                  </p>
                </button>
              ))}
            </div>

            {/* Amount slider */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-gray-600">Investment Amount</span>
                <span className="text-2xl font-bold text-[#1e3a5f] font-serif">
                  {formatCurrency(effectiveAmount).replace(".00", "")}
                </span>
              </div>
              <Slider
                value={[effectiveAmount]}
                min={min}
                max={100000}
                step={500}
                onValueChange={([v]) => setAmount(v)}
                className="my-4"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>{formatCurrency(min).replace(".00", "")} min</span>
                <span>₦100,000</span>
              </div>
            </div>
          </div>

          {/* Right: results */}
          <div className="bg-[#1e3a5f] rounded-2xl p-8 text-white shadow-2xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 bg-[#c8956c] rounded-xl flex items-center justify-center">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold font-serif">Projected Returns</h3>
            </div>

            <div className="space-y-5">
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <span className="text-gray-300">Selected Plan</span>
                <span className="font-bold text-[#c8956c]">
                  {selectedPlan?.name} · {selectedPlan?.durationMonths} months
                </span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <span className="text-gray-300">Your Investment</span>
                <span className="font-bold text-xl">{formatCurrency(effectiveAmount)}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <span className="text-gray-300">Target Return</span>
                <span className="font-bold text-xl text-green-400">
                  up to {selectedPlan?.targetReturn}%
                </span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <span className="text-gray-300">Projected Earnings</span>
                <span className="font-bold text-xl text-green-400">
                  +{formatCurrency(projectedEarnings)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <span className="text-gray-300">Avg. Monthly Earnings</span>
                <span className="font-bold">{formatCurrency(monthlyEarnings)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg text-gray-200">Total at Maturity</span>
                <span className="text-3xl font-bold font-serif text-[#c8956c]">
                  {formatCurrency(totalValue)}
                </span>
              </div>
            </div>

            <Link to={`/invest/register?plan=${selectedPlan?.slug ?? "starter"}`} className="block mt-8">
              <Button className="w-full h-12 bg-gradient-to-r from-[#c8956c] to-[#b07d52] hover:shadow-xl transition text-base font-semibold">
                Start Earning Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <p className="text-xs text-gray-400 mt-4 text-center">
              Projections are illustrative only and not a guarantee of future performance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
