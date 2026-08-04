// Fallback plan data used when the API is unreachable (e.g. offline preview).
// The live source of truth is the investmentPlans table via trpc.investor.plans.
export interface PlanDisplay {
  id: number;
  name: string;
  slug: string;
  minAmount: string;
  targetReturn: number;
  durationMonths: number;
  featured: "yes" | "no";
  description: string | null;
  features: unknown;
  isActive: "yes" | "no";
  sortOrder: number;
}

export const fallbackPlans: PlanDisplay[] = [
  {
    id: 1,
    name: "Starter",
    slug: "starter",
    minAmount: "1000.00",
    targetReturn: 40,
    durationMonths: 6,
    featured: "no",
    description:
      "Perfect for first-time investors. Dip your toes into real estate investing with a low minimum and a short 6-month term.",
    features: JSON.stringify([
      "Minimum investment ₦1,000",
      "Target return up to 12%",
      "6-month investment term",
      "Quarterly earnings reports",
      "Email support",
      "Early exit after 90 days",
    ]),
    isActive: "yes",
    sortOrder: 1,
  },
  {
    id: 2,
    name: "Growth",
    slug: "growth",
    minAmount: "50000.00",
    targetReturn: 55,
    durationMonths: 12,
    featured: "no",
    description:
      "Our most balanced plan. A full 12-month term across diversified luxury real estate projects with higher target returns.",
    features: JSON.stringify([
      "Minimum investment ₦50,000",
      "Target return up to 15%",
      "12-month investment term",
      "Monthly earnings reports",
      "Priority support",
      "Diversified project allocation",
      "Compound earnings option",
    ]),
    isActive: "yes",
    sortOrder: 2,
  },
  {
    id: 3,
    name: "Premium",
    slug: "premium",
    minAmount: "100000.00",
    targetReturn: 70,
    durationMonths: 18,
    featured: "yes",
    description:
      "Maximum growth potential. An 18-month term across our flagship development portfolio with the highest target returns.",
    features: JSON.stringify([
      "Minimum investment ₦100,000",
      "Target return up to 20%",
      "18-month investment term",
      "Weekly earnings reports",
      "Dedicated account manager",
      "Priority project access",
      "Compound earnings option",
      "Exclusive investor events",
    ]),
    isActive: "yes",
    sortOrder: 3,
  },
];

export function parsePlanFeatures(features: unknown): string[] {
  if (Array.isArray(features)) return features.map(String);
  if (typeof features === "string") {
    try {
      const parsed = JSON.parse(features);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}
