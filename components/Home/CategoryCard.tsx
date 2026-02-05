export function CategoryCard({
    icon,
    title,
    desc,
  }: {
    icon: string;
    title: string;
    desc: string;
  }) {
    return (
      <div
        className="
          relative group cursor-pointer
          bg-white rounded-3xl p-5 md:not-first:p-10 text-center
          border-2 border-transparent
          transition-all duration-500 ease-out
          shadow-sm overflow-hidden
  
          hover:-translate-y-4 hover:scale-[1.03]
          hover:border-[var(--accent)]
          hover:shadow-2xl
        "
      >
        {/* top gradient bar */}
        <div className="
          absolute top-0 left-0 h-1 w-0
          bg-gradient-to-r from-[var(--accent)] to-[var(--secondary)]
          transition-all duration-500
          group-hover:w-full
        " />
  
        {/* glow */}
        <div className="
          absolute inset-0 rounded-3xl opacity-0
          bg-[radial-gradient(circle,rgba(0,229,200,0.15),transparent_60%)]
          transition-opacity duration-500
          group-hover:opacity-100
        " />
  
        <div className="relative z-10">
          <div className="
            w-20 h-20 mx-auto mb-6
            rounded-full
            flex items-center justify-center
            text-4xl
            bg-gradient-to-br from-[var(--accent)] to-[var(--secondary)]
            transition-transform duration-700
            group-hover:[transform:rotateY(360deg)]
          ">
            {icon}
          </div>
            <h3
            className="
                text-2xl font-bold mb-3
                text-[var(--primary)]
                transition-colors duration-300
                group-hover:text-[var(--accent)]
            "
            >

            {title}
          </h3>
          
  
          <p className="text-[var(--gray)] leading-relaxed">
            {desc}
          </p>
        </div>
      </div>
    );
  }
  