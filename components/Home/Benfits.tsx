const BENEFITS = [
    {
      id: 1,
      icon: "💰",
      title: "Unbeatable Savings",
      desc: "Save 20-40% on average compared to shopping alone. Our collective buying power gets you prices previously reserved for corporations and large organizations. Every purchase maximizes your money.",
    },
    {
      id: 2,
      icon: "🤝",
      title: "We Negotiate for You",
      desc: "No haggling, no back-and-forth negotiations. Our expert team handles all vendor discussions, leveraging group purchasing power to secure the absolute best pricing on your behalf.",
    },
    {
      id: 3,
      icon: "⚡",
      title: "Lightning Fast Process",
      desc: "Express your interest, we build the buying group, and deals are typically finalized within 72 hours. Fast, efficient, and completely transparent from start to finish.",
    },
    {
      id: 4,
      icon: "✅",
      title: "Trusted Vendors Only",
      desc: "Every vendor is thoroughly vetted and verified. We partner exclusively with reputable businesses that meet our strict quality, service, and reliability standards.",
    },
    {
      id: 5,
      icon: "🔒",
      title: "100% Secure",
      desc: "Protected payments, clear terms, and full transparency throughout every transaction. Your financial security and privacy are our top priorities.",
    },
    {
      id: 6,
      icon: "📱",
      title: "Simple & Accessible",
      desc: "Intuitive platform, clear communication, and dedicated support team. Making the power of bulk buying accessible to everyone, not just big corporations.",
    },
  ];
  
  export default function Benefits() {
    return (
      <section className="relative py-12 md:py-24 bg-[var(--primary)] text-white overflow-hidden">
        
        {/* subtle background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full
            bg-[radial-gradient(circle,rgba(0,229,200,0.15),transparent_60%)]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px]
            bg-[radial-gradient(circle,rgba(255,107,53,0.15),transparent_60%)]" />
        </div>
  
        <div className="relative z-10 max-w-350 mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* header */}
          <div className="text-center mb-14 sm:mb-16">
            <h2 className="text-3xl sm:text-5xl font-extrabold mb-4">
              What Makes Us Different
            </h2>
            <p className="text-white/75 max-w-2xl mx-auto text-lg md:text-xl">
              More than a marketplace - a smarter way to buy together.
            </p>
          </div>
  
          {/* grid */}
          <div
            className="
              grid gap-6
              sm:grid-cols-2
            "
          >
            {BENEFITS.map((b) => (
              <div
                key={b.id}
                className="
                  group relative
                  p-6 sm:p-10
                  rounded-2xl
                  bg-white/5 backdrop-blur
                  border border-white/10
  
                  transition-all duration-500 ease-out
                  hover:-translate-y-2
                  hover:border-[var(--accent)]
                  hover:shadow-[0_30px_60px_rgba(0,0,0,0.4)]
                "
              >
                {/* hover glow */}
                <div
                  className="
                    absolute inset-0 rounded-2xl
                    bg-[linear-gradient(135deg,rgba(0,229,200,0.15),rgba(255,107,53,0.15))]
                    opacity-0
                    transition-opacity duration-500
                    group-hover:opacity-100
                    pointer-events-none
                  "
                />
  
                <div className="relative z-10">
                  <div
                    className="
                      text-3xl md:text-5xl mb-4 md:mb-6 inline-block
                      transition-transform duration-500
                      group-hover:scale-125
                      group-hover:rotate-6
                    "
                  >
                    {b.icon}
                  </div>
  
                  <h4
                    className="
                      text-xl md:text-3xl font-bold mb-2
                      transition-colors duration-300
                      group-hover:text-[var(--accent)]
                    "
                  >
                    {b.title}
                  </h4>
  
                  <p className="text-white/70 leading-relaxed text-sm sm:text-lg">
                    {b.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
  
        </div>
      </section>
    );
  }
  