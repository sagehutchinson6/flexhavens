import { useState } from "react";
import { useNavigate } from "react-router";
import { X, ShoppingCart, Shield, Clock, Flag, ChevronDown, ChevronUp, Play, Landmark, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BookAppointmentModal from "@/components/crm/BookAppointmentModal";

interface ProductModalProps {
  product: any;
  onClose: () => void;
  onAddToCart: (product: any) => void;
}

export default function ProductModal({ product, onClose, onAddToCart }: ProductModalProps) {
  const navigate = useNavigate();
  const [mainImage, setMainImage] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  const images = typeof product.images === "string" ? JSON.parse(product.images) : product.images;
  const specs = typeof product.specs === "string" ? JSON.parse(product.specs) : product.specs;
  const features = typeof product.features === "string" ? JSON.parse(product.features) : product.features;
  const imageList = Array.isArray(images) ? images : ["/images/home-exterior-1.jpg"];
  const specEntries = specs && typeof specs === "object" ? Object.entries(specs) : [];
  const featureList = Array.isArray(features) ? features : [];

  const faqs = [
    { q: "Is the property title verified?", a: "Yes. Every FlexHavens property comes with verified title documents (Certificate of Occupancy). Our legal team handles the full documentation and transfer process on your behalf." },
    { q: "Can I inspect the property before buying?", a: "Absolutely. We encourage physical inspections — book a viewing with our consultants and a final inspection is always scheduled before handover." },
    { q: "Can I buy with a mortgage?", a: "Yes — eligible properties can be purchased with a FlexHavens mortgage plan. Pay a deposit and spread the balance in monthly or yearly installments." },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center z-10 transition"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="grid lg:grid-cols-2">
          {/* Left: Images */}
          <div className="p-6">
            <div className="relative h-80 rounded-xl overflow-hidden mb-4">
              <img src={imageList[mainImage]} className="w-full h-full object-cover" alt={product.name} />
              <button className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-white transition">
                <Play className="w-4 h-4 text-[#1e3a5f]" />
                Watch Video
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {imageList.slice(0, 4).map((img: string, i: number) => (
                <img
                  key={i}
                  src={img}
                  onClick={() => setMainImage(i)}
                  className={`h-20 w-full object-cover rounded-lg cursor-pointer hover:opacity-80 transition border-2 ${
                    i === mainImage ? "border-[#1e3a5f]" : "border-transparent"
                  }`}
                  alt={`${product.name} view ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right: Details */}
          <div className="p-6 lg:border-l">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-3xl font-bold text-[#1e3a5f] font-serif">{product.name}</h2>
                <p className="text-gray-500">{product.bedrooms} Bedrooms | {product.bathrooms} Bathrooms | {product.size}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-[#1e3a5f]">₦{Number(product.price).toLocaleString()}</div>
                <div className="text-sm text-green-600 font-medium">Verified title · Ready for handover</div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-[#c8956c]" />
                <span>Handover: <strong>{product.delivery}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-[#c8956c]" />
                <span>Title: <strong>{product.warranty}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Flag className="w-4 h-4 text-[#c8956c]" />
                <span>Location: <strong>Abuja, FCT, Nigeria</strong></span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-[#1e3a5f] mb-3">Key Features</h3>
              <div className="flex flex-wrap gap-2">
                {featureList.map((f: string) => (
                  <Badge key={f} variant="secondary" className="bg-[#faf8f5] text-[#1e3a5f] px-3 py-1">
                    {f}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-[#1e3a5f] mb-3">Specifications</h3>
              <div className="bg-gray-50 rounded-xl overflow-hidden">
                {specEntries.map(([key, val]: [string, any], i: number) => (
                  <div
                    key={key}
                    className={`flex justify-between px-4 py-2 text-sm ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                  >
                    <span className="text-gray-600">{key}</span>
                    <span className="font-medium text-[#1e3a5f]">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Accordion */}
            <div className="mb-6">
              <h3 className="font-bold text-[#1e3a5f] mb-3">FAQ</h3>
              <div className="space-y-2">
                {faqs.map((faq, i) => (
                  <div key={i} className="border rounded-lg">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex justify-between items-center p-3 text-left hover:bg-gray-50 transition"
                    >
                      <span className="font-medium text-sm">{faq.q}</span>
                      {openFaq === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>
                    {openFaq === i && (
                      <div className="px-3 pb-3">
                        <p className="text-sm text-gray-600">{faq.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Purchase Options</p>
            <Button
              variant="outline"
              onClick={() => setBookingOpen(true)}
              className="w-full border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f]/5 text-lg py-6 mb-3"
            >
              <CalendarCheck className="w-5 h-5 mr-2" />
              Book an Inspection / Tour
            </Button>
            <Button
              onClick={() => { onAddToCart(product); onClose(); }}
              className="w-full bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] hover:shadow-xl transition text-lg py-6 mb-3"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Buy Outright — ₦{Number(product.price).toLocaleString()}
            </Button>
            {product.mortgageEnabled === "yes" && (
              <Button
                variant="outline"
                onClick={() => {
                  onClose();
                  navigate(`/mortgage/apply/${product.id}`);
                }}
                className="w-full border-[#c8956c] text-[#b07d52] hover:bg-[#c8956c]/10 text-lg py-6"
              >
                <Landmark className="w-5 h-5 mr-2" />
                Buy with Mortgage
              </Button>
            )}

            <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Shield className="w-4 h-4 text-green-500" /> SSL Secure</span>
              <span className="flex items-center gap-1"><Badge variant="outline" className="text-green-500 border-green-500">14-Day Cancellation</Badge></span>
              <span className="flex items-center gap-1"><Flag className="w-4 h-4 text-[#c8956c]" /> Abuja, Nigeria</span>
            </div>
          </div>
        </div>
      </div>

      {bookingOpen && (
        <BookAppointmentModal
          onClose={() => setBookingOpen(false)}
          productId={product.id}
          propertyName={product.name}
          defaultType="property_inspection"
        />
      )}
    </div>
  );
}
