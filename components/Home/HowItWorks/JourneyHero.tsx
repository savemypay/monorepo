export default function JourneyHero({ type }: { type: "customer" | "vendor" }) {
    const isVendor = type === "vendor";
  
    return (
      <div
        className={`
          mb-16 rounded-3xl p-6 md:p-14 text-white
          bg-gradient-to-br
          ${isVendor
            ? "from-[var(--secondary)] to-[#FFB347]"
            : "from-[var(--accent)] to-[#00FFF0]"}
        `}
      >
        <h3 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-5 max-w-3xl leading-tight">
          {isVendor
            ? "Move Inventory Faster, Reduce Costs"
            : "Your Journey to Massive Savings"}
        </h3>
  
        <p className="max-w-2xl text-base md:text-xl">
          {isVendor
            ? "Partner with Save My Pay to access a network of pre-qualified buyers actively seeking your products. Turn bulk orders into predictable revenue while reducing your customer acquisition costs."
            : "Join thousands of smart shoppers who leverage collective buying power to unlock prices typically reserved for corporations. No complicated processes, just straightforward savings."}
        </p>
      </div>
    );
  }
  