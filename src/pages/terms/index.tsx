import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Scale, Shield, Users } from 'lucide-react'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Scale className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            These terms govern your use of HirePlan and our services.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        <div className="space-y-8">
          {/* Acceptance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600" />
                Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                By accessing and using HirePlan, you accept and agree to be bound by the terms and provision of this agreement. 
                These terms apply to all visitors, users, and others who access or use the service.
              </p>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="w-5 h-5 text-green-600" />
                Service Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                HirePlan is a recruiting and hiring platform that connects employers with job candidates. Our services include:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                <li>Job posting and candidate matching</li>
                <li>Application tracking and management</li>
                <li>Communication tools between employers and candidates</li>
                <li>SMS and email notifications (with consent)</li>
                <li>Analytics and reporting features</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-orange-600" />
                User Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Account Security</h4>
                <p className="text-gray-600">
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities 
                  that occur under your account.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Accurate Information</h4>
                <p className="text-gray-600">
                  You agree to provide accurate, current, and complete information during registration and to update 
                  such information to keep it accurate, current, and complete.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Prohibited Uses</h4>
                <p className="text-gray-600 mb-2">You may not use our service:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                  <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                  <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                  <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                  <li>To submit false or misleading information</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* SMS Terms */}
          <Card>
            <CardHeader>
              <CardTitle>SMS Communications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                By opting into SMS communications, you agree to receive text messages from HirePlan. Message frequency varies. 
                Message and data rates may apply. You can opt out at any time by replying STOP. 
                See our Privacy Policy for more details about how we handle your information.
              </p>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle>Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                The service and its original content, features, and functionality are and will remain the exclusive property of 
                HirePlan and its licensors. The service is protected by copyright, trademark, and other laws.
              </p>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card>
            <CardHeader>
              <CardTitle>Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                In no event shall HirePlan, nor its directors, employees, partners, agents, suppliers, or affiliates, 
                be liable for any indirect, incidental, special, consequential, or punitive damages, including without 
                limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle>Termination</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, 
                under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the terms.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We reserve the right, at our sole discretion, to modify or replace these terms at any time. 
                If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="text-gray-700"><strong>Email:</strong> legal@hireplan.co</p>
                <p className="text-gray-700"><strong>Support:</strong> support@hireplan.co</p>
                <p className="text-gray-700"><strong>Address:</strong> HirePlan, Inc., [Your Business Address]</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 