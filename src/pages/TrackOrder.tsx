import { useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router";
import {
  Search, CheckCircle2, Circle, Clock, XCircle, Download, FileText, CreditCard,
  FileSignature, Scale, MapPin, ScrollText, ClipboardCheck, KeyRound, Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/sections/Footer";
import WhatsAppChat from "@/components/WhatsAppChat";
import { trpc } from "@/providers/trpc";
import { formatCurrency, formatDate, formatDateTime } from "@/hooks/use-investor";
import { PURCHASE_STAGES, purchaseStageIndex, purchaseStageNext } from "@contracts/purchase-stages";

const stageIcons: Record<string, any> = {
  purchase_request: FileText,
  payment_verification: CreditCard,
  purchase_agreement: FileSignature,
  legal_documentation: Scale,
  property_allocation: MapPin,
  title_documentation: ScrollText,
  final_inspection: ClipboardCheck,
  handover_preparation: Home,
  handed_over: KeyRound,
};

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get("order") || "");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [query, setQuery] = useState<{ orderNumber: string; email: string } | null>(
    searchParams.get("order") && searchParams.get("email")
      ? { orderNumber: searchParams.get("order")!, email: searchParams.get("email")! }
      : null,
  );

  const trackQuery = trpc.orders.track.useQuery(query!, { enabled: !!query, retry: false });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderNumber.trim() && email.trim()) {
      setQuery({ orderNumber: orderNumber.trim(), email: email.trim() });
    }
  };

  const tracking = trackQuery.data;

  // Latest history entry per stage → date updated + admin note
  const stageInfo = useMemo(() => {
    const map: Record<string, { date: string; note?: string | null }> = {};
    for (const h of tracking?.history ?? []) {
      map[h.status] = { date: h.createdAt as unknown as string, note: h.note };
    }
    return map;
  }, [tracking]);

  const currentIdx = tracking ? purchaseStageIndex(tracking.order.orderStatus) : -1;
  const cancelled = tracking?.order.orderStatus === "cancelled";
  const nextStep = tracking && !cancelled ? purchaseStageNext(tracking.order.orderStatus) : null;

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-[#c8956c] font-semibold uppercase tracking-widest text-sm mb-2">Purchase Progress</p>
            <h1 className="text-4xl font-serif font-bold text-[#1e3a5f] mb-3">Track Your Property Purchase</h1>
            <p className="text-gray-500">
              Follow every stage of your purchase — from request to documentation to handover.
            </p>
          </div>

          {/* Search */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="orderNumber">Order Number *</Label>
                <Input
                  id="orderNumber"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="FH-NG-2026-XXXXX"
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1.5"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] h-12" disabled={trackQuery.isFetching}>
                <Search className="w-4 h-4 mr-2" />
                {trackQuery.isFetching ? "Searching..." : "Track Purchase"}
              </Button>
            </form>
          </div>

          {trackQuery.isError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center text-red-600 text-sm">
              Purchase not found. Please check your order number and email address.
            </div>
          )}

          {tracking && (
            <div className="space-y-6">
              {/* Order summary */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Order</p>
                    <p className="text-lg font-bold text-[#1e3a5f] font-mono">{tracking.order.orderNumber}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Submitted {formatDate(tracking.order.createdAt)}</p>
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${
                    cancelled ? "bg-red-100 text-red-600" :
                    currentIdx === 8 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {cancelled ? "Cancelled" : currentIdx === 8 ? "Completed" : "In Progress"}
                  </span>
                </div>
                <div className="space-y-2 border-t pt-4">
                  {tracking.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.productName} × {item.quantity}</span>
                      <span className="font-semibold text-[#1e3a5f]">{formatCurrency(item.totalPrice)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold text-[#1e3a5f]">Total</span>
                    <span className="font-bold text-[#1e3a5f] text-lg">{formatCurrency(tracking.order.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Payment method</span>
                    <span className="capitalize">{tracking.order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Payment status</span>
                    <span className={`capitalize font-semibold ${tracking.order.paymentStatus === "confirmed" ? "text-green-600" : "text-amber-600"}`}>
                      {tracking.order.paymentStatus.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              </div>

              {cancelled ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                  <XCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                  <h2 className="font-bold text-red-600 text-lg mb-1">Purchase Cancelled</h2>
                  <p className="text-sm text-red-500">This purchase has been cancelled. Please contact support if you have questions.</p>
                </div>
              ) : (
                <>
                  {/* Current stage highlight */}
                  {currentIdx >= 0 && (
                    <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] rounded-2xl p-6 text-white">
                      <p className="text-[#c8956c] text-xs font-bold uppercase tracking-widest mb-1">Current Stage {currentIdx + 1} of 9</p>
                      <h2 className="text-2xl font-serif font-bold mb-1">{PURCHASE_STAGES[currentIdx].label}</h2>
                      <p className="text-white/75 text-sm mb-3">{PURCHASE_STAGES[currentIdx].description}</p>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                        {stageInfo[tracking.order.orderStatus] && (
                          <p className="text-white/60">
                            Updated: <span className="text-white font-semibold">{formatDateTime(stageInfo[tracking.order.orderStatus].date)}</span>
                          </p>
                        )}
                        {nextStep && (
                          <p className="text-white/60">
                            Estimated next step: <span className="text-[#c8956c] font-semibold">{nextStep}</span>
                          </p>
                        )}
                      </div>
                      {/* progress bar */}
                      <div className="mt-4 h-2 bg-white/15 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#c8956c] rounded-full transition-all duration-700"
                          style={{ width: `${((currentIdx + 1) / 9) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* 9-stage timeline */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-[#1e3a5f] mb-5">Purchase Timeline</h3>
                    <div className="space-y-0">
                      {PURCHASE_STAGES.map((stage, i) => {
                        const done = i < currentIdx || currentIdx === 8;
                        const current = i === currentIdx && currentIdx !== 8;
                        const info = stageInfo[stage.key];
                        const Icon = stageIcons[stage.key] ?? Circle;
                        return (
                          <div key={stage.key} className="flex gap-4">
                            {/* rail */}
                            <div className="flex flex-col items-center">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                done ? "bg-green-100 text-green-600" :
                                current ? "bg-[#1e3a5f] text-white ring-4 ring-[#c8956c]/30" :
                                "bg-gray-100 text-gray-300"
                              }`}>
                                {done ? <CheckCircle2 className="w-5 h-5" /> :
                                 current ? <Icon className="w-5 h-5" /> :
                                 <Circle className="w-5 h-5" />}
                              </div>
                              {i < 8 && <div className={`w-0.5 flex-1 min-h-6 ${i < currentIdx ? "bg-green-200" : "bg-gray-100"}`} />}
                            </div>
                            {/* content */}
                            <div className="pb-6 min-w-0">
                              <p className={`font-semibold text-sm ${done ? "text-green-700" : current ? "text-[#1e3a5f]" : "text-gray-400"}`}>
                                {i + 1}. {stage.label}
                              </p>
                              {info?.date && (done || current) && (
                                <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(info.date)}</p>
                              )}
                              {info?.note && (done || current) && (
                                <p className="text-xs text-gray-500 mt-1 bg-[#faf8f5] border border-gray-100 rounded-lg px-3 py-2">
                                  {info.note}
                                </p>
                              )}
                              {current && stage.next && (
                                <p className="text-xs text-[#b07d52] mt-1 flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" /> Next: {stage.next}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Supporting documents */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-[#1e3a5f] mb-2">Purchase Documents</h3>
                    <p className="text-xs text-gray-400 mb-4">
                      Agreements, title documents, and inspection reports uploaded by our team appear here.
                    </p>
                    {tracking.documents.length === 0 ? (
                      <p className="text-sm text-gray-400 bg-[#faf8f5] rounded-lg px-4 py-3">
                        No documents uploaded yet — they will appear as your purchase progresses.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {tracking.documents.map((d: any) => (
                          <a
                            key={d.id}
                            href={d.dataUrl}
                            download={d.name}
                            className="flex items-center gap-3 bg-[#faf8f5] hover:bg-[#f3ede4] border border-gray-100 rounded-lg px-4 py-3 transition group"
                          >
                            <FileText className="w-4 h-4 text-[#c8956c] shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[#1e3a5f] truncate">{d.name}</p>
                              <p className="text-xs text-gray-400">Uploaded {formatDate(d.uploadedAt)}</p>
                            </div>
                            <Download className="w-4 h-4 text-gray-400 group-hover:text-[#1e3a5f] shrink-0" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="text-center text-sm text-gray-400">
                Questions about your purchase?{" "}
                <Link to="/#contact" className="text-[#c8956c] font-semibold hover:text-[#b07d52]">Contact our team</Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppChat />
    </div>
  );
}
