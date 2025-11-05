import { ATSHeroSection } from "./ats-hero-section";
import { ATSFeaturesSection } from "./ats-features-section";
import { ClientShowcaseSection } from "./client-showcase-section";
import { IntegrationsSection } from "./integrations-section";
import { ATSTestimonialsSection } from "./ats-testimonials-section";
import { ATSCTASection } from "./ats-cta-section";
import { useSEO } from "@/lib/hooks/useSEO";

export default function ATSLandingPage() {
  // SEO configuration for ATS page
  useSEO({
    title: "HirePlan ATS - Enterprise Applicant Tracking System",
    description: "Complete enterprise ATS solution with multi-platform integrations, EEO compliance, and AI-powered screening. Trusted by 200+ companies for comprehensive talent management.",
    keywords: "applicant tracking system, ATS software, enterprise recruitment, talent management, HR technology, recruitment automation, multi-platform integration, EEO compliance",
    ogTitle: "HirePlan ATS - Enterprise Applicant Tracking System",
    ogDescription: "Complete enterprise ATS solution with comprehensive recruitment management features and job board integrations.",
    ogUrl: "https://hireplan.co/ats",
    ogImage: "https://hireplan.co/og-ats-image.png",
    canonical: "https://hireplan.co/ats",
  });

  return (
    <main>
      <ATSHeroSection />
      <ATSFeaturesSection />
      <ClientShowcaseSection />
      <IntegrationsSection />
      <ATSTestimonialsSection />
      <ATSCTASection />
    </main>
  );
}