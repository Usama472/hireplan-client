import { Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useSEO } from "@/lib/hooks/useSEO";

const PrivacyPolicy = () => {
  // SEO configuration
  useSEO({
    title: "Privacy Policy - HirePlan | Data Protection & Privacy",
    description: "Learn how HirePlan protects your privacy and handles your data. Read our comprehensive privacy policy covering data collection, usage, and your rights.",
    keywords: "HirePlan privacy policy, data protection, privacy rights, data security, GDPR compliance, user data",
    ogTitle: "Privacy Policy - HirePlan",
    ogDescription: "Learn how HirePlan protects your privacy and handles your data securely.",
    ogUrl: "https://hireplan.co/privacy",
    canonical: "https://hireplan.co/privacy",
    noindex: false,
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const sectionVariants = {
    hidden: {
      opacity: 0,
      x: -50,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      x: 30,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-primary text-white py-12 sm:py-16 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 pointer-events-none"></div>
        <div className="absolute top-10 sm:top-20 right-5 sm:right-10 w-32 sm:w-64 h-32 sm:h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"></div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <motion.div variants={sectionVariants}>
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/30">
              <Shield className="h-4 w-4 text-white" />
              <span>Privacy & Security</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">Privacy Policy</h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Your privacy is important to us. This policy explains how we
              collect, use, and protect your personal information.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-12">
        {/* I. GENERAL INFORMATION */}
        <motion.section variants={sectionVariants}>
          <h2 className="text-3xl font-bold text-primary mb-6">
            I. GENERAL INFORMATION
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed text-base">
            <p>
              This Privacy Policy details how HirePlan, LLC ("HirePlan," "we,"
              "us," or "our"), a private company headquartered in the United
              States, collects, uses, and protects your personal information
              when you interact with our hiring platform and related services
              (collectively, the "Platform"). By using our Platform, you agree
              to the collection and use of information in accordance with this
              policy.
            </p>
            <p>
              HirePlan acts as the data controller under applicable data
              protection laws, including the General Data Protection Regulation
              (GDPR) and the California Consumer Privacy Act (CCPA), and is
              responsible for ensuring that your personal information is
              processed in accordance with these laws.
            </p>
            <p>
              Our Platform may contain links to third-party websites or
              services. When you access these third-party services, you will be
              subject to their own privacy policies, and HirePlan is not
              responsible for how these third parties handle your personal data.
            </p>
          </div>
        </motion.section>

        {/* II. INFORMATION WE COLLECT */}
        <motion.section variants={sectionVariants}>
          <h2 className="text-3xl font-bold text-primary mb-6">
            II. INFORMATION WE COLLECT
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed text-base">
            <p>
              We collect various types of personal information to provide and
              improve our services:
            </p>
            <motion.div
              variants={cardVariants}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                        Purpose
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                        Personal Data
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                        Legal Basis
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <strong>Managing Your User Account</strong>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        Email, Password, Profile Image, Username, Full Name,
                        Address, Phone Number, Payment Details, Date of Birth,
                        Country
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        Performance of a contract (e.g., account setup and
                        access to features)
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <strong>Job Applications and Matching</strong>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        Resume, Cover Letter, Work Experience, Education,
                        Skills, Certifications, Job Preferences, Application
                        History
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        Performance of a contract and legitimate interest in
                        providing job matching services
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <strong>Platform Usage and Analytics</strong>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        IP Address, Browser Type, Device Information, Usage
                        Patterns, Search Queries, Click Data, Session Duration
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        Legitimate interest in improving platform functionality
                        and user experience
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <strong>Communication and Support</strong>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        Support Tickets, Chat Logs, Email Correspondence,
                        Feedback, Survey Responses, Feature Requests
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        Performance of a contract and legitimate interest in
                        providing customer support
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* III. HOW WE USE YOUR INFORMATION */}
        <motion.section variants={sectionVariants}>
          <h2 className="text-3xl font-bold text-primary mb-6">
            III. HOW WE USE YOUR INFORMATION
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed text-base">
            <p>
              We use the personal data we collect for the following purposes:
            </p>
            <motion.div
              variants={cardVariants}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                        Purpose
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                        Platform Development
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        Provide, maintain, and improve our hiring platform
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                        Job Matching
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        Match candidates with relevant job opportunities
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                        Notifications
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        Send you requested notifications and updates
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                        Account Communication
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        Communicate about your account and services
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                        Analytics
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        Analyze usage patterns to enhance experience
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                        Security
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        Prevent fraud and ensure platform security
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                        Legal Compliance
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        Comply with legal obligations and terms
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                        Relationship Management
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        Manage relationships with customers and partners
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                        Marketing
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        Send marketing communications (with consent)
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                        Business Intelligence
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        Create anonymized statistics for business
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* IV. INFORMATION SHARING AND DISCLOSURE */}
        <motion.section variants={sectionVariants}>
          <h2 className="text-3xl font-bold text-primary mb-6">
            IV. INFORMATION SHARING AND DISCLOSURE
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed text-base">
            <p>
              We may share your personal information in the following
              circumstances:
            </p>
            <motion.div
              variants={cardVariants}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                        Circumstance
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                        With Your Consent
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        We share your information with potential employers when
                        you apply for jobs or express interest in opportunities,
                        with your explicit consent.
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                        Service Providers
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        We work with trusted third-party service providers who
                        help us operate our platform, including SMS delivery
                        services, email providers, and analytics platforms.
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                        Legal Requirements
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        We may disclose information when required by law, to
                        comply with government subpoenas, to protect against
                        fraud or abuse, or to defend against third-party claims.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* V. DATA SECURITY AND RETENTION */}
        <motion.section variants={sectionVariants}>
          <h2 className="text-3xl font-bold text-primary mb-6">
            V. DATA SECURITY AND RETENTION
          </h2>
          <motion.div
            variants={cardVariants}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                      Aspect
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                      Security Measures
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      We implement industry-standard security measures including
                      encryption, secure data storage, and regular security
                      audits.
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                      Data Retention
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      We retain your information for as long as necessary to
                      provide our services and comply with legal obligations.
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                      Breach Notification
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      In the event of a security breach, we will take reasonable
                      steps to investigate and notify affected individuals.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.section>

        {/* VI. YOUR RIGHTS AND CHOICES */}
        <motion.section variants={sectionVariants}>
          <h2 className="text-3xl font-bold text-primary mb-6">
            VI. YOUR RIGHTS AND CHOICES
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed text-base">
            <p>
              Under applicable data protection laws, you have the following
              rights:
            </p>
            <motion.div
              variants={cardVariants}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                        Right
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                        Access and Update
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        Access and update your personal information
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                        Delete Account
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        Delete your account and associated data
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                        Marketing Opt-out
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        Opt-out of marketing communications
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                        Data Copy
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        Request a copy of your data
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                        Object to Use
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        Object to certain uses of your information
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                        File Complaints
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        File complaints with regulatory authorities
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
            <div className="mt-6 space-y-4 text-gray-700">
              <p>
                You can exercise these rights by contacting us at
                privacy@hireplan.co. We will respond to your request within 30
                days.
              </p>
            </div>
          </div>
        </motion.section>

        {/* VII. INTERNATIONAL DATA TRANSFERS */}
        <motion.section variants={sectionVariants}>
          <h2 className="text-3xl font-bold text-primary mb-6">
            VII. INTERNATIONAL DATA TRANSFERS
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed text-base">
            <p>
              We may transfer your personal information to countries other than
              the country in which the data was originally collected. Those
              countries may not have the same data protection laws as the
              country in which you initially provided that information.
            </p>
            <p>
              To offer our services, we may need to transfer your personal
              information among several countries where we have employees,
              facilities, or third-party subprocessors, including the United
              States, where we are headquartered. By providing your personal
              information, you consent to such transfer.
            </p>
          </div>
        </motion.section>

        {/* VIII. COOKIES AND TRACKING TECHNOLOGIES */}
        <motion.section variants={sectionVariants}>
          <h2 className="text-3xl font-bold text-primary mb-6">
            VIII. COOKIES AND TRACKING TECHNOLOGIES
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed text-base">
            <p>
              When you visit our Platform, we and our third-party service
              providers receive and record information that you may have
              provided and your digital signature, such as your IP address.
            </p>
            <p>
              The technologies we use to track your movements around our
              Platform include cookies, tracking scripts and pixels, and tagging
              technologies. You can control the use of cookies at the individual
              browser level.
            </p>
          </div>
        </motion.section>

        {/* IX. CHANGES TO THIS PRIVACY POLICY */}
        <motion.section variants={sectionVariants}>
          <h2 className="text-3xl font-bold text-primary mb-6">
            IX. CHANGES TO THIS PRIVACY POLICY
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed text-base">
            <p>
              We may revise this Privacy Policy from time to time. We will post
              any adjustments to the Privacy Policy on this web page, and the
              revised version will be effective when it is posted.
            </p>
            <p>
              If you are concerned about how your information is used, you
              should bookmark this page and read this Privacy Policy
              periodically.
            </p>
          </div>
        </motion.section>

        {/* X. CONTACT US */}
        <motion.section variants={sectionVariants}>
          <h2 className="text-3xl font-bold text-primary mb-6">
            X. CONTACT US
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed text-base">
            <p>
              If you have questions about this Privacy Policy or our data
              practices, please contact us:
            </p>
            <motion.div
              variants={cardVariants}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                        Contact Method
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                        Email
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        privacy@hireplan.co
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                        Support
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        support@hireplan.co
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                        Phone
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        [Your Business Phone Number]
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                        Business Address
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        HirePlan, LLC
                        <br />
                        8 The Green, Suite 15717
                        <br />
                        Dover, DE 19901
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
