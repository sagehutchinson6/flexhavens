import { eq, and } from "drizzle-orm";
import { fmtMoney } from "./format";
import { getDb } from "../queries/connection";
import {
  investors,
  investmentPlans,
  investments,
  profitPayments,
  investorNotifications,
} from "@db/schema";
import { notifyAdmin, logAudit } from "./activity";
import { creditWallet, requireAffected } from "./wallet";
import { sendSystemMessage } from "./messaging";
import { generatePdfDocument } from "./documents";
import { runMortgageReminders } from "./mortgage";

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

// Monthly profit for an investment = principal × (returnRate / durationMonths) %
export function monthlyProfitFor(
  amount: number,
  returnRate: number,
  durationMonths: number,
): { monthlyProfit: number; monthlyRate: number } {
  const monthlyRate = returnRate / durationMonths;
  return { monthlyProfit: (amount * monthlyRate) / 100, monthlyRate };
}

let running = false;

/**
 * Monthly ROI settlement engine.
 * - Credits due monthly profits to investor wallets
 * - Records profit payments, transactions, notifications
 * - Returns principal when an investment reaches maturity
 * Schedule: month k falls due at startDate + (k-1) months, so month 1 pays
 * during the investment month itself. Safe to run repeatedly — the unique
 * (investmentId, monthNumber) index and profitsPaid guard make duplicates
 * impossible.
 */
export async function runMonthlySettlement(trigger: "scheduler" | "admin" = "scheduler", adminName = "system") {
  if (running) return { settled: 0, profitsPaid: 0, skipped: true };
  running = true;
  const db = getDb();
  const now = new Date();
  let profitsPaid = 0;
  let settled = 0;

  try {
    const active = await db
      .select()
      .from(investments)
      .where(and(eq(investments.status, "active"), eq(investments.profitPaused, "no")));
    const plans = await db.select().from(investmentPlans);
    const planMap = new Map(plans.map((p) => [p.id, p]));

    for (const inv of active) {
      const plan = planMap.get(inv.planId);
      if (!plan) continue;

      try {
        const outcome = await db.transaction(async (tx) => {
          // Re-read inside the transaction and guard against concurrent settlement
          const freshRows = await tx.select().from(investments).where(eq(investments.id, inv.id)).limit(1);
          const fresh = freshRows.at(0);
          if (!fresh || fresh.status !== "active" || fresh.profitPaused === "yes") return null;

          const investorRows = await tx.select().from(investors).where(eq(investors.id, fresh.investorId)).limit(1);
          const investor = investorRows.at(0);
          if (!investor) return null;

          const returnRate = fresh.customReturnRate ?? plan.targetReturn;
          const principal = Number(fresh.amount);
          const { monthlyProfit, monthlyRate } = monthlyProfitFor(principal, returnRate, plan.durationMonths);

          // Month k falls due at startDate + (k-1) months — month 1 is due
          // immediately on activation, so ROI starts in the investment month.
          let profitsCount = fresh.profitsPaid;
          let nextProfit = addMonths(new Date(fresh.startDate), profitsCount);
          let totalPaid = Number(fresh.totalProfitPaid);
          const startCount = profitsCount;
          let monthsCredited = 0;
          let creditedTotal = 0;

          // Credit every monthly profit that is due — atomically per month.
          // The unique (investmentId, monthNumber) index makes duplicates impossible.
          while (nextProfit <= now && profitsCount < plan.durationMonths) {
            profitsCount += 1;
            await tx.insert(profitPayments).values({
              investmentId: fresh.id,
              investorId: fresh.investorId,
              amount: monthlyProfit.toFixed(2),
              monthNumber: profitsCount,
              roiPercent: monthlyRate.toFixed(2),
              status: "paid",
            });
            await creditWallet(tx, {
              investorId: fresh.investorId,
              amount: monthlyProfit,
              type: "earning",
              description: `Monthly ROI profit (month ${profitsCount}/${plan.durationMonths}) — ${fresh.projectName}`,
              reference: `PROF-${fresh.id}-M${profitsCount}`,
              counters: { totalEarnings: true },
              skipFrozenCheck: true, // system credit
              notification: null, // one aggregated notification below
            });
            monthsCredited += 1;
            creditedTotal += monthlyProfit;
            totalPaid += monthlyProfit;
            nextProfit = addMonths(nextProfit, 1);
          }

          if (monthsCredited > 0) {
            await tx.insert(investorNotifications).values({
              investorId: fresh.investorId,
              title: "Monthly Profit Credited",
              message:
                monthsCredited === 1
                  ? `Month ${profitsCount} profit of ${fmtMoney(monthlyProfit)} from ${fresh.projectName} has been credited to your wallet.`
                  : `${monthsCredited} monthly profits totaling ${fmtMoney(creditedTotal)} from ${fresh.projectName} have been credited to your wallet.`,
              type: "success",
            });
          }

          // Maturity: return principal and close out
          const maturity = new Date(fresh.maturityDate);
          let maturedNow = false;
          if (now >= maturity) {
            // Only one settlement run can claim the active → matured transition
            const claim = await tx
              .update(investments)
              .set({
                status: "matured",
                progress: 100,
                profitsPaid: profitsCount,
                totalProfitPaid: totalPaid.toFixed(2),
                lastProfitAt: profitsCount > 0 ? now : fresh.lastProfitAt,
                nextProfitAt: null,
                currentValue: (principal + totalPaid).toFixed(2),
                estimatedEarnings: totalPaid.toFixed(2),
                roi: principal > 0 ? ((totalPaid / principal) * 100).toFixed(2) : "0.00",
              })
              .where(and(eq(investments.id, fresh.id), eq(investments.status, "active")));
            requireAffected(claim, "investment already settled");

            await creditWallet(tx, {
              investorId: fresh.investorId,
              amount: principal,
              type: "earning",
              description: `Investment principal returned at maturity — ${fresh.projectName}`,
              reference: `MAT-${fresh.id}`,
              skipFrozenCheck: true, // system credit
              notification: {
                title: "Investment Completed",
                message: `Your investment in ${fresh.projectName} has completed. Principal of ${fmtMoney(principal)} returned to your wallet. Total profit earned: ${fmtMoney(totalPaid)}.`,
                kind: "success",
              },
            });
            await notifyAdmin(
              "Investment Completed",
              `${investor.name}'s investment #${fresh.id} (${fresh.projectName}) matured. Principal ${fmtMoney(principal)} returned, total profit ${fmtMoney(totalPaid)} paid.`,
              "investment",
              tx,
            );
            maturedNow = true;
          } else if (monthsCredited > 0) {
            // Bookkeeping with optimistic concurrency on profitsPaid
            const total = Math.max(maturity.getTime() - new Date(fresh.startDate).getTime(), 1);
            const progress = Math.min(Math.round(((now.getTime() - new Date(fresh.startDate).getTime()) / total) * 100), 100);
            const upd = await tx
              .update(investments)
              .set({
                progress,
                profitsPaid: profitsCount,
                totalProfitPaid: totalPaid.toFixed(2),
                lastProfitAt: now,
                nextProfitAt: nextProfit,
                currentValue: (principal + totalPaid).toFixed(2),
                estimatedEarnings: totalPaid.toFixed(2),
                roi: principal > 0 ? ((totalPaid / principal) * 100).toFixed(2) : "0.00",
              })
              .where(and(eq(investments.id, fresh.id), eq(investments.profitsPaid, startCount)));
            requireAffected(upd, "investment changed concurrently");

            await notifyAdmin(
              "ROI Credited",
              `Monthly profit of ${fmtMoney(creditedTotal)} credited to ${investor.name} for investment #${fresh.id} (${fresh.projectName}). Total profits to date: ${fmtMoney(totalPaid)}.`,
              "roi",
              tx,
            );
          }

          return {
            monthsCredited,
            maturedNow,
            investorInfo: { id: investor.id, name: investor.name, email: investor.email },
            roiDoc:
              monthsCredited > 0
                ? {
                    investmentId: fresh.id,
                    projectName: fresh.projectName,
                    planName: plan.name,
                    amount: creditedTotal,
                    reference: `PROF-${fresh.id}-M${startCount + 1}${monthsCredited > 1 ? `-M${profitsCount}` : ""}`,
                    period: monthsCredited === 1 ? `Month ${profitsCount} of ${plan.durationMonths}` : `Months ${startCount + 1}–${profitsCount} of ${plan.durationMonths}`,
                    principal,
                    totalPaid,
                  }
                : null,
            closureDoc: maturedNow
              ? {
                  investmentId: fresh.id,
                  projectName: fresh.projectName,
                  planName: plan.name,
                  reference: `MAT-${fresh.id}`,
                  principal,
                  totalPaid,
                  durationMonths: plan.durationMonths,
                }
              : null,
          };
        });

        if (outcome) {
          profitsPaid += outcome.monthsCredited;
          if (outcome.maturedNow) settled += 1;
          if (outcome.roiDoc) {
            const d = outcome.roiDoc;
            void generatePdfDocument({
              investorId: outcome.investorInfo.id,
              ownerEmail: outcome.investorInfo.email,
              ownerName: outcome.investorInfo.name,
              category: "investment",
              docType: "ROI Payment Statement",
              amount: d.amount,
              reference: d.reference,
              links: { investmentId: d.investmentId },
              lines: [
                { label: "Investment Plan", value: d.planName },
                { label: "Project", value: d.projectName },
                { label: "Profit Period", value: d.period },
                { label: "Amount Invested", value: fmtMoney(d.principal) },
                { label: "Profit Credited", value: fmtMoney(d.amount) },
                { label: "Total Profit to Date", value: fmtMoney(d.totalPaid) },
              ],
              note: "Your monthly ROI profit has been credited to your FlexHavens wallet.",
            });
            void sendSystemMessage(outcome.investorInfo.id, {
              subject: "ROI Paid",
              category: "investment_support",
              body: `Your ROI profit of ${fmtMoney(d.amount)} for ${d.projectName} (${d.planName}) has been credited to your wallet. Period: ${d.period}. Total profit to date: ${fmtMoney(d.totalPaid)}. Reference: ${d.reference}.`,
              notify: false,
            });
          }
          if (outcome.closureDoc) {
            const d = outcome.closureDoc;
            void generatePdfDocument({
              investorId: outcome.investorInfo.id,
              ownerEmail: outcome.investorInfo.email,
              ownerName: outcome.investorInfo.name,
              category: "investment",
              docType: "Investment Closure Certificate",
              name: `Investment Closure Certificate — ${d.projectName} (${d.reference})`,
              amount: d.principal + d.totalPaid,
              reference: d.reference,
              links: { investmentId: d.investmentId },
              lines: [
                { label: "Investment Plan", value: d.planName },
                { label: "Project", value: d.projectName },
                { label: "Principal Invested", value: fmtMoney(d.principal) },
                { label: "Total Profit Earned", value: fmtMoney(d.totalPaid) },
                { label: "Duration", value: `${d.durationMonths} months` },
                { label: "Status", value: "Completed — Principal Returned" },
              ],
              note: "This certificate confirms the successful completion of your investment. Principal and all profits have been returned to your wallet.",
            });
            void sendSystemMessage(outcome.investorInfo.id, {
              subject: "Investment Completed",
              category: "investment_support",
              body: `Congratulations! Your investment in ${d.projectName} (${d.planName}) has completed successfully. Principal of ${fmtMoney(d.principal)} and total profit of ${fmtMoney(d.totalPaid)} have been returned to your wallet. Reference: ${d.reference}.`,
              notify: false,
            });
          }
        }
      } catch (err) {
        // A failed investment rolls back entirely; the rest of the batch continues
        console.error(`settlement failed for investment #${inv.id}:`, err);
      }
    }

    if (trigger === "admin") {
      await logAudit(null, adminName, "run_settlement", `Manual settlement: ${profitsPaid} profits paid, ${settled} investments matured`);
    }
    return { settled, profitsPaid, skipped: false };
  } finally {
    running = false;
  }
}

let schedulerStarted = false;

export function startRoiScheduler() {
  if (schedulerStarted) return;
  schedulerStarted = true;
  const tick = () =>
    runMonthlySettlement("scheduler")
      .catch((err) => console.error("ROI scheduler error:", err))
      .then(() => runMortgageReminders())
      .catch((err) => console.error("Mortgage reminder error:", err));
  // First pass shortly after boot, then hourly
  setTimeout(tick, 15_000).unref?.();
  setInterval(tick, 60 * 60 * 1000).unref?.();
  console.log("Monthly ROI scheduler started (hourly).");
}
