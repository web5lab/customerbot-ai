import { Hero } from '../components/Hero';
import { AppFeatures } from '../components/AppFeatures';
import { Pricing } from '../components/Pricing';
import { Testimonials } from '../components/Testimonials';
import { HowItWorks } from '../components/HowItWorks';
import { Integration } from '../components/Integration';

export function HomePage() {
  return (
    <>
      <Hero />
      <AppFeatures />
      <HowItWorks />
      {/* <Integration /> */}
      <Testimonials />
      <Pricing />
    </>
  );
}