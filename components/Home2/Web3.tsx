import Image from "next/image";
import { WEB3_CARDS, WEB3_FLOW } from "./data";

const REVEAL =
  ""; // "opacity-0 translate-y-7 transition-all duration-700 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]";

export default function Web3() {
  return (
    <section id="web3" className="px-6 py-12 md:py-30 bg-[#f5f4f6]">
      <div className="max-w-[1200px] mx-auto">
        <div className="relative overflow-hidden bg-[#f5f4f6]">
          <div className="relative">
            <h2
              className={`text-[28px] md:text-[36px] lg:text-[48px] leading-tight font-medium mb-[14px] text-[#163B63] ${REVEAL}`}
              data-reveal
              style={{ transitionDelay: "100ms" }}
            >
              Save Money.<br/> Earn blockchain based rewards.<br/> <em className="not-italic bg-[linear-gradient(90deg,#e8a830,#f5c96a)] bg-clip-text text-transparent">On Solana.</em>
            </h2>
            <p
              className={`text-base text-[#7A8CA3] leading-tight max-w-150 ${REVEAL}`}
              data-reveal
              style={{ transitionDelay: "200ms" }}
            >
              Every purchase earns reward points you can convert into crypto tokens. Your shopping
              activity becomes a real financial investment.
            </p>

            <div
              className={`my-16 md:my-24 overflow-hidden rounded-2xl border border-[#e0e8f0] bg-[#e0e8f0] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px ${REVEAL}`}
              data-reveal
              style={{ transitionDelay: "300ms" }}
            >
              {WEB3_CARDS.map((item) => (
                <article
                  key={item.title}
                  className="group relative bg-white p-6 transition-colors duration-300 hover:bg-[#f8fbff]"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[rgba(110,198,192,0.28)] bg-[rgba(110,198,192,0.12)] text-2xl"> 
                    <Image src={item.icon} alt={item.title} width={30} height={30}/>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-[#1b3a6b] leading-snug">{item.title}</h3>
                  <p className="mt-2 text-base text-[#7A8CA3] leading-[1.6]">{item.description}</p>
                  <div className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-[linear-gradient(90deg,#e8a830,#f5c96a)] transition-transform duration-300 group-hover:scale-x-100" />
                </article>
              ))}
            </div>

            <aside
              className={`relative mt-10 overflow-hidden rounded-3xl border border-[rgba(232,168,48,0.16)] bg-[#0C111A] p-6 md:p-10 shadow-[0_20px_60px_rgba(15,35,71,0.2)] ${REVEAL}`}
              data-reveal
              style={{ transitionDelay: "400ms" }}
            >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-125 bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(232,168,48,0.14)_0%,transparent_70%)]" />

              <div className="relative mb-8 flex items-center gap-3">
                <div className="text-xl font-bold uppercase tracking-[1.5px] text-[#F2B705]">How Rewards Flow</div>
                <div className="h-px flex-1 bg-[linear-gradient(90deg,rgba(232,168,48,0.35),transparent)]" />
              </div>

              <div className="relative">
                <div className="pointer-events-none absolute left-[13%] right-[14.5%] top-9 hidden lg:block h-[2px] bg-[linear-gradient(90deg,#1CA7A6_0%,#6ec6c0_45%,#F2B705_100%)]" />

                <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {WEB3_FLOW.map((item, index) => {
                    const isLast = index === WEB3_FLOW.length - 1;

                    return (
                      <div key={item.value} className="group flex flex-col items-center gap-4 text-center">
                        <div
                          className={`relative flex h-16 w-16 items-center justify-center rounded-2xl border-2 text-[24px] transition-all duration-300 bg-white ${
                            isLast
                              ? "border-[rgba(232,168,48,0.4)] bg-[rgba(232,168,48,0.08)] group-hover:border-[#F2B705] group-hover:shadow-[0_0_24px_rgba(232,168,48,0.22)]"
                              : "border-white/20 bg-[#0f2347] group-hover:border-[#1CA7A6] group-hover:scale-110 group-hover:shadow-[0_0_24px_rgba(110,198,192,0.22)]"
                          }`}
                        >
                          <Image src={item.icon} alt={item.value} width={30} height={30}/>
                          <span
                            className={`absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold ${
                              isLast ? "bg-[#F2B705] text-[#0f2347]" : "bg-[#1CA7A6] text-[#0f2347]"
                            }`}
                          >
                            {index + 1}
                          </span>
                        </div>

                        <div className={`text-base leading-snug ${isLast ? "text-[#F2B705]" : "text-white"}`}>
                          {item.value}
                        </div>
                        <div className="text-base text-white/65">{item.step}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
