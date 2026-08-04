import { Link } from "react-router";
import { ArrowLeft, HelpCircle, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/sections/Footer";
import WhatsAppChat from "@/components/WhatsAppChat";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqCategories = [
  {
    title: "Buying & Payment",
    faqs: [
      {
        q: "How do I buy a property?",
        a: "Browse our properties, add your chosen home to the cart, and proceed to checkout — or choose Buy with Mortgage on eligible properties. Once your purchase request is submitted, you receive a reference number you can use to follow every stage on the Track Purchase page.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept PayPal, bank transfer, and cryptocurrency (BTC, ETH, USDT) for outright purchases. Mortgage purchases start with a deposit (from 20% depending on the property), with the balance spread in monthly or yearly installments. All transactions are secured with 256-bit SSL encryption.",
      },
      {
        q: "Can I inspect a property before buying?",
        a: "Absolutely. We encourage physical inspections — book a viewing with our consultants at any time. A final inspection is always scheduled before handover so you can walk through your home with our team.",
      },
      {
        q: "What is your refund policy?",
        a: "Purchase requests can be cancelled for a full refund within 14 days of placement, before legal documentation begins. After documentation starts, the deposit becomes non-refundable. See our Terms & Conditions for full details.",
      },
    ],
  },
  {
    title: "Documentation & Handover",
    faqs: [
      {
        q: "How does the purchase process work?",
        a: "Every purchase moves through nine transparent stages — from purchase request and payment verification, through agreement, legal documentation, allocation and title processing, to final inspection and handover. You are notified by email at every stage and can follow everything on the Track Purchase page.",
      },
      {
        q: "How long does the process take?",
        a: "All our properties are completed homes, so there is no construction wait. Most purchases complete documentation and handover within 4-10 weeks, depending on how quickly payments and signing are completed.",
      },
      {
        q: "Are title documents included?",
        a: "Yes. Every property comes with a verified Certificate of Occupancy (C of O). Our legal team processes the full title transfer and hands over complete documentation — agreements, title documents, and receipts are also available in your dashboard.",
      },
      {
        q: "I live outside Abuja — can I still buy?",
        a: "Yes. Buyers across Nigeria and Africa purchase with us remotely. Our team supports virtual viewings, couriered document signing, and a guided handover — you do not need to be in Abuja until you want to be.",
      },
    ],
  },
  {
    title: "Our Properties",
    faqs: [
      {
        q: "Are your properties completed homes?",
        a: "Yes — every FlexHavens listing is a completed, move-in-ready residence in Abuja, FCT. No off-plan waits, no construction risk. What you inspect is exactly what you receive.",
      },
      {
        q: "Where are your estates located?",
        a: "Our properties sit in Abuja's most prestigious districts — Maitama, Guzape, Katampe Extension, Jabi, Life Camp, Gwarinpa, Kado and Lokogoma — all gated estates with 24/7 security.",
      },
      {
        q: "Do the homes have smart features?",
        a: "Yes. Depending on the residence, features range from smart lighting and automated gates to full home automation, biometric access, and intelligent energy management. Each listing details its exact specification.",
      },
      {
        q: "Can I buy with a mortgage?",
        a: "Yes — every property in our collection is mortgage-eligible. Pay a deposit from 20%, choose a monthly or yearly plan, and spread the balance over up to 10 years. See the Mortgage page for plans and the calculator.",
      },
    ],
  },
  {
    title: "Investment Portal",
    faqs: [
      {
        q: "How does real estate investing with FlexHavens work?",
        a: "Our Investment Portal lets you invest in luxury real estate developments from as little as ₦1,000. Choose a plan, fund your wallet, and your capital is deployed across our development projects with target returns of up to 70% over 6-18 months.",
      },
      {
        q: "How do I withdraw my earnings?",
        a: "When an investment matures, your principal plus earnings are credited to your wallet. You can request a withdrawal to your bank, PayPal, or crypto wallet at any time from your investor dashboard.",
      },
      {
        q: "Is my investment guaranteed?",
        a: "No investment is without risk. Target returns are projections based on project performance and are not guaranteed. Please read the full risk disclosure on the Investment page before investing.",
      },
    ],
  },
];

export default function FAQ() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-[#1e3a5f] hover:text-[#2d5a87] mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="text-center mb-12">
            <div className="w-14 h-14 bg-[#1e3a5f] rounded-xl flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-7 h-7 text-[#c8956c]" />
            </div>
            <h1 className="text-4xl font-serif font-bold text-[#1e3a5f] mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-gray-600 text-lg">
              Everything you need to know about FlexHavens properties, the purchase process, and investing.
            </p>
          </div>

          <div className="space-y-10">
            {faqCategories.map((category) => (
              <div key={category.title}>
                <h2 className="text-2xl font-bold text-[#1e3a5f] mb-4 flex items-center gap-3">
                  <span className="w-8 h-1 bg-[#c8956c] rounded-full"></span>
                  {category.title}
                </h2>
                <div className="bg-[#faf8f5] rounded-2xl p-6">
                  <Accordion type="single" collapsible className="w-full">
                    {category.faqs.map((faq, i) => (
                      <AccordionItem key={i} value={`${category.title}-${i}`}>
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
            ))}
          </div>

          <div className="mt-12 bg-[#1e3a5f] rounded-2xl p-8 text-center text-white">
            <MessageCircle className="w-10 h-10 text-[#c8956c] mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Still have questions?</h2>
            <p className="text-gray-300 mb-6">
              Our team is available 7 days a week to help you find your perfect home.
            </p>
            <a
              href="/#contact"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c8956c] to-[#b07d52] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition"
            >
              Contact Us
            </a>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppChat />
    </div>
  );
}
