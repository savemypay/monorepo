import { FAQ_ITEMS } from "./data";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const REVEAL =
  "opacity-0 translate-y-7 transition-all duration-700 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]";

export default function FAQ() {
  return (
    <section id="faq" className="px-6 pb-12 md:pb-24 bg-[#f9f7f3]">
      <div className="max-w-[980px] mx-auto">
        <div className="text-center mb-10">
          <span
            className={`inline-block bg-[#fdf3dc] text-[#e8a830] px-[13px] py-1 rounded-[20px] text-[11px] font-bold tracking-[1px] uppercase mb-5 ${REVEAL}`}
            data-reveal
          >
            FAQ
          </span>
          <h2
            className={`text-[28px] md:text-[36px] lg:text-[54px] leading-[1.15] font-extrabold mb-[14px] ${REVEAL}`}
            data-reveal
            style={{ transitionDelay: "100ms" }}
          >
            Frequently Asked Questions
          </h2>
          <p
            className={`text-base text-[#5a7090] leading-[1.75] max-w-[650px] mx-auto ${REVEAL}`}
            data-reveal
            style={{ transitionDelay: "200ms" }}
          >
            Everything you need to know about how SaveMyPay works for buyers and vendors.
          </p>
        </div>

        <div className={REVEAL} data-reveal style={{ transitionDelay: "300ms" }}>
          <Accordion type="single" collapsible className="gap-3">
            {FAQ_ITEMS.map((item, index) => (
              <AccordionItem key={item.question} value={`faq-${index + 1}`} className="rounded-xl px-3 md:px-5">
                <AccordionTrigger className="text-[15px] md:text-lg text-[#162233] font-medium hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-[15px] leading-[1.7] text-[#4c5f7a] pb-5">
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
