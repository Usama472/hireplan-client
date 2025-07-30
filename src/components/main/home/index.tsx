import { FeaturesSection } from './features-section'
import { HeroSection } from './hero-section'
import { PricingSection } from './pricing-section'
import { SMSOptIn } from './sms-opt-in'
import { CTASection } from './cta-section'

export default function Home() {
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      
      {/* SMS Opt-in Section - Condensed */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Stay Updated</h2>
            <p className="text-gray-600 text-sm">Get hiring tips via text</p>
          </div>
          <SMSOptIn />
        </div>
      </section>
      
      <CTASection />
    </main>
  )
}
