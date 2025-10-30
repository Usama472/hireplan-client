import { HeroSection } from "./hero-section";
import { FeaturesSection } from "./features-section";
import { CompactHowItWorks } from "./compact-how-it-works";
// import { PricingSection } from "./pricing-section"; // Commented out - using custom pricing per company
import { SMSOptIn } from "./sms-opt-in";
import { MessageSquare, ArrowRight, CheckCircle } from "lucide-react";
import { useSEO } from "@/lib/hooks/useSEO";
import { Button } from "@/components/ui/button";

export default function Home() {
  // Redirect is handled by AuthRedirection component - no need to do it here
  
  // SEO configuration for home page
  useSEO({
    title: "HirePlan - AI-Powered Recruitment Platform | Hire 10x Faster",
    description: "Transform your hiring process with HirePlan's AI-powered recruitment platform. Automate candidate screening, conduct smart interviews, and hire the right talent 10x faster with 95% accuracy.",
    keywords: "AI recruitment software, applicant tracking system, ATS, automated hiring, candidate screening, recruitment automation, AI hiring platform, talent acquisition software, HR technology",
    ogTitle: "HirePlan - AI-Powered Recruitment Platform | Hire 10x Faster",
    ogDescription: "Transform your hiring process with AI. Automate candidate screening and hire the right talent 10x faster.",
    ogUrl: "https://hireplan.co/",
    ogImage: "https://hireplan.co/og-image.png",
    canonical: "https://hireplan.co/",
  });

  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <CompactHowItWorks />
      
      {/* CTA Section (replaces pricing) */}
      <section id="pricing" className="w-full py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center text-white">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Ready to Transform Your Hiring?
            </h2>
            <p className="text-xl sm:text-2xl mb-8 text-white/90">
              Custom pricing tailored to your organization's needs
            </p>
            
            <div className="grid sm:grid-cols-3 gap-6 mb-10">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <CheckCircle className="w-8 h-8 mx-auto mb-3 text-green-300" />
                <p className="font-semibold text-lg">Flexible Pricing</p>
                <p className="text-sm text-white/80 mt-2">Plans customized to your company size and needs</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <CheckCircle className="w-8 h-8 mx-auto mb-3 text-green-300" />
                <p className="font-semibold text-lg">AI Features Available</p>
                <p className="text-sm text-white/80 mt-2">Optional AI-powered screening and automation</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <CheckCircle className="w-8 h-8 mx-auto mb-3 text-green-300" />
                <p className="font-semibold text-lg">No Commitments</p>
                <p className="text-sm text-white/80 mt-2">Cancel anytime, no long-term contracts</p>
              </div>
            </div>

            <Button 
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 h-14 px-8 text-lg font-bold shadow-xl"
              onClick={() => window.location.href = '/contact'}
            >
              Get Custom Pricing
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <p className="mt-6 text-white/80 text-sm">
              Contact us for a personalized quote based on your requirements
            </p>
          </div>
        </div>
      </section>

      {/* Simplified SMS Opt-in Section */}
      <section className="w-full py-12 bg-white relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-200">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <span>Stay Connected</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Get Hiring Tips & Updates
            </h2>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Stay ahead with expert recruiting insights delivered to your phone.
            </p>
          </div>

          <SMSOptIn />
        </div>
      </section>
    </main>
  );
}
