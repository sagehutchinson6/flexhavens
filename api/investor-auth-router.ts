import { z } from "zod";
import * as cookie from "cookie";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { TRPCError } from "@trpc/server";
import { eq, and, gt, isNull } from "drizzle-orm";
import { createRouter, publicQuery, investorQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { investors, investorTokens, referrals, investorNotifications } from "@db/schema";
import { InvestorSession } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { signInvestorToken } from "./lib/investor-session";
import { logInvestorActivity, notifyAdmin, logAudit } from "./lib/activity";
import { checkRateLimit, resetRateLimit } from "./lib/rate-limit";
import { isSmtpConfigured, sendVerificationEmail, sendPasswordResetEmail } from "./lib/email";
import { linkLeadToInvestor } from "./lib/crm";

function generateReferralCode(name: string) {
  const base = name.replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase() || "FLEX";
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${base}${rand}`;
}

function createTokenValue() {
  return randomBytes(32).toString("hex");
}

function setInvestorCookie(resHeaders: Headers, reqHeaders: Headers, token: string, remember = true) {
  const opts = getSessionCookieOptions(reqHeaders);
  resHeaders.append(
    "set-cookie",
    cookie.serialize(InvestorSession.cookieName, token, {
      httpOnly: opts.httpOnly,
      path: opts.path,
      sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
      secure: opts.secure,
      // "Remember me" unchecked → session cookie (expires when the browser closes)
      ...(remember ? { maxAge: InvestorSession.maxAgeMs / 1000 } : {}),
    }),
  );
}

export function clearInvestorCookie(resHeaders: Headers, reqHeaders: Headers) {
  const opts = getSessionCookieOptions(reqHeaders);
  resHeaders.append(
    "set-cookie",
    cookie.serialize(InvestorSession.cookieName, "", {
      httpOnly: opts.httpOnly,
      path: opts.path,
      sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
      secure: opts.secure,
      maxAge: 0,
    }),
  );
}

async function issueToken(investorId: number, type: "email_verification" | "password_reset") {
  const db = getDb();
  const token = createTokenValue();
  const expiresAt = new Date(Date.now() + (type === "password_reset" ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000));
  await db.insert(investorTokens).values({ investorId, token, type, expiresAt });
  return token;
}

// Strip sensitive fields before returning an investor to the client
export function sanitizeInvestor<T extends { passwordHash?: string }>(investor: T) {
  const { passwordHash: _ignored, ...rest } = investor;
  return rest;
}

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-zA-Z]/, "Password must contain a letter")
  .regex(/[0-9]/, "Password must contain a number");

export const investorAuthRouter = createRouter({
  register: publicQuery
    .input(
      z.object({
        name: z.string().min(2).max(255),
        email: z.string().email().max(320),
        password: passwordSchema,
        phone: z.string().max(50).optional(),
        country: z.string().max(100).optional(),
        referralCode: z.string().max(20).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const email = input.email.toLowerCase().trim();

      const existing = await db.select().from(investors).where(eq(investors.email, email)).limit(1);
      if (existing.length) {
        throw new TRPCError({ code: "CONFLICT", message: "An account with this email already exists" });
      }

      // Resolve referral code
      let referrerId: number | null = null;
      if (input.referralCode) {
        const referrer = await db
          .select()
          .from(investors)
          .where(eq(investors.referralCode, input.referralCode.trim().toUpperCase()))
          .limit(1);
        if (referrer.length) referrerId = referrer[0].id;
      }

      const passwordHash = await bcrypt.hash(input.password, 12);

      const [row] = await db
        .insert(investors)
        .values({
          name: input.name.trim(),
          email,
          passwordHash,
          phone: input.phone || null,
          country: input.country || null,
          referralCode: generateReferralCode(input.name),
          referredById: referrerId,
        })
        .$returningId();

      const investorId = row.id;

      if (referrerId) {
        await db.insert(referrals).values({
          referrerId,
          referredId: investorId,
          referredName: input.name.trim(),
          bonusAmount: "0.00",
          status: "pending",
        });
        await db.insert(investorNotifications).values({
          investorId: referrerId,
          title: "New Referral Joined",
          message: `${input.name.trim()} joined FlexHavens Invest with your referral code. Your bonus is credited once their first deposit is approved.`,
          type: "success",
        });
      }

      await db.insert(investorNotifications).values({
        investorId,
        title: "Welcome to FlexHavens Invest",
        message: "Your investor account is ready. Verify your email, make your first deposit, and start building wealth with real estate.",
        type: "info",
      });

      const verificationToken = await issueToken(investorId, "email_verification");
      await logInvestorActivity(investorId, "register", "Investor account created", ctx.req.headers);
      await logAudit(null, "System", "user_registered", `New user registered: ${input.name.trim()} (${email})`, ctx.req.headers);
      // CRM: link any existing lead to this registered account
      await linkLeadToInvestor(email, investorId, input.name.trim());

      // Send verification email asynchronously. Do not block registration if SMTP is slow or fails.
      sendVerificationEmail({
        to: email,
        name: input.name.trim(),
        token: verificationToken,
        reqHeaders: ctx.req.headers,
      }).catch((err) => console.error("verification email failed:", err));

      return {
        success: true,
        message: "Registration successful. Please verify your email before logging in.",
        devVerificationToken: isSmtpConfigured() ? null : verificationToken,
      };
    }),

  login: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
        remember: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const email = input.email.toLowerCase().trim();
      const ip =
        ctx.req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        ctx.req.headers.get("x-real-ip") ??
        "unknown";
      const rlKey = `login:${email}:${ip}`;

      // Rate limit: 5 attempts per 10 minutes per email+IP
      if (!checkRateLimit(rlKey, 5, 10 * 60 * 1000)) {
        await notifyAdmin(
          "Suspicious Login Activity",
          `Repeated failed login attempts for investor account ${email} from IP ${ip}. The account has been temporarily rate-limited.`,
          "security",
        );
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many failed attempts. Please try again in 10 minutes.",
        });
      }

      const rows = await db.select().from(investors).where(eq(investors.email, email)).limit(1);
      const investor = rows.at(0);
      if (!investor) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }
      const ok = await bcrypt.compare(input.password, investor.passwordHash);
      if (!ok) {
        await logInvestorActivity(investor.id, "login_failed", `Failed login from IP ${ip}`, ctx.req.headers);
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }
      if (investor.status !== "active") {
        throw new TRPCError({ code: "FORBIDDEN", message: "This account has been suspended. Contact support." });
      }
      if (investor.emailVerified !== "yes") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Please verify your email before logging in.",
        });
      }

      resetRateLimit(rlKey);
      await db.update(investors).set({ lastSignInAt: new Date() }).where(eq(investors.id, investor.id));
      await logInvestorActivity(investor.id, "login", `Successful login from IP ${ip}`, ctx.req.headers);

      const jwt = await signInvestorToken({ investorId: investor.id, email: investor.email });
      setInvestorCookie(ctx.resHeaders, ctx.req.headers, jwt, input.remember ?? true);

      return { investor: sanitizeInvestor(investor) };
    }),

  logout: investorQuery.mutation(async ({ ctx }) => {
    clearInvestorCookie(ctx.resHeaders, ctx.req.headers);
    return { success: true };
    }),

  me: investorQuery.query(({ ctx }) => sanitizeInvestor(ctx.investor)),

  verifyEmail: publicQuery
    .input(z.object({ token: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(investorTokens)
        .where(
          and(
            eq(investorTokens.token, input.token),
            eq(investorTokens.type, "email_verification"),
            isNull(investorTokens.usedAt),
            gt(investorTokens.expiresAt, new Date()),
          ),
        )
        .limit(1);
      const tokenRow = rows.at(0);
      if (!tokenRow) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This verification link is invalid or has expired" });
      }

      await db.update(investorTokens).set({ usedAt: new Date() }).where(eq(investorTokens.id, tokenRow.id));
      await db.update(investors).set({ emailVerified: "yes" }).where(eq(investors.id, tokenRow.investorId));
      await db.insert(investorNotifications).values({
        investorId: tokenRow.investorId,
        title: "Email Verified",
        message: "Your email address has been verified successfully.",
        type: "success",
      });

      const [investor] = await db
        .select()
        .from(investors)
        .where(eq(investors.id, tokenRow.investorId))
        .limit(1);
      if (!investor) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Investor account not found after verification" });
      }

      const jwt = await signInvestorToken({ investorId: investor.id, email: investor.email });
      setInvestorCookie(ctx.resHeaders, ctx.req.headers, jwt, false);

      return { success: true };
    }),

  resendVerification: investorQuery.mutation(async ({ ctx }) => {
    if (ctx.investor.emailVerified === "yes") {
      return { success: true, devVerificationToken: null };
    }
    const token = await issueToken(ctx.investor.id, "email_verification");
    sendVerificationEmail({
      to: ctx.investor.email,
      name: ctx.investor.name,
      token,
      reqHeaders: ctx.req.headers,
    }).catch((err) => console.error("resend verification email failed:", err));
    return { success: true, devVerificationToken: isSmtpConfigured() ? null : token };
  }),

  forgotPassword: publicQuery
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const email = input.email.toLowerCase().trim();
      const rows = await db.select().from(investors).where(eq(investors.email, email)).limit(1);
      // Always succeed to avoid leaking which emails are registered
      if (!rows.length) {
        return { success: true, devResetToken: null };
      }
      const token = await issueToken(rows[0].id, "password_reset");
      sendPasswordResetEmail({
        to: email,
        name: rows[0].name,
        token,
      }).catch((err) => console.error("password reset email failed:", err));
      return { success: true, devResetToken: isSmtpConfigured() ? null : token };
    }),

  resetPassword: publicQuery
    .input(
      z.object({
        token: z.string().min(1),
        password: passwordSchema,
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(investorTokens)
        .where(
          and(
            eq(investorTokens.token, input.token),
            eq(investorTokens.type, "password_reset"),
            isNull(investorTokens.usedAt),
            gt(investorTokens.expiresAt, new Date()),
          ),
        )
        .limit(1);
      const tokenRow = rows.at(0);
      if (!tokenRow) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This reset link is invalid or has expired" });
      }

      const passwordHash = await bcrypt.hash(input.password, 12);
      await db.update(investors).set({ passwordHash }).where(eq(investors.id, tokenRow.investorId));
      await db.update(investorTokens).set({ usedAt: new Date() }).where(eq(investorTokens.id, tokenRow.id));

      return { success: true };
    }),

  changePassword: investorQuery
    .input(
      z.object({
        currentPassword: z.string().min(1),
        newPassword: passwordSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const ok = await bcrypt.compare(input.currentPassword, ctx.investor.passwordHash);
      if (!ok) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Current password is incorrect" });
      }
      const passwordHash = await bcrypt.hash(input.newPassword, 12);
      await db.update(investors).set({ passwordHash }).where(eq(investors.id, ctx.investor.id));
      return { success: true };
    }),

  updateProfile: investorQuery
    .input(
      z.object({
        name: z.string().min(2).max(255).optional(),
        phone: z.string().max(50).optional(),
        country: z.string().max(100).optional(),
        avatar: z
          .string()
          .max(2_000_000, "Image is too large — please choose one under 5 MB")
          .regex(/^data:image\/(jpeg|jpg|png|webp);base64,/i, "Avatar must be a JPG, PNG or WEBP image")
          .nullable()
          .optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const data: Record<string, string | null> = {};
      if (input.name !== undefined) data.name = input.name.trim();
      if (input.phone !== undefined) data.phone = input.phone;
      if (input.country !== undefined) data.country = input.country;
      if (input.avatar !== undefined) data.avatar = input.avatar; // null removes the photo
      if (Object.keys(data).length) {
        await db.update(investors).set(data).where(eq(investors.id, ctx.investor.id));
      }
      const updated = await db.select().from(investors).where(eq(investors.id, ctx.investor.id)).limit(1);
      return { investor: sanitizeInvestor(updated[0]) };
    }),

  submitKyc: investorQuery
    .input(
      z.object({
        fullName: z.string().min(2).max(255),
        documentType: z.enum(["passport", "drivers_license", "national_id"]),
        idNumber: z.string().min(3).max(100),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db
        .update(investors)
        .set({
          kycStatus: "pending",
          kycFullName: input.fullName.trim(),
          kycDocumentType: input.documentType,
          kycIdNumber: input.idNumber.trim(),
        })
        .where(eq(investors.id, ctx.investor.id));
      await db.insert(investorNotifications).values({
        investorId: ctx.investor.id,
        title: "Verification Submitted",
        message: "Your identity verification has been submitted and is under review. This usually takes 1-2 business days.",
        type: "info",
      });
      return { success: true };
    }),
});
