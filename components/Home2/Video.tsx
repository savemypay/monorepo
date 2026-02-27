const REVEAL =""// "opacity-0 translate-y-7 transition-all duration-700 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]";

const VIDEO_EMBED_URL =
  process.env.NEXT_PUBLIC_HOME_VIDEO_URL ?? "https://www.youtube-nocookie.com/embed/igvorXfp-rA";

export default function Video() {
  return (
    <section id="video" className="relative px-6 py-12 md:py-25 md:pb-35 bg-slate-950 overflow-hidden">
      
      {/* Glow effect matching the previous section */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Added relative and z-10 so the content sits above the background glow */}
      <div className="relative z-10 max-w-[1200px] mx-auto grid grid-cols-1 gap-10 items-center">
        <div className="flex flex-col items-start justify-center">
          <h2
            className={`text-[28px] md:text-[36px] lg:text-[48px] leading-tight tracking-tight font-medium text-white mb-4 ${REVEAL}`}
            data-reveal
            style={{ transitionDelay: "80ms" }}
          >
            Real Savings Start When{" "}
            <em className="not-italic bg-[linear-gradient(90deg,#e8a830,#f5c96a)] bg-clip-text text-transparent ">
                We Buy Together 
              </em>
          </h2>
          <p
            className={`text-lg text-[#7A8CA3] leading-tight max-w-200 ${REVEAL}`}
            data-reveal
            style={{ transitionDelay: "160ms" }}
          >
           From showing interest to locking in your discount - the entire journey takes in few hours.
          </p>
        </div>

        <div
          className={`rounded-2xl border border-[rgba(232,168,48,0.22)] bg-white/5 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.35)] mt-5 lg:mt-10 ${REVEAL}`}
          data-reveal
          style={{ transitionDelay: "220ms" }}
        >
          <div className="relative w-full overflow-hidden rounded-xl border border-white/15 bg-black/40 pt-[56.25%]">
            <iframe
              className="absolute inset-0 h-full w-full"
              src={VIDEO_EMBED_URL}
              title="SaveMyPay Platform Overview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
