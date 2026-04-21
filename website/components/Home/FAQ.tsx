 "use client";

import { useEffect, useRef } from "react";
import { FAQ_ITEMS } from "./data";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const REVEAL ="opacity-0 translate-y-7 transition-all duration-700 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]";

export default function FAQ() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const nodes = Array.from(section.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.remove("opacity-0", "translate-y-7");
          entry.target.classList.add("opacity-100", "translate-y-0");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1 }
    );

    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="faq" className="px-6 py-12 md:py-24 bg-[#ffffff]">
      <div className="max-w-[1000px] mx-auto text-center">
        <div className="mb-10">
          {/* <span
            className={`inline-block bg-[#fdf3dc] text-[#e8a830] px-[13px] py-1 rounded-[20px] text-[11px] font-bold tracking-[1px] uppercase mb-5 ${REVEAL}`}
            data-reveal
          >
            FAQ
          </span> */}
          <h2
            className={`text-[28px] md:text-[36px] lg:text-[48px] leading-tight font-medium mb-4 ${REVEAL}`}
            data-reveal
            style={{ transitionDelay: "100ms" }}
          >
            Frequently Asked Questions
          </h2>
          <p
            className={`text-base md:text-lg leading-tight text-[#7A8CA3] ${REVEAL}`}
            data-reveal
            style={{ transitionDelay: "200ms" }}
          >
            Everything you need to know about how SaveMyPay works for buyers and vendors.
          </p>
        </div>

        <div className={REVEAL} data-reveal style={{ transitionDelay: "300ms" }}>
          <Accordion type="single" collapsible className="gap-3">
            {FAQ_ITEMS.map((item, index) => (
              <AccordionItem key={item.question} value={`faq-${index + 1}`} className="rounded-xl py-3 px-3 md:px-5">
                <AccordionTrigger className="text-base md:text-lg text-black/90 font-medium hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-[15px] leading-[1.7] text-[#4c5f7a] pb-5 text-left">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
