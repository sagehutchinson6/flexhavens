import { Link } from "react-router";
import { Home, Shield, CheckCircle, Flag } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1e3a5f] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center relative overflow-hidden">
                <Home className="w-5 h-5 text-[#c8956c]" />
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full border-2 border-white/10"></div>
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif">FlexHavens</h3>
                <p className="text-xs text-gray-400 tracking-widest uppercase">Luxury Real Estate</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Luxury homes and estates in Abuja, built to international standards. Nigerian craftsmanship, continental reach.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
              <Flag className="w-4 h-4 text-[#c8956c]" />
              <span>Abuja, FCT, Nigeria</span>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-semibold mb-4 text-[#c8956c]">Products</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/#catalog" className="hover:text-white transition">Terrace Duplexes</a></li>
              <li><a href="/#catalog" className="hover:text-white transition">Detached Duplexes</a></li>
              <li><a href="/#catalog" className="hover:text-white transition">Executive Villas</a></li>
              <li><a href="/#catalog" className="hover:text-white transition">Luxury Mansions</a></li>
              <li><a href="/mortgage" className="hover:text-white transition">Mortgage Plans</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4 text-[#c8956c]">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link to="/invest" className="hover:text-white transition">Investment Portal</Link></li>
              <li><Link to="/faq" className="hover:text-white transition">FAQ</Link></li>
              <li><Link to="/track-order" className="hover:text-white transition">Track Purchase</Link></li>
              <li><a href="/#contact" className="hover:text-white transition">Contact</a></li>
              <li><Link to="/admin" className="hover:text-white transition">Admin Portal</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-[#c8956c]">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link to="/terms-conditions" className="hover:text-white transition">Terms of Service</Link></li>
              <li><a href="#" className="hover:text-white transition">Refund Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Data Protection</a></li>
            </ul>
            <div className="mt-4 text-xs text-gray-500">
              <p>FlexHavens Real Estate Development Ltd.</p>
              <p>Abuja, FCT, Nigeria</p>
              <p>Serving clients across Africa</p>
            </div>
          </div>
        </div>

        {/* Social & Copyright */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} FlexHavens Real Estate Development Ltd. All rights reserved. Headquartered in Abuja, FCT, Nigeria.
            </p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Shield className="w-4 h-4 text-green-400" />
                <span>256-bit SSL</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>NDPR Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Flag className="w-4 h-4 text-[#c8956c]" />
                <span>Nigeria Based</span>
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="flex justify-center gap-4 mt-6">
            {[
              { href: "https://facebook.com/flexhavens", label: "Facebook", color: "bg-blue-600 hover:bg-blue-700" },
              { href: "https://instagram.com/flexhavens", label: "Instagram", color: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400" },
              { href: "https://tiktok.com/@flexhavens", label: "TikTok", color: "bg-black hover:bg-gray-800" },
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-10 h-10 ${social.color} rounded-lg flex items-center justify-center text-white transition transform hover:scale-110`}
                title={social.label}
              >
                <span className="text-xs font-bold">{social.label[0]}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
