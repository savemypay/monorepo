import { WHY_ITEMS } from "./data";

const REVEAL =
  "opacity-0 translate-y-7 transition-all duration-700 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]";

export default function WhyUs() {
  return (
    <section className="px-6 py-12 md:py-24 bg-white">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center">
          <span className={`inline-block bg-[#fdf3dc] text-[#e8a830] px-[13px] py-1 rounded-[20px] text-[11px] font-bold tracking-[1px] uppercase mb-5 ${REVEAL}`} data-reveal>
            Why SaveMyPay
          </span>
          <h2 className={`text-[28px] md:text-[36px] lg:text-[54px] leading-[1.15] font-extrabold mb-[14px] ${REVEAL}`} data-reveal style={{ transitionDelay: "100ms" }}>
            More Than a Marketplace -
            <br />
            <em className="not-italic text-[#1b3a6b]">A Smarter Way to Buy</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[22px] mt-[52px]">
          {WHY_ITEMS.map((item, index) => (
            <article
              key={item.title}
              className={`p-7 rounded-[15px] bg-[#f9f7f3] border border-[#e0e8f0] hover:bg-white hover:shadow-[0_10px_34px_rgba(27,58,107,0.09)] hover:-translate-y-1 hover:border-[#e8a830] transition-all ${REVEAL}`}
              data-reveal
              style={{ transitionDelay: `${((index % 3) + 1) * 100}ms` }}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-[21px] mb-[18px] ${
                  item.tone === "teal" ? "bg-[#d4f0ee]" : "bg-[#fdf3dc]"
                }`}
              >
                {item.icon}
              </div>
              <h4 className="text-base md:text-xl font-bold text-[#1b3a6b] mb-[9px]">{item.title}</h4>
              <p className="text-sm md:text-base text-[#5a7090] leading-[1.6]">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
