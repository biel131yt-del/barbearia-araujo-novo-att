import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import HowItWorks from "@/components/HowItWorks";
import Booking from "@/components/Booking";
import Testimonials from "@/components/Testimonials";
import Gallery from "@/components/Gallery";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-950 via-brand-900 to-brand-950 text-slate-100 selection:bg-accent/30 selection:text-white">
      <Header />
      <Hero />
      <Services />
      <HowItWorks />
      <Booking />
      <Testimonials />
      <Gallery />
      <CTA />
      <Footer />
    </main>
  );
}
