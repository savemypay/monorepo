export default function SavingsCard() {
  return (
    <div className="relative max-w-[520px] w-full my-6">

      {/* badge */}
      <div className="absolute -top-4 -right-4 z-10 bg-[var(--secondary)] text-white px-5 py-2 rounded-full text-xs sm:text-sm font-extrabold shadow-xl">
        35% OFF
      </div>

      {/* Card */}
      <div className="relative overflow-hidden rounded-[30px]
                        bg-white/5 backdrop-blur-xl
                        border-2 border-white/10
                        px-4 md:px-10 py-6 sm:py-12 min-h-[520px]">

        {/* Header */}
        <div className="text-center mb-8">
          <h3 className="text-[var(--accent)] text-xl md:text-3xl font-bold mb-4">
            Your Savings Potential
          </h3>
          <p className="text-white/70 text-base">
            When you buy with the group
          </p>
        </div>

        {/* Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5 md:mb-10">
          <Item icon="🏠" name="Home Insurance" saving="$420" />
          <Item icon="🚗" name="Car Purchase" saving="$3,200" />
          <Item icon="🏘️" name="Property Deal" saving="$8,500" />
          <Item icon="🛡️" name="Life Insurance" saving="$560" />
        </div>

        {/* Total */}
        {/* <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[#00FFF0] p-5 text-center">
          <p className="text-[var(--primary)] text-xs font-bold uppercase tracking-wider">
            Total You Save
          </p>
          <p className="text-[var(--primary)] text-4xl font-extrabold">
            $12,680
          </p>
        </div> */}
      </div>
    </div>
  );
}

function Item({
  icon,
  name,
  saving,
}: {
  icon: string;
  name: string;
  saving: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl  p-6 min-h-[200px] text-center w-full
      bg-white/10 border-2 border-white/10
      flex flex-col items-center justify-center
      transition-all duration-300
      hover:scale-105 hover:border-[var(--accent)] shimmer-diagonal">

      <div className="relative flex flex-col justify-center items-center ">
        <div className="text-5xl mb-3 md:mb-5 drop-shadow-lg">{icon}</div>
        <div className="text-white font-semibold text-base mb-2">
          {name}
        </div>
        <div className="text-[var(--accent)] text-sm font-bold">
          Save {saving}
        </div>
      </div>
    </div>
  );
}
