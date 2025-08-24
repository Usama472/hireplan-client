import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Phone, Database, UserCheck, Mail, MessageSquare } from 'lucide-react'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 mt-8">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
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
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-blue-600" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                HirePlan, Inc. ("HirePlan," "we," "us," or "our") respects your privacy and is committed to protecting it in accordance with applicable laws and using generally-accepted industry practices. For purposes of this Privacy Policy, "Personal Information" means any information relating to an identified or identifiable individual (e.g., name, address, email address, phone number, or employment information).
              </p>
              <p className="text-gray-600">
                This Privacy Policy explains how HirePlan collects and uses Personal Information of visitors to our website and how our customers use our recruiting and hiring software platform (the "Services") to collect Personal Information from individuals who are job applicants or employees. This Privacy Policy does not apply to our customers, who manage Personal Information they collect through our Services in accordance with their own privacy policies.
              </p>
              <p className="text-gray-600">
                We will not sell or otherwise disclose your Personal Information to third parties for their marketing purposes without your explicit consent.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Database className="w-5 h-5 text-blue-600" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Personal Information</h4>
                <p className="text-gray-600 mb-2">We collect information you provide directly to us, including:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Name, email address, and contact information</li>
                  <li>Company information and job details</li>
                  <li>Resume and application materials</li>
                  <li>Phone number (for SMS alerts, if you opt-in)</li>
                  <li>Profile and account preferences</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Automatically Collected Information</h4>
                <p className="text-gray-600 mb-2">We automatically collect certain information when you use our services:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Device information and IP address</li>
                  <li>Browser type and operating system</li>
                  <li>Usage patterns and interactions with our platform</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">From Sales, Marketing, and Customer Support</h4>
                <p className="text-gray-600">
                  We collect Personal Information such as your name, company name, email address, phone number, and billing information when you request a demo of our Services, request sales information, or contact customer service.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Mobile Information Privacy</h4>
                <p className="text-gray-600">
                  No mobile information will be shared with third parties/affiliates for marketing/promotional purposes. Opt-in data and consent is not transferable to third parties/affiliates and this information will not be shared with any third parties.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* SMS Marketing Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-green-600" />
                SMS Marketing & Text Communications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Consent and Opt-In</h4>
                <p className="text-gray-600">
                  By providing your phone number and consenting to SMS communications, you agree to receive text messages 
                  from HirePlan about job opportunities, hiring tips, and platform updates. This consent is not required 
                  to use our services.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Message Frequency and Charges</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Message frequency varies based on your preferences and platform activity</li>
                  <li>Message and data rates may apply from your carrier</li>
                  <li>We support all major US carriers including AT&T, Verizon, T-Mobile, and others</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Opt-Out and Support</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Reply STOP to any message to unsubscribe immediately</li>
                  <li>Reply HELP for customer support</li>
                  <li>Contact us at support@hireplan.co for additional assistance</li>
                  <li>You can also opt-out through your account settings</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">SMS Delivery and Regulations</h4>
                <p className="text-gray-600">
                  Our SMS communications are sent through registered business messaging channels in accordance 
                  with TCPA regulations and carrier requirements. We maintain proper registrations with mobile carriers 
                  and follow all applicable laws and industry standards for business messaging.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <UserCheck className="w-5 h-5 text-purple-600" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">We use the information we collect to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                <li>Provide, maintain, and improve our hiring platform</li>
                <li>Match candidates with relevant job opportunities</li>
                <li>Send you requested notifications and updates (email and SMS)</li>
                <li>Communicate with you about your account and our services</li>
                <li>Analyze usage patterns to enhance user experience</li>
                <li>Prevent fraud and ensure platform security</li>
                <li>Comply with legal obligations and enforce our terms</li>
                <li>Manage relationships with our customers, partners, and vendors</li>
                <li>Send marketing communications (with your prior opt-in consent where required)</li>
                <li>Create anonymized and aggregated statistics for business purposes</li>
              </ul>
            </CardContent>
          </Card>

          {/* Information Sharing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-orange-600" />
                Information Sharing and Disclosure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">With Your Consent</h4>
                <p className="text-gray-600">
                  We share your information with potential employers when you apply for jobs or express interest in opportunities.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Service Providers</h4>
                <p className="text-gray-600">
                  We work with trusted third-party service providers who help us operate our platform, including SMS delivery 
                  services, email providers, and analytics platforms. These providers are bound by confidentiality agreements.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Legal Requirements and Protection</h4>
                <p className="text-gray-600 mb-2">We may disclose information:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>When required by law or court order</li>
                  <li>To comply with government subpoenas or warrants</li>
                  <li>To protect against fraud, abuse, or unlawful activity</li>
                  <li>To defend against third-party claims or allegations</li>
                  <li>To protect the security and integrity of our platform</li>
                  <li>To protect our property, rights, or safety of others</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Business Transfers</h4>
                <p className="text-gray-600">
                  We may transfer your information to an acquirer, successor, or assignee as part of any merger, acquisition, debt financing, sale of assets, or similar transaction, or in the event of insolvency, bankruptcy, or receivership.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-red-600" />
                Data Security and Retention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Security Measures</h4>
                <p className="text-gray-600">
                  We implement industry-standard security measures to protect your information, including encryption, 
                  secure data storage, and regular security audits.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Data Retention</h4>
                <p className="text-gray-600">
                  We retain your information for as long as necessary to provide our services and comply with legal obligations. 
                  You can request deletion of your account and data at any time.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Security Breach Notification</h4>
                <p className="text-gray-600">
                  Unfortunately, the Internet cannot be guaranteed to be 100% secure. In the event that any information under our control is compromised, we will take reasonable steps to investigate the situation and, where appropriate, notify affected individuals and take other steps in accordance with applicable laws and regulations.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <UserCheck className="w-5 h-5 text-indigo-600" />
                Your Rights and Choices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">You have the right to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                <li>Access and update your personal information</li>
                <li>Delete your account and associated data</li>
                <li>Opt-out of marketing communications (email and SMS)</li>
                <li>Request a copy of your data</li>
                <li>Object to certain uses of your information</li>
                <li>File complaints with relevant regulatory authorities</li>
              </ul>
              
              <div className="mt-6 space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Marketing Communications</h4>
                  <p className="text-gray-600">
                    If you do not wish to receive email marketing communications from us, you can opt-out by sending an email to privacy@hireplan.co or by following the unsubscribe instructions in our marketing emails. Where required under applicable law, we will only send you marketing communications with your prior consent.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Account Information</h4>
                  <p className="text-gray-600">
                    You can update, edit, or remove your account information at any time by logging into our website and accessing your account settings.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* International Data Transfers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Database className="w-5 h-5 text-teal-600" />
                International Data Transfers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                We may transfer your Personal Information to countries other than the country in which the data was originally collected. Those countries may not have the same data protection laws as the country in which you initially provided that information. When we transfer your Personal Information to other countries, we will protect it as described in this Privacy Policy.
              </p>
              <p className="text-gray-600">
                To offer our services, we may need to transfer your Personal Information among several countries where we have employees, facilities, or third-party subprocessors, including the United States, where we are headquartered. By providing your Personal Information, you consent to such transfer.
              </p>
            </CardContent>
          </Card>

          {/* Third-Party Links */}
          <Card>
            <CardHeader>
              <CardTitle>Third-Party Links and Services</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Our website may contain links to third-party websites or applications. When you click on a link to any other website or location, you will leave our website and go to another site, and another entity may collect Personal Information from you. We have no control over, do not review, and cannot be responsible for these outside websites or their content. Please be aware that the terms of this Privacy Policy do not apply to these outside websites, and we encourage you to read the privacy policies of every website you visit.
              </p>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <UserCheck className="w-5 h-5 text-pink-600" />
                Children's Privacy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                We do not knowingly collect, maintain, or use Personal Information from children under 13 years of age, and no part of our website is directed to children under the age of 13. We will take steps to delete it if we learn we have inadvertently collected it.
              </p>
              <p className="text-gray-600">
                If you learn that your child has provided us with Personal Information without your consent, you may alert us at privacy@hireplan.co. If we learn that we have collected any Personal Information from children under 13, we will promptly take steps to delete such information and terminate the child's account.
              </p>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Cookies and Tracking Technologies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                When you visit our websites, we and our third-party service providers receive and record information that you may have provided and your digital signature, such as your IP address. The technologies we use to track your movements around our website include cookies, tracking scripts and pixels, and tagging technologies.
              </p>
              <p className="text-gray-600">
                You can control the use of cookies at the individual browser level. If you do not want us to collect cookies, you may set your browser to refuse cookies or to alert you when cookies are being sent. If you want to learn more about cookies, or how to control, disable, or delete them, please visit http://www.aboutcookies.org for detailed guidance. Please note that some parts of our website may not function properly if cookies are disabled.
              </p>
            </CardContent>
          </Card>

          {/* Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Changes to Our Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Posting of Revised Privacy Policy</h4>
                <p className="text-gray-600">
                  We may revise this Privacy Policy from time to time. We will post any adjustments to the Privacy Policy on this web page, and the revised version will be effective when it is posted. If you are concerned about how your information is used, you should bookmark this page and read this Privacy Policy periodically.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">New Uses of Personal Information</h4>
                <p className="text-gray-600">
                  From time to time, we may desire to use Personal Information for uses not previously disclosed in our Privacy Policy. If our practices change regarding previously collected Personal Information in a way that would be materially less restrictive than stated in the version of this Privacy Policy in effect at the time we collected the information, we will make reasonable efforts to provide notice and obtain consent to any such uses as may be required by law.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-600" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                If you have questions about this privacy policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="text-gray-700"><strong>Email:</strong> privacy@hireplan.co</p>
                <p className="text-gray-700"><strong>Support:</strong> support@hireplan.co</p>
                <p className="text-gray-700"><strong>Address:</strong> HirePlan, Inc., 8 The Green, Suite 15717, Dover, DE 19901</p>
                <p className="text-gray-700"><strong>Phone:</strong> [Your Business Phone Number]</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 