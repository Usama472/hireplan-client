import { HeroSection } from "./hero-section";
import { FeaturesSection } from "./features-section";
import { CompactHowItWorks } from "./compact-how-it-works";
import { PricingSection } from "./pricing-section";
import { SMSOptIn } from "./sms-opt-in";
import { MessageSquare } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";
import { ROUTES } from "@/constants";

export default function Home() {
  const navigate = useNavigate();
  const { status } = useAuthSessionContext();

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (status === 'authenticated') {
      navigate(ROUTES.DASHBOARD.MAIN);
    }
  }, [status, navigate]);
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <CompactHowItWorks />
      <PricingSection />

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
