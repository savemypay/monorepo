import { HOW_STEPS } from "./data";

const REVEAL = "";
  //"opacity-0 translate-y-7 transition-all duration-700 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]";

export default function HowItWorks() {
  return (
    <section 
      id="how" 
      className="relative px-6 py-16 md:py-40 bg-[#0C111A] overflow-hidden"
    >
      {/* Subtle background glow for depth */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-125 bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-300 mx-auto z-10">
        
        {/* Header - Centered for a better visual anchor */}
        <div className="mb-16 md:mb-24">
          <h2 
            className={`text-[28px] md:text-[36px] lg:text-[48px] leading-tight tracking-tight font-medium text-white ${REVEAL}`} 
            data-reveal 
            style={{ transitionDelay: "100ms" }}
          >
            From Interest to{" "}
            <span className="not-italic bg-[linear-gradient(90deg,#e8a830,#f5c96a)] bg-clip-text text-transparent">
              Savings in 4 Steps
            </span>
          </h2>
          <p 
            className={`text-lg text-slate-400 leading-relaxed ${REVEAL}`} 
            data-reveal 
            style={{ transitionDelay: "200ms" }}
          >
            No complicated processes, no upfront commitment. Just straightforward savings that work
            for everyone.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative">
          
          {/* Modern dashed connecting line - positioned behind the cards */}
          <div className="hidden lg:block absolute top-1/2 left-[10%] right-[10%] h-0.5 -translate-y-1/2 bg-gradient-to-r from-transparent via-slate-600/50 to-transparent border-t border-dashed border-slate-500/30 -z-10" />

          {HOW_STEPS.map((step, index) => (
            <article
              key={step.title}
              className={`group relative flex flex-col p-8 rounded-3xl bg-white/3 border border-white/8 backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.06] hover:border-white/[0.15] hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] ${REVEAL}`}
              data-reveal
              style={{ transitionDelay: `${(index + 1) * 100}ms` }}
            >
              {/* Step Number Badge */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F2B705] to-[#D9A304] flex items-center justify-center text-white text-xl font-bold shadow-[0_0_25px_rgba(245,158,11,0.25)] mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                {index + 1}
              </div>

              <h4 className="text-xl font-semibold text-slate-100 mb-3 transition-colors group-hover:text-white">
                {step.title}
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                {step.description}
              </p>
              
              {/* Decorative arrow that appears on hover */}
              <div className="absolute top-0 right-0 p-8 opacity-0 translate-x-4 -translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 pointer-events-none">
                 <svg className="w-5 h-5 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                 </svg>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}