import { CATEGORIES } from "./data";

const REVEAL =
  "opacity-0 translate-y-7 transition-all duration-700 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]";

export default function Categories() {
  return (
    <section id="categories" className="px-6 py-12 md:py-20 bg-[#f9f7f3]">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center">
          <span className={`inline-block bg-[#fdf3dc] text-[#e8a830] px-3 py-1 rounded-[20px] text-[11px] font-bold tracking-[1px] uppercase mb-5 ${REVEAL}`} data-reveal style={{ transitionDelay: "0ms" }}>
            Featured Categories
          </span>
          <h2 className={`text-[28px] md:text-[36px] lg:text-[54px] leading-[1.15] font-extrabold mb-[14px] ${REVEAL}`} data-reveal style={{ transitionDelay: "100ms" }}>
            Where Collective Power <em className="not-italic text-[#1b3a6b]">Changes Everything</em>
          </h2>
          <p className={`text-lg font-medium text-[#5a7090] leading-[1.75] max-w-[540px] mx-auto ${REVEAL}`} data-reveal style={{ transitionDelay: "200ms" }}>
            Starting with high-value purchases where bulk buying delivers the biggest impact for
            salaried professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px] mt-[52px]">
          {CATEGORIES.map((item, index) => (
            <article
              key={item.title}
              className={`bg-white rounded-2xl px-[26px] py-[26px] border border-[#e0e8f0] hover:border-[#e8a830] hover:-translate-y-1.5 hover:shadow-[0_18px_44px_rgba(27,58,107,0.12)] transition-all relative overflow-hidden group ${REVEAL}`}
              data-reveal
              style={{ transitionDelay: `${((index % 3) + 1) * 100}ms` }}
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-[linear-gradient(90deg,#e8a830,#6ec6c0)] origin-left scale-x-0 group-hover:scale-x-100 transition-transform" />
              <div className="text-[34px] mb-3">{item.icon}</div>
              <h3 className="text-lg md:text-2xl font-bold mb-[9px] text-[#1b3a6b]">{item.title}</h3>
              <p className="text-sm text-[#5a7090] leading-[1.6]">{item.description}</p>
              <span className="inline-block mt-[14px] bg-[#fdf3dc] text-[#d39728] px-[11px] py-[3px] rounded-[20px] text-[12px] font-bold">
                {item.badge}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
