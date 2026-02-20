import { HOW_STEPS } from "./data";

const REVEAL =
  "opacity-0 translate-y-7 transition-all duration-700 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]";

export default function HowItWorks() {
  return (
    <section id="how" className="px-6 py-12 md:py-20 bg-[linear-gradient(135deg,#0f2347_0%,#1b3a6b_50%,#1a3a5c_100%)]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <span className={`inline-block bg-[rgba(232,168,48,0.14)] text-[#f5c96a] px-3 py-1 rounded-[20px] text-[11px] font-bold tracking-[1px] uppercase mb-5 ${REVEAL}`} data-reveal>
            Simple Process
          </span>
          <h2 className={`text-[28px] md:text-[36px] lg:text-[54px] leading-[1.15] font-extrabold mb-4 text-white ${REVEAL}`} data-reveal style={{ transitionDelay: "100ms" }}>
            From Interest to <em className="not-italic bg-[linear-gradient(90deg,#e8a830,#6ec6c0)] bg-clip-text text-transparent">Savings in 4 Steps</em>
          </h2>
          <p className={`text-lg text-white/70 leading-[1.75] max-w-xl mx-auto ${REVEAL}`} data-reveal style={{ transitionDelay: "200ms" }}>
            No complicated processes, no upfront commitment. Just straightforward savings that work
            for everyone.
          </p>
        </div>

        <div className="relative mt-15 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
          <div className="hidden lg:block absolute top-7 left-[0%] right-[20%] h-0.5 bg-[linear-gradient(90deg,#e8a830,#6ec6c0,rgba(110,198,192,0.1))]" />
          {HOW_STEPS.map((step, index) => (
            <article
              key={step.title}
              className={`relative z-1 ${REVEAL}`}
              data-reveal
              style={{ transitionDelay: `${(index + 1) * 100}ms` }}
            >
              <div className="w-12 h-12 md:w-14.5 md:h-14.5 rounded-full bg-[linear-gradient(135deg,#e8a830,#f0883e)] flex items-center justify-center text-white text-[22px] font-extrabold mb-5.5 shadow-[0_6px_20px_rgba(232,168,48,0.3)] transition-transform hover:scale-105 hover:-rotate-3">
                {index + 1}
              </div>
              <h4 className="text-lg font-bold text-white/70 mb-2">{step.title}</h4>
              <p className="text-sm text-gray-400 leading-[1.6]">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
