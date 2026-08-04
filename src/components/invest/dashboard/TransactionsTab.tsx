import { useState } from "react";
import { Receipt, TrendingUp, Wallet } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { formatCurrency, formatDate } from "@/hooks/use-investor";
import { SectionCard, StatusBadge, EmptyState } from "./shared";

const typeFilters = [
  { id: "all", label: "All" },
  { id: "deposit", label: "Deposits" },
  { id: "withdrawal", label: "Withdrawals" },
  { id: "investment", label: "Investments" },
  { id: "earning", label: "Earnings" },
  { id: "referral_bonus", label: "Referral Bonuses" },
];

export default function TransactionsTab() {
  const [filter, setFilter] = useState("all");
  const { data: transactions } = trpc.investor.transactions.useQuery(undefined, { retry: false, refetchInterval: 20_000 });

  const filtered = (transactions ?? []).filter((tx: any) => filter === "all" || tx.type === filter);

  return (
    <SectionCard
      title="Transaction History"
      subtitle={`${filtered.length} transactions`}
      action={
        <div className="flex flex-wrap gap-2">
          {typeFilters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                filter === f.id
                  ? "bg-[#1e3a5f] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      }
    >
      {filtered.length > 0 ? (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b">
                  <th className="pb-3 pr-4 font-semibold">Type</th>
                  <th className="pb-3 pr-4 font-semibold">Description</th>
                  <th className="pb-3 pr-4 font-semibold">Reference</th>
                  <th className="pb-3 pr-4 font-semibold">Date</th>
                  <th className="pb-3 pr-4 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-[#faf8f5] transition">
                    <td className="py-3.5 pr-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                          tx.direction === "credit"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {tx.direction === "credit" ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <Wallet className="w-3 h-3" />
                        )}
                        {tx.type.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-gray-600 max-w-xs truncate">{tx.description}</td>
                    <td className="py-3.5 pr-4 text-xs text-gray-400 font-mono">{tx.reference || "—"}</td>
                    <td className="py-3.5 pr-4 text-gray-600">{formatDate(tx.createdAt)}</td>
                    <td className="py-3.5 pr-4">
                      <StatusBadge status={tx.status} />
                    </td>
                    <td
                      className={`py-3.5 text-right font-bold ${
                        tx.direction === "credit" ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {tx.direction === "credit" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile list */}
          <div className="md:hidden divide-y">
            {filtered.map((tx: any) => (
              <div key={tx.id} className="py-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1e3a5f] capitalize">
                    {tx.type.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{tx.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(tx.createdAt)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className={`text-sm font-bold ${
                      tx.direction === "credit" ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {tx.direction === "credit" ? "+" : "-"}
                    {formatCurrency(tx.amount)}
                  </p>
                  <StatusBadge status={tx.status} />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          icon={Receipt}
          title="No transactions found"
          text="Try a different filter, or make your first deposit to get started."
        />
      )}
    </SectionCard>
  );
}
