import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  Landmark, Calculator, FileText, HelpCircle, CheckCircle2, ChevronDown, Wallet,
  CalendarClock, BadgeCheck, ArrowRight, KeyRound, Home, Search, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/sections/Footer";
import WhatsAppChat from "@/components/WhatsAppChat";
import { trpc } from "@/providers/trpc";
import { formatCurrency, formatDate } from "@/hooks/use-investor";
import {
  quoteMortgageClient, buildSchedule, estimatedCompletionClient,
} from "@/lib/mortgage-math";

const faqs = [
  {
    q: "Who can apply for a mortgage?",
    a: "Any registered FlexHavens investor can apply. Simply choose an eligible property, select 'Buy with Mortgage' during checkout or on the property page, pick a plan, and submit. Every application is reviewed by our administration team, and you'll be notified as soon as a decision is made.",
  },
  {
    q: "How do mortgage payments work?",
    a: "All payments are made from your investor wallet — there are no external transfers to set up. Your first payment covers the down payment and activates your mortgage. After that you can pay any amount at any time, and every payment instantly reduces your remaining balance.",
  },
  {
    q: "What happens after my application is approved?",
    a: "The property appears in the My Mortgages section of your investor dashboard with your full payment schedule, next payment date, and live progress tracking. Make the down payment from your wallet to activate the plan.",
  },
  {
    q: "Can I pay off my mortgage early?",
    a: "Yes. You may pay any amount above the scheduled installment at any time, with no early-repayment penalties. Once the remaining balance reaches zero, the mortgage is marked completed automatically.",
  },
  {
    q: "What if I miss a payment?",
    a: "We'll send you reminders before and after a due date. Each plan includes a grace period, and a late fee may apply afterwards as shown in your plan terms. If you run into difficulty, contact support early — we're here to help.",
  },
  {
    q: "How is the total cost calculated?",
    a: "Each plan has a flat interest rate shown upfront. Your total contract value is the property price plus that flat rate — no compounding, no hidden charges. The down payment, installment amount, and estimated completion date are all shown before you apply.",
  },
];

const steps = [
  { icon: Search, title: "Choose a Property", text: "Browse the catalog and pick any mortgage-eligible home — look for the Mortgage Available badge." },
  { icon: FileText, title: "Pick a Plan & Apply", text: "Select Buy with Mortgage, compare plans, and submit your application in under two minutes." },
  { icon: ShieldCheck, title: "Admin Review", text: "Our team reviews every application promptly. You're notified the moment a decision is made." },
  { icon: KeyRound, title: "Pay & Own", text: "Pay the down payment from your wallet to activate, then installments at your own pace until you own it." },
];

export default function Mortgage() {
  const location = useLocation();
  const navigate = useNavigate();
  const plansQuery = trpc.mortgage.publicPlans.useQuery(undefined, { retry: false });
  const productsQuery = trpc.products.list.useQuery(undefined, { retry: false });

  // Smooth-scroll to hash targets when arriving from the navigation menu
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace("#", "");
    const t = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
    return () => clearTimeout(t);
  }, [location.hash, plansQuery.data, productsQuery.data]);

  // ── Calculator state ──────────────────────────────────────────
  const [calcPrice, setCalcPrice] = useState("120000");
  const [calcPlanId, setCalcPlanId] = useState<number | null>(null);
  const plans = plansQuery.data ?? [];
  const calcPlan = useMemo(
    () => plans.find((p) => p.id === calcPlanId) ?? plans[0],
    [plans, calcPlanId],
  );
  const calc = useMemo(() => {
    const price = Number(calcPrice);
    if (!calcPlan || !Number.isFinite(price) || price <= 0) return null;
    const q = quoteMortgageClient(price, calcPlan);
    return {
      ...q,
      completion: estimatedCompletionClient(new Date(), q.durationMonths),
      schedule: buildSchedule(q.totalPayable, q.downPayment, q.installment, q.periods, calcPlan.paymentFrequency),
    };
  }, [calcPrice, calcPlan]);

  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  const eligible = (productsQuery.data ?? []).filter(
    (p: any) => p.mortgageEnabled === "yes" && p.isActive === "yes",
  );

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navbar />
      <main>
        {/* ── Hero / Mortgage Information ─────────────────────── */}
        <section id="info" className="bg-gradient-to-br from-[#16293f] via-[#1e3a5f] to-[#2d5a87] text-white pt-32 pb-20 scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-[#c8956c] font-semibold uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
                <Landmark className="w-4 h-4" /> FlexHavens Mortgage
              </p>
              <h1 className="text-4xl sm:text-5xl font-serif font-bold leading-tight mb-6">
                Own Your Home, One Payment at a Time
              </h1>
              <p className="text-lg text-white/80 mb-8 leading-relaxed">
                Purchase any eligible FlexHavens property outright or spread the cost with a flexible
                mortgage plan. Transparent flat-rate pricing, wallet-based payments, and live progress
                tracking from your investor dashboard — no banks, no paperwork marathons.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="#properties">
                  <Button className="bg-[#c8956c] hover:bg-[#b07d52] text-white h-12 px-6 text-base font-semibold">
                    Apply for a Mortgage <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </a>
                <a href="#calculator">
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 h-12 px-6 text-base">
                    <Calculator className="w-4 h-4 mr-2" /> Try the Calculator
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── How it works ────────────────────────────────────── */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-serif font-bold text-[#1e3a5f] text-center mb-3">How It Works</h2>
            <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
              From application to ownership in four straightforward steps.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((s, i) => (
                <div key={s.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative">
                  <span className="absolute top-4 right-5 text-4xl font-serif font-bold text-[#c8956c]/20">{i + 1}</span>
                  <div className="w-12 h-12 bg-[#1e3a5f] rounded-xl flex items-center justify-center mb-4">
                    <s.icon className="w-6 h-6 text-[#c8956c]" />
                  </div>
                  <h3 className="font-bold text-[#1e3a5f] mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Available Mortgage Plans ────────────────────────── */}
        <section id="plans" className="py-16 bg-white scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-serif font-bold text-[#1e3a5f] text-center mb-3">Available Mortgage Plans</h2>
            <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
              Every plan is flat-rate and fully transparent — what you see is exactly what you pay.
            </p>
            {plansQuery.isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-10 h-10 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : plans.length === 0 ? (
              <p className="text-center text-gray-400 py-10">
                Mortgage plans are being prepared — please check back soon or contact us for details.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((p) => (
                  <div key={p.id} className="bg-[#faf8f5] rounded-2xl p-6 border border-gray-100 hover:border-[#c8956c]/40 hover:shadow-md transition">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-11 h-11 bg-[#1e3a5f] rounded-xl flex items-center justify-center shrink-0">
                        <Landmark className="w-5 h-5 text-[#c8956c]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1e3a5f]">{p.name}</h3>
                        <p className="text-xs text-gray-400 capitalize">
                          {p.planType} plan · {p.paymentFrequency} payments
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-[11px] text-gray-400 uppercase tracking-wider">Duration</p>
                        <p className="font-bold text-[#1e3a5f]">
                          {p.planType === "yearly" ? `${p.durationValue} years` : `${p.durationValue} months`}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-[11px] text-gray-400 uppercase tracking-wider">Down Payment</p>
                        <p className="font-bold text-[#b07d52]">{Number(p.downPaymentPercent)}%</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-[11px] text-gray-400 uppercase tracking-wider">Interest (flat)</p>
                        <p className="font-bold text-[#1e3a5f]">{Number(p.interestPercent)}%</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-[11px] text-gray-400 uppercase tracking-wider">Grace Period</p>
                        <p className="font-bold text-[#1e3a5f]">{p.gracePeriodDays ?? 0} days</p>
                      </div>
                    </div>
                    {p.lateFeePercent != null && (
                      <p className="text-xs text-gray-400 mt-3">Late fee: {Number(p.lateFeePercent)}% after grace period</p>
                    )}
                    <a href="#calculator" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#c8956c] hover:text-[#b07d52] mt-4">
                      Calculate with this plan <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Mortgage Calculator ─────────────────────────────── */}
        <section id="calculator" className="py-16 scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-serif font-bold text-[#1e3a5f] text-center mb-3">Mortgage Calculator</h2>
            <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
              Estimate your down payment, installments, and full repayment schedule.
            </p>
            <div className="grid lg:grid-cols-5 gap-8">
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Property Price (₦)</label>
                  <Input
                    type="number"
                    min="1000"
                    step="1000"
                    value={calcPrice}
                    onChange={(e) => setCalcPrice(e.target.value)}
                    className="mt-1.5 h-12 text-lg font-bold text-[#1e3a5f]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mortgage Plan</label>
                  <select
                    value={calcPlan?.id ?? ""}
                    onChange={(e) => setCalcPlanId(Number(e.target.value))}
                    className="mt-1.5 w-full h-12 rounded-md border border-input bg-background px-3 text-sm font-semibold text-[#1e3a5f]"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                {calc && calcPlan && (
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Down payment ({calc.downPercent}%)</span><span className="font-bold text-[#b07d52]">{formatCurrency(calc.downPayment)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">{calcPlan.paymentFrequency === "yearly" ? "Yearly" : "Monthly"} installment</span><span className="font-bold text-[#c8956c]">{formatCurrency(calc.installment)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Number of payments</span><span className="font-semibold text-[#1e3a5f]">{calc.periods + 1} (incl. down payment)</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Interest ({Number(calcPlan.interestPercent)}% flat)</span><span className="font-semibold text-[#1e3a5f]">{formatCurrency(calc.totalPayable - Number(calcPrice))}</span></div>
                    <div className="flex justify-between border-t pt-3"><span className="font-semibold text-[#1e3a5f]">Total contract value</span><span className="font-bold text-[#1e3a5f] text-lg">{formatCurrency(calc.totalPayable)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Estimated completion</span><span className="font-semibold text-[#1e3a5f]">{formatDate(calc.completion)}</span></div>
                  </div>
                )}
              </div>
              <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-[#1e3a5f] mb-4 flex items-center gap-2">
                  <CalendarClock className="w-5 h-5 text-[#c8956c]" /> Estimated Repayment Schedule
                </h3>
                {!calc ? (
                  <p className="text-gray-400 text-sm py-8 text-center">Enter a price and choose a plan to see the schedule.</p>
                ) : (
                  <div className="max-h-96 overflow-y-auto pr-1">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-white">
                        <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b">
                          <th className="pb-2 pr-4 font-semibold">#</th>
                          <th className="pb-2 pr-4 font-semibold">Payment</th>
                          <th className="pb-2 pr-4 font-semibold">Date</th>
                          <th className="pb-2 pr-4 font-semibold text-right">Amount</th>
                          <th className="pb-2 font-semibold text-right">Remaining</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {calc.schedule.map((r) => (
                          <tr key={r.n} className={r.n === 0 ? "bg-[#c8956c]/5" : ""}>
                            <td className="py-2.5 pr-4 text-gray-400">{r.n === 0 ? "—" : r.n}</td>
                            <td className="py-2.5 pr-4 font-medium text-[#1e3a5f]">{r.label}</td>
                            <td className="py-2.5 pr-4 text-gray-500 whitespace-nowrap">{formatDate(r.date)}</td>
                            <td className="py-2.5 pr-4 text-right font-semibold text-[#1e3a5f]">{formatCurrency(r.amount)}</td>
                            <td className="py-2.5 text-right text-gray-500">{formatCurrency(r.remaining)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Eligible Properties (Apply) ─────────────────────── */}
        <section id="properties" className="py-16 bg-white scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-serif font-bold text-[#1e3a5f] text-center mb-3">Apply for a Mortgage</h2>
            <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
              These properties are currently eligible for mortgage purchase. Pick one to start your application.
            </p>
            {productsQuery.isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-10 h-10 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : eligible.length === 0 ? (
              <div className="text-center py-10">
                <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400">No mortgage-eligible properties right now — browse the full catalog instead.</p>
                <Link to="/#catalog" className="inline-block mt-4">
                  <Button className="bg-[#1e3a5f]">Browse Catalog</Button>
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {eligible.map((p: any) => {
                  const img = Array.isArray(p.images) ? p.images[0] : null;
                  return (
                    <div key={p.id} className="bg-[#faf8f5] rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition group">
                      {img && (
                        <div className="relative h-44 overflow-hidden">
                          <img src={img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                          <span className="absolute bottom-3 left-3 bg-[#c8956c] text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                            Mortgage Available
                          </span>
                        </div>
                      )}
                      <div className="p-5">
                        <h3 className="font-bold text-[#1e3a5f]">{p.name}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{p.size} · {p.bedrooms} bed · {p.bathrooms} bath</p>
                        <div className="flex items-center justify-between mt-4">
                          <p className="text-lg font-bold text-[#1e3a5f]">{formatCurrency(p.price)}</p>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87]"
                            onClick={() => navigate(`/mortgage/apply/${p.id}`)}
                          >
                            <FileText className="w-4 h-4 mr-1.5" /> Apply
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ── Mortgage FAQ ────────────────────────────────────── */}
        <section id="faq" className="py-16 scroll-mt-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-serif font-bold text-[#1e3a5f] text-center mb-3">Mortgage FAQ</h2>
            <p className="text-gray-500 text-center mb-10">Everything you need to know before applying.</p>
            <div className="space-y-3">
              {faqs.map((f, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="font-semibold text-[#1e3a5f] flex items-center gap-2.5">
                      <HelpCircle className="w-4 h-4 text-[#c8956c] shrink-0" /> {f.q}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${faqOpen === i ? "rotate-180" : ""}`} />
                  </button>
                  {faqOpen === i && (
                    <p className="px-5 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-50 pt-4">{f.a}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA band ────────────────────────────────────────── */}
        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] rounded-3xl p-8 sm:p-12 text-center text-white">
              <BadgeCheck className="w-10 h-10 text-[#c8956c] mx-auto mb-4" />
              <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-3">Ready to Make It Yours?</h2>
              <p className="text-white/75 max-w-lg mx-auto mb-6">
                Apply in minutes, get a prompt review, and track every payment from your investor dashboard.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <a href="#properties">
                  <Button className="bg-[#c8956c] hover:bg-[#b07d52] text-white h-11 px-6 font-semibold">
                    <FileText className="w-4 h-4 mr-2" /> Start an Application
                  </Button>
                </a>
                <Link to="/invest/dashboard?tab=mortgages">
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 h-11 px-6">
                    <Wallet className="w-4 h-4 mr-2" /> My Mortgages
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-white/50 mt-6 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Flat-rate pricing · Wallet payments · No early-repayment penalties
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppChat />
    </div>
  );
}
