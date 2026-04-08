import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { WhatWeReview } from "@/components/sections/WhatWeReview";
import { WhatYouReceive } from "@/components/sections/WhatYouReceive";
import { WhyOpsMatter } from "@/components/sections/WhyOpsMatter";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { WhoItsFor } from "@/components/sections/WhoItsFor";
import { CommonProblems } from "@/components/sections/CommonProblems";
import { ConsultationCTA } from "@/components/sections/ConsultationCTA";
import { ServicesPreview } from "@/components/sections/ServicesPreview";
import { FAQSection } from "@/components/sections/FAQSection";
import { FinalCTA } from "@/components/sections/FinalCTA";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <WhatWeReview />
        <WhatYouReceive />
        <WhyOpsMatter />
        <HowItWorks />
        <WhoItsFor />
        <CommonProblems />
        <ConsultationCTA />
        <ServicesPreview />
        <FAQSection />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
