export default function Web3Visual() {
    return (
      <div className="relative flex justify-center items-center">
        <div className="relative w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] lg:w-[520px] lg:h-[520px] rounded-full">
          {/* dotted ring */}
          <div className="absolute inset-4 sm:inset-6 rounded-full border-2 border-dashed border-[var(--accent)] opacity-60 animate-spin-slow"/>
          {/* orbit items INSIDE ring */}
          <OrbitItem style={{ top: "20%", left: "60%" }}>🛒</OrbitItem>
          <OrbitItem style={{ top: "60%", right: "5%" }}>⭐</OrbitItem>
          <OrbitItem style={{ bottom: "5%", left: "60%" }}>🪙</OrbitItem>
          <OrbitItem style={{ top: "60%", left: "24%" }}>💰</OrbitItem>
  
          {/* center card */}
          <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-36 lg:h-36
                rounded-2xl sm:rounded-3xl
                bg-gradient-to-br from-[var(--accent)] to-purple-600
                flex items-center justify-center
                text-2xl sm:text-4xl lg:text-5xl
                shadow-[0_20px_60px_rgba(0,229,200,0.5)]
                animate-float
              "
          >
              💎
          </div>

          </div>
  
        </div>
      </div>
    );
  }
  
  
function OrbitItem({
    children,
    style,
    }: {
    children: string;
    style: React.CSSProperties;
    }) {
    return (
        <div
        className="
            absolute -translate-x-1/2 -translate-y-1/2
            animate-float
        "
        style={style}
        >
        <div
          className="
            w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16
            rounded-xl
            bg-white/10 backdrop-blur
            border border-white/20
            flex items-center justify-center
            text-sm sm:text-base lg:text-xl
          "
        >

            {children}
        </div>
        </div>
    );
}
  
  
