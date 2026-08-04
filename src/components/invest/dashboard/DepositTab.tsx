import { useState } from "react";
import { CreditCard, Building2, Bitcoin, Wallet, ArrowDownToLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { formatCurrency, formatDate } from "@/hooks/use-investor";
import { SectionCard, StatusBadge, EmptyState } from "./shared";
import { VerificationBadgeStrip } from "@/components/invest/VerificationBadge";

const methods = [
  { id: "bank" as const, label: "Bank Transfer", icon: Building2, note: "Instant review" },
  { id: "card" as const, label: "Debit / Credit Card", icon: CreditCard, note: "Instant review" },
  { id: "paypal" as const, label: "PayPal", icon: Wallet, note: "Instant review" },
  { id: "crypto" as const, label: "Cryptocurrency", icon: Bitcoin, note: "BTC, ETH, USDT" },
];

export default function DepositTab({ onDeposited }: { onDeposited: () => void }) {
  const [amountStr, setAmountStr] = useState("");
  const [method, setMethod] = useState<"bank" | "paypal" | "crypto" | "card">("bank");
  const amount = Number(amountStr) || 0;

  const { data: deposits, refetch } = trpc.investor.deposits.useQuery(undefined, { retry: false, refetchInterval: 20_000 });

  const deposit = trpc.investor.deposit.useMutation({
    onSuccess: (data) => {
      toast.success(`Deposit request submitted. Reference: ${data.reference}`);
      setAmountStr("");
      refetch();
      onDeposited();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleDeposit = () => {
    if (amount < 1000) {
      toast.error("Minimum deposit is ₦1,000");
      return;
    }
    deposit.mutate({ amount, method });
  };

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <div className="col-span-full">
        <VerificationBadgeStrip />
      </div>
      <div className="lg:col-span-2">
        <SectionCard title="Make a Deposit" subtitle="Funds are credited after compliance review">
          <div className="space-y-5">
            <div>
              <Label htmlFor="deposit-amount">Amount (₦)</Label>
              <div className="relative mt-1.5">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₦</span>
                <Input
                  id="deposit-amount"
                  type="number"
                  min={1000}
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  placeholder="1,000"
                  className="pl-8 h-12 font-bold text-lg"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Minimum ₦1000</p>
            </div>

            <div>
              <Label>Payment Method</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {methods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`p-4 rounded-xl border-2 text-left transition ${
                      method === m.id
                        ? "border-[#1e3a5f] bg-[#1e3a5f]/[0.04]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <m.icon className={`w-5 h-5 mb-2 ${method === m.id ? "text-[#1e3a5f]" : "text-gray-400"}`} />
                    <p className="text-sm font-semibold text-[#1e3a5f]">{m.label}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{m.note}</p>
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleDeposit}
              disabled={deposit.isPending || !amountStr}
              className="w-full h-12 bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] hover:shadow-lg transition text-base font-semibold"
            >
              <ArrowDownToLine className="w-5 h-5 mr-2" />
              {deposit.isPending ? "Submitting..." : `Deposit ${amount > 0 ? formatCurrency(amount) : ""}`}
            </Button>
            <p className="text-[11px] text-gray-400 text-center">
              Deposits are reviewed by our compliance team, usually within 24 hours.
            </p>
          </div>
        </SectionCard>
      </div>

      <div className="lg:col-span-3">
        <SectionCard title="Deposit History" subtitle={`${deposits?.length ?? 0} requests`}>
          {deposits && deposits.length > 0 ? (
            <div className="divide-y">
              {deposits.map((d: any) => (
                <div key={d.id} className="flex items-center justify-between py-3.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1e3a5f]">
                      {formatCurrency(d.amount)}
                      <span className="text-xs text-gray-400 font-normal ml-2 capitalize">via {d.method}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(d.createdAt)} · Ref {d.reference}
                    </p>
                  </div>
                  <StatusBadge status={d.status} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={ArrowDownToLine}
              title="No deposits yet"
              text="Your deposit requests will appear here with their review status."
            />
          )}
        </SectionCard>
      </div>
    </div>
  );
}
