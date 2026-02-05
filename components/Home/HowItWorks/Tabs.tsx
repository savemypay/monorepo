export default function Tabs({
    active,
    onChange,
  }: {
    active: "customer" | "vendor";
    onChange: (v: "customer" | "vendor") => void;
  }) {
    return (
      <div className="flex flex-col md:flex-row justify-center gap-6">
        <Tab
          label="👥 For Shoppers"
          active={active === "customer"}
          onClick={() => onChange("customer")}
        />
        <Tab
          label="🤝 For Vendors"
          active={active === "vendor"}
          onClick={() => onChange("vendor")}
          variant="vendor"
        />
      </div>
    );
  }
  
  function Tab({
    label,
    active,
    onClick,
    variant,
  }: {
    label: string;
    active: boolean;
    onClick: () => void;
    variant?: "vendor";
  }) {
    const gradient =
      variant === "vendor"
        ? "from-[var(--secondary)] to-[#FFB347] border-[var(--secondary)]"
        : "from-[var(--accent)] to-[#00FFF0] border-[var(--accent)]";
  
    return (
      <button
        onClick={onClick}
        className={`
          px-8 py-3 md:py-4 rounded-full font-bold text-lg md:text-xl border md:border-3
          transition-all duration-500
          ${active ? `bg-gradient-to-br ${gradient} text-white` : "bg-white text-[var(--gray)]"}
          hover:-translate-y-1
        `}
      >
        {label}
      </button>
    );
  }
  