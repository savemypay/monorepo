export type CategorySlug =
  | "insurance"
  | "property-deals"
  | "automotive"
  | "ecommerce"
  | "travel"
  | "healthcare";

type SectionCard = {
  title: string;
  description: string;
};

type SectionStep = {
  title: string;
  description: string;
};

type HeroStat = {
  value: string;
  label: string;
};

type BaseSection = {
  eyebrow?: string;
  title: string;
  description?: string;
  tone?: "default" | "muted" | "dark";
};

export type CardsSection = BaseSection & {
  type: "cards";
  cards: SectionCard[];
};

export type SplitSection = BaseSection & {
  type: "split";
  visualTitle: string;
  visualDescription: string;
  bullets: string[];
};

export type StepsSection = BaseSection & {
  type: "steps";
  steps: SectionStep[];
};

export type HighlightSection = BaseSection & {
  type: "highlight";
  highlightTitle: string;
  highlightDescription: string;
  cards: SectionCard[];
};

export type CategorySection = CardsSection | SplitSection | StepsSection | HighlightSection;

export type CategoryPageData = {
  slug: CategorySlug;
  categoryLabel: string;
  metaTitle: string;
  metaDescription: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroSavings: string;
  heroStats?: HeroStat[];
  sections: CategorySection[];
  ctaTitle: string;
  ctaDescription: string;
  ctaLabel: string;
};

export const CATEGORY_PAGE_CONTENT: Record<CategorySlug, CategoryPageData> = {
  insurance: {
    slug: "insurance",
    categoryLabel: "Insurance Plans",
    metaTitle: "Insurance Group Buying Deals | SaveMyPay",
    metaDescription:
      "Compare and join group insurance plans on SaveMyPay to unlock corporate-level premium pricing on health, life, and home coverage with transparent benefits.",
    heroBadge: "Group Insurance Pricing",
    heroTitle: "Insurance Plans That Don’t Rob You Blind",
    heroSubtitle:
      "Access corporate-level health, life, and home insurance premiums through SaveMyPay’s group buying platform for salaried professionals and families.",
    heroSavings: "Save 20-35% on premiums through group buying",
    sections: [
      {
        type: "cards",
        title: "Why pay full retail when you can save thousands?",
        description:
          "Bulk negotiation lets individual buyers access enterprise insurance pricing, better policy value, and clearer decision-making.",
        cards: [
          {
            title: "Corporate pricing for everyone",
            description:
              "Large companies secure lower insurance premiums by negotiating volume. SaveMyPay brings the same leverage by aggregating individual buyer demand.",
          },
          {
            title: "Health insurance made affordable",
            description:
              "Get group health insurance rates for individuals and families with the same coverage and insurer quality, but at lower premium costs.",
          },
          {
            title: "Home and life coverage",
            description:
              "Protect your home and family with group pricing on life and property insurance plans that are usually priced higher for solo buyers.",
          },
          {
            title: "Transparent comparison",
            description:
              "We negotiate with top insurers and show clear comparisons so you can choose the policy that fits your family’s risk profile and budget.",
          },
          {
            title: "Fast group formation",
            description:
              "Express interest, join a matching group, and unlock negotiated pricing in a short cycle designed for fast, transparent closures.",
          },
          {
            title: "Rewards on premium payments",
            description:
              "Every completed payment can earn platform rewards, helping you convert essential expenses into long-term value.",
          },
        ],
      },
      {
        type: "cards",
        tone: "muted",
        title: "What you get through SaveMyPay",
        cards: [
          {
            title: "20-35% lower premiums",
            description:
              "Group pricing can reduce annual insurance outflow significantly compared with standard market retail plans.",
          },
          {
            title: "Same coverage, better pricing",
            description:
              "No compromise on benefits, claim process, or insurer quality. The advantage comes from group negotiation leverage.",
          },
          {
            title: "Top-rated insurers only",
            description:
              "We prioritize partners with strong settlement reputation and dependable support so your protection remains trustworthy.",
          },
          {
            title: "Rewards enabled payments",
            description:
              "Use the SaveMyPay ecosystem to earn additional value as you pay for essential insurance protection.",
          },
          {
            title: "No hidden buyer-side fee",
            description:
              "Pricing and terms are transparent, with clear communication on how each group deal is structured.",
          },
          {
            title: "Renewal continuity",
            description:
              "As groups scale, renewal cycles can continue to benefit from stronger volume-based pricing and better negotiations.",
          },
        ],
      },
    ],
    ctaTitle: "Stop overpaying for insurance",
    ctaDescription:
      "Join insured buyers on SaveMyPay and unlock group rates built for salaried professionals.",
    ctaLabel: "Get Group Insurance Rates",
  },
  "property-deals": {
    slug: "property-deals",
    categoryLabel: "Property Deals",
    metaTitle: "Property Group Deals & Corporate Farming | SaveMyPay",
    metaDescription:
      "Explore SaveMyPay property group deals for residential, rental, and farmland opportunities. Unlock lower investment entry with collective buying and transparent ownership.",
    heroBadge: "Property + Corporate Farming",
    heroTitle: "Property Deals with Collective Ownership Power",
    heroSubtitle:
      "Unlock bulk property opportunities and future-ready corporate farming models through shared investment and group negotiation.",
    heroSavings: "Save up to 12% on property deals and reduce farming costs by up to 40%",
    heroStats: [
      { value: "12%", label: "Average property savings" },
      { value: "40%", label: "Lower farming costs" },
      { value: "100+", label: "Professionals participating" },
    ],
    sections: [
      {
        type: "cards",
        eyebrow: "The Challenge",
        title: "Why traditional property and farming models are failing",
        cards: [
          {
            title: "High individual property costs",
            description:
              "Solo buyers typically pay full market pricing with limited negotiation leverage for premium locations and high-demand assets.",
          },
          {
            title: "Small-scale farming pressure",
            description:
              "Input costs continue to rise, making single-owner small acreage farming less sustainable year over year.",
          },
          {
            title: "One-acre economics don’t scale",
            description:
              "Land, labor, irrigation, and equipment costs make isolated farming investments inefficient for most urban professionals.",
          },
          {
            title: "Salaried buyers are locked out",
            description:
              "Many professionals want land exposure, but high entry tickets and management overhead block participation.",
          },
        ],
      },
      {
        type: "split",
        tone: "muted",
        eyebrow: "The SaveMyPay Solution",
        title: "Group buying transforms property and farming access",
        visualTitle: "Corporate Agriculture Model",
        visualDescription:
          "When buyers pool capital and demand, corporate-scale opportunities become accessible with lower per-person exposure.",
        bullets: [
          "Group land purchase: 50-100 members can target 25-50 acre opportunities",
          "Professional management: execute with experienced agriculture operators",
          "Economies of scale: shared machinery, procurement, irrigation, and labor",
          "Lower entry ticket: avoid single-owner high capital concentration",
          "Structured profit distribution: returns allocated transparently",
          "Web3-ready records: digital-first ownership and earnings visibility",
        ],
      },
      {
        type: "steps",
        tone: "dark",
        title: "How SaveMyPay makes it happen",
        steps: [
          {
            title: "Express interest",
            description:
              "Tell us whether you need property purchase, rental opportunities, or farmland investment exposure.",
          },
          {
            title: "We build your group",
            description:
              "Demand is grouped by intent so negotiations are backed by real, qualified collective volume.",
          },
          {
            title: "Negotiate together",
            description:
              "We work with developers, landowners, and experts to secure bulk pricing and better commercial terms.",
          },
          {
            title: "Confirm and own",
            description:
              "Review terms, finalize participation, and access structured ownership under a transparent model.",
          },
        ],
      },
      {
        type: "highlight",
        eyebrow: "Our Vision",
        title: "The future of agriculture and land access in India",
        highlightTitle: "Corporate farming for everyone",
        highlightDescription:
          "SaveMyPay democratizes access to land-backed opportunities by combining group purchasing, professional operations, and transparent member participation.",
        cards: [
          {
            title: "What we’re building",
            description:
              "Residential and commercial property pools, collective farmland opportunities, and bulk rental agreements in high-demand areas.",
          },
          {
            title: "Why it works",
            description:
              "Lower per-person investment, shared risk, expert execution, and potential passive income from scaled operations.",
          },
          {
            title: "Who it’s for",
            description:
              "Salaried professionals, NRIs, and future-focused buyers seeking practical entry into property and agriculture exposure.",
          },
        ],
      },
    ],
    ctaTitle: "Join the property and agriculture transition",
    ctaDescription:
      "Express interest to access upcoming group opportunities without immediate commitment.",
    ctaLabel: "Express Interest",
  },
  automotive: {
    slug: "automotive",
    categoryLabel: "Automotive",
    metaTitle: "Automotive Group Deals & Fleet Pricing | SaveMyPay",
    metaDescription:
      "Get fleet-level pricing on new and pre-owned vehicles through SaveMyPay group buying. Compare offers, join buyer pools, and reduce total purchase cost.",
    heroBadge: "Automotive Group Deals",
    heroTitle: "Fleet-level automotive pricing for individual buyers",
    heroSubtitle:
      "Access dealer-level discounts on new and pre-owned vehicles through verified bulk demand and fast group closures.",
    heroSavings: "Save 10-18% on your next car purchase",
    sections: [
      {
        type: "cards",
        title: "Why buy alone when groups get better deals?",
        cards: [
          {
            title: "Fleet pricing for individuals",
            description:
              "Auto dealers reserve their best discounts for volume buyers. SaveMyPay aggregates demand to unlock similar pricing for individuals.",
          },
          {
            title: "New and pre-owned options",
            description:
              "Participate in group deals for both new models and certified pre-owned inventory from trusted seller networks.",
          },
          {
            title: "Subscription model roadmap",
            description:
              "Upcoming subscription-led access will target flexible monthly vehicle usage with improved commercial terms.",
          },
          {
            title: "Service and maintenance add-ons",
            description:
              "Group leverage can also extend to service packages, warranties, and related ownership cost optimization.",
          },
          {
            title: "Fast deal closure",
            description:
              "Interest capture, group formation, negotiated quote, and closure are optimized for predictable timelines.",
          },
          {
            title: "Rewards on major purchases",
            description:
              "Large-ticket automotive purchases can generate meaningful ecosystem rewards after transaction completion.",
          },
        ],
      },
    ],
    ctaTitle: "Ready to save on your next vehicle?",
    ctaDescription:
      "Join an automotive buyer pool and unlock data-backed group pricing.",
    ctaLabel: "Get Fleet Pricing",
  },
  ecommerce: {
    slug: "ecommerce",
    categoryLabel: "E-Commerce",
    metaTitle: "E-Commerce Group Buying Deals | SaveMyPay",
    metaDescription:
      "Save on groceries, gadgets, and everyday essentials using SaveMyPay e-commerce group buying. Unlock bulk discounts from major marketplace vendors.",
    heroBadge: "Bulk E-Commerce Discounts",
    heroTitle: "Daily essentials at wholesale-level pricing",
    heroSubtitle:
      "Use group demand to lower monthly shopping costs across groceries, electronics, and household staples you already buy.",
    heroSavings: "Save 15-25% on recurring shopping",
    sections: [
      {
        type: "cards",
        title: "Stop paying retail for recurring monthly purchases",
        cards: [
          {
            title: "Bulk discount access",
            description:
              "When demand is aggregated across buyers, sellers can provide significantly better pricing than isolated retail orders.",
          },
          {
            title: "Monthly essentials bundles",
            description:
              "Get structured bundles on staples and household items with predictable delivery and better unit economics.",
          },
          {
            title: "Gadget group buys",
            description:
              "Express product interest, join a cohort, and unlock negotiated pricing on high-value electronics.",
          },
          {
            title: "Subscription-ready model",
            description:
              "Planned recurring bundles can help lock pricing and improve monthly planning for families and professionals.",
          },
          {
            title: "Marketplace partner network",
            description:
              "SaveMyPay is designed to secure stronger commercial terms from leading digital commerce ecosystems.",
          },
          {
            title: "Reward-backed purchases",
            description:
              "Routine spending can generate additional ecosystem value, turning essentials into long-term advantage.",
          },
        ],
      },
    ],
    ctaTitle: "Start saving on purchases you already make",
    ctaDescription:
      "Join e-commerce cohorts and unlock better pricing across everyday categories.",
    ctaLabel: "Join E-Commerce Groups",
  },
  travel: {
    slug: "travel",
    categoryLabel: "Travel & Stays",
    metaTitle: "Travel Group Deals on Flights, Hotels & Stays | SaveMyPay",
    metaDescription:
      "Access corporate-style travel rates on flights, hotels, and local transport through SaveMyPay group bookings and demand pooling.",
    heroBadge: "Travel & Stays",
    heroTitle: "Travel like a corporate buyer, pay like a smart group",
    heroSubtitle:
      "Unlock lower rates on flights, hotels, cabs, and holiday plans through community-led booking power.",
    heroSavings: "Save 20-30% on every trip",
    sections: [
      {
        type: "cards",
        title: "Travel smarter with aggregated demand",
        cards: [
          {
            title: "Group hotel bookings",
            description:
              "Bulk booking intent can unlock stronger room rates and package terms in popular destinations.",
          },
          {
            title: "Flight deal cohorts",
            description:
              "Route-aligned travel groups help secure better airfare pricing than standard individual bookings.",
          },
          {
            title: "Cab and transport value",
            description:
              "Group-negotiated mobility rates support airport transfers, city travel, and intercity movement.",
          },
          {
            title: "Holiday package optimization",
            description:
              "Community-driven package demand improves affordability for domestic and international travel plans.",
          },
          {
            title: "Subscription travel roadmap",
            description:
              "Future travel credits and recurring models target predictable yearly travel costs for members.",
          },
          {
            title: "Rewards on bookings",
            description:
              "Trip spend can convert into rewards for future use, strengthening value over repeated travel cycles.",
          },
        ],
      },
    ],
    ctaTitle: "Stop overpaying for travel",
    ctaDescription:
      "Join travel pools and unlock better group rates for your next journey.",
    ctaLabel: "Get Travel Deals",
  },
  healthcare: {
    slug: "healthcare",
    categoryLabel: "Healthcare",
    metaTitle: "Healthcare Group Deals on Diagnostics, Telehealth & Medicines | SaveMyPay",
    metaDescription:
      "Reduce healthcare expenses with SaveMyPay group deals on diagnostics, teleconsultations, medicines, and preventive care subscriptions.",
    heroBadge: "Healthcare Deals",
    heroTitle: "Quality healthcare should not break your budget",
    heroSubtitle:
      "Get discounted diagnostics, telehealth, pharmacy access, and preventive care through a trusted group buying model.",
    heroSavings: "Save 30-40% on healthcare costs",
    sections: [
      {
        type: "cards",
        title: "Healthcare value through collective pricing",
        cards: [
          {
            title: "Group pharmacy discounts",
            description:
              "Reduce recurring medicine costs with aggregated procurement across common and chronic care categories.",
          },
          {
            title: "Diagnostic test packages",
            description:
              "Access negotiated rates for diagnostics and full-body health packages with transparent pricing.",
          },
          {
            title: "Telehealth subscriptions",
            description:
              "Use subscription-oriented consultation models that reduce per-visit friction and cost for families.",
          },
          {
            title: "Preventive care bundles",
            description:
              "Combine annual checks, screenings, and routine care services under group-negotiated structures.",
          },
          {
            title: "Subscription healthcare roadmap",
            description:
              "Coming models target predictable monthly healthcare planning with wider access and lower volatility.",
          },
          {
            title: "Rewards on health spend",
            description:
              "Healthcare spending can generate platform rewards, helping improve long-term financial wellness.",
          },
        ],
      },
    ],
    ctaTitle: "Healthcare you can actually afford",
    ctaDescription:
      "Join healthcare groups and access corporate-like pricing on essential services.",
    ctaLabel: "Get Healthcare Deals",
  },
};

export const CATEGORY_PAGE_SLUGS = Object.keys(CATEGORY_PAGE_CONTENT) as CategorySlug[];

export function getCategoryPage(slug: string) {
  if (!(slug in CATEGORY_PAGE_CONTENT)) {
    return null;
  }

  return CATEGORY_PAGE_CONTENT[slug as CategorySlug];
}
