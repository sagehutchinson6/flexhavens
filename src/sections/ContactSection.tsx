import { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageSquare, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { AFRICAN_COUNTRIES } from "@contracts/geo";
import BookAppointmentModal from "@/components/crm/BookAppointmentModal";

export default function ContactSection() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "Nigeria",
    message: "",
  });
  const [bookingOpen, setBookingOpen] = useState(false);

  const contactMutation = trpc.contact.submit.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setForm({ firstName: "", lastName: "", email: "", phone: "", country: "Nigeria", message: "" });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.message) {
      toast.error("Please fill in all required fields");
      return;
    }
    contactMutation.mutate(form);
  };

  const countries = [...AFRICAN_COUNTRIES];

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif font-bold text-[#1e3a5f] mb-4">Get In Touch</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our Nigerian team is here to help — serving customers across Africa.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <div className="bg-[#faf8f5] p-8 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold text-[#1e3a5f] mb-6">Send Us a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <Input
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <Input
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <select
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
                >
                  {countries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <Textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={4}
                  required
                  placeholder="Tell us about your project..."
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] hover:shadow-lg transition"
                disabled={contactMutation.isPending}
              >
                <Send className="w-4 h-4 mr-2" />
                {contactMutation.isPending ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            {/* Nigeria HQ */}
            <div className="bg-[#faf8f5] p-8 rounded-2xl shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-[#1e3a5f]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
                </svg>
                <h3 className="text-xl font-bold text-[#1e3a5f]">Nigeria Headquarters</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#1e3a5f]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#1e3a5f]" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#1e3a5f]">Email</div>
                    <p className="text-gray-600">info@eaventra.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#1e3a5f]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-[#1e3a5f]" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#1e3a5f]">Phone / WhatsApp</div>
                    <p className="text-gray-600">+23408054825441</p>
                    <p className="text-xs text-gray-500">Mon-Sun, 8AM-9PM WAT</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#1e3a5f]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#1e3a5f]" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#1e3a5f]">Address</div>
                    <p className="text-gray-600">FlexHavens Real Estate Development Ltd.</p>
                    <p className="text-gray-600">Abuja, FCT, Nigeria</p>
                    <p className="text-gray-600">Serving clients across Africa</p>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/23408054825441"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-green-50 border-2 border-green-200 p-6 rounded-xl hover:bg-green-100 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-green-800">Chat on WhatsApp</h4>
                  <p className="text-sm text-green-700">Get instant replies from our team</p>
                </div>
              </div>
            </a>

            {/* Book Appointment CTA */}
            <button
              onClick={() => setBookingOpen(true)}
              className="block w-full text-left bg-[#1e3a5f]/5 border-2 border-[#1e3a5f]/20 p-6 rounded-xl hover:bg-[#1e3a5f]/10 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#1e3a5f] rounded-full flex items-center justify-center">
                  <CalendarCheck className="w-6 h-6 text-[#c8956c]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1e3a5f]">Book an Appointment</h4>
                  <p className="text-sm text-gray-600">Inspections, virtual tours, meetings & consultations</p>
                </div>
              </div>
            </button>

          </div>
        </div>
      </div>

      {bookingOpen && <BookAppointmentModal onClose={() => setBookingOpen(false)} />}
    </section>
  );
}
