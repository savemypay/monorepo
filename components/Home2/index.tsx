"use client";

import { useEffect } from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import Trust from "./Trust";
import Video from "./Video";
import Categories from "./Categories";
import HowItWorks from "./HowItWorks";
import Stats from "./Stats";
import Web3 from "./Web3";
import WhyUs from "./WhyUs";
import Vendor from "./Vendor";
import FAQ from "./FAQ";
import CTA from "./CTA";
import Footer from "./Footer";
import WaveDivider from "./WaveDivider";

export default function Home2() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("opacity-0", "translate-y-7");
            entry.target.classList.add("opacity-100", "translate-y-0");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="text-[#0f1e35] bg-white overflow-x-hidden">
      <Navbar />
      <Hero />
      {/* <Trust /> */}
      <Video />
      {/* <WaveDivider
        background="#020618"
        fill="#f5f4f6"
        path="M0,20 C360,40 720,0 1080,20 C1260,30 1380,25 1440,20 L1440,40 L0,40 Z"
      /> */}
      <Categories />
      <HowItWorks />
      {/* <Stats /> */}
      <Web3 />
      <WhyUs />
      <Vendor />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
