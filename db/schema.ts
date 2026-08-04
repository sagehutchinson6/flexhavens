import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  longtext,
  timestamp,
  int,
  decimal,
  json,
  bigint,
  unique,
} from "drizzle-orm/mysql-core";

// ── Users (OAuth auth) ──────────────────────────────────────────
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ── Products (Luxury Property Catalog) ──────────────────────────
export const products = mysqlTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  category: mysqlEnum("category", ["1br", "2br", "3br", "4br"]).notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  size: varchar("size", { length: 50 }).notNull(),
  bedrooms: int("bedrooms").notNull(),
  bathrooms: int("bathrooms").notNull(),
  images: json("images").notNull(),
  specs: json("specs").notNull(),
  features: json("features").notNull(),
  delivery: varchar("delivery", { length: 100 }).notNull(),
  warranty: varchar("warranty", { length: 100 }).notNull(),
  description: text("description"),
  isActive: mysqlEnum("isActive", ["yes", "no"]).default("yes").notNull(),
  mortgageEnabled: mysqlEnum("mortgageEnabled", ["yes", "no"]).default("no").notNull(),
  mortgagePlanIds: text("mortgagePlanIds"), // JSON array of mortgage plan IDs
  minDownPaymentPercent: decimal("minDownPaymentPercent", { precision: 5, scale: 2 }),
  mortgageConditions: text("mortgageConditions"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// ── Customers (Delivery Information) ────────────────────────────
export const customers = mysqlTable("customers", {
  id: serial("id").primaryKey(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  middleName: varchar("middleName", { length: 100 }),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  postalCode: varchar("postalCode", { length: 20 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

// ── Orders ──────────────────────────────────────────────────────
export const orders = mysqlTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  customerId: bigint("customerId", { mode: "number", unsigned: true }).notNull(),
  totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["paypal", "bank", "crypto"]).notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "confirmed", "failed"]).default("pending").notNull(),
  orderStatus: mysqlEnum("orderStatus", [
    "purchase_request",
    "payment_verification",
    "purchase_agreement",
    "legal_documentation",
    "property_allocation",
    "title_documentation",
    "final_inspection",
    "handover_preparation",
    "handed_over",
    "cancelled"
  ]).default("purchase_request").notNull(),
  transitDay: int("transitDay").default(0),
  estimatedDelivery: timestamp("estimatedDelivery"),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// ── Order Items ─────────────────────────────────────────────────
export const orderItems = mysqlTable("orderItems", {
  id: serial("id").primaryKey(),
  orderId: bigint("orderId", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("productId", { mode: "number", unsigned: true }).notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  quantity: int("quantity").notNull().default(1),
  unitPrice: decimal("unitPrice", { precision: 12, scale: 2 }).notNull(),
  totalPrice: decimal("totalPrice", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

// ── Tracking History ────────────────────────────────────────────
export const trackingHistory = mysqlTable("trackingHistory", {
  id: serial("id").primaryKey(),
  orderId: bigint("orderId", { mode: "number", unsigned: true }).notNull(),
  status: mysqlEnum("status", [
    "purchase_request",
    "payment_verification",
    "purchase_agreement",
    "legal_documentation",
    "property_allocation",
    "title_documentation",
    "final_inspection",
    "handover_preparation",
    "handed_over"
  ]).notNull(),
  transitDay: int("transitDay").default(0),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TrackingHistory = typeof trackingHistory.$inferSelect;
export type InsertTrackingHistory = typeof trackingHistory.$inferInsert;

// ── Order Documents (purchase paperwork uploaded by admin) ──────
export const orderDocuments = mysqlTable("orderDocuments", {
  id: serial("id").primaryKey(),
  orderId: bigint("orderId", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  dataUrl: longtext("dataUrl").notNull(),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

export type OrderDocument = typeof orderDocuments.$inferSelect;
export type InsertOrderDocument = typeof orderDocuments.$inferInsert;

// ── Investors (Investment Portal auth) ──────────────────────────
export const investors = mysqlTable("investors", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  country: varchar("country", { length: 100 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["investor", "admin"]).default("investor").notNull(),
  status: mysqlEnum("status", ["active", "suspended", "deleted"]).default("active").notNull(),
  referralCode: varchar("referralCode", { length: 20 }).notNull().unique(),
  referredById: bigint("referredById", { mode: "number", unsigned: true }),
  emailVerified: mysqlEnum("emailVerified", ["yes", "no"]).default("no").notNull(),
  kycStatus: mysqlEnum("kycStatus", ["unverified", "pending", "verified", "rejected"]).default("unverified").notNull(),
  kycDocumentType: varchar("kycDocumentType", { length: 50 }),
  kycIdNumber: varchar("kycIdNumber", { length: 100 }),
  kycFullName: varchar("kycFullName", { length: 255 }),
  walletBalance: decimal("walletBalance", { precision: 14, scale: 2 }).default("0.00").notNull(),
  totalEarnings: decimal("totalEarnings", { precision: 14, scale: 2 }).default("0.00").notNull(),
  referralEarnings: decimal("referralEarnings", { precision: 14, scale: 2 }).default("0.00").notNull(),
  totalDeposited: decimal("totalDeposited", { precision: 14, scale: 2 }).default("0.00").notNull(),
  totalWithdrawn: decimal("totalWithdrawn", { precision: 14, scale: 2 }).default("0.00").notNull(),
  withdrawalCount: int("withdrawalCount").default(0).notNull(),
  walletFrozen: mysqlEnum("walletFrozen", ["yes", "no"]).default("no").notNull(),
  verificationTier: mysqlEnum("verificationTier", ["tier1", "tier2", "tier3"]).default("tier1").notNull(),
  verificationStatus: mysqlEnum("verificationStatus", ["not_started", "pending", "approved", "rejected", "more_info", "suspended"]).default("not_started").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type Investor = typeof investors.$inferSelect;
export type InsertInvestor = typeof investors.$inferInsert;

// ── Investment Plans ────────────────────────────────────────────
export const investmentPlans = mysqlTable("investmentPlans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  minAmount: decimal("minAmount", { precision: 14, scale: 2 }).notNull(),
  targetReturn: int("targetReturn").notNull(), // percent, e.g. 40 = up to 40%
  durationMonths: int("durationMonths").notNull(),
  featured: mysqlEnum("featured", ["yes", "no"]).default("no").notNull(),
  description: text("description"),
  features: json("features").notNull(),
  isActive: mysqlEnum("isActive", ["yes", "no"]).default("yes").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InvestmentPlan = typeof investmentPlans.$inferSelect;
export type InsertInvestmentPlan = typeof investmentPlans.$inferInsert;

// ── Investment Projects ─────────────────────────────────────────
export const investmentProjects = mysqlTable("investmentProjects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description"),
  image: varchar("image", { length: 500 }),
  targetAmount: decimal("targetAmount", { precision: 14, scale: 2 }).notNull(),
  raisedAmount: decimal("raisedAmount", { precision: 14, scale: 2 }).default("0.00").notNull(),
  expectedReturn: int("expectedReturn").notNull(), // percent
  durationMonths: int("durationMonths").notNull(),
  status: mysqlEnum("status", ["open", "funding", "funded", "completed"]).default("open").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InvestmentProject = typeof investmentProjects.$inferSelect;
export type InsertInvestmentProject = typeof investmentProjects.$inferInsert;

// ── Investments ─────────────────────────────────────────────────
export const investments = mysqlTable("investments", {
  id: serial("id").primaryKey(),
  investorId: bigint("investorId", { mode: "number", unsigned: true }).notNull(),
  planId: bigint("planId", { mode: "number", unsigned: true }).notNull(),
  projectId: bigint("projectId", { mode: "number", unsigned: true }),
  projectName: varchar("projectName", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
  currentValue: decimal("currentValue", { precision: 14, scale: 2 }).notNull(),
  estimatedEarnings: decimal("estimatedEarnings", { precision: 14, scale: 2 }).notNull(),
  roi: decimal("roi", { precision: 8, scale: 2 }).notNull(), // percent
  status: mysqlEnum("status", ["pending", "active", "suspended", "matured", "cancelled", "liquidated"]).default("pending").notNull(),
  progress: int("progress").default(0).notNull(), // 0-100
  customReturnRate: int("customReturnRate"), // admin override of the plan's targetReturn (%)
  profitPaused: mysqlEnum("profitPaused", ["yes", "no"]).default("no").notNull(),
  profitsPaid: int("profitsPaid").default(0).notNull(), // number of monthly profits credited
  totalProfitPaid: decimal("totalProfitPaid", { precision: 14, scale: 2 }).default("0.00").notNull(),
  lastProfitAt: timestamp("lastProfitAt"),
  nextProfitAt: timestamp("nextProfitAt"),
  startDate: timestamp("startDate").defaultNow().notNull(),
  maturityDate: timestamp("maturityDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Investment = typeof investments.$inferSelect;
export type InsertInvestment = typeof investments.$inferInsert;

// ── Deposits ────────────────────────────────────────────────────
export const deposits = mysqlTable("deposits", {
  id: serial("id").primaryKey(),
  investorId: bigint("investorId", { mode: "number", unsigned: true }).notNull(),
  amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
  method: mysqlEnum("method", ["bank", "paypal", "crypto", "card"]).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  reference: varchar("reference", { length: 100 }).notNull().unique(),
  adminNote: text("adminNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  processedAt: timestamp("processedAt"),
});

export type Deposit = typeof deposits.$inferSelect;
export type InsertDeposit = typeof deposits.$inferInsert;

// ── Withdrawals ─────────────────────────────────────────────────
export const withdrawals = mysqlTable("withdrawals", {
  id: serial("id").primaryKey(),
  investorId: bigint("investorId", { mode: "number", unsigned: true }).notNull(),
  amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
  method: mysqlEnum("method", ["bank", "paypal", "crypto"]).notNull(),
  destination: varchar("destination", { length: 500 }).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "paid", "rejected"]).default("pending").notNull(),
  reference: varchar("reference", { length: 100 }).notNull().unique(),
  adminNote: text("adminNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  processedAt: timestamp("processedAt"),
});

export type Withdrawal = typeof withdrawals.$inferSelect;
export type InsertWithdrawal = typeof withdrawals.$inferInsert;

// ── Investment Transactions (ledger) ────────────────────────────
export const investmentTransactions = mysqlTable("investmentTransactions", {
  id: serial("id").primaryKey(),
  investorId: bigint("investorId", { mode: "number", unsigned: true }).notNull(),
  type: mysqlEnum("type", [
    "deposit",
    "withdrawal",
    "investment",
    "earning",
    "referral_bonus",
    "adjustment",
    "refund",
    "mortgage_payment",
  ]).notNull(),
  direction: mysqlEnum("direction", ["credit", "debit"]).notNull(),
  amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  reference: varchar("reference", { length: 100 }),
  status: mysqlEnum("status", ["completed", "pending", "failed"]).default("completed").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InvestmentTransaction = typeof investmentTransactions.$inferSelect;
export type InsertInvestmentTransaction = typeof investmentTransactions.$inferInsert;

// ── Referrals ───────────────────────────────────────────────────
export const referrals = mysqlTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: bigint("referrerId", { mode: "number", unsigned: true }).notNull(),
  referredId: bigint("referredId", { mode: "number", unsigned: true }).notNull(),
  referredName: varchar("referredName", { length: 255 }).notNull(),
  bonusAmount: decimal("bonusAmount", { precision: 14, scale: 2 }).default("0.00").notNull(),
  status: mysqlEnum("status", ["pending", "credited"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

// ── Investor Notifications ──────────────────────────────────────
export const investorNotifications = mysqlTable("investorNotifications", {
  id: serial("id").primaryKey(),
  investorId: bigint("investorId", { mode: "number", unsigned: true }), // null = broadcast
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["info", "success", "warning", "error"]).default("info").notNull(),
  isRead: mysqlEnum("isRead", ["yes", "no"]).default("no").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InvestorNotification = typeof investorNotifications.$inferSelect;
export type InsertInvestorNotification = typeof investorNotifications.$inferInsert;

// ── Investor Tokens (email verification / password reset) ───────
export const investorTokens = mysqlTable("investorTokens", {
  id: serial("id").primaryKey(),
  investorId: bigint("investorId", { mode: "number", unsigned: true }).notNull(),
  token: varchar("token", { length: 128 }).notNull().unique(),
  type: mysqlEnum("type", ["email_verification", "password_reset"]).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InvestorToken = typeof investorTokens.$inferSelect;
export type InsertInvestorToken = typeof investorTokens.$inferInsert;

// ── Monthly Profit Payments ─────────────────────────────────────
export const profitPayments = mysqlTable(
  "profitPayments",
  {
    id: serial("id").primaryKey(),
    investmentId: bigint("investmentId", { mode: "number", unsigned: true }).notNull(),
    investorId: bigint("investorId", { mode: "number", unsigned: true }).notNull(),
    amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
    monthNumber: int("monthNumber").notNull(),
    roiPercent: decimal("roiPercent", { precision: 8, scale: 2 }).notNull(), // monthly rate applied
    status: mysqlEnum("status", ["paid", "reversed"]).default("paid").notNull(),
    paidAt: timestamp("paidAt").defaultNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (t) => [unique("profitPayments_inv_month_uq").on(t.investmentId, t.monthNumber)],
);

export type ProfitPayment = typeof profitPayments.$inferSelect;
export type InsertProfitPayment = typeof profitPayments.$inferInsert;

// ── Investor Activity Log ───────────────────────────────────────
export const investorActivityLogs = mysqlTable("investorActivityLogs", {
  id: serial("id").primaryKey(),
  investorId: bigint("investorId", { mode: "number", unsigned: true }).notNull(),
  action: varchar("action", { length: 100 }).notNull(), // login, deposit, invest, withdraw...
  details: text("details"),
  ipAddress: varchar("ipAddress", { length: 64 }),
  userAgent: varchar("userAgent", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InvestorActivityLog = typeof investorActivityLogs.$inferSelect;
export type InsertInvestorActivityLog = typeof investorActivityLogs.$inferInsert;

// ── Admin Notifications ─────────────────────────────────────────
export const adminNotifications = mysqlTable("adminNotifications", {
  id: serial("id").primaryKey(),
  adminId: bigint("adminId", { mode: "number", unsigned: true }), // null = all admins
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", [
    "investment",
    "deposit",
    "withdrawal",
    "roi",
    "order",
    "security",
    "system",
  ]).default("system").notNull(),
  isRead: mysqlEnum("isRead", ["yes", "no"]).default("no").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdminNotification = typeof adminNotifications.$inferSelect;
export type InsertAdminNotification = typeof adminNotifications.$inferInsert;

// ── Admin Audit Log ─────────────────────────────────────────────
export const auditLogs = mysqlTable("auditLogs", {
  id: serial("id").primaryKey(),
  adminId: bigint("adminId", { mode: "number", unsigned: true }),
  adminName: varchar("adminName", { length: 255 }).notNull(),
  action: varchar("action", { length: 150 }).notNull(),
  details: text("details"),
  ipAddress: varchar("ipAddress", { length: 64 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// ── Contact Submissions ─────────────────────────────────────────
export const contactSubmissions = mysqlTable("contactSubmissions", {
  id: serial("id").primaryKey(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  country: varchar("country", { length: 100 }),
  message: text("message").notNull(),
  isRead: mysqlEnum("isRead", ["yes", "no"]).default("no").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = typeof contactSubmissions.$inferInsert;

// Investment liquidation requests (early exit from an active investment)
export const liquidationRequests = mysqlTable("liquidationRequests", {
  id: serial("id").primaryKey(),
  investmentId: bigint("investmentId", { mode: "number", unsigned: true }).notNull(),
  investorId: bigint("investorId", { mode: "number", unsigned: true }).notNull(),
  principalAmount: decimal("principalAmount", { precision: 14, scale: 2 }).notNull(),
  profitEarned: decimal("profitEarned", { precision: 14, scale: 2 }).notNull(), // ROI paid out so far (snapshot)
  penaltyPercent: int("penaltyPercent").notNull(), // early-exit penalty applied (snapshot)
  penaltyAmount: decimal("penaltyAmount", { precision: 14, scale: 2 }).notNull(),
  accruedProfit: decimal("accruedProfit", { precision: 14, scale: 2 }).notNull(), // partial-month profit accrued
  estimatedValue: decimal("estimatedValue", { precision: 14, scale: 2 }).notNull(), // expected payout
  finalAmount: decimal("finalAmount", { precision: 14, scale: 2 }), // actual payout set at approval
  status: mysqlEnum("status", ["pending", "approved", "rejected", "completed"]).default("pending").notNull(),
  adminNote: text("adminNote"),
  requestedAt: timestamp("requestedAt").defaultNow().notNull(),
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LiquidationRequest = typeof liquidationRequests.$inferSelect;
export type InsertLiquidationRequest = typeof liquidationRequests.$inferInsert;

// ── Administrator Accounts (multi-admin RBAC) ───────────────────
export const adminUsers = mysqlTable("adminUsers", {
  id: serial("id").primaryKey(),
  firstName: varchar("firstName", { length: 100 }),
  lastName: varchar("lastName", { length: 100 }),
  displayName: varchar("displayName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["primary", "secondary"]).default("secondary").notNull(),
  permissions: text("permissions"), // JSON array of permission keys
  status: mysqlEnum("status", ["active", "suspended"]).default("active").notNull(),
  pendingEmail: varchar("pendingEmail", { length: 320 }),
  sessionsInvalidatedAt: timestamp("sessionsInvalidatedAt"),
  lastSignInAt: timestamp("lastSignInAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = typeof adminUsers.$inferInsert;

export const adminTokens = mysqlTable("adminTokens", {
  id: serial("id").primaryKey(),
  adminId: bigint("adminId", { mode: "number", unsigned: true }).notNull(),
  token: varchar("token", { length: 128 }).notNull().unique(),
  type: mysqlEnum("type", ["email_change"]).notNull(),
  newEmail: varchar("newEmail", { length: 320 }),
  expiresAt: timestamp("expiresAt").notNull(),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdminToken = typeof adminTokens.$inferSelect;
export type InsertAdminToken = typeof adminTokens.$inferInsert;

// ── Account Deletion Feedback (Primary Admin only) ──────────────
export const accountDeletionFeedback = mysqlTable("accountDeletionFeedback", {
  id: serial("id").primaryKey(),
  investorId: bigint("investorId", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  reason: varchar("reason", { length: 150 }).notNull(),
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AccountDeletionFeedback = typeof accountDeletionFeedback.$inferSelect;
export type InsertAccountDeletionFeedback = typeof accountDeletionFeedback.$inferInsert;

// ── Mortgage System ─────────────────────────────────────────────
export const mortgagePlans = mysqlTable("mortgagePlans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  planType: mysqlEnum("planType", ["monthly", "yearly"]).default("monthly").notNull(),
  durationValue: int("durationValue").notNull(), // e.g. 24 (months) or 5 (years)
  downPaymentPercent: decimal("downPaymentPercent", { precision: 5, scale: 2 }).default("20.00").notNull(),
  interestPercent: decimal("interestPercent", { precision: 5, scale: 2 }).default("0.00").notNull(), // flat, total over term
  paymentFrequency: mysqlEnum("paymentFrequency", ["monthly", "yearly"]).default("monthly").notNull(),
  gracePeriodDays: int("gracePeriodDays"),
  lateFeePercent: decimal("lateFeePercent", { precision: 5, scale: 2 }),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type MortgagePlan = typeof mortgagePlans.$inferSelect;
export type InsertMortgagePlan = typeof mortgagePlans.$inferInsert;

export const mortgages = mysqlTable("mortgages", {
  id: serial("id").primaryKey(),
  reference: varchar("reference", { length: 40 }).notNull().unique(),
  investorId: bigint("investorId", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("productId", { mode: "number", unsigned: true }).notNull(),
  planId: bigint("planId", { mode: "number", unsigned: true }).notNull(),
  propertyName: varchar("propertyName", { length: 255 }).notNull(),
  propertyImage: varchar("propertyImage", { length: 500 }),
  propertyPrice: decimal("propertyPrice", { precision: 12, scale: 2 }).notNull(),
  planName: varchar("planName", { length: 150 }).notNull(),
  planType: mysqlEnum("planType", ["monthly", "yearly"]).notNull(),
  paymentFrequency: mysqlEnum("paymentFrequency", ["monthly", "yearly"]).notNull(),
  durationMonths: int("durationMonths").notNull(),
  installmentAmount: decimal("installmentAmount", { precision: 14, scale: 2 }).notNull(),
  downPaymentAmount: decimal("downPaymentAmount", { precision: 14, scale: 2 }).notNull(),
  totalPayable: decimal("totalPayable", { precision: 14, scale: 2 }).notNull(),
  amountPaid: decimal("amountPaid", { precision: 14, scale: 2 }).default("0.00").notNull(),
  remainingBalance: decimal("remainingBalance", { precision: 14, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "active", "suspended", "rejected", "completed"]).default("pending").notNull(),
  adminNote: text("adminNote"),
  startDate: timestamp("startDate"),
  nextPaymentAt: timestamp("nextPaymentAt"),
  lastReminderAt: timestamp("lastReminderAt"),
  approvedAt: timestamp("approvedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Mortgage = typeof mortgages.$inferSelect;
export type InsertMortgage = typeof mortgages.$inferInsert;

export const mortgagePayments = mysqlTable("mortgagePayments", {
  id: serial("id").primaryKey(),
  mortgageId: bigint("mortgageId", { mode: "number", unsigned: true }).notNull(),
  investorId: bigint("investorId", { mode: "number", unsigned: true }).notNull(),
  amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
  walletBalanceBefore: decimal("walletBalanceBefore", { precision: 14, scale: 2 }),
  walletBalanceAfter: decimal("walletBalanceAfter", { precision: 14, scale: 2 }),
  remainingBalanceAfter: decimal("remainingBalanceAfter", { precision: 14, scale: 2 }).notNull(),
  reference: varchar("reference", { length: 60 }).notNull().unique(),
  receiptNo: varchar("receiptNo", { length: 40 }).notNull().unique(),
  method: mysqlEnum("method", ["wallet", "manual_adjustment"]).default("wallet").notNull(),
  note: varchar("note", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MortgagePayment = typeof mortgagePayments.$inferSelect;
export type InsertMortgagePayment = typeof mortgagePayments.$inferInsert;

// ── Announcement Bar (website-wide scrolling notice) ────────────────
export const announcements = mysqlTable("announcements", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }),
  message: text("message").notNull(),
  priority: mysqlEnum("priority", ["low", "normal", "high", "urgent"]).default("normal").notNull(),
  status: mysqlEnum("status", ["draft", "active", "scheduled", "expired"]).default("draft").notNull(),
  startAt: timestamp("startAt"),
  endAt: timestamp("endAt"),
  createdById: bigint("createdById", { mode: "number", unsigned: true }),
  createdByName: varchar("createdByName", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = typeof announcements.$inferInsert;

export const announcementSettings = mysqlTable("announcementSettings", {
  id: serial("id").primaryKey(),
  displayMode: mysqlEnum("displayMode", ["single", "rotate", "scroll_all"]).default("scroll_all").notNull(),
  singleAnnouncementId: bigint("singleAnnouncementId", { mode: "number", unsigned: true }),
  speed: mysqlEnum("speed", ["slow", "normal", "fast"]).default("normal").notNull(),
  direction: mysqlEnum("direction", ["ltr", "rtl"]).default("rtl").notNull(),
  pauseOnHover: mysqlEnum("pauseOnHover", ["yes", "no"]).default("yes").notNull(),
  autoRepeat: mysqlEnum("autoRepeat", ["yes", "no"]).default("yes").notNull(),
  bgColor: varchar("bgColor", { length: 20 }).default("#1e3a5f").notNull(),
  textColor: varchar("textColor", { length: 20 }).default("#ffffff").notNull(),
  visibility: mysqlEnum("visibility", ["homepage", "all", "selected"]).default("homepage").notNull(),
  selectedPages: text("selectedPages"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AnnouncementSetting = typeof announcementSettings.$inferSelect;
export type InsertAnnouncementSetting = typeof announcementSettings.$inferInsert;

// ── Investor Verification (KYC Tier System) ─────────────────────────
export const kycRequests = mysqlTable("kycRequests", {
  id: serial("id").primaryKey(),
  investorId: bigint("investorId", { mode: "number", unsigned: true }).notNull(),
  tierRequested: mysqlEnum("tierRequested", ["tier2", "tier3"]).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "more_info"]).default("pending").notNull(),
  sourceOfFunds: text("sourceOfFunds"),
  adminNotes: text("adminNotes"),
  rejectionReason: text("rejectionReason"),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  reviewedAt: timestamp("reviewedAt"),
  reviewedById: bigint("reviewedById", { mode: "number", unsigned: true }),
  reviewedByName: varchar("reviewedByName", { length: 255 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type KycRequest = typeof kycRequests.$inferSelect;
export type InsertKycRequest = typeof kycRequests.$inferInsert;

export const kycDocuments = mysqlTable("kycDocuments", {
  id: serial("id").primaryKey(),
  requestId: bigint("requestId", { mode: "number", unsigned: true }).notNull(),
  investorId: bigint("investorId", { mode: "number", unsigned: true }).notNull(),
  docType: mysqlEnum("docType", ["government_id", "selfie_with_id", "proof_of_address", "additional"]).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  dataUrl: longtext("dataUrl").notNull(),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

export type KycDocument = typeof kycDocuments.$inferSelect;
export type InsertKycDocument = typeof kycDocuments.$inferInsert;

export const kycHistory = mysqlTable("kycHistory", {
  id: serial("id").primaryKey(),
  investorId: bigint("investorId", { mode: "number", unsigned: true }).notNull(),
  action: varchar("action", { length: 60 }).notNull(),
  fromTier: varchar("fromTier", { length: 10 }),
  toTier: varchar("toTier", { length: 10 }),
  note: text("note"),
  actorName: varchar("actorName", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type KycHistoryEntry = typeof kycHistory.$inferSelect;
export type InsertKycHistoryEntry = typeof kycHistory.$inferInsert;

// ── Document Center (investor document vault + generated PDFs) ──────
export const documents = mysqlTable("documents", {
  id: serial("id").primaryKey(),
  docRef: varchar("docRef", { length: 40 }).notNull().unique(),
  investorId: bigint("investorId", { mode: "number", unsigned: true }),
  ownerEmail: varchar("ownerEmail", { length: 320 }),
  ownerName: varchar("ownerName", { length: 255 }),
  category: mysqlEnum("category", ["property", "investment", "mortgage", "financial", "personal"]).notNull(),
  docType: varchar("docType", { length: 80 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["available", "uploaded", "generated", "pending_upload", "awaiting_signature", "completed", "archived"]).default("generated").notNull(),
  orderId: bigint("orderId", { mode: "number", unsigned: true }),
  mortgageId: bigint("mortgageId", { mode: "number", unsigned: true }),
  investmentId: bigint("investmentId", { mode: "number", unsigned: true }),
  depositId: bigint("depositId", { mode: "number", unsigned: true }),
  withdrawalId: bigint("withdrawalId", { mode: "number", unsigned: true }),
  reference: varchar("reference", { length: 80 }),
  propertyName: varchar("propertyName", { length: 255 }),
  dataUrl: longtext("dataUrl").notNull(),
  fileSize: int("fileSize").default(0).notNull(),
  version: int("version").default(1).notNull(),
  uploadedByName: varchar("uploadedByName", { length: 255 }),
  source: mysqlEnum("source", ["generated", "uploaded"]).default("generated").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

export const documentDownloads = mysqlTable("documentDownloads", {
  id: serial("id").primaryKey(),
  documentId: bigint("documentId", { mode: "number", unsigned: true }).notNull(),
  investorId: bigint("investorId", { mode: "number", unsigned: true }),
  investorName: varchar("investorName", { length: 255 }),
  ip: varchar("ip", { length: 60 }),
  userAgent: varchar("userAgent", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DocumentDownload = typeof documentDownloads.$inferSelect;
export type InsertDocumentDownload = typeof documentDownloads.$inferInsert;

// ── CRM: Pipeline Stages (admin-customizable) ───────────────────
export const crmStages = mysqlTable("crmStages", {
  id: serial("id").primaryKey(),
  stageKey: varchar("stageKey", { length: 60 }).notNull().unique(),
  label: varchar("label", { length: 120 }).notNull(),
  color: varchar("color", { length: 20 }).default("#3b82f6").notNull(),
  kind: mysqlEnum("kind", ["open", "won", "lost"]).default("open").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CrmStage = typeof crmStages.$inferSelect;
export type InsertCrmStage = typeof crmStages.$inferInsert;

// ── CRM: Leads ──────────────────────────────────────────────────
export const leads = mysqlTable("leads", {
  id: serial("id").primaryKey(),
  leadRef: varchar("leadRef", { length: 30 }).notNull().unique(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  whatsapp: varchar("whatsapp", { length: 50 }),
  country: varchar("country", { length: 100 }),
  state: varchar("state", { length: 100 }),
  city: varchar("city", { length: 100 }),
  source: mysqlEnum("source", [
    "contact_form",
    "property_inquiry",
    "investment_inquiry",
    "mortgage_inquiry",
    "appointment_request",
    "reservation_request",
    "newsletter",
    "manual",
  ]).notNull(),
  stage: varchar("stage", { length: 60 }).default("new").notNull(),
  interestedProperty: varchar("interestedProperty", { length: 255 }),
  investmentInterest: varchar("investmentInterest", { length: 255 }),
  mortgageInterest: varchar("mortgageInterest", { length: 255 }),
  budgetRange: varchar("budgetRange", { length: 100 }),
  preferredContact: varchar("preferredContact", { length: 20 }),
  notes: text("notes"),
  assignedAdminId: bigint("assignedAdminId", { mode: "number", unsigned: true }),
  assignedAdminName: varchar("assignedAdminName", { length: 255 }),
  investorId: bigint("investorId", { mode: "number", unsigned: true }),
  lastContactAt: timestamp("lastContactAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

// ── CRM: Lead Activity Timeline (never deleted) ─────────────────
export const leadActivities = mysqlTable("leadActivities", {
  id: serial("id").primaryKey(),
  leadId: bigint("leadId", { mode: "number", unsigned: true }).notNull(),
  type: varchar("type", { length: 40 }).notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  notes: text("notes"),
  adminId: bigint("adminId", { mode: "number", unsigned: true }),
  adminName: varchar("adminName", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LeadActivity = typeof leadActivities.$inferSelect;
export type InsertLeadActivity = typeof leadActivities.$inferInsert;

// ── CRM: Follow-up Tasks ────────────────────────────────────────
export const leadFollowUps = mysqlTable("leadFollowUps", {
  id: serial("id").primaryKey(),
  leadId: bigint("leadId", { mode: "number", unsigned: true }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  dueAt: timestamp("dueAt").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  assignedAdminId: bigint("assignedAdminId", { mode: "number", unsigned: true }),
  assignedAdminName: varchar("assignedAdminName", { length: 255 }),
  status: mysqlEnum("status", ["pending", "completed", "cancelled"]).default("pending").notNull(),
  reminderSentAt: timestamp("reminderSentAt"),
  completedAt: timestamp("completedAt"),
  completedByName: varchar("completedByName", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LeadFollowUp = typeof leadFollowUps.$inferSelect;
export type InsertLeadFollowUp = typeof leadFollowUps.$inferInsert;

// ── CRM: Appointments ───────────────────────────────────────────
export const appointments = mysqlTable("appointments", {
  id: serial("id").primaryKey(),
  appointmentRef: varchar("appointmentRef", { length: 30 }).notNull().unique(),
  investorId: bigint("investorId", { mode: "number", unsigned: true }),
  leadId: bigint("leadId", { mode: "number", unsigned: true }),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  type: mysqlEnum("type", [
    "property_inspection",
    "virtual_tour",
    "office_meeting",
    "investment_consultation",
    "mortgage_consultation",
  ]).notNull(),
  productId: bigint("productId", { mode: "number", unsigned: true }),
  propertyName: varchar("propertyName", { length: 255 }),
  preferredAt: timestamp("preferredAt").notNull(),
  durationMinutes: int("durationMinutes").default(60).notNull(),
  assignedAdminId: bigint("assignedAdminId", { mode: "number", unsigned: true }),
  assignedAdminName: varchar("assignedAdminName", { length: 255 }),
  location: varchar("location", { length: 255 }),
  meetingLink: varchar("meetingLink", { length: 500 }),
  notes: text("notes"),
  adminNotes: text("adminNotes"),
  status: mysqlEnum("status", ["pending", "confirmed", "rescheduled", "completed", "cancelled", "no_show"]).default("pending").notNull(),
  cancelReason: text("cancelReason"),
  reminder24hAt: timestamp("reminder24hAt"),
  reminder1hAt: timestamp("reminder1hAt"),
  confirmedAt: timestamp("confirmedAt"),
  completedAt: timestamp("completedAt"),
  cancelledAt: timestamp("cancelledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

// ── Messaging Center: Conversations ─────────────────────────────
export const conversations = mysqlTable("conversations", {
  id: serial("id").primaryKey(),
  convRef: varchar("convRef", { length: 30 }).notNull().unique(),
  investorId: bigint("investorId", { mode: "number", unsigned: true }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  category: mysqlEnum("category", [
    "general_inquiry",
    "property_inquiry",
    "investment_support",
    "mortgage_support",
    "payment_support",
    "account_verification",
    "technical_support",
    "complaint",
    "feedback",
    "other",
  ]).notNull(),
  status: mysqlEnum("status", ["open", "closed", "archived"]).default("open").notNull(),
  priority: mysqlEnum("priority", ["low", "normal", "high", "urgent"]).default("normal").notNull(),
  lastMessageBy: mysqlEnum("lastMessageBy", ["user", "admin", "system"]).default("user").notNull(),
  lastMessageAt: timestamp("lastMessageAt"),
  userLastReadAt: timestamp("userLastReadAt"),
  adminLastReadAt: timestamp("adminLastReadAt"),
  assignedAdminId: bigint("assignedAdminId", { mode: "number", unsigned: true }),
  assignedAdminName: varchar("assignedAdminName", { length: 255 }),
  propertyName: varchar("propertyName", { length: 255 }),
  systemGenerated: mysqlEnum("systemGenerated", ["yes", "no"]).default("no").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

// ── Messaging Center: Messages ──────────────────────────────────
export const messages = mysqlTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: bigint("conversationId", { mode: "number", unsigned: true }).notNull(),
  senderType: mysqlEnum("senderType", ["user", "admin", "system"]).notNull(),
  senderName: varchar("senderName", { length: 255 }).notNull(),
  adminId: bigint("adminId", { mode: "number", unsigned: true }),
  body: text("body").notNull(),
  attachmentName: varchar("attachmentName", { length: 255 }),
  attachmentUrl: longtext("attachmentUrl"),
  attachmentSize: int("attachmentSize"),
  deleted: mysqlEnum("deleted", ["yes", "no"]).default("no").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// ── Testimonials ────────────────────────────────────────────────
export const testimonials = mysqlTable("testimonials", {
  id: serial("id").primaryKey(),
  investorId: bigint("investorId", { mode: "number", unsigned: true }),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  photo: longtext("photo"),
  propertyName: varchar("propertyName", { length: 255 }),
  investmentPlan: varchar("investmentPlan", { length: 255 }),
  mortgagePlan: varchar("mortgagePlan", { length: 255 }),
  rating: int("rating").default(5).notNull(),
  title: varchar("title", { length: 255 }),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "archived"]).default("pending").notNull(),
  featured: mysqlEnum("featured", ["yes", "no"]).default("no").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  adminNote: text("adminNote"),
  reviewedByName: varchar("reviewedByName", { length: 255 }),
  reviewedAt: timestamp("reviewedAt"),
  deletedAt: timestamp("deletedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = typeof testimonials.$inferInsert;
