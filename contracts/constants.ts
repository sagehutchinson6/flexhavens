export const Session = {
  cookieName: "kimi_sid",
  maxAgeMs: 365 * 24 * 60 * 60 * 1000,
} as const;

export const InvestorSession = {
  cookieName: "fh_investor_sid",
  maxAgeMs: 30 * 24 * 60 * 60 * 1000, // 30 days
} as const;

export const ReferralBonus = {
  // Credited to the referrer when a referred investor's first deposit is approved
  percentOfFirstDeposit: 5,
} as const;

export const LiquidationRules = {
  // Early liquidation penalty, charged as a % of the invested principal
  penaltyPercent: 10,
  // Partial-month profit accrues at 1/30 of the monthly profit per day
  daysPerMonth: 30,
} as const;

export const AdminSession = {
  cookieName: "fh_admin_sid",
  maxAgeMs: 12 * 60 * 60 * 1000, // 12 hours
} as const;

// Permissions assignable to Secondary Administrators.
// Everything NOT listed here (investor management, wallets, deposits,
// withdrawals, ROI, liquidations, financial reports, admin management,
// security settings) is exclusive to the Primary Admin.
export const AdminPermissions = [
  { key: "orders", label: "Property Orders" },
  { key: "tracking", label: "Order Tracking" },
  { key: "products", label: "Product Management" },
  { key: "content", label: "Website Content" },
  { key: "support", label: "Customer Support" },
  { key: "notifications", label: "Notifications" },
  { key: "reports", label: "Reports" },
  { key: "faqs", label: "FAQs" },
  { key: "contact", label: "Contact Messages" },
  { key: "catalog", label: "Catalog Management" },
  { key: "announcements", label: "Announcement Management" },
  { key: "crm", label: "CRM / Lead Management" },
  { key: "appointments", label: "Appointments" },
] as const;

export type AdminPermissionKey = (typeof AdminPermissions)[number]["key"];

export const ErrorMessages = {
  unauthenticated: "Authentication required",
  insufficientRole: "Insufficient permissions",
} as const;

export const Paths = {
  login: "/login",
  oauthCallback: "/api/oauth/callback",
} as const;
