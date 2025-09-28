export function TermsOfServiceContent() {
  return (
    <div className="space-y-6 text-sm">
      <p className="text-gray-700 leading-relaxed">
        These terms govern your use of HirePlan and our services. By accessing and using HirePlan, you accept and agree to be bound by the terms and provision of this agreement. These terms apply to all visitors, users, and others who access or use the service.
      </p>
      
      <p className="text-xs text-gray-500">
        Last updated: {new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </p>

      {/* Acceptance of Terms */}
      <section>
        <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-3">
          Acceptance of Terms
        </h3>
        <p className="text-gray-700 leading-relaxed">
          By accessing and using HirePlan, you accept and agree to be bound by the terms and provision of this agreement. 
          These terms apply to all visitors, users, and others who access or use the service.
        </p>
      </section>

      {/* Service Description */}
      <section>
        <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-3">
          Service Description
        </h3>
        <p className="text-gray-700 leading-relaxed mb-4">
          HirePlan is a recruiting and hiring platform that connects employers with job candidates. Our services include:
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
          <li>Job posting and candidate matching</li>
          <li>Application tracking and management</li>
          <li>Communication tools between employers and candidates</li>
          <li>SMS and email notifications (with consent)</li>
          <li>Analytics and reporting features</li>
        </ul>
      </section>

      {/* User Responsibilities */}
      <section>
        <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-3">
          User Responsibilities
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Account Security</h4>
            <p className="text-gray-700 leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities 
              that occur under your account.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Accurate Information</h4>
            <p className="text-gray-700 leading-relaxed">
              You agree to provide accurate, current, and complete information during registration and to update 
              such information to keep it accurate, current, and complete.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Prohibited Uses</h4>
            <p className="text-gray-700 leading-relaxed mb-2">You may not use our service:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              <li>To submit false or misleading information</li>
            </ul>
          </div>
        </div>
      </section>

      {/* SMS Terms */}
      <section>
        <h3 className="text-lg font-bold text-primary mb-4">SMS Communications</h3>
        <p className="text-gray-700 leading-relaxed">
          By opting into SMS communications, you agree to receive text messages from HirePlan. Message frequency varies. 
          Message and data rates may apply. You can opt out at any time by replying STOP. 
          See our Privacy Policy for more details about how we handle your information.
        </p>
      </section>

      {/* Intellectual Property */}
      <section>
        <h3 className="text-lg font-bold text-primary mb-4">Intellectual Property</h3>
        <p className="text-gray-700 leading-relaxed">
          The service and its original content, features, and functionality are and will remain the exclusive property of 
          HirePlan and its licensors. The service is protected by copyright, trademark, and other laws.
        </p>
      </section>

      {/* Limitation of Liability */}
      <section>
        <h3 className="text-lg font-bold text-primary mb-4">Limitation of Liability</h3>
        <p className="text-gray-700 leading-relaxed">
          In no event shall HirePlan, nor its directors, employees, partners, agents, suppliers, or affiliates, 
          be liable for any indirect, incidental, special, consequential, or punitive damages, including without 
          limitation, loss of profits, data, use, goodwill, or other intangible losses.
        </p>
      </section>

      {/* Termination */}
      <section>
        <h3 className="text-lg font-bold text-primary mb-4">Termination</h3>
        <p className="text-gray-700 leading-relaxed">
          We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, 
          under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the terms.
        </p>
      </section>

      {/* Changes to Terms */}
      <section>
        <h3 className="text-lg font-bold text-primary mb-4">Changes to Terms</h3>
        <p className="text-gray-700 leading-relaxed">
          We reserve the right, at our sole discretion, to modify or replace these terms at any time. 
          If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
        </p>
      </section>

      {/* Contact Information */}
      <section>
        <h3 className="text-lg font-bold text-primary mb-4">Contact Information</h3>
        <p className="text-gray-700 leading-relaxed mb-4">
          If you have any questions about these Terms of Service, please contact us:
        </p>
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <p className="text-gray-700"><strong>Email:</strong> legal@hireplan.co</p>
          <p className="text-gray-700"><strong>Support:</strong> support@hireplan.co</p>
        </div>
      </section>
    </div>
  );
}
