import { STATS } from "./data";

const REVEAL =
  "opacity-0 translate-y-7 transition-all duration-700 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]";

export default function Stats() {
  return (
    <div className="relative overflow-hidden px-6 py-12 md:py-30 bg-[linear-gradient(135deg,#0f2347_0%,#1b3a6b_100%)]">
      <div className="absolute -top-25 -right-25 w-95 h-95 rounded-full bg-[radial-gradient(circle,rgba(232,168,48,0.1)_0%,transparent_70%)]" />
      <div className="absolute -bottom-20 -left-20 w-[320px] h-80 rounded-full bg-[radial-gradient(circle,rgba(110,198,192,0.08)_0%,transparent_70%)]" />
      <div className="max-w-300 mx-auto relative z-1 grid grid-cols-2 lg:grid-cols-4 gap-9">
        {STATS.map((item, index) => (
          <div
            key={item.label}
            className={`text-center ${REVEAL}`}
            data-reveal
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className="text-[42px] md:text-[60px] leading-none font-extrabold mb-2 md:mb-4 bg-[linear-gradient(90deg,#f5c96a,#6ec6c0)] bg-clip-text text-transparent">
              {item.value}
            </div>
            <div className="text-sm md:text-xl text-white/45 font-medium">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
