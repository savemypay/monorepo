export default function Timeline({
    steps,
    type,
  }: {
    steps: { title: string; desc: string }[];
    type: "customer" | "vendor";
  }) {
    const isVendor = type === "vendor";
  
    const lineColor = isVendor
      ? "bg-[var(--secondary)]"
      : "bg-[var(--accent)]";
  
    const badgeGradient = isVendor
      ? "from-[var(--secondary)] to-[#FFB347]"
      : "from-[var(--accent)] to-[#00FFF0]";

    const shadowColor = isVendor 
      ? "shadow-[0_0_25px_rgba(255,107,53,0.45)]"
      : "shadow-[0_0_25px_rgba(0,229,200,0.45)]"
  
    return (
      <div className="relative pl-8 md:pl-14">
  
        {/* vertical line */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${lineColor} ${shadowColor}`} />
  
        <div className="space-y-10 md:space-y-20">
          {steps.map((step, index) => (
            <div key={index} className="relative">

            {/* hollow circle */}
            <span
              className={`
                absolute left-[-33px] md:left-[-55px] top-1
                w-6 h-6 rounded-full bg-white
                border-[4px] z-10
                ${shadowColor}

                ${isVendor
                  ? "border-[var(--secondary)]"
                  : "border-[var(--accent)]"}
              `}
              
            />
          
            {/* step content */}
            <div className="ml-4 flex flex-col items-start">
          
              {/* number badge */}
              <div
                className={`
                  w-10 h-10 md:w-12 md:h-12 mb-4
                  rounded-xl md:rounded-2xl
                  flex items-center justify-center
                  text-white font-bold text-base md:text-lg
                  bg-gradient-to-br ${badgeGradient}
                  ${shadowColor}
                `}
              >
                {index + 1}
              </div>
          
              {/* title */}
              <h4 className="text-2xl font-extrabold text-[var(--primary)] mb-3">
                {step.title}
              </h4>
          
              {/* description */}
              <p className="textlg md:text-xl text-[var(--gray)] leading-relaxed max-w-6xl">
                {step.desc}
              </p>
          
            </div>
          </div>
          
          ))}
        </div>
      </div>
    );
  }
  