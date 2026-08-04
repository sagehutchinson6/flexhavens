import { createContext, useContext, type ReactNode } from "react";
import { trpc } from "@/providers/trpc";
import type { Investor } from "@contracts/types";

export type InvestorMe = Omit<Investor, "passwordHash">;

interface InvestorContextType {
  investor: InvestorMe | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  refetch: () => void;
  logout: () => void;
}

const InvestorContext = createContext<InvestorContextType | null>(null);

export function InvestorProvider({ children }: { children: ReactNode }) {
  const meQuery = trpc.investorAuth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });

  const logoutMutation = trpc.investorAuth.logout.useMutation({
    onSettled: () => {
      meQuery.refetch();
    },
  });

  // After logout the refetch fails with 401 — react-query keeps the old data,
  // so auth state must consider the query status, not just cached data.
  const authed = !!meQuery.data && meQuery.status !== "error";

  const value: InvestorContextType = {
    investor: authed ? meQuery.data : undefined,
    isLoading: meQuery.isLoading,
    isAuthenticated: authed,
    isAdmin: authed && meQuery.data?.role === "admin",
    refetch: () => meQuery.refetch(),
    logout: () => logoutMutation.mutate(),
  };

  return <InvestorContext.Provider value={value}>{children}</InvestorContext.Provider>;
}

export function useInvestor() {
  const context = useContext(InvestorContext);
  if (!context) throw new Error("useInvestor must be used within InvestorProvider");
  return context;
}

// ── Nigerian localization ───────────────────────────────────────
// Platform default currency: Nigerian Naira (₦). Display-only — no
// conversion is applied to stored values.
export function formatCurrency(value: number | string) {
  const num = typeof value === "string" ? Number(value) : value;
  return `₦${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Whole-number variant for catalog prices and large amounts (₦2,500,000).
export function formatCurrencyWhole(value: number | string) {
  const num = typeof value === "string" ? Number(value) : value;
  return `₦${num.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

const LAGOS = "Africa/Lagos";

// Nigerian standard date: DD/MM/YYYY (Africa/Lagos · WAT, UTC+1)
export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-GB", { timeZone: LAGOS });
}

// DD/MM/YYYY hh:mm AM/PM in Africa/Lagos time
export function formatDateTime(date: Date | string) {
  const d = new Date(date);
  const day = d.toLocaleDateString("en-GB", { timeZone: LAGOS });
  const time = d.toLocaleTimeString("en-US", {
    timeZone: LAGOS,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${day} ${time}`;
}
