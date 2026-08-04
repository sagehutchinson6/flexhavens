import { useState } from "react";
import { Building2, Bitcoin, Wallet, ArrowUpFromLine, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { formatCurrency, formatDate } from "@/hooks/use-investor";
import { SectionCard, StatusBadge, EmptyState } from "./shared";

const methods = [
  { id: "bank" as const, label: "Bank Account", icon: Building2, placeholder: "IBAN / Account number + routing" },
  { id: "paypal" as const, label: "PayPal", icon: Wallet, placeholder: "PayPal email address" },
  { id: "crypto" as const, label: "Crypto Wallet", icon: Bitcoin, placeholder: "BTC / ETH / USDT wallet address" },
];

export default function WithdrawTab({
  walletBalance,
  kycStatus,
  onWithdrawn,
}: {
  walletBalance: number;
  kycStatus: string;
  onWithdrawn: () => void;
}) {
  const [amountStr, setAmountStr] = useState("");
  const [method, setMethod] = useState<"bank" | "paypal" | "crypto">("bank");
  const [destination, setDestination] = useState("");
  const amount = Number(amountStr) || 0;

  const { data: withdrawals, refetch } = trpc.investor.withdrawals.useQuery(undefined, { retry: false, refetchInterval: 20_000 });

  const withdraw = trpc.investor.withdraw.useMutation({
    onSuccess: (data) => {
      toast.success(`Withdrawal request submitted. Reference: ${data.reference}`);
      setAmountStr("");
      setDestination("");
      refetch();
      onWithdrawn();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleWithdraw = () => {
    if (amount < 50) {
      toast.error("Minimum withdrawal is ₦50");
      return;
    }
    if (amount > walletBalance) {
      toast.error("Insufficient wallet balance");
      return;
    }
    if (destination.trim().length < 4) {
      toast.error("Please enter a valid destination");
      return;
    }
    withdraw.mutate({ amount, method, destination: destination.trim() });
  };

  const selectedMethod = methods.find((m) => m.id === method)!;

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2">
        <SectionCard title="Request a Withdrawal" subtitle={`Available: ${formatCurrency(walletBalance)}`}>
          <div className="space-y-5">
            <div>
              <Label htmlFor="withdraw-amount">Amount (₦)</Label>
              <div className="relative mt-1.5">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <Input
                  id="withdraw-amount"
                  type="number"
                  min={50}
                  max={walletBalance}
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  placeholder="500"
                  className="pl-8 h-12 font-bold text-lg"
                />
                <button
                  onClick={() => setAmountStr(String(walletBalance))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#c8956c] hover:text-[#b07d52]"
                >
                  MAX
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Minimum ₦50</p>
            </div>

            <div>
              <Label>Destination Method</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {methods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`p-3.5 rounded-xl border-2 text-center transition ${
                      method === m.id
                        ? "border-[#1e3a5f] bg-[#1e3a5f]/[0.04]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <m.icon className={`w-5 h-5 mx-auto mb-1.5 ${method === m.id ? "text-[#1e3a5f]" : "text-gray-400"}`} />
                    <p className="text-xs font-semibold text-[#1e3a5f]">{m.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="destination">{selectedMethod.label} Details</Label>
              <Input
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder={selectedMethod.placeholder}
                className="mt-1.5 h-12"
              />
            </div>

            {kycStatus !== "verified" && (
              <div className="flex gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-800">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                Withdrawals above ₦5,000 require identity verification. Complete verification in
                Settings to unlock higher limits.
              </div>
            )}

            <Button
              onClick={handleWithdraw}
              disabled={withdraw.isPending || !amountStr}
              className="w-full h-12 bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] hover:shadow-lg transition text-base font-semibold"
            >
              <ArrowUpFromLine className="w-5 h-5 mr-2" />
              {withdraw.isPending ? "Submitting..." : `Withdraw ${amount > 0 ? formatCurrency(amount) : ""}`}
            </Button>
            <p className="text-[11px] text-gray-400 text-center">
              Withdrawals are reviewed and typically processed within 1-3 business days.
            </p>
          </div>
        </SectionCard>
      </div>

      <div className="lg:col-span-3">
        <SectionCard title="Withdrawal History" subtitle={`${withdrawals?.length ?? 0} requests`}>
          {withdrawals && withdrawals.length > 0 ? (
            <div className="divide-y">
              {withdrawals.map((w: any) => (
                <div key={w.id} className="flex items-center justify-between py-3.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1e3a5f]">
                      {formatCurrency(w.amount)}
                      <span className="text-xs text-gray-400 font-normal ml-2 capitalize">via {w.method}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
                      {formatDate(w.createdAt)} · To {w.destination}
                    </p>
                  </div>
                  <StatusBadge status={w.status} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={ArrowUpFromLine}
              title="No withdrawals yet"
              text="Your withdrawal requests and their processing status will appear here."
            />
          )}
        </SectionCard>
      </div>
    </div>
  );
}
