import { WEB3_CARDS, WEB3_FLOW } from "./data";

const REVEAL =
  "opacity-0 translate-y-7 transition-all duration-700 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]";

export default function Web3() {
  return (
    <section id="web3" className="px-6 py-12 md:py-24 bg-[#f9f7f3]">
      <div className="max-w-300 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16 items-center mt-4">
          <div>
            <span
              className={`inline-block bg-[#d4f0ee] text-[#3da8a0] px-[13px] py-1 rounded-[20px] text-[11px] font-bold tracking-[1px] uppercase mb-5 ${REVEAL}`}
              data-reveal
            >
              🚀 Web3 Rewards
            </span>
            <h2 className={`text-[28px] md:text-[36px] lg:text-[54px] leading-[1.15] font-extrabold mb-[14px] ${REVEAL}`} data-reveal style={{ transitionDelay: "100ms" }}>
              Earn While You <em className="not-italic text-[#1b3a6b]">Save - Web3 Powered</em>
            </h2>
            <p className={`text-base md:text-lg text-[#5a7090] leading-[1.75] max-w-150 ${REVEAL}`} data-reveal style={{ transitionDelay: "200ms" }}>
              Every purchase earns reward points you can convert into crypto tokens. Your shopping
              activity becomes a real financial investment.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-[30px]">
              {WEB3_CARDS.map((item, index) => (
                <article
                  key={item.title}
                  className={`bg-white rounded-[13px] p-[22px] border border-[#e0e8f0] hover:border-[#6ec6c0] hover:shadow-[0_6px_24px_rgba(110,198,192,0.15)] transition-all ${REVEAL}`}
                  data-reveal
                  style={{ transitionDelay: `${(index + 1) * 100}ms` }}
                >
                  <div className="text-[26px] mb-[11px]">{item.icon}</div>
                  <h4 className="text-sm md:text-lg font-bold text-[#1b3a6b] mb-[7px]">{item.title}</h4>
                  <p className="text-xs md:text-sm text-[#5a7090] leading-[1.5]">{item.description}</p>
                </article>
              ))}
            </div>
          </div>

          <aside
            className={`bg-[linear-gradient(135deg,#0f2347,#1b3a6b)] rounded-[18px] p-8 border border-[rgba(232,168,48,0.15)] shadow-[0_20px_60px_rgba(15,35,71,0.2)] ${REVEAL}`}
            data-reveal
            style={{ transitionDelay: "200ms" }}
          >
            <div className="text-[15px] font-bold text-white mb-4">💰 How Rewards Flow</div>
            {WEB3_FLOW.map((item, index) => (
              <div
                key={item.value}
                className="flex items-center gap-[13px] bg-white/5 border border-white/10 rounded-[11px] px-4 py-[14px] mb-3 hover:border-[rgba(232,168,48,0.3)] hover:bg-[rgba(232,168,48,0.06)] transition-all"
              >
                <div className="text-[24px]">{item.icon}</div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.8px] text-white/58 font-medium">{item.step}</div>
                  <div className="text-[15px] font-bold text-white">{item.value}</div>
                </div>
                {index < WEB3_FLOW.length - 1 && <div className="ml-auto text-[#e8a830] text-[18px] font-bold">↓</div>}
              </div>
            ))}
          </aside>
        </div>
      </div>
    </section>
  );
}
