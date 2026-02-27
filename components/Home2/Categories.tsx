import Link from "next/link";
import Image from "next/image";
import { CATEGORIES } from "./data";

const REVEAL =
  ""; // "opacity-0 translate-y-7 transition-all duration-700 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]";

function CategoryCard({ item, index }: { item: (typeof CATEGORIES)[number]; index: number }) {
  return (
    <article
      className={`bg-white pb-5 rounded-lg border border-[#dfe6ef] hover:border-[#e8a830] hover:shadow-[0_18px_44px_rgba(27,58,107,0.12)] transition-all relative overflow-hidden group ${REVEAL}`}
      data-reveal
      style={{ transitionDelay: `${((index % 4) + 1) * 100}ms` }}
    >
      <div className="relative h-44 w-full overflow-hidden">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(15,35,71,0.72),rgba(15,35,71,0.12))]" />
        <h3 className="absolute left-4 right-4 bottom-4 text-lg md:text-xl font-bold text-white drop-shadow-sm">
          {item.title}
        </h3>
      </div>

      <p className="text-sm leading-5 text-[#7A8CA3] px-5 py-5">{item.description}</p>

      <div className="px-5 flex justify-end">
        <Link
          href={`/category/${item.slug}`}
          className="inline-flex items-center text-sm font-medium text-amber-600 hover:scale-105 transition-transform"
        >
          Learn more →
        </Link>
      </div>
    </article>
  );
}

export default function Categories() {
  const firstRowCards = CATEGORIES.slice(0, 2);
  const secondRowCards = CATEGORIES.slice(2);

  return (
    <section id="categories" className="px-6 py-12 md:py-40 bg-[#f5f4f6]">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-[52px]">
          <div className="text-left flex flex-col justify-center lg:col-span-2">
            <h2
              className={`text-[28px] md:text-[36px] lg:text-[48px] leading-tight font-medium mb-4 text-[#163B63] ${REVEAL}`}
              data-reveal
              style={{ transitionDelay: "100ms" }}
            >
              Where <em className="not-italic bg-[linear-gradient(90deg,#e8a830,#f5c96a)] bg-clip-text text-transparent"><br/>Collective Power</em><br/> Changes Everything
            </h2>
            <p
              className={`text-lg text-[#7A8CA3] leading-tight max-w-200 ${REVEAL}`}
              data-reveal
              style={{ transitionDelay: "200ms" }}
            >
              Starting with high-value purchases where bulk buying delivers the biggest impact for
              salaried professionals.
            </p>
          </div>

          {firstRowCards.map((item, index) => (
            <CategoryCard key={item.title} item={item} index={index} />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {secondRowCards.map((item, index) => (
            <CategoryCard key={item.title} item={item} index={index + 2} />
          ))}
        </div>
      </div>
    </section>
  );
}
