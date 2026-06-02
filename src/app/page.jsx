import Nav from "@/components/landing/nav";
import Hero from "@/components/landing/hero";
import Trust from "@/components/landing/trust";
import Features from "@/components/landing/features";
import Workflow from "@/components/landing/workflow";
import Showcase from "@/components/landing/showcase";
import Testimonials from "@/components/landing/testimonials";
import PricingSection from "@/components/landing/pricing-section";
import Faq from "@/components/landing/faq";
import CtaBanner from "@/components/landing/cta-banner";
import Footer from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Trust />
        <Features />
        <Workflow />
        <Showcase />
        <Testimonials />
        <PricingSection />
        <Faq />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}
