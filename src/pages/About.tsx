import { Link } from "react-router";
import { ArrowLeft, Flag, Target, Eye, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/sections/Footer";
import WhatsAppChat from "@/components/WhatsAppChat";

export default function About() {
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
            <h1 className="text-4xl font-serif font-bold text-[#1e3a5f] mb-4">About FlexHavens</h1>
            <p className="text-gray-600 text-lg">Nigerian craftsmanship, African reach.</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="bg-[#faf8f5] rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-[#1e3a5f] mb-4 flex items-center gap-2">
                <Flag className="w-6 h-6 text-[#c8956c]" />
                Our Story
              </h2>
              <p className="text-gray-600 leading-relaxed">
                FlexHavens was founded in Abuja, FCT, Nigeria with a simple mission: make exceptional luxury homes
                accessible to everyone, everywhere. We recognized that finding premium property with verified titles
                and transparent documentation was far too difficult, and we set out to create a better solution.
              </p>
              <p className="text-gray-600 leading-relaxed mt-4">
                From our first estate in Abuja, we have grown into a leading luxury real estate development company,
                serving buyers and investors across Africa. Every residence is built with premium materials,
                international engineering standards, and a commitment to quality that is unmatched in the industry.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white border rounded-xl p-6 text-center">
                <Target className="w-10 h-10 text-[#1e3a5f] mx-auto mb-3" />
                <h3 className="font-bold text-[#1e3a5f] mb-2">Our Mission</h3>
                <p className="text-sm text-gray-600">To develop exceptional luxury properties with secure titles that improve lives and build generational wealth.</p>
              </div>
              <div className="bg-white border rounded-xl p-6 text-center">
                <Eye className="w-10 h-10 text-[#1e3a5f] mx-auto mb-3" />
                <h3 className="font-bold text-[#1e3a5f] mb-2">Our Vision</h3>
                <p className="text-sm text-gray-600">To become Africa&apos;s most trusted name in luxury real estate, known for quality, integrity, and innovation.</p>
              </div>
              <div className="bg-white border rounded-xl p-6 text-center">
                <Heart className="w-10 h-10 text-[#1e3a5f] mx-auto mb-3" />
                <h3 className="font-bold text-[#1e3a5f] mb-2">Our Values</h3>
                <p className="text-sm text-gray-600">Quality, integrity, customer-first approach, and sustainable building practices.</p>
              </div>
            </div>

            <div className="bg-[#1e3a5f] rounded-2xl p-8 text-white mb-8">
              <h2 className="text-2xl font-bold mb-4">Why Choose Us?</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-[#c8956c] mb-2">Nigerian Quality</h4>
                  <p className="text-gray-300 text-sm">All residences are developed in Abuja, FCT using premium materials and international engineering standards.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-[#c8956c] mb-2">Verified Titles</h4>
                  <p className="text-gray-300 text-sm">Every property comes with a verified Certificate of Occupancy and full legal documentation handled by our team.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-[#c8956c] mb-2">Transparent Pricing</h4>
                  <p className="text-gray-300 text-sm">No hidden fees. The price you see is the price you pay — documentation and handover included.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-[#c8956c] mb-2">Flexible Payments</h4>
                  <p className="text-gray-300 text-sm">Buy outright or with a flexible FlexHavens mortgage plan — pay a deposit and spread the balance in installments.</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#1e3a5f] mb-4">Ready to Get Started?</h2>
              <p className="text-gray-600 mb-6">Browse our properties and find your perfect luxury home today.</p>
              <Link
                to="/#catalog"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition"
              >
                Browse Our Properties
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppChat />
    </div>
  );
}
