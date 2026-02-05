import Benefits from "@/components/Home/Benfits";
import FooterSection from "@/components/Home/Footer";
import HowItWorks from "@/components/Home/HowItWorks";
import ImpactSection from "@/components/Home/Impact";
import Partner from "@/components/Home/Partner";
import Video from "@/components/Home/Video";
import Web3Gateway from "@/components/Home/Web3Gateway";
import Categories from "@/components/Home/categories";
import Hero from "@/components/Home/hero";
import Navbar from "@/components/Home/navbar";

export default function Home() {
  return (
    <div className="w-full">
      <Navbar/>
      <Hero/>
      <Video/>
      <Categories/>
      <HowItWorks/>
      <Web3Gateway/>
      <ImpactSection/>
      <Benefits/>
      <Partner/>
      <FooterSection/>
    </div>
  );
}
