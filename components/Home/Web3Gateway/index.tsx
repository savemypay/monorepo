import Web3Visual from "./Web3Visual";
import Web3Features from "./Web3Features";

export default function Web3Gateway() {
  return (
    <section className="relative py-12 sm:py-24 bg-[var(--primary)] overflow-hidden text-white">
      {/* BACKGROUND LAYERS */}
      <div className="absolute inset-0 pointer-events-none">
        {/* animated grid background */}
        <div className="web3-grid-bg pointer-events-none" />
        {/* radial glow */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px]
          bg-[radial-gradient(circle,rgba(0,229,200,0.25),transparent_60%)]" />

        <div className="absolute bottom-0 right-0 w-[500px] h-[500px]
          bg-[radial-gradient(circle,rgba(138,43,226,0.25),transparent_60%)]" />
      </div>

      {/* CONTENT */}
      <div className="
        relative z-10
        max-w-[1400px]
        mx-auto
        px-4 sm:px-6 lg:px-8
        ">
        {/* header */}
        <div className="text-center mb-14 sm:mb-16 lg:mb-20">

          <span
            className="
              inline-block mb-6 px-6 py-2 rounded-full
              border border-[var(--accent)]
              bg-[rgba(0,229,200,0.15)]
              text-sm font-bold tracking-widest uppercase
            "
          >
            🚀 Future of Shopping
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-5
            bg-gradient-to-r from-[var(--accent)] via-purple-500 to-[var(--accent)] bg-[length:200%_200%] bg-clip-text text-transparent animate-gradientFlow">
            Your Gateway to Web3 Rewards
          </h2>

          <p className="max-w-2xl mx-auto text-white/80 text-base sm:text-lg">
            Earn rewards on every purchase. Convert them to tokens.
            Build real value while you shop.
          </p>
        </div>

        {/* main content */}
        <div className="grid gap-14 sm:gap-16 lg:gap-20 lg:grid-cols-2 items-center">
          <Web3Visual />
          <Web3Features />
        </div>

        {/* CTA */}
        <div className="text-center mt-14 sm:mt-16 lg:mt-20">

          <p className="text-xl font-semibold mb-8">
            Ready to start earning while saving?
          </p>
          <a
            href="#"
            className="
              inline-block px-10 py-5 rounded-full font-bold
              bg-gradient-to-r from-[var(--accent)] to-purple-600
              hover:-translate-y-1 transition
              shadow-2xl
            "
          >
            Learn More About Web3 Rewards
          </a>
        </div>

      </div>
    </section>
  );
}
