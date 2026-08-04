import { AlertTriangle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What is the minimum investment?",
    a: "The Starter plan begins at just ₦1,000, making real estate investing accessible to everyone. Growth starts at ₦5,000 and Premium at ₦10,000.",
  },
  {
    q: "How are returns generated?",
    a: "Your capital funds the development and sale of FlexHavens luxury properties — estate developments, premium residences, and build-to-rent portfolios. Returns come from property sales and rental income across these projects.",
  },
  {
    q: "When and how do I get paid?",
    a: "Earnings accrue over your plan's term and are visible in your dashboard in real time. At maturity, your principal plus earnings are credited to your wallet, ready to withdraw to your bank, PayPal, or crypto wallet.",
  },
  {
    q: "Can I withdraw before maturity?",
    a: "Investments are locked for the plan term (6–18 months). Starter plan investors may request early exit after 90 days, subject to a review and a partial earnings adjustment.",
  },
  {
    q: "How does the referral program work?",
    a: "Share your unique referral code. When someone registers with it and their first deposit is approved, you receive a 5% bonus on that deposit, credited directly to your wallet.",
  },
  {
    q: "Is my personal and financial data secure?",
    a: "Yes. Passwords are encrypted with industry-standard bcrypt hashing, sessions use signed JWT tokens, and all traffic is protected with 256-bit SSL. Withdrawals above ₦5,000 additionally require identity verification.",
  },
  {
    q: "Are returns guaranteed?",
    a: "No. Target returns are projections based on project pipelines and historical performance. Real estate markets can fluctuate, and you may receive less than projected. Please read our full risk disclosure below.",
  },
  {
    q: "Who can invest?",
    a: "Adults 18+ from supported countries can register. Identity verification (KYC) is required for higher withdrawal limits, in line with anti-money-laundering regulations.",
  },
];

export default function InvestFAQ() {
  return (
    <>
      {/* FAQ */}
      <section id="invest-faq" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#c8956c] font-semibold uppercase tracking-widest text-sm mb-3">
              Investor FAQ
            </p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#1e3a5f] mb-4">
              Questions, Answered
            </h2>
            <p className="text-gray-600 text-lg">
              Everything investors ask us before getting started.
            </p>
          </div>

          <div className="bg-[#faf8f5] rounded-2xl p-6 md:p-8">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`invest-faq-${i}`}>
                  <AccordionTrigger className="text-left font-semibold text-[#1e3a5f] hover:text-[#2d5a87]">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Risk Disclosure */}
      <section id="risk-disclosure" className="py-16 bg-[#faf8f5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border-l-4 border-[#c8956c] rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 bg-[#c8956c]/10 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-[#c8956c]" />
              </div>
              <h2 className="text-2xl font-bold text-[#1e3a5f] font-serif">Risk Disclosure</h2>
            </div>
            <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
              <p>
                Investing in real estate development involves substantial risk and may result in
                partial or total loss of capital. Target returns of up to 40%, 55%, and 70%
                represent goals based on project pipelines and historical performance — they are
                projections, not guarantees, and actual returns may be lower or negative.
              </p>
              <p>
                Investments are illiquid for the duration of the plan term. Property values,
                rental demand, construction costs, interest rates, and regulatory conditions can
                all affect project outcomes. Past performance of FlexHavens projects is not
                indicative of future results.
              </p>
              <p>
                FlexHavens Invest is not a bank, and investments are not deposits — they are not
                insured by the FDIC or any other government agency. You should only invest money
                you can afford to have committed for the full investment term, and you are
                encouraged to consult a licensed financial advisor before investing.
              </p>
              <p className="font-semibold text-[#1e3a5f]">
                By creating an investor account, you acknowledge that you have read, understood,
                and accepted these risks.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
