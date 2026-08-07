import { useState } from "react";
import { Building2, Bitcoin, Smartphone, ArrowDownToLine, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { formatCurrency, formatDate } from "@/hooks/use-investor";
import { PAYMENT_METHOD_LABELS } from "@contracts/constants";
import { SectionCard, StatusBadge, EmptyState, WalletSummary } from "./shared";
import { VerificationBadgeStrip } from "@/components/invest/VerificationBadge";

const methods = [
  { id: "bank" as const, label: "Bank Transfer", icon: Building2, note: "Direct bank transfer" },
  { id: "opay" as const, label: "OPay", icon: Smartphone, note: "Send to our OPay account" },
  { id: "crypto" as const, label: "Cryptocurrency", icon: Bitcoin, note: "BTC, ETH, USDT" },
];

const FALLBACK_INSTRUCTIONS: Record<string, string> = {
  bank: "Make a bank transfer to the FlexHavens corporate account. Submit your deposit request here, then include your deposit reference in the transfer narration. Your wallet is credited once our team confirms the transfer.",
  opay: "Send the deposit amount to the FlexHavens OPay account. Submit your deposit request here and use your deposit reference as the payment note. Your wallet is credited once our team confirms the payment.",
  crypto: "Send the deposit amount to the FlexHavens crypto wallet on your chosen network. Submit your deposit request here and keep your transaction hash. Your wallet is credited once our team confirms the transaction.",
};

export default function DepositTab({
  onDeposited,
  stats,
  setTab,
}: {
  onDeposited: () => void;
  stats?: any;
  setTab?: (tab: string) => void;
}) {
  const [amountStr, setAmountStr] = useState("");
  const [method, setMethod] = useState<"bank" | "opay" | "crypto">("bank");
  const amount = Number(amountStr) || 0;

  const { data: deposits, refetch } = trpc.investor.deposits.useQuery(undefined, { retry: false, refetchInterval: 20_000 });
  const { data: instructions } = trpc.investor.paymentInstructions.useQuery(undefined, { retry: false });

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
    if (amount < 100) {
      toast.error("Minimum deposit is ₦100");
      return;
    }
    deposit.mutate({ amount, method });
  };

  const instructionText = (instructions?.[method] ?? "").trim() || FALLBACK_INSTRUCTIONS[method];

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <div className="col-span-full">
        <VerificationBadgeStrip />
      </div>
      {stats && setTab && (
        <div className="col-span-full">
          <WalletSummary stats={stats} setTab={setTab} />
        </div>
      )}
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
                  min={100}
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  placeholder="1,000"
                  className="pl-8 h-12 font-bold text-lg"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Minimum ₦100</p>
            </div>

            <div>
              <Label>Payment Method</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {methods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`p-3.5 rounded-xl border-2 text-left transition ${
                      method === m.id
                        ? "border-[#1e3a5f] bg-[#1e3a5f]/[0.04]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <m.icon className={`w-5 h-5 mb-2 ${method === m.id ? "text-[#1e3a5f]" : "text-gray-400"}`} />
                    <p className="text-xs font-semibold text-[#1e3a5f]">{m.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{m.note}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2.5 bg-[#1e3a5f]/[0.04] border border-[#1e3a5f]/15 rounded-xl p-4">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#1e3a5f]" />
              <div className="text-xs text-gray-700 whitespace-pre-line leading-relaxed">
                <p className="font-semibold text-[#1e3a5f] mb-1">
                  How to pay via {methods.find((m) => m.id === method)!.label}
                </p>
                {instructionText}
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
              Your deposit appears in your wallet history immediately as pending and is
              credited once approved by our compliance team.
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
                      <span className="text-xs text-gray-400 font-normal ml-2">
                        via {PAYMENT_METHOD_LABELS[d.method] ?? d.method}
                      </span>
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
