import { Link } from "react-router";
import { ArrowLeft, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/sections/Footer";

export default function TermsConditions() {
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
            <FileText className="w-12 h-12 text-[#1e3a5f] mx-auto mb-4" />
            <h1 className="text-4xl font-serif font-bold text-[#1e3a5f] mb-4">Terms & Conditions</h1>
            <p className="text-gray-600">Last updated: June 2026</p>
          </div>

          <div className="prose max-w-none text-gray-600">
            <h2 className="text-xl font-bold text-[#1e3a5f] mb-3">1. Acceptance of Terms</h2>
            <p className="mb-4">By accessing and using the FlexHavens website and services, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.</p>

            <h2 className="text-xl font-bold text-[#1e3a5f] mb-3">2. Products and Services</h2>
            <p className="mb-4">FlexHavens Real Estate Development Ltd. develops and sells completed luxury properties in Abuja, FCT, Nigeria. All property descriptions, specifications, and pricing are subject to change without notice. We reserve the right to withdraw any property from sale at any time.</p>

            <h2 className="text-xl font-bold text-[#1e3a5f] mb-3">3. Ordering and Payment</h2>
            <p className="mb-4">To purchase a property, you must provide accurate and complete information. Outright purchases require full payment before documentation begins; mortgage purchases require the applicable deposit followed by scheduled installments. We accept PayPal, cryptocurrency, and bank transfers.</p>

            <h2 className="text-xl font-bold text-[#1e3a5f] mb-3">4. Documentation & Handover</h2>
            <p className="mb-4">Documentation and handover timelines are estimates and not guaranteed. We are not responsible for delays caused by government registries, payment delays, or other circumstances beyond our control. Ownership transfers upon completed documentation and official handover.</p>

            <h2 className="text-xl font-bold text-[#1e3a5f] mb-3">5. Cancellation and Refunds</h2>
            <p className="mb-4">Purchases may be cancelled within 14 days of the purchase request for a full refund. After 14 days, cancellation fees apply based on documentation progress. Purchases may not be cancelled once title transfer has been executed.</p>

            <h2 className="text-xl font-bold text-[#1e3a5f] mb-3">6. Title & Condition</h2>
            <p className="mb-4">All properties are sold with verified title documents (Certificate of Occupancy) and are inspected before handover. Pre-existing defects identified at the final inspection are rectified before handover; damage from misuse after handover is not covered.</p>

            <h2 className="text-xl font-bold text-[#1e3a5f] mb-3">7. Limitation of Liability</h2>
            <p className="mb-4">FlexHavens shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our products or services. Our total liability shall not exceed the amount paid for the product.</p>

            <h2 className="text-xl font-bold text-[#1e3a5f] mb-3">8. Governing Law</h2>
            <p className="mb-4">These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria, without regard to its conflict of law provisions.</p>

            <h2 className="text-xl font-bold text-[#1e3a5f] mb-3">9. Contact Information</h2>
            <p className="mb-4">For questions about these Terms, please contact us at:<br />Email: info@eaventra.com<br />Address: Abuja, FCT, Nigeria</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
