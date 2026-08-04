import { getDb } from "../api/queries/connection";
import { products, investmentPlans, investmentProjects } from "./schema";

const productsData = [
  {
    name: "The Amber Terrace",
    slug: "compact-solo",
    category: "2br" as const,
    price: "38500000.00",
    size: "180m2",
    bedrooms: 2,
    bathrooms: 3,
    images: JSON.stringify(["/images/home-exterior-1.jpg", "/images/interior-1.jpg", "/images/interior-2.jpg", "/images/interior-3.jpg"]),
    specs: JSON.stringify({
      "Property Type": "2-Bedroom Terrace Duplex",
      "Bedrooms": "2 (all en-suite)",
      "Bathrooms": "3",
      "Plot Size": "250m2",
      "Floor Area": "180m2",
      "Parking Spaces": "2",
      "Swimming Pool": "No",
      "Smart Home Features": "Smart lighting, video doorbell, automated gate",
      "Security Features": "Gated estate, 24/7 security patrol, CCTV coverage",
      "Estate Name": "Amber Gardens Estate",
      "Location": "Lokogoma District, Abuja, FCT",
      "Completion Status": "Completed — ready for immediate handover",
      "Title": "Certificate of Occupancy (C of O)",
      "Finishing": "Fully finished with fitted kitchen and wardrobes"
    }),
    features: JSON.stringify(["All rooms en-suite", "Fitted kitchen with cabinets", "POP ceiling finishes", "Borehole water supply", "Interlocked compound", "Serene gated estate"]),
    delivery: "Ready for immediate handover",
    warranty: "Verified title documents (C of O)",
    description: "An elegant 2-bedroom terrace duplex in the serene Amber Gardens Estate, Lokogoma. Finished to a premium standard with all rooms en-suite, a fitted kitchen, and smart entry features — perfect for young professionals, small families, or as a high-yield investment property in Abuja's fast-growing Lokogoma corridor.",
    mortgageEnabled: "yes" as const,
    minDownPaymentPercent: "30.00",
  },
  {
    name: "The Maple Court",
    slug: "urban-nest",
    category: "3br" as const,
    price: "48000000.00",
    size: "220m2",
    bedrooms: 3,
    bathrooms: 4,
    images: JSON.stringify(["/images/home-exterior-2.jpg", "/images/interior-4.jpg", "/images/interior-2.jpg", "/images/interior-3.jpg"]),
    specs: JSON.stringify({
      "Property Type": "3-Bedroom Terrace House",
      "Bedrooms": "3 (all en-suite)",
      "Bathrooms": "4",
      "Plot Size": "300m2",
      "Floor Area": "220m2",
      "Parking Spaces": "2",
      "Swimming Pool": "No",
      "Smart Home Features": "Smart lighting, inverter backup, video intercom",
      "Security Features": "Gated estate, 24/7 uniformed guards, CCTV, electric fence",
      "Estate Name": "Maple Court Estate",
      "Location": "Gwarinpa, Abuja, FCT",
      "Completion Status": "Completed — ready for immediate handover",
      "Title": "Certificate of Occupancy (C of O)",
      "Finishing": "Premium finishing with imported fittings"
    }),
    features: JSON.stringify(["Spacious family lounge", "Boys' quarters (BQ)", "Fitted kitchen with pantry", "Inverter backup system", "Landscaped surroundings", "Tarred estate roads"]),
    delivery: "Ready for immediate handover",
    warranty: "Verified title documents (C of O)",
    description: "A beautifully finished 3-bedroom terrace house in the heart of Gwarinpa, Abuja's largest and most desirable residential district. With a boys' quarter, inverter backup, and 24/7 estate security, The Maple Court is the ideal family home in a mature, fully serviced neighbourhood.",
    mortgageEnabled: "yes" as const,
    minDownPaymentPercent: "30.00",
  },
  {
    name: "The Cedar Residence",
    slug: "studio-deluxe",
    category: "4br" as const,
    price: "67500000.00",
    size: "300m2",
    bedrooms: 4,
    bathrooms: 5,
    images: JSON.stringify(["/images/home-exterior-3.jpg", "/images/interior-5.jpg", "/images/interior-1.jpg", "/images/interior-4.jpg"]),
    specs: JSON.stringify({
      "Property Type": "4-Bedroom Semi-Detached Duplex",
      "Bedrooms": "4 (all en-suite)",
      "Bathrooms": "5",
      "Plot Size": "350m2",
      "Floor Area": "300m2",
      "Parking Spaces": "3",
      "Swimming Pool": "No",
      "Smart Home Features": "Full home automation, smart locks, automated lighting & climate",
      "Security Features": "Gated estate, 24/7 security, CCTV, perimeter fencing, intercom",
      "Estate Name": "Cedar Heights Estate",
      "Location": "Life Camp, Abuja, FCT",
      "Completion Status": "Completed — ready for immediate handover",
      "Title": "Certificate of Occupancy (C of O)",
      "Finishing": "Luxury finishing — marble floors, bespoke joinery"
    }),
    features: JSON.stringify(["Home automation throughout", "Family lounge upstairs", "Boys' quarters (BQ)", "Fully fitted designer kitchen", "Walk-in closets", "Ample parking for 3 cars"]),
    delivery: "Ready for immediate handover",
    warranty: "Verified title documents (C of O)",
    description: "A smart 4-bedroom semi-detached duplex in the prestigious Life Camp district. The Cedar Residence blends full home automation with luxury finishing — marble floors, bespoke joinery, and a designer kitchen — minutes from the city centre and top international schools.",
    mortgageEnabled: "yes" as const,
    minDownPaymentPercent: "25.00",
  },
  {
    name: "The Palm Haven",
    slug: "family-starter",
    category: "4br" as const,
    price: "85000000.00",
    size: "340m2",
    bedrooms: 4,
    bathrooms: 5,
    images: JSON.stringify(["/images/home-exterior-4.jpg", "/images/interior-2.jpg", "/images/interior-5.jpg", "/images/interior-3.jpg"]),
    specs: JSON.stringify({
      "Property Type": "4-Bedroom Detached Duplex",
      "Bedrooms": "4 (all en-suite)",
      "Bathrooms": "5",
      "Plot Size": "500m2",
      "Floor Area": "340m2",
      "Parking Spaces": "4",
      "Swimming Pool": "Yes — private pool",
      "Smart Home Features": "Smart home controls, automated gate, solar hybrid power",
      "Security Features": "Gated estate, 24/7 armed response, CCTV, electric perimeter fence",
      "Estate Name": "Palm Haven Estate",
      "Location": "Kado Estate, Abuja, FCT",
      "Completion Status": "Completed — ready for immediate handover",
      "Title": "Certificate of Occupancy (C of O)",
      "Finishing": "Executive finishing with premium sanitary ware"
    }),
    features: JSON.stringify(["Private swimming pool", "Solar hybrid power system", "Detached boys' quarters", "Landscaped gardens", "Family lounge + study", "Ample parking for 4 cars"]),
    delivery: "Ready for immediate handover",
    warranty: "Verified title documents (C of O)",
    description: "An impressive 4-bedroom fully detached duplex with a private swimming pool in the well-established Kado district. Solar hybrid power, landscaped gardens, and executive finishes make The Palm Haven a standout family residence close to Jabi Lake and the city centre.",
    mortgageEnabled: "yes" as const,
    minDownPaymentPercent: "25.00",
  },
  {
    name: "The Ivory Villa",
    slug: "comfort-duo",
    category: "4br" as const,
    price: "110000000.00",
    size: "420m2",
    bedrooms: 5,
    bathrooms: 6,
    images: JSON.stringify(["/images/home-exterior-5.jpg", "/images/interior-3.jpg", "/images/interior-4.jpg", "/images/interior-1.jpg"]),
    specs: JSON.stringify({
      "Property Type": "5-Bedroom Detached Duplex",
      "Bedrooms": "5 (all en-suite)",
      "Bathrooms": "6",
      "Plot Size": "600m2",
      "Floor Area": "420m2",
      "Parking Spaces": "4",
      "Swimming Pool": "Yes — private pool with deck",
      "Smart Home Features": "Full automation, smart security, climate & lighting scenes",
      "Security Features": "Gated estate, 24/7 armed security, CCTV, panic room wiring",
      "Estate Name": "Ivory Courts",
      "Location": "Jabi, Abuja, FCT",
      "Completion Status": "Completed — ready for immediate handover",
      "Title": "Certificate of Occupancy (C of O)",
      "Finishing": "Contemporary luxury — Italian tiles, designer lighting"
    }),
    features: JSON.stringify(["Private pool with sun deck", "Rooftop terrace", "Home office / study", "2-room boys' quarters", "Chef's kitchen with island", "Walk-in dressing rooms"]),
    delivery: "Ready for immediate handover",
    warranty: "Verified title documents (C of O)",
    description: "A striking 5-bedroom detached villa moments from Jabi Lake. The Ivory Villa offers a private pool with sun deck, rooftop terrace, chef's kitchen, and full smart-home automation — contemporary luxury living in one of Abuja's most connected neighbourhoods.",
    mortgageEnabled: "yes" as const,
    minDownPaymentPercent: "25.00",
  },
  {
    name: "The Sapphire Villa",
    slug: "family-haven",
    category: "4br" as const,
    price: "145000000.00",
    size: "480m2",
    bedrooms: 5,
    bathrooms: 6,
    images: JSON.stringify(["/images/home-exterior-6.jpg", "/images/interior-5.jpg", "/images/interior-2.jpg", "/images/interior-4.jpg"]),
    specs: JSON.stringify({
      "Property Type": "5-Bedroom Executive Villa",
      "Bedrooms": "5 (all en-suite)",
      "Bathrooms": "6",
      "Plot Size": "800m2",
      "Floor Area": "480m2",
      "Parking Spaces": "5",
      "Swimming Pool": "Yes — infinity-edge pool",
      "Smart Home Features": "Whole-villa automation, voice control, smart irrigation",
      "Security Features": "Gated diplomatic estate, 24/7 armed security, biometric access, CCTV",
      "Estate Name": "Sapphire Hills Estate",
      "Location": "Katampe Extension, Abuja, FCT",
      "Completion Status": "Completed — ready for immediate handover",
      "Title": "Certificate of Occupancy (C of O)",
      "Finishing": "Ultra-premium — natural stone, hardwood accents"
    }),
    features: JSON.stringify(["Infinity-edge swimming pool", "Private cinema room", "Gym & sauna", "2-room boys' quarters", "Panoramic hillside views", "Smart irrigation gardens"]),
    delivery: "Ready for immediate handover",
    warranty: "Verified title documents (C of O)",
    description: "An executive 5-bedroom villa on the hills of Katampe Extension, Abuja's diplomatic enclave. An infinity-edge pool, private cinema, gym and sauna, and panoramic city views define The Sapphire Villa — a residence built for those who entertain and unwind in style.",
    mortgageEnabled: "yes" as const,
    minDownPaymentPercent: "20.00",
  },
  {
    name: "The Royal Guzape Mansion",
    slug: "grand-estate",
    category: "4br" as const,
    price: "185000000.00",
    size: "560m2",
    bedrooms: 6,
    bathrooms: 7,
    images: JSON.stringify(["/images/home-exterior-1.jpg", "/images/interior-4.jpg", "/images/interior-5.jpg", "/images/interior-1.jpg"]),
    specs: JSON.stringify({
      "Property Type": "6-Bedroom Mansion",
      "Bedrooms": "6 (all en-suite)",
      "Bathrooms": "7",
      "Plot Size": "1,000m2",
      "Floor Area": "560m2",
      "Parking Spaces": "6",
      "Swimming Pool": "Yes — resort-style pool & pool house",
      "Smart Home Features": "Estate-wide automation, biometric entry, intelligent energy management",
      "Security Features": "Gated estate, 24/7 armed security detail, bullet-resistant glazing, CCTV, panic room",
      "Estate Name": "Royal Palms Reserve",
      "Location": "Guzape District, Abuja, FCT",
      "Completion Status": "Completed — ready for immediate handover",
      "Title": "Certificate of Occupancy (C of O)",
      "Finishing": "Palatial — imported marble, crystal fittings"
    }),
    features: JSON.stringify(["Resort-style pool & pool house", "Grand double-volume lobby", "Private elevator", "Wine cellar", "Staff quarters for 4", "Manicured 1,000m2 grounds"]),
    delivery: "Ready for immediate handover",
    warranty: "Verified title documents (C of O)",
    description: "A palatial 6-bedroom mansion in Guzape, one of Abuja's most exclusive districts. A grand double-volume lobby, private elevator, wine cellar, and resort-style pool across 1,000m2 of manicured grounds — The Royal Guzape Mansion is a statement of arrival.",
    mortgageEnabled: "yes" as const,
    minDownPaymentPercent: "20.00",
  },
  {
    name: "The Maitama Presidential",
    slug: "luxury-villa",
    category: "4br" as const,
    price: "250000000.00",
    size: "720m2",
    bedrooms: 7,
    bathrooms: 8,
    images: JSON.stringify(["/images/home-exterior-2.jpg", "/images/interior-5.jpg", "/images/interior-3.jpg", "/images/interior-1.jpg"]),
    specs: JSON.stringify({
      "Property Type": "7-Bedroom Presidential Mansion",
      "Bedrooms": "7 (all en-suite, 2 master suites)",
      "Bathrooms": "8",
      "Plot Size": "1,500m2",
      "Floor Area": "720m2",
      "Parking Spaces": "8",
      "Swimming Pool": "Yes — Olympic-length pool & spa",
      "Smart Home Features": "Full estate automation, facial-recognition entry, smart glass, energy AI",
      "Security Features": "Diplomatic-grade security, 24/7 armed detail, safe room, perimeter surveillance",
      "Estate Name": "Maitama Heights",
      "Location": "Maitama, Abuja, FCT",
      "Completion Status": "Completed — ready for immediate handover",
      "Title": "Certificate of Occupancy (C of O)",
      "Finishing": "Presidential — rare marbles, gold-leaf detailing, bespoke everything"
    }),
    features: JSON.stringify(["Olympic-length pool & spa", "Two master suites", "Private elevator & grand staircase", "Banquet hall for 60 guests", "Home cinema & games lounge", "Staff wing for 6"]),
    delivery: "Ready for immediate handover",
    warranty: "Verified title documents (C of O)",
    description: "The crown jewel of our collection — a 7-bedroom presidential mansion in Maitama, Abuja's most prestigious address. Olympic-length pool and spa, banquet hall for 60, two master suites, and diplomatic-grade security across 1,500m2 of prime land. The Maitama Presidential is, quite simply, the finest residence we have ever delivered.",
    mortgageEnabled: "yes" as const,
    minDownPaymentPercent: "20.00",
  },
];

const plansData = [
  {
    name: "Starter",
    slug: "starter",
    minAmount: "1000.00",
    targetReturn: 40,
    durationMonths: 6,
    featured: "no" as const,
    description:
      "Perfect for first-time investors. Dip your toes into real estate investing with a low minimum and a short 6-month term.",
    features: JSON.stringify([
      "Minimum investment ₦1,000",
      "Target return up to 40%",
      "6-month investment term",
      "Monthly profit payouts",
      "Email support",
      "Early exit after 90 days",
    ]),
    isActive: "yes" as const,
    sortOrder: 1,
  },
  {
    name: "Growth",
    slug: "growth",
    minAmount: "5000.00",
    targetReturn: 55,
    durationMonths: 12,
    featured: "no" as const,
    description:
      "Our most balanced plan. A full 12-month term across diversified luxury real estate projects with higher target returns.",
    features: JSON.stringify([
      "Minimum investment ₦5,000",
      "Target return up to 55%",
      "12-month investment term",
      "Monthly profit payouts",
      "Priority support",
      "Diversified project allocation",
      "Compound earnings option",
    ]),
    isActive: "yes" as const,
    sortOrder: 2,
  },
  {
    name: "Premium",
    slug: "premium",
    minAmount: "10000.00",
    targetReturn: 70,
    durationMonths: 18,
    featured: "yes" as const,
    description:
      "Maximum growth potential. An 18-month term across our flagship development portfolio with the highest target returns.",
    features: JSON.stringify([
      "Minimum investment ₦10,000",
      "Target return up to 70%",
      "18-month investment term",
      "Monthly profit payouts",
      "Dedicated account manager",
      "Priority project access",
      "Compound earnings option",
      "Exclusive investor events",
    ]),
    isActive: "yes" as const,
    sortOrder: 3,
  },
];

const projectsData = [
  {
    name: "Sunrise Ridge Development",
    location: "Lokogoma District, Abuja",
    category: "Residential",
    description:
      "A 24-unit luxury terrace community in Abuja's fast-growing Lokogoma corridor, targeting young professionals and families seeking premium, secure estate living.",
    image: null as string | null,
    targetAmount: "250000.00",
    expectedReturn: 40,
    durationMonths: 6,
    status: "funding" as const,
  },
  {
    name: "Lakeside Eco Village",
    location: "Jabi Lakefront, Abuja",
    category: "Eco Living",
    description:
      "A waterfront collection of 40 solar-hybrid luxury villas with shared green spaces, landscaped gardens, and smart energy management near Jabi Lake.",
    image: null as string | null,
    targetAmount: "500000.00",
    expectedReturn: 55,
    durationMonths: 12,
    status: "funding" as const,
  },
  {
    name: "Metro Flex Apartments",
    location: "Victoria Island, Lagos",
    category: "Mixed Use",
    description:
      "Flagship luxury apartment complex combining premium residential units with ground-floor retail in Lagos's prime Victoria Island business corridor.",
    image: null as string | null,
    targetAmount: "1000000.00",
    expectedReturn: 70,
    durationMonths: 18,
    status: "funding" as const,
  },
];

async function seed() {
  const db = getDb();

  console.log("Seeding products...");

  for (const product of productsData) {
    // Check if product already exists
    const existing = await db.select().from(products).where(eq(products.slug, product.slug));
    if (existing.length === 0) {
      await db.insert(products).values(product);
      console.log(`  Created: ${product.name}`);
    } else {
      console.log(`  Exists: ${product.name}`);
    }
  }

  console.log("Seeding investment plans...");

  for (const plan of plansData) {
    const existing = await db.select().from(investmentPlans).where(eq(investmentPlans.slug, plan.slug));
    if (existing.length === 0) {
      await db.insert(investmentPlans).values(plan);
      console.log(`  Created: ${plan.name} Plan`);
    } else {
      console.log(`  Exists: ${plan.name} Plan`);
    }
  }

  console.log("Seeding investment projects...");

  for (const project of projectsData) {
    const existing = await db
      .select()
      .from(investmentProjects)
      .where(eq(investmentProjects.name, project.name));
    if (existing.length === 0) {
      await db.insert(investmentProjects).values(project);
      console.log(`  Created: ${project.name}`);
    } else {
      console.log(`  Exists: ${project.name}`);
    }
  }

  console.log("Seed complete!");
}

// Need to import eq
import { eq } from "drizzle-orm";

seed().catch(console.error);
