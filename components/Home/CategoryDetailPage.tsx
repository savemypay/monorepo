import Link from "next/link";
import type { CategoryPageData, CategorySection } from "@/lib/category-pages";

const THEME = {
  pageBg: "bg-[#f5f4f6]",
  sectionBg: "bg-white",
  sectionMutedBg: "bg-[#f9f7f3]",
  heroBg: "bg-[linear-gradient(135deg,#0f2347_0%,#1b3a6b_55%,#163B63_100%)]",
  darkCardBg: "bg-[linear-gradient(135deg,#0f2347_0%,#1b3a6b_60%,#163B63_100%)]",
  border: "border-[#e0e8f0]",
  textPrimary: "text-[#163B63]",
  textMuted: "text-[#5a7090]",
  accentGold: "text-[#e8a830]",
  accentTeal: "text-[#6ec6c0]",
};

function sectionToneClasses(tone: CategorySection["tone"]) {
  if (tone === "dark") {
    return "border-[rgba(232,168,48,0.25)] bg-[linear-gradient(135deg,#0f2347_0%,#1b3a6b_60%,#163B63_100%)] text-white";
  }

  if (tone === "muted") {
    return `${THEME.sectionMutedBg} ${THEME.border} ${THEME.textPrimary}`;
  }

  return `${THEME.sectionBg} ${THEME.border} ${THEME.textPrimary}`;
}

function renderCards(section: Extract<CategorySection, { type: "cards" }>) {
  const gridCols = section.cards.length <= 4 ? "lg:grid-cols-2" : "lg:grid-cols-3";

  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${gridCols}`}>
      {section.cards.map((card) => (
        <article
          key={card.title}
          className="group relative overflow-hidden rounded-2xl border border-[#e0e8f0] bg-white px-5 py-5 shadow-[0_10px_24px_rgba(27,58,107,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-[#e8a830] hover:shadow-[0_16px_32px_rgba(27,58,107,0.14)]"
        >
          <div className="absolute left-0 top-0 h-[3px] w-full origin-left scale-x-0 bg-[linear-gradient(90deg,#e8a830,#6ec6c0)] transition-transform duration-300 group-hover:scale-x-100" />
          <h3 className="text-lg font-bold text-[#1b3a6b]">{card.title}</h3>
          <p className="mt-2 text-sm leading-6 text-[#5a7090]">{card.description}</p>
        </article>
      ))}
    </div>
  );
}

function renderSplit(section: Extract<CategorySection, { type: "split" }>) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-center">
      <article className="rounded-2xl border border-[rgba(232,168,48,0.25)] bg-[linear-gradient(145deg,#0f2347,#163B63)] p-6 text-white shadow-[0_14px_30px_rgba(15,35,71,0.24)]">
        <h3 className="text-2xl font-bold text-white">{section.visualTitle}</h3>
        <p className="mt-3 text-sm leading-6 text-white/85">{section.visualDescription}</p>
      </article>

      <ul className="space-y-3">
        {section.bullets.map((item) => (
          <li
            key={item}
            className="rounded-xl border border-[#e0e8f0] bg-white px-4 py-3 text-sm leading-6 text-[#35557b]"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function renderSteps(section: Extract<CategorySection, { type: "steps" }>) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {section.steps.map((step, index) => (
        <article key={step.title} className="rounded-2xl border border-white/20 bg-white/8 p-5 backdrop-blur-sm">
          <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#e8a830,#f5c96a)] text-[#0f2347] font-extrabold">
            {index + 1}
          </div>
          <h3 className="text-base font-bold text-[#f5c96a]">{step.title}</h3>
          <p className="mt-2 text-sm leading-6 text-white/80">{step.description}</p>
        </article>
      ))}
    </div>
  );
}

function renderHighlight(section: Extract<CategorySection, { type: "highlight" }>) {
  return (
    <div className="space-y-6">
      <article className="rounded-2xl border border-[rgba(232,168,48,0.25)] bg-[linear-gradient(145deg,#0f2347,#163B63)] p-6 text-white shadow-[0_14px_30px_rgba(15,35,71,0.24)]">
        <h3 className="text-2xl font-bold text-white">{section.highlightTitle}</h3>
        <p className="mt-3 text-sm leading-6 text-white/85">{section.highlightDescription}</p>
      </article>
      {renderCards({ ...section, type: "cards" })}
    </div>
  );
}

function renderSection(section: CategorySection) {
  switch (section.type) {
    case "cards":
      return renderCards(section);
    case "split":
      return renderSplit(section);
    case "steps":
      return renderSteps(section);
    case "highlight":
      return renderHighlight(section);
    default:
      return null;
  }
}

export default function CategoryDetailPage({ page }: { page: CategoryPageData }) {
  return (
    <div className={`${THEME.pageBg} ${THEME.textPrimary}`}>
      <section className={`relative overflow-hidden border-b border-[rgba(232,168,48,0.18)] text-white ${THEME.heroBg}`}>
        <div className="pointer-events-none absolute -right-24 -top-16 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(232,168,48,0.18)_0%,transparent_70%)]" />
        <div className="pointer-events-none absolute -left-28 -bottom-20 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(110,198,192,0.14)_0%,transparent_70%)]" />

        <div className="relative mx-auto max-w-[1200px] px-6 py-14 md:py-18">
          <span className="inline-flex rounded-full border border-[rgba(232,168,48,0.3)] bg-[rgba(232,168,48,0.12)] px-3 py-1 text-[11px] font-bold uppercase tracking-[1px] text-[#f5c96a]">
            {page.heroBadge}
          </span>
          <h1 className="mt-4 max-w-4xl text-3xl font-extrabold leading-tight md:text-5xl">{page.heroTitle}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-white/85 md:text-lg">{page.heroSubtitle}</p>
          <p className="mt-5 text-lg font-bold text-[#f5c96a] md:text-2xl">{page.heroSavings}</p>

          {page.heroStats?.length ? (
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {page.heroStats.map((stat) => (
                <article key={stat.label} className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur">
                  <p className="text-3xl font-extrabold text-[#f5c96a]">{stat.value}</p>
                  <p className="mt-1 text-sm text-white/80">{stat.label}</p>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] space-y-8 px-6 py-10 md:space-y-10 md:py-14">
        {page.sections.map((section) => {
          const isDark = section.tone === "dark";

          return (
            <section
              key={section.title}
              className={`rounded-3xl border px-5 py-6 md:px-8 md:py-8 ${sectionToneClasses(section.tone)}`}
            >
              {section.eyebrow ? (
                <p className={`mb-2 text-xs font-bold uppercase tracking-[1px] ${isDark ? "text-[#f5c96a]" : "text-[#e8a830]"}`}>
                  {section.eyebrow}
                </p>
              ) : null}
              <h2 className={`text-2xl font-extrabold leading-tight md:text-3xl ${isDark ? "text-white" : "text-[#1b3a6b]"}`}>
                {section.title}
              </h2>
              {section.description ? (
                <p className={`mt-3 max-w-3xl text-sm leading-6 md:text-base md:leading-7 ${isDark ? "text-white/85" : "text-[#5a7090]"}`}>
                  {section.description}
                </p>
              ) : null}
              <div className="mt-6">{renderSection(section)}</div>
            </section>
          );
        })}
      </div>

      <section className={`relative overflow-hidden border-t border-[rgba(232,168,48,0.18)] text-center ${THEME.darkCardBg}`}>
        <div className="pointer-events-none absolute -top-16 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(232,168,48,0.14)_0%,transparent_70%)]" />
        <div className="relative mx-auto max-w-[1200px] px-6 py-14">
          <h2 className="text-3xl font-extrabold text-white">{page.ctaTitle}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/75 md:text-base">{page.ctaDescription}</p>
          <Link
            href="/#categories"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-[10px] bg-[linear-gradient(135deg,#e8a830,#f5c96a)] px-6 py-3 text-sm font-bold text-[#0f2347] shadow-[0_10px_24px_rgba(232,168,48,0.35)] transition-transform hover:-translate-y-0.5"
          >
            {page.ctaLabel}
          </Link>
        </div>
      </section>
    </div>
  );
}
