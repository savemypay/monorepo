import { TRUST_ITEMS } from "./data";

export default function Trust() {
  return (
    <div className="bg-[#0f2347] px-6 py-[18px] border-b border-[rgba(232,168,48,0.12)]">
      <div className="max-w-[1200px] mx-auto flex items-center justify-center flex-wrap gap-10 max-sm:gap-[18px]">
        {TRUST_ITEMS.map((item) => (
          <div key={item} className="text-xs md:text-base font-medium text-white/45">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
