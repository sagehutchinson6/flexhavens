import { z } from "zod";
import { fmtMoney } from "./lib/format";
import { assertTierAllows } from "./lib/kyc";
import { generatePdfDocument } from "./lib/documents";
import { captureLead, leadEvent } from "./lib/crm";
import { sendSystemMessage } from "./lib/messaging";
import { TRPCError } from "@trpc/server";
import { eq, desc, or, and, sql, inArray } from "drizzle-orm";
import { createRouter, publicQuery, investorQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  investmentPlans,
  investmentProjects,
  investments,
  deposits,
  withdrawals,
  investmentTransactions,
  referrals,
  investorNotifications,
  investorActivityLogs,
  investorTokens,
  liquidationRequests,
  accountDeletionFeedback,
  customers,
  orders,
  orderItems,
  orderDocuments,
  trackingHistory,
} from "@db/schema";
import { computeLiquidationEstimate } from "./lib/liquidation";
import { sanitizeInvestor, clearInvestorCookie } from "./investor-auth-router";
import { logInvestorActivity, notifyAdmin, logAudit } from "./lib/activity";
import { sendAccountDeletedEmail } from "./lib/email";
import { monthlyProfitFor } from "./lib/roi";
import { debitWallet } from "./lib/wallet";
import { profitPayments, investors as investorTableForUpdate } from "@db/schema";

function generateReference(prefix: string) {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${rand}`;
}

// Recompute derived investment values (value, earnings, ROI, progress) from elapsed time
export function computeInvestmentState(inv: {
  amount: string;
  startDate: Date;
  maturityDate: Date;
  status: string;
}) {
  const principal = Number(inv.amount);
  const start = new Date(inv.startDate).getTime();
  const maturity = new Date(inv.maturityDate).getTime();
  const total = Math.max(maturity - start, 1);
  const now = Date.now();
  const elapsed = Math.min(Math.max(now - start, 0), total);
  const progress = Math.round((elapsed / total) * 100);
  return { principal, progress, matured: now >= maturity };
}

export const investorRouter = createRouter({
  // ── Public: active plans for the landing page ─────────────────
  plans: publicQuery.query(async () => {
    const db = getDb();
    const rows = await db
      .select()
      .from(investmentPlans)
      .where(eq(investmentPlans.isActive, "yes"))
      .orderBy(investmentPlans.sortOrder);
    return rows;
  }),

  // ── Public: open/funding projects ─────────────────────────────
  projects: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(investmentProjects)
      .where(or(eq(investmentProjects.status, "open"), eq(investmentProjects.status, "funding")))
      .orderBy(desc(investmentProjects.createdAt));
  }),

  // ── Dashboard aggregate ───────────────────────────────────────
  dashboard: investorQuery.query(async ({ ctx }) => {
    const db = getDb();
    const investorId = ctx.investor.id;

    const myInvestments = await db
      .select()
      .from(investments)
      .where(eq(investments.investorId, investorId))
      .orderBy(desc(investments.createdAt));

    const plans = await db.select().from(investmentPlans);
    const planMap = new Map(plans.map((p) => [p.id, p]));

    // Compute live values + monthly ROI fields for each investment
    const pendingLiquidations = await db
      .select({ investmentId: liquidationRequests.investmentId })
      .from(liquidationRequests)
      .where(and(eq(liquidationRequests.investorId, investorId), eq(liquidationRequests.status, "pending")));
    const pendingLiquidationIds = new Set(pendingLiquidations.map((r) => r.investmentId));

    const portfolio = myInvestments.map((inv) => {
      const plan = planMap.get(inv.planId);
      const returnRate = inv.customReturnRate ?? plan?.targetReturn ?? Number(inv.roi);
      const durationMonths = plan?.durationMonths ?? 0;
      const { principal, progress, matured } = computeInvestmentState(inv);
      const { monthlyProfit, monthlyRate } = monthlyProfitFor(principal, returnRate, durationMonths || 1);
      const projectedEarnings = (principal * returnRate) / 100;
      const totalProfitPaid = Number(inv.totalProfitPaid);
      const currentValue =
        inv.status === "active" || inv.status === "suspended"
          ? principal + totalProfitPaid
          : Number(inv.currentValue);
      const remainingDays = Math.max(
        0,
        Math.ceil((new Date(inv.maturityDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      );
      return {
        ...inv,
        planName: plan?.name ?? "Plan",
        targetReturn: returnRate,
        durationMonths,
        progress: inv.status === "active" ? progress : inv.progress,
        computedCurrentValue: currentValue,
        computedEstimatedEarnings: inv.status === "active" || inv.status === "suspended" ? totalProfitPaid : Number(inv.estimatedEarnings),
        projectedEarnings,
        computedRoi: principal > 0 ? ((totalProfitPaid / principal) * 100) : 0,
        monthlyProfit,
        monthlyRate,
        remainingDays,
        matured,
        pendingLiquidation: pendingLiquidationIds.has(inv.id),
      };
    });

    const activeInvestments = portfolio.filter((i) => i.status === "active" || i.status === "suspended");
    const portfolioValue = activeInvestments.reduce((s, i) => s + i.computedCurrentValue, 0);
    const totalInvested = myInvestments
      .filter((i) => i.status !== "cancelled")
      .reduce((s, i) => s + Number(i.amount), 0);
    const estimatedEarnings = activeInvestments.reduce((s, i) => s + i.computedEstimatedEarnings, 0);
    const totalMonthlyProfitEarned = portfolio.reduce((s, i) => s + Number(i.totalProfitPaid), 0);
    const monthlyIncome = portfolio
      .filter((i) => i.status === "active" && i.profitPaused === "no")
      .reduce((s, i) => s + i.monthlyProfit, 0);

    const unreadNotifications = await db
      .select({ count: sql<number>`count(*)` })
      .from(investorNotifications)
      .where(
        and(
          or(eq(investorNotifications.investorId, investorId), sql`${investorNotifications.investorId} IS NULL`),
          eq(investorNotifications.isRead, "no"),
        ),
      );

    const pendingDeposits = await db
      .select({ count: sql<number>`count(*)`, total: sql<string>`coalesce(sum(${deposits.amount}), 0)` })
      .from(deposits)
      .where(and(eq(deposits.investorId, investorId), eq(deposits.status, "pending")));
    const pendingWithdrawals = await db
      .select({ count: sql<number>`count(*)`, total: sql<string>`coalesce(sum(${withdrawals.amount}), 0)` })
      .from(withdrawals)
      .where(and(eq(withdrawals.investorId, investorId), eq(withdrawals.status, "pending")));

    return {
      investor: sanitizeInvestor(ctx.investor),
      stats: {
        portfolioValue,
        totalInvested,
        estimatedEarnings,
        activeInvestments: activeInvestments.length,
        walletBalance: Number(ctx.investor.walletBalance),
        totalEarnings: Number(ctx.investor.totalEarnings),
        referralEarnings: Number(ctx.investor.referralEarnings),
        unreadNotifications: Number(unreadNotifications[0]?.count ?? 0),
        totalMonthlyProfitEarned,
        monthlyIncome,
        pendingInvestments: portfolio.filter((i) => i.status === "pending").length,
        availableWithdrawalBalance: Number(ctx.investor.walletBalance),
        totalDeposited: Number(ctx.investor.totalDeposited),
        totalWithdrawn: Number(ctx.investor.totalWithdrawn),
        withdrawalCount: Number(ctx.investor.withdrawalCount ?? 0),
        walletFrozen: ctx.investor.walletFrozen === "yes",
        pendingDepositsCount: Number(pendingDeposits[0]?.count ?? 0),
        pendingDepositsAmount: Number(pendingDeposits[0]?.total ?? 0),
        pendingWithdrawalsCount: Number(pendingWithdrawals[0]?.count ?? 0),
        pendingWithdrawalsAmount: Number(pendingWithdrawals[0]?.total ?? 0),
        nextPaymentDate: (() => {
          const dates = portfolio
            .filter((i) => i.status === "active" && i.profitPaused === "no" && i.nextProfitAt)
            .map((i) => new Date(i.nextProfitAt!).getTime());
          return dates.length ? new Date(Math.min(...dates)).toISOString() : null;
        })(),
      },
      portfolio,
    };
  }),

  // ── Portfolio (investments + plan info) ───────────────────────
  portfolio: investorQuery.query(async ({ ctx }) => {
    const db = getDb();
    const rows = await db
      .select()
      .from(investments)
      .where(eq(investments.investorId, ctx.investor.id))
      .orderBy(desc(investments.createdAt));
    const plans = await db.select().from(investmentPlans);
    const planMap = new Map(plans.map((p) => [p.id, p]));
    return rows.map((inv) => {
      const plan = planMap.get(inv.planId);
      const returnRate = inv.customReturnRate ?? plan?.targetReturn ?? Number(inv.roi);
      const durationMonths = plan?.durationMonths ?? 0;
      const { principal, progress, matured } = computeInvestmentState(inv);
      const { monthlyProfit, monthlyRate } = monthlyProfitFor(principal, returnRate, durationMonths || 1);
      const totalProfitPaid = Number(inv.totalProfitPaid);
      const projectedEarnings = (principal * returnRate) / 100;
      const remainingDays = Math.max(
        0,
        Math.ceil((new Date(inv.maturityDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      );
      return {
        ...inv,
        planName: plan?.name ?? "Plan",
        durationMonths,
        targetReturn: returnRate,
        progress: inv.status === "active" ? progress : inv.progress,
        computedCurrentValue: inv.status === "active" || inv.status === "suspended" ? principal + totalProfitPaid : Number(inv.currentValue),
        computedEstimatedEarnings: inv.status === "active" || inv.status === "suspended" ? totalProfitPaid : Number(inv.estimatedEarnings),
        projectedEarnings,
        monthlyProfit,
        monthlyRate,
        remainingDays,
        matured,
      };
    });
  }),

  // ── Monthly profit payment history ────────────────────────────
  profits: investorQuery.query(async ({ ctx }) => {
    const db = getDb();
    const rows = await db
      .select()
      .from(profitPayments)
      .where(eq(profitPayments.investorId, ctx.investor.id))
      .orderBy(desc(profitPayments.paidAt))
      .limit(300);
    const myInvestments = await db
      .select()
      .from(investments)
      .where(eq(investments.investorId, ctx.investor.id));
    const invMap = new Map(myInvestments.map((i) => [i.id, i]));
    return rows.map((p) => ({
      ...p,
      projectName: invMap.get(p.investmentId)?.projectName ?? "Investment",
    }));
  }),

  // ── Investment liquidation (early exit) ───────────────────────
  liquidationEstimate: investorQuery
    .input(z.object({ investmentId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(investments)
        .where(and(eq(investments.id, input.investmentId), eq(investments.investorId, ctx.investor.id)))
        .limit(1);
      const inv = rows.at(0);
      if (!inv) throw new TRPCError({ code: "NOT_FOUND", message: "Investment not found" });
      if (inv.status !== "active") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Only active investments can be liquidated" });
      }
      const plans = await db.select().from(investmentPlans).where(eq(investmentPlans.id, inv.planId)).limit(1);
      const plan = plans.at(0);
      if (!plan) throw new TRPCError({ code: "NOT_FOUND", message: "Plan not found" });

      const pending = await db
        .select({ id: liquidationRequests.id })
        .from(liquidationRequests)
        .where(and(eq(liquidationRequests.investmentId, inv.id), eq(liquidationRequests.status, "pending")))
        .limit(1);

      return {
        investmentId: inv.id,
        projectName: inv.projectName,
        planName: plan.name,
        startDate: inv.startDate,
        maturityDate: inv.maturityDate,
        alreadyPending: pending.length > 0,
        ...computeLiquidationEstimate(inv, plan),
      };
    }),

  requestLiquidation: investorQuery
    .input(z.object({ investmentId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      return db.transaction(async (tx) => {
        const rows = await tx
          .select()
          .from(investments)
          .where(and(eq(investments.id, input.investmentId), eq(investments.investorId, ctx.investor.id)))
          .limit(1);
        const inv = rows.at(0);
        if (!inv) throw new TRPCError({ code: "NOT_FOUND", message: "Investment not found" });
        if (inv.status !== "active") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Only active investments can be liquidated" });
        }

        // No duplicate pending requests
        const pending = await tx
          .select({ id: liquidationRequests.id })
          .from(liquidationRequests)
          .where(and(eq(liquidationRequests.investmentId, inv.id), eq(liquidationRequests.status, "pending")))
          .limit(1);
        if (pending.length > 0) {
          throw new TRPCError({ code: "CONFLICT", message: "A liquidation request for this investment is already pending review" });
        }

        const plans = await tx.select().from(investmentPlans).where(eq(investmentPlans.id, inv.planId)).limit(1);
        const plan = plans.at(0);
        if (!plan) throw new TRPCError({ code: "NOT_FOUND", message: "Plan not found" });

        const est = computeLiquidationEstimate(inv, plan);

        const [req] = await tx
          .insert(liquidationRequests)
          .values({
            investmentId: inv.id,
            investorId: ctx.investor.id,
            principalAmount: est.principal.toFixed(2),
            profitEarned: est.profitEarned.toFixed(2),
            penaltyPercent: est.penaltyPercent,
            penaltyAmount: est.penaltyAmount.toFixed(2),
            accruedProfit: est.accruedProfit.toFixed(2),
            estimatedValue: est.estimatedValue.toFixed(2),
            status: "pending",
          })
          .$returningId();

        // Freeze ROI while the request is under review
        await tx
          .update(investments)
          .set({ profitPaused: "yes" })
          .where(eq(investments.id, inv.id));

        await tx.insert(investorNotifications).values({
          investorId: ctx.investor.id,
          title: "Liquidation Request Submitted",
          message: `Your liquidation request for ${inv.projectName} (estimated payout ${fmtMoney(est.estimatedValue)}) has been submitted for review.`,
          type: "info",
        });
        await notifyAdmin(
          "Liquidation Request Submitted",
          `${ctx.investor.name} requested liquidation of investment #${inv.id} (${inv.projectName}) — estimated payout ${fmtMoney(est.estimatedValue)}.`,
          "investment",
          tx,
        );
        await logInvestorActivity(
          ctx.investor.id,
          "liquidation_requested",
          `Investment #${inv.id} (${inv.projectName}), estimated ${fmtMoney(est.estimatedValue)}`,
          ctx.req.headers,
          tx,
        );

        return { success: true, requestId: req.id, estimatedValue: est.estimatedValue };
      });
    }),

  liquidations: investorQuery.query(async ({ ctx }) => {
    const db = getDb();
    const rows = await db
      .select()
      .from(liquidationRequests)
      .where(eq(liquidationRequests.investorId, ctx.investor.id))
      .orderBy(desc(liquidationRequests.requestedAt))
      .limit(100);
    const myInvestments = await db
      .select()
      .from(investments)
      .where(eq(investments.investorId, ctx.investor.id));
    const invMap = new Map(myInvestments.map((i) => [i.id, i]));
    return rows.map((r) => ({
      ...r,
      projectName: invMap.get(r.investmentId)?.projectName ?? "Investment",
    }));
  }),

  // ── Start a new investment from wallet balance ────────────────
  invest: investorQuery
    .input(
      z.object({
        planId: z.number(),
        amount: z.number().positive(),
        projectId: z.number().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const investorId = ctx.investor.id;

      if (ctx.investor.walletFrozen === "yes") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Your wallet is currently frozen. Please contact support." });
      }

      assertTierAllows(ctx.investor, "investment", input.amount);

      const planRows = await db
        .select()
        .from(investmentPlans)
        .where(and(eq(investmentPlans.id, input.planId), eq(investmentPlans.isActive, "yes")))
        .limit(1);
      const plan = planRows.at(0);
      if (!plan) throw new TRPCError({ code: "NOT_FOUND", message: "Investment plan not found" });

      const minAmount = Number(plan.minAmount);
      if (input.amount < minAmount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Minimum investment for the ${plan.name} plan is ${fmtMoney(minAmount)}`,
        });
      }

      let projectName = `${plan.name} Plan Portfolio`;
      if (input.projectId) {
        const projectRows = await db
          .select()
          .from(investmentProjects)
          .where(eq(investmentProjects.id, input.projectId))
          .limit(1);
        if (projectRows.length) projectName = projectRows[0].name;
      }

      const maturityDate = new Date();
      maturityDate.setMonth(maturityDate.getMonth() + plan.durationMonths);

      const reference = generateReference("INV");
      const result = await db.transaction(async (tx) => {
        // Debit the wallet atomically (insufficient funds / frozen → clean error)
        await debitWallet(tx, {
          investorId,
          amount: input.amount,
          type: "investment",
          description: `Invested in ${plan.name} plan — ${projectName}`,
          reference,
          skipLedger: true, // ledger row inserted below with full detail
        });

        const [row] = await tx
          .insert(investments)
          .values({
            investorId,
            planId: plan.id,
            projectId: input.projectId ?? null,
            projectName,
            amount: input.amount.toFixed(2),
            currentValue: input.amount.toFixed(2),
            estimatedEarnings: "0.00",
            roi: "0.00",
            status: "pending", // activates after admin approval
            progress: 0,
            maturityDate,
          })
          .$returningId();

        await tx.insert(investmentTransactions).values({
          investorId,
          type: "investment",
          direction: "debit",
          amount: input.amount.toFixed(2),
          description: `Invested in ${plan.name} plan — ${projectName}`,
          reference,
          status: "completed",
        });

        await tx.insert(investorNotifications).values({
          investorId,
          title: "Investment Submitted",
          message: `Your ${fmtMoney(input.amount)} investment in the ${plan.name} plan has been submitted and will be activated after review. Estimated maturity: ${maturityDate.toDateString()}.`,
          type: "info",
        });

        await notifyAdmin(
          "New Investment Created",
          `${ctx.investor.name} invested ${fmtMoney(input.amount)} in the ${plan.name} plan (${projectName}). Pending approval.`,
          "investment",
          tx,
        );
        await logInvestorActivity(
          ctx.investor.id,
          "investment_created",
          `${fmtMoney(input.amount)} into ${plan.name} plan (${projectName})`,
          ctx.req.headers,
          tx,
        );

        return { success: true, investmentId: row.id };
      });
      // CRM: capture the investor as a lead and log the conversion event
      void (async () => {
        await captureLead({
          name: ctx.investor.name,
          email: ctx.investor.email,
          phone: ctx.investor.phone,
          country: ctx.investor.country,
          source: "investment_inquiry",
          investmentInterest: plan.name,
          notify: false,
        });
        await leadEvent({
          email: ctx.investor.email,
          type: "investment_started",
          description: `Investment started: ${fmtMoney(input.amount)} in the ${plan.name} plan (${projectName})`,
          stage: "investment_processing",
          notes: `Reference: ${reference}`,
        });
        await sendSystemMessage(ctx.investor.id, {
          subject: "Investment Created",
          category: "investment_support",
          body: `Your investment of ${fmtMoney(input.amount)} in the ${plan.name} plan (${projectName}) has been created successfully. Reference: ${reference}. Monthly profits are credited to your wallet automatically.`,
          propertyName: projectName,
        });
        await logAudit(null, ctx.investor.name, "investment_created", `Investment created: ${fmtMoney(input.amount)} in ${plan.name} (${projectName}) by ${ctx.investor.name} (${ctx.investor.email}) — Ref ${reference}`, ctx.req.headers);
      })();
      void generatePdfDocument({
        investorId: ctx.investor.id,
        ownerEmail: ctx.investor.email,
        ownerName: ctx.investor.name,
        category: "investment",
        docType: "Investment Agreement",
        name: `Investment Agreement — ${plan.name} Plan (${reference})`,
        amount: input.amount,
        reference,
        links: { investmentId: result.investmentId },
        lines: [
          { label: "Investment Plan", value: plan.name },
          { label: "Project", value: projectName },
          { label: "Amount Invested", value: fmtMoney(input.amount) },
          { label: "Expected ROI", value: `Up to ${plan.targetReturn}% monthly` },
          { label: "Duration", value: `${plan.durationMonths} months` },
          { label: "Maturity Date", value: maturityDate.toDateString() },
          { label: "Status", value: "Pending Activation" },
        ],
        note: "This agreement confirms your investment with FlexHavens Real Estate Development Ltd. under the terms of the selected plan.",
      });
      void generatePdfDocument({
        investorId: ctx.investor.id,
        ownerEmail: ctx.investor.email,
        ownerName: ctx.investor.name,
        category: "financial",
        docType: "Investment Receipt",
        amount: input.amount,
        reference,
        links: { investmentId: result.investmentId },
        lines: [
          { label: "Transaction Type", value: "Investment (Wallet Debit)" },
          { label: "Investment Plan", value: plan.name },
          { label: "Project", value: projectName },
          { label: "Reference", value: reference },
          { label: "Status", value: "Submitted — Pending Activation" },
        ],
        note: "Your investment amount has been debited from your FlexHavens wallet and allocated to the selected plan.",
      });
      return result;
    }),

  // ── Deposits ──────────────────────────────────────────────────
  deposit: investorQuery
    .input(
      z.object({
        amount: z.number().positive(),
        method: z.enum(["bank", "paypal", "crypto", "card"]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      if (input.amount < 100) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `Minimum deposit is ${fmtMoney(100)}` });
      }
      assertTierAllows(ctx.investor, "deposit", input.amount);
      const reference = generateReference("DEP");
      const [row] = await db
        .insert(deposits)
        .values({
          investorId: ctx.investor.id,
          amount: input.amount.toFixed(2),
          method: input.method,
          reference,
          status: "pending",
        })
        .$returningId();

      await db.insert(investmentTransactions).values({
        investorId: ctx.investor.id,
        type: "deposit",
        direction: "credit",
        amount: input.amount.toFixed(2),
        description: `Deposit via ${input.method} (pending approval)`,
        reference,
        status: "pending",
      });

      return { success: true, depositId: row.id, reference };
    }),

  deposits: investorQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(deposits)
      .where(eq(deposits.investorId, ctx.investor.id))
      .orderBy(desc(deposits.createdAt));
  }),

  // ── Withdrawals ───────────────────────────────────────────────
  withdraw: investorQuery
    .input(
      z.object({
        amount: z.number().positive(),
        method: z.enum(["bank", "paypal", "crypto"]),
        destination: z.string().min(4).max(500),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      if (input.amount < 50) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Minimum withdrawal is $50" });
      }
      if (ctx.investor.walletFrozen === "yes") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Your wallet is currently frozen. Please contact support." });
      }
      if (ctx.investor.kycStatus !== "verified" && input.amount > 5000) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Account verification is required for withdrawals above ₦5,000",
        });
      }

      const reference = generateReference("WDR");
      return db.transaction(async (tx) => {
        // Hold funds atomically — fails cleanly on insufficient balance or frozen wallet
        await debitWallet(tx, {
          investorId: ctx.investor.id,
          amount: input.amount,
          type: "withdrawal",
          description: `Withdrawal via ${input.method} (pending approval)`,
          reference,
          skipLedger: true, // pending ledger row inserted below
        });

        const [row] = await tx
          .insert(withdrawals)
          .values({
            investorId: ctx.investor.id,
            amount: input.amount.toFixed(2),
            method: input.method,
            destination: input.destination,
            reference,
            status: "pending",
          })
          .$returningId();

        await tx.insert(investmentTransactions).values({
          investorId: ctx.investor.id,
          type: "withdrawal",
          direction: "debit",
          amount: input.amount.toFixed(2),
          description: `Withdrawal via ${input.method} (pending approval)`,
          reference,
          status: "pending",
        });

        await notifyAdmin(
          "Withdrawal Request Submitted",
          `${ctx.investor.name} requested a withdrawal of ${fmtMoney(input.amount)} via ${input.method}.`,
          "withdrawal",
          tx,
        );
        await logInvestorActivity(
          ctx.investor.id,
          "withdrawal_requested",
          `${fmtMoney(input.amount)} via ${input.method} (${reference})`,
          ctx.req.headers,
          tx,
        );

        return { success: true, withdrawalId: row.id, reference };
      });
    }),

  withdrawals: investorQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.investorId, ctx.investor.id))
      .orderBy(desc(withdrawals.createdAt));
  }),

  // ── Transactions ──────────────────────────────────────────────
  transactions: investorQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(investmentTransactions)
      .where(eq(investmentTransactions.investorId, ctx.investor.id))
      .orderBy(desc(investmentTransactions.createdAt))
      .limit(200);
  }),

  // ── Referrals ─────────────────────────────────────────────────
  referrals: investorQuery.query(async ({ ctx }) => {
    const db = getDb();
    const rows = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, ctx.investor.id))
      .orderBy(desc(referrals.createdAt));
    return {
      referralCode: ctx.investor.referralCode,
      referralEarnings: Number(ctx.investor.referralEarnings),
      referrals: rows,
    };
  }),

  // ── Notifications ─────────────────────────────────────────────
  notifications: investorQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(investorNotifications)
      .where(
        or(
          eq(investorNotifications.investorId, ctx.investor.id),
          sql`${investorNotifications.investorId} IS NULL`,
        ),
      )
      .orderBy(desc(investorNotifications.createdAt))
      .limit(100);
  }),

  markNotificationRead: investorQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db
        .update(investorNotifications)
        .set({ isRead: "yes" })
        .where(
          and(
            eq(investorNotifications.id, input.id),
            eq(investorNotifications.investorId, ctx.investor.id),
          ),
        );
      return { success: true };
    }),

  markAllNotificationsRead: investorQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    await db
      .update(investorNotifications)
      .set({ isRead: "yes" })
      .where(eq(investorNotifications.investorId, ctx.investor.id));
    return { success: true };
  }),

  // ── My Property Purchases (outright orders placed with the account email) ──
  myPurchases: investorQuery.query(async ({ ctx }) => {
    const db = getDb();
    const cust = await db.select().from(customers).where(eq(customers.email, ctx.investor.email));
    if (!cust.length) return [];
    const ordersList = await db
      .select()
      .from(orders)
      .where(eq(orders.customerId, cust[0].id))
      .orderBy(desc(orders.createdAt))
      .limit(100);
    if (!ordersList.length) return [];
    const ids = ordersList.map((o) => o.id);
    const items = await db.select().from(orderItems).where(inArray(orderItems.orderId, ids));
    const docs = await db.select().from(orderDocuments).where(inArray(orderDocuments.orderId, ids));
    const history = await db
      .select()
      .from(trackingHistory)
      .where(inArray(trackingHistory.orderId, ids))
      .orderBy(trackingHistory.createdAt);
    return ordersList.map((o) => ({
      ...o,
      items: items.filter((i) => i.orderId === o.id),
      documents: docs.filter((d) => d.orderId === o.id),
      history: history.filter((h) => h.orderId === o.id),
    }));
  }),

  // ── Statement data (for download) ─────────────────────────────
  statement: investorQuery.query(async ({ ctx }) => {
    const db = getDb();
    const investorId = ctx.investor.id;
    const txs = await db
      .select()
      .from(investmentTransactions)
      .where(eq(investmentTransactions.investorId, investorId))
      .orderBy(desc(investmentTransactions.createdAt))
      .limit(500);
    const myInvestments = await db
      .select()
      .from(investments)
      .where(eq(investments.investorId, investorId))
      .orderBy(desc(investments.createdAt));
    return {
      investor: sanitizeInvestor(ctx.investor),
      generatedAt: new Date(),
      transactions: txs,
      investments: myInvestments,
    };
  }),

  // ── Account deletion ──────────────────────────────────────────
  deletionEligibility: investorQuery.query(async ({ ctx }) => {
    const db = getDb();
    const myInvestments = await db.select().from(investments).where(eq(investments.investorId, ctx.investor.id));
    const myWithdrawals = await db.select().from(withdrawals).where(eq(withdrawals.investorId, ctx.investor.id));
    const myDeposits = await db.select().from(deposits).where(eq(deposits.investorId, ctx.investor.id));
    const myLiquidations = await db.select().from(liquidationRequests).where(eq(liquidationRequests.investorId, ctx.investor.id));

    const checks = {
      activeInvestments: myInvestments.filter((i) => i.status === "active" || i.status === "suspended").length,
      pendingInvestments: myInvestments.filter((i) => i.status === "pending").length,
      pendingWithdrawals: myWithdrawals.filter((w) => w.status === "pending").length,
      pendingDeposits: myDeposits.filter((d) => d.status === "pending").length,
      pendingLiquidations: myLiquidations.filter((l) => l.status === "pending").length,
      walletBalance: Number(ctx.investor.walletBalance),
    };
    const eligible =
      checks.activeInvestments === 0 &&
      checks.pendingInvestments === 0 &&
      checks.pendingWithdrawals === 0 &&
      checks.pendingDeposits === 0 &&
      checks.pendingLiquidations === 0 &&
      checks.walletBalance <= 0;
    return { eligible, checks };
  }),

  deleteAccount: investorQuery
    .input(
      z.object({
        reason: z.string().min(3).max(150),
        comment: z.string().max(2000).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const investor = ctx.investor;
      const originalEmail = investor.email;
      const originalName = investor.name;

      await db.transaction(async (tx) => {
        // Re-verify every condition inside the transaction
        const myInvestments = await tx.select().from(investments).where(eq(investments.investorId, investor.id));
        const blocking = myInvestments.filter((i) => ["active", "suspended", "pending"].includes(i.status));
        if (blocking.length > 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "You still have active or pending investments. Liquidate them first." });
        }
        const myWithdrawals = await tx.select().from(withdrawals).where(eq(withdrawals.investorId, investor.id));
        if (myWithdrawals.some((w) => w.status === "pending")) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "You have a pending withdrawal request." });
        }
        const myDeposits = await tx.select().from(deposits).where(eq(deposits.investorId, investor.id));
        if (myDeposits.some((d) => d.status === "pending")) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "You have a pending deposit request." });
        }
        const myLiquidations = await tx.select().from(liquidationRequests).where(eq(liquidationRequests.investorId, investor.id));
        if (myLiquidations.some((l) => l.status === "pending")) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "You have a pending liquidation request." });
        }
        if (Number(investor.walletBalance) > 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Please withdraw your remaining wallet balance first." });
        }

        // Store feedback for the Primary Admin
        await tx.insert(accountDeletionFeedback).values({
          investorId: investor.id,
          name: originalName,
          email: originalEmail,
          reason: input.reason,
          comment: input.comment?.trim() || null,
        });

        // Anonymize the account — financial records are retained for accounting
        await tx
          .update(investorTableForUpdate)
          .set({
            name: `Deleted Investor #${investor.id}`,
            email: `deleted+${investor.id}@deleted.flexhavens.invalid`,
            passwordHash: "!deleted",
            phone: null,
            country: null,
            kycFullName: null,
            kycDocumentType: null,
            kycIdNumber: null,
            referralCode: `DEL${investor.id}`,
            status: "deleted",
            walletFrozen: "yes",
          })
          .where(eq(investorTableForUpdate.id, investor.id));

        // Revoke tokens and remove personal activity data
        await tx.delete(investorTokens).where(eq(investorTokens.investorId, investor.id));
        await tx.delete(investorNotifications).where(eq(investorNotifications.investorId, investor.id));
        await tx.delete(investorActivityLogs).where(eq(investorActivityLogs.investorId, investor.id));
      });

      clearInvestorCookie(ctx.resHeaders, ctx.req.headers);
      await logAudit(null, originalName, "investor_account_deleted", `Investor #${investor.id} (${originalEmail}) permanently deleted their account. Reason: ${input.reason}`, ctx.req.headers);
      await notifyAdmin(
        "Investor Account Deleted",
        `${originalName} (${originalEmail}) permanently deleted their account. Reason: ${input.reason}. Their feedback is available under Deletion Feedback.`,
        "system",
      );
      await sendAccountDeletedEmail({ to: originalEmail, name: originalName, reqHeaders: ctx.req.headers });
      return { success: true };
    }),
});