const REVEAL =
  "opacity-0 translate-y-7 transition-all duration-700 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]";

const VIDEO_EMBED_URL =
  process.env.NEXT_PUBLIC_HOME_VIDEO_URL ?? "https://www.youtube-nocookie.com/embed/M7lc1UVf-VE";

export default function Video() {
  return (
    <section id="video" className="px-6 py-20 bg-[#0f2347]">
      <div className="max-w-5xl mx-auto grid grid-cols-1 gap-10 items-center">
        <div className="flex flex-col items-center justify-center">
          <span
            className={`inline-block bg-[rgba(232,168,48,0.14)] text-[#f5c96a] px-3 py-1 rounded-[20px] text-[11px] font-bold tracking-[1px] uppercase mb-5 ${REVEAL}`}
            data-reveal
          >
            Platform Demo
          </span>
          <h2
            className={`text-[28px] md:text-[36px] lg:text-[54px] leading-[1.15] font-extrabold text-white mb-4 ${REVEAL}`}
            data-reveal
            style={{ transitionDelay: "80ms" }}
          >
            See SaveMyPay in Action
          </h2>
          <p
            className={`text-lg text-white/68 leading-[1.75] max-w-[520px] text-center ${REVEAL}`}
            data-reveal
            style={{ transitionDelay: "160ms" }}
          >
            Watch how group buying works, how discounts unlock, and how members complete purchases
            with full transparency.
          </p>
        </div>

        <div
          className={`rounded-2xl border border-[rgba(232,168,48,0.22)] bg-white/5 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.35)] ${REVEAL}`}
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
