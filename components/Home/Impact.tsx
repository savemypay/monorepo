const IMPACTS = [
    {
      id: 1,
      value: "$45M+",
      title: "Total Saved",
      desc: "Cumulative savings for our customer community",
    },
    {
      id: 2,
      value: "2.5K",
      title: "Bulk Deals",
      desc: "Successful group purchases completed",
    },
    {
      id: 3,
      value: "98%",
      title: "Satisfaction",
      desc: "Customer satisfaction rating",
    },
    {
      id: 4,
      value: "72hr",
      title: "Avg Deal Time",
      desc: "From interest to locked-in pricing",
    },
  ];
  
  export default function ImpactSection() {
    return (
      <section
        id="impact"
        className="py-20 sm:py-24 lg:py-28 bg-white"
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* header */}
          <div className="text-center mb-14 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-[var(--primary)]">
              Real Results, Real Savings
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              The numbers that matter-real impact for our growing community
            </p>
          </div>
  
          {/* grid */}
          <div
            className="
              grid gap-10
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >
            {IMPACTS.map((item) => (
              <div
                key={item.id}
                className="
                  text-center
                  transition-transform duration-300
                  hover:-translate-y-2
                "
              >
                <div
                  className="
                    text-4xl sm:text-5xl font-extrabold mb-3
                    bg-gradient-to-r from-[var(--accent)] via-orange-500 to-[var(--accent)]
                    bg-[length:200%_200%]
                    bg-clip-text text-transparent
                    animate-gradientFlow
                  "
                >
                  {item.value}
                </div>
  
                <h4 className="text-lg font-semibold text-[var(--primary)]">
                  {item.title}
                </h4>
  
                <p className="text-gray-500 text-sm mt-1">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
  
        </div>
      </section>
    );
  }
  