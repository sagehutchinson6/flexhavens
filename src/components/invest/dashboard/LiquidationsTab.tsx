import { CircleDollarSign } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { formatCurrency, formatDate } from "@/hooks/use-investor";
import { SectionCard, StatusBadge, EmptyState } from "./shared";

export default function LiquidationsTab() {
  const liquidationsQuery = trpc.investor.liquidations.useQuery(undefined, {
    retry: false,
    refetchInterval: 20_000,
  });
  const rows = liquidationsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <SectionCard
        title="Liquidation History"
        subtitle="Track your early-exit requests, reviews and payouts"
      >
        {liquidationsQuery.isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={CircleDollarSign}
            title="No liquidation requests yet"
            text="When you liquidate an active investment from your Portfolio, the request and its review status will appear here."
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b">
                    <th className="pb-3 pr-4 font-semibold">Request ID</th>
                    <th className="pb-3 pr-4 font-semibold">Investment</th>
                    <th className="pb-3 pr-4 font-semibold">Invested</th>
                    <th className="pb-3 pr-4 font-semibold">Profit Earned</th>
                    <th className="pb-3 pr-4 font-semibold">Est. Value</th>
                    <th className="pb-3 pr-4 font-semibold">Final Payout</th>
                    <th className="pb-3 pr-4 font-semibold">Requested</th>
                    <th className="pb-3 pr-4 font-semibold">Processed</th>
                    <th className="pb-3 pr-4 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Admin Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((r) => (
                    <tr key={r.id} className="hover:bg-[#faf8f5] transition">
                      <td className="py-4 pr-4 font-mono text-xs text-gray-500">
                        LIQ-{String(r.id).padStart(4, "0")}
                      </td>
                      <td className="py-4 pr-4 font-semibold text-[#1e3a5f]">{r.projectName}</td>
                      <td className="py-4 pr-4 font-medium">{formatCurrency(r.principalAmount)}</td>
                      <td className="py-4 pr-4 text-green-600 font-semibold">
                        +{formatCurrency(r.profitEarned)}
                      </td>
                      <td className="py-4 pr-4 text-gray-600">{formatCurrency(r.estimatedValue)}</td>
                      <td className="py-4 pr-4 font-bold text-[#c8956c]">
                        {r.finalAmount != null ? formatCurrency(r.finalAmount) : "—"}
                      </td>
                      <td className="py-4 pr-4 text-gray-600">{formatDate(r.requestedAt)}</td>
                      <td className="py-4 pr-4 text-gray-600">
                        {r.processedAt ? formatDate(r.processedAt) : "—"}
                      </td>
                      <td className="py-4 pr-4">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="py-4 text-xs text-gray-500 max-w-48">
                        <span className="line-clamp-2">{r.adminNote ?? "—"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden space-y-4">
              {rows.map((r) => (
                <div key={r.id} className="bg-[#faf8f5] rounded-xl p-5 border border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-[#1e3a5f]">{r.projectName}</p>
                      <p className="text-xs text-gray-500 font-mono">
                        LIQ-{String(r.id).padStart(4, "0")}
                      </p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-400">Invested</p>
                      <p className="font-semibold text-[#1e3a5f]">{formatCurrency(r.principalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Profit Earned</p>
                      <p className="font-semibold text-green-600">+{formatCurrency(r.profitEarned)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Est. Value</p>
                      <p className="font-semibold text-[#1e3a5f]">{formatCurrency(r.estimatedValue)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Final Payout</p>
                      <p className="font-bold text-[#c8956c]">
                        {r.finalAmount != null ? formatCurrency(r.finalAmount) : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Requested</p>
                      <p className="font-semibold text-[#1e3a5f]">{formatDate(r.requestedAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Processed</p>
                      <p className="font-semibold text-[#1e3a5f]">
                        {r.processedAt ? formatDate(r.processedAt) : "—"}
                      </p>
                    </div>
                  </div>
                  {r.adminNote && (
                    <div className="mt-3 bg-white border border-gray-200 rounded-lg px-3 py-2">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400">Admin note</p>
                      <p className="text-xs text-gray-600 mt-0.5">{r.adminNote}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </SectionCard>
    </div>
  );
}
