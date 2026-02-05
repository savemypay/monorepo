const FOOTER_LINKS = {
    quickLinks: {
      title: "Quick Links",
      items: [
        { label: "Categories", href: "#categories" },
        { label: "How It Works", href: "#how-it-works" },
        { label: "Impact", href: "#impact" },
        { label: "Partner With Us", href: "#partner" },
      ],
    },
  
    support: {
      title: "Support",
      items: [
        { label: "FAQ", href: "#faq" },
        { label: "Contact Us", href: "#contact" },
        { label: "Help Center", href: "#help" },
        { label: "Live Chat", href: "#chat" },
      ],
    },
  
    legal: {
      title: "Legal",
      items: [
        { label: "Privacy Policy", href: "#privacy" },
        { label: "Terms of Service", href: "#terms" },
        { label: "Vendor Terms", href: "#vendor-terms" },
        { label: "Refund Policy", href: "#refunds" },
      ],
    },
  };

  export default function FooterSection() {
    return (
      <footer className="bg-[var(--primary)] text-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
  
          {/* top */}
          <div
            className="
              py-16
              grid gap-12
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >
            {/* brand */}
            <div>
              <h3 className="text-2xl font-extrabold mb-4">
                Save<span className="text-[var(--accent)]">My</span>Pay
              </h3>
              <p className="text-white/70 text-sm leading-relaxed max-w-sm">
                Transforming how people make high-value purchases through
                collective buying power.
              </p>
            </div>
  
            {/* mapped columns */}
            {Object.values(FOOTER_LINKS).map((section) => (
              <FooterColumn
                key={section.title}
                title={section.title}
                links={section.items}
              />
            ))}
          </div>
  
          {/* bottom */}
          <div className="border-t border-white/10 py-6 text-center text-sm text-white/50">
            © 2026 Save My Pay. All rights reserved.
          </div>
  
        </div>
      </footer>
    );
  }

  function FooterColumn({
    title,
    links,
  }: {
    title: string;
    links: { label: string; href: string }[];
  }) {
    return (
      <div>
        <h4 className="text-[var(--accent)] font-semibold mb-4">
          {title}
        </h4>
  
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="
                  text-white/70 text-sm
                  transition-colors duration-200
                  hover:text-white
                "
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  