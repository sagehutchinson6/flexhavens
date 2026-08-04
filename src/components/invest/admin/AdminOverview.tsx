import {
  Users, DollarSign, TrendingUp, ArrowDownToLine, ArrowUpFromLine, UserCheck,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { trpc } from "@/providers/trpc";
import { formatCurrency } from "@/hooks/use-investor";
import { StatCard, SectionCard } from "../dashboard/shared";

export default function AdminOverview() {
  const { data: stats } = trpc.investAdmin.stats.useQuery(undefined, { retry: false, refetchInterval: 20_000 });
  const { data: analytics } = trpc.investAdmin.analytics.useQuery(undefined, { retry: false, refetchInterval: 20_000 });

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Investors" value={String(stats?.totalInvestors ?? 0)} sub={`${stats?.activeInvestors ?? 0} active · ${stats?.suspendedInvestors ?? 0} suspended`} />
        <StatCard icon={TrendingUp} label="Total Invested" value={formatCurrency(stats?.totalInvested ?? 0)} sub={`${stats?.activeInvestmentsCount ?? 0} active investments`} accent />
        <StatCard icon={ArrowDownToLine} label="Deposits" value={formatCurrency(stats?.totalDeposited ?? 0)} sub={`${stats?.pendingDepositsCount ?? 0} pending (${formatCurrency(stats?.pendingDepositsAmount ?? 0)})`} />
        <StatCard icon={ArrowUpFromLine} label="Withdrawals Paid" value={formatCurrency(stats?.totalWithdrawn ?? 0)} sub={`${stats?.pendingWithdrawalsCount ?? 0} pending (${formatCurrency(stats?.pendingWithdrawalsAmount ?? 0)})`} />
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="ROI Paid This Month" value={formatCurrency(stats?.monthlyProfitPaid ?? 0)} sub={`${formatCurrency(stats?.totalRoiPaid ?? 0)} all-time`} />
        <StatCard icon={UserCheck} label="Referral Bonuses" value={formatCurrency(stats?.totalReferralBonuses ?? 0)} sub={`${stats?.totalReferrals ?? 0} referrals total`} />
        <StatCard icon={Users} label="Pending KYC" value={String(stats?.pendingKyc ?? 0)} sub="Verifications awaiting review" />
        <StatCard icon={TrendingUp} label="Investments" value={`${stats?.activeInvestmentsCount ?? 0} active`} sub={`${stats?.pendingInvestmentsCount ?? 0} pending · ${stats?.completedInvestmentsCount ?? 0} completed · ${stats?.suspendedInvestmentsCount ?? 0} suspended`} />
      </div>

      <SectionCard title="Platform Analytics" subtitle="Last 6 months — deposits, withdrawals, investments">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics ?? []} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6b7280" }} />
              <YAxis
                tick={{ fontSize: 12, fill: "#6b7280" }}
                tickFormatter={(v) => `₦${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              />
              <Tooltip
                formatter={(value: any, name: any) => [formatCurrency(Number(value)), name]}
                contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="deposits" name="Deposits" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
              <Bar dataKey="investments" name="Investments" fill="#c8956c" radius={[4, 4, 0, 0]} />
              <Bar dataKey="withdrawals" name="Withdrawals" fill="#8aa5c0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>
    </div>
  );
}
