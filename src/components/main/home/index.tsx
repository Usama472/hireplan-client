import { FeaturesSection } from './features-section'
import { HeroSection } from './hero-section'
import { PricingSection } from './pricing-section'

export default function Home() {
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      {/* <CTASection /> */}
    </main>
  )
}
