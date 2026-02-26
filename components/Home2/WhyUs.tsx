import { WHY_ITEMS } from "./data";

const REVEAL =
  ""; // "opacity-0 translate-y-7 transition-all duration-700 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]";

const WHY_STATS = [
  { icon: "🆓", value: "Always Free", label: "To browse & join" },
  { icon: "⚡", value: "1 Week", label: "Average deal close" },
  { icon: "🔒", value: "100%", label: "Secure payments" },
  { icon: "✅", value: "Verified", label: "Every vendor, always" },
];

function getWord(title: string, fallback: string) {
  const cleaned = title.replace(/[^a-zA-Z0-9\s&]/g, "").trim();
  if (!cleaned) return fallback;

  const first = cleaned.split(/\s+/)[0]?.toUpperCase();
  if (!first) return fallback;

  return first.length > 8 ? first.slice(0, 8) : first;
}

export default function WhyUs() {
  const [heroItem, supportItem, ...rest] = WHY_ITEMS;
  const tiles = rest.slice(0, 4);

  if (!heroItem || !supportItem) {
    return null;
  }

  return (
    <section className="px-6 py-12 md:py-30 bg-white">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-14">
          <div>
            <h2
              className={`text-[28px] md:text-[36px] lg:text-[48px] leading-tight font-medium mb-[14px] text-[#163B63] ${REVEAL}`}
              data-reveal
              style={{ transitionDelay: "100ms" }}
            >
              Not Just Shopping.{" "}
              <em className="not-italic bg-[linear-gradient(90deg,#e8a830,#f5c96a)] bg-clip-text text-transparent">Real Financial Power.</em>
            </h2>
          </div>
          {/* <p
            className={`max-w-[260px] text-sm italic leading-relaxed text-[#7A8CA3] ${REVEAL}`}
            data-reveal
            style={{ transitionDelay: "200ms" }}
          >
            Everything you need to buy smarter and save bigger with collective power.
          </p> */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-3 items-stretch">
          <div className="flex flex-col gap-3">
            <article
              className={`group relative overflow-hidden rounded-[20px] p-8 md:p-9 text-white bg-[linear-gradient(135deg,#0f2347_0%,#1b3a6b_60%,#163B63_100%)] border border-[rgba(110,198,192,0.28)] transition-all duration-300 hover:-translate-y-0.5 ${REVEAL}`}
              data-reveal
              style={{ transitionDelay: "100ms" }}
            >
              <div className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-[radial-gradient(circle,rgba(110,198,192,0.16),transparent_70%)]" />

              <div className="relative z-[2]">
                <div className="mb-4 flex h-[52px] w-[52px] items-center justify-center rounded-[14px] border border-[rgba(110,198,192,0.32)] bg-[rgba(110,198,192,0.18)] text-[1.5rem] transition-transform duration-300 group-hover:rotate-[8deg] group-hover:scale-105">
                  {heroItem.icon}
                </div>
                <span className="mb-3 inline-flex items-center rounded-full bg-[#e8a830] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[1.6px] text-[#0f2347]">
                  Core Benefit
                </span>
                <h3 className="text-[30px] md:text-[34px] leading-none font-bold mb-3">{heroItem.title}</h3>
                <p className="text-sm leading-[1.75] text-white/75">{heroItem.description}</p>
              </div>
            </article>

            <article
              className={`group relative overflow-hidden rounded-[20px] p-7 md:p-8 border border-[#e0e8f0] bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-[#e8a830] ${REVEAL}`}
              data-reveal
              style={{ transitionDelay: "180ms" }}
            >

              <div className="relative z-[2]">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-[rgba(110,198,192,0.25)] bg-[rgba(110,198,192,0.12)] text-[1.3rem] transition-transform duration-300 group-hover:rotate-[8deg] group-hover:scale-105">
                  {supportItem.icon}
                </div>
                <h4 className="text-xl md:text-2xl leading-tight font-bold text-[#1b3a6b] mb-2">{supportItem.title}</h4>
                <p className="text-sm leading-[1.75] text-[#5a7090]">{supportItem.description}</p>
              </div>
            </article>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tiles.map((item, index) => (
              <article
                key={item.title}
                data-word={getWord(item.title, "POWER")}
                className={`group relative overflow-hidden rounded-[20px] p-7 border border-[#e0e8f0] bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-[#e8a830] hover:bg-[#fafaf8] ${REVEAL}`}
                data-reveal
                style={{ transitionDelay: `${(index + 3) * 80}ms` }}
              >

                <div className="relative z-[2]">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-[rgba(110,198,192,0.22)] bg-[rgba(110,198,192,0.1)] text-[1.3rem] transition-transform duration-300 group-hover:rotate-[8deg] group-hover:scale-105">
                    {item.icon}
                  </div>
                  <h4 className="text-xl md:text-2xl leading-tight font-bold text-[#1b3a6b] mb-2">{item.title}</h4>
                  <p className="text-sm leading-[1.75] text-[#5a7090]">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div
          className={`mt-10 grid grid-cols-2 lg:grid-cols-4 overflow-hidden rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-[linear-gradient(135deg,#0f2347_0%,#1b3a6b_60%,#163B63_100%)] ${REVEAL}`}
          data-reveal
          style={{ transitionDelay: "420ms" }}
        >
          {WHY_STATS.map((stat, index) => (
            <article
              key={stat.value}
              className={`flex items-center gap-3 px-5 py-5 transition-colors hover:bg-[rgba(110,198,192,0.1)] ${
                index % 2 === 0 ? "border-r border-white/10 lg:border-r lg:border-white/10" : "lg:border-r lg:border-white/10"
              } ${index < 2 ? "border-b border-white/10 lg:border-b-0" : ""} ${index === WHY_STATS.length - 1 ? "lg:border-r-0" : ""}`}
            >
              <div className="text-[1.2rem] shrink-0">{stat.icon}</div>
              <div>
                <p className="text-[#6ec6c0] text-[1.12rem] leading-none font-bold">{stat.value}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[1.2px] text-white/55 font-semibold">{stat.label}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
