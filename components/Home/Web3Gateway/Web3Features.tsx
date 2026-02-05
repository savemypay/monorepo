const FEATURES = [
    {
      id:1,
      icon: "⭐",
      title: "Earn on Every Action",
      desc: "Every purchase, referral, and engagement earns you reward points. The more you participate in our community, the more you accumulate.",
    },
    {
      id:2,
      icon: "🪙",
      title: "Convert to Crypto Tokens",
      desc: "Exchange your accumulated rewards for our native cryptocurrency tokens. These tokens have real-world value and can appreciate over time as our platform grows.",
    },
    {
      id:3,
      icon: "📈",
      title: "Watch Your Wealth Grow",
      desc: "Hold tokens for potential appreciation, trade them on exchanges, or use them for exclusive platform benefits. Your shopping activity becomes an investment in your financial future.",
    },
    {
      id:4,
      icon: "🔐",
      title: "Secure & Transparent",
      desc: "All transactions are recorded on the blockchain, ensuring complete transparency and security. Your rewards are truly yours, backed by decentralized technology.",
    },
  ];
  
  export default function Web3Features() {
    return (
      // <div className="space-y-6">
      //   {FEATURES.map((f) => (
      //   <div
      //     key={f.id}
      //     className="
      //       relative overflow-hidden
      //       group
      //       p-6 rounded-2xl
      //       bg-white/5 backdrop-blur
      //       border-2 border-white/10
      //       hover:border-[var(--accent)]
      //       transition-transform duration-1000 ease-out
      //       hover:translate-x-2
      //     "
      //   >
      //     {/* sliding glow layer */}
      //     <div
      //       className="
      //         absolute inset-0
      //         -translate-x-full
      //         bg-gradient-to-r
      //         from-transparent
      //         via-[rgba(0,229,200,0.25)]
      //         to-transparent

      //         transition-transform duration-700 ease-in-out
      //         group-hover:translate-x-full
      //         pointer-events-none
      //       "
      //     />

      //     {/* content */}
      //     <div className="relative z-10 flex gap-5 items-start">
      //       {/* icon */}
      //       <div
      //         className="
      //           w-14 h-14 rounded-xl
      //           bg-gradient-to-br from-[var(--accent)] to-purple-600
      //           flex items-center justify-center text-xl
      //           shadow-lg

      //           transition-all duration-500
      //           group-hover:scale-110
      //           group-hover:shadow-[0_0_30px_rgba(0,229,200,0.6)]
      //         "
      //       >
      //         {f.icon}
      //       </div>

      //       {/* text */}
      //       <div>
      //         <h3
      //           className="
      //             text-xl font-bold
      //             transition-colors duration-300
      //           "
      //         >
      //           {f.title}
      //         </h3>

      //         <p className="text-white/75 mt-1">
      //           {f.desc}
      //         </p>
      //       </div>
      //     </div>
      //   </div>        
      //   ))}
      // </div>
      <div className="space-y-4 sm:space-y-6">
      {FEATURES.map((f) => (
        <div
          key={f.id}
          className="
            relative overflow-hidden group
            p-5 sm:p-6
            rounded-2xl
            bg-white/5 backdrop-blur
            border-2 border-white/10
            hover:border-[var(--accent)]

            transition-all duration-700 ease-out

            /* desktop hover movement */
            lg:hover:translate-x-2

            /* mobile interaction */
            hover:scale-[1.01]
          "
        >
          {/* sliding glow layer (desktop + tab only) */}
          <div
            className="
              absolute inset-0
              -translate-x-full
              bg-gradient-to-r
              from-transparent
              via-[rgba(0,229,200,0.25)]
              to-transparent

              transition-transform duration-700 ease-in-out
              group-hover:translate-x-full

              hidden sm:block
              pointer-events-none
            "
          />

          {/* content */}
          <div className="
            relative z-10
            flex items-start gap-4 sm:gap-5
          ">
            {/* icon */}
            <div
              className="
                w-12 h-12 sm:w-14 sm:h-14
                rounded-xl
                bg-gradient-to-br from-[var(--accent)] to-purple-600
                flex items-center justify-center
                text-lg sm:text-xl
                shadow-lg

                flex-shrink-0

                transition-all duration-500
                group-hover:scale-110
                group-hover:shadow-[0_0_30px_rgba(0,229,200,0.6)]
              "
            >
              {f.icon}
            </div>

            {/* text */}
            <div>
              <h3
                className="
                  text-lg sm:text-xl
                  font-bold
                  transition-colors duration-300
                  group-hover:text-[var(--accent)]
                "
              >
                {f.title}
              </h3>

              <p className="text-white/75 mt-1 text-sm sm:text-base leading-relaxed">
                {f.desc}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
    );
  }
  