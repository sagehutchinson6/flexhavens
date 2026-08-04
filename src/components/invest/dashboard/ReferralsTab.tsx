import { useState } from "react";
import { Users, Copy, Check, Gift, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { formatCurrency, formatDate } from "@/hooks/use-investor";
import { StatCard, SectionCard, StatusBadge, EmptyState } from "./shared";

export default function ReferralsTab() {
  const { data } = trpc.investor.referrals.useQuery(undefined, { retry: false, refetchInterval: 20_000 });
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  const referralCode = data?.referralCode ?? "";
  const referralLink = `${window.location.origin}/invest/register?ref=${referralCode}`;

  const copy = (text: string, which: "code" | "link") => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(which);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const credited = (data?.referrals ?? []).filter((r: any) => r.status === "credited").length;

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard icon={Users} label="Total Referrals" value={String(data?.referrals?.length ?? 0)} sub="People who joined with your code" />
        <StatCard icon={Gift} label="Referral Earnings" value={formatCurrency(data?.referralEarnings ?? 0)} sub="Credited to your wallet" accent />
        <StatCard icon={Check} label="Bonuses Paid" value={String(credited)} sub="5% of each first deposit" />
      </div>

      <SectionCard
        title="Your Referral Code"
        subtitle="Earn 5% of the first deposit of every investor you refer"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-[#faf8f5] rounded-xl p-5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-gray-500 mb-1">Referral Code</p>
              <p className="text-2xl font-bold font-serif text-[#1e3a5f] tracking-wider">{referralCode}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copy(referralCode, "code")}
              className="border-[#1e3a5f] text-[#1e3a5f] shrink-0"
            >
              {copied === "code" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <div className="bg-[#faf8f5] rounded-xl p-5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-gray-500 mb-1">Referral Link</p>
              <p className="text-sm font-medium text-[#1e3a5f] truncate">{referralLink}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copy(referralLink, "link")}
              className="border-[#c8956c] text-[#b07d52] shrink-0"
            >
              {copied === "link" ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-4">
          Bonuses are credited automatically when your referral's first deposit is approved.
        </p>
      </SectionCard>

      <SectionCard title="Referral History" subtitle={`${data?.referrals?.length ?? 0} referrals`}>
        {data?.referrals && data.referrals.length > 0 ? (
          <div className="divide-y">
            {data.referrals.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white font-bold shrink-0">
                    {r.referredName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1e3a5f]">{r.referredName}</p>
                    <p className="text-xs text-gray-400">Joined {formatDate(r.createdAt)}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold ${Number(r.bonusAmount) > 0 ? "text-green-600" : "text-gray-400"}`}>
                    {Number(r.bonusAmount) > 0 ? `+${formatCurrency(r.bonusAmount)}` : "Pending"}
                  </p>
                  <StatusBadge status={r.status} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="No referrals yet"
            text="Share your code with friends — you'll earn 5% of their first deposit."
          />
        )}
      </SectionCard>
    </div>
  );
}
