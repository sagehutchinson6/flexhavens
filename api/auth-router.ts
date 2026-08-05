import * as cookie from "cookie";
import { randomBytes } from "crypto";
import { z } from "zod";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { investors, investorTokens } from "@db/schema";
import { logInvestorActivity, logAudit } from "./lib/activity";
import { sendVerificationEmail } from "./lib/email";
import { eq, and, isNull } from "drizzle-orm";

function createTokenValue() {
  return randomBytes(32).toString("hex");
}

export const authRouter = createRouter({
  me: authedQuery.query((opts) => opts.ctx.user),
  resendVerification: publicQuery
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const email = input.email.toLowerCase().trim();
      const rows = await db.select().from(investors).where(eq(investors.email, email)).limit(1);
      const account = rows.at(0);
      const message = "If an account exists and is awaiting verification, a new verification email has been sent.";
      if (!account || account.emailVerified === "yes") {
        return { success: true, message };
      }

      await db
        .update(investorTokens)
        .set({ usedAt: new Date() })
        .where(
          and(
            eq(investorTokens.investorId, account.id),
            eq(investorTokens.type, "email_verification"),
            isNull(investorTokens.usedAt),
          ),
        );

      const token = createTokenValue();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await db.insert(investorTokens).values({ investorId: account.id, token, type: "email_verification", expiresAt });

      sendVerificationEmail({
        to: email,
        name: account.name,
        token,
        reqHeaders: ctx.req.headers,
      }).catch((err) => console.error("public resend verification email failed:", err));

      await logInvestorActivity(account.id, "resend_verification", "Resent verification email", ctx.req.headers);
      await logAudit(null, "System", "resend_email_verification", `Resend verification requested for ${email}`, ctx.req.headers);

      return { success: true, message };
    }),
  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      }),
    );
    return { success: true };
  }),
});
