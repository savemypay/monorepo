export default function Video() {
    return (
      <section className="relative py-12 md:py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-8 text-center">
  
          {/* Title */}
          <h2 className="relative inline-block text-3xl md:text-5xl font-bold text-[var(--primary)] mb-16">
            See How It Works
            <span className="
              absolute left-1/2 -bottom-3
              w-2/3 h-1
              -translate-x-1/2
              rounded-full
              bg-gradient-to-r from-[var(--accent)] to-[var(--secondary)]
            " />
          </h2>
  
          {/* Video wrapper */}
          <div className="relative mx-auto max-w-[900px] aspect-video rounded-2xl overflow-hidden">
  
            {/* Animated glowing border */}
            <div className="absolute inset-[-3px] rounded-2xl
              bg-gradient-to-r from-[var(--accent)] via-[var(--secondary)] to-[var(--accent)]
              animate-[videoGlow_4s_ease-in-out_infinite]
            " />
  
            {/* Inner video container */}
            <div className="relative z-10 w-full h-full
              bg-[var(--primary)]
              flex items-center justify-center
              rounded-2xl
            ">
              <p className="text-white text-lg">
                [Your Explainer Video Here]
              </p>
            </div>
  
          </div>
        </div>
      </section>
    );
  }
  