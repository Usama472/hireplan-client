import { Footer } from "@/components/common/navigation/main/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle,
  Clock,
  Mail,
  MessageSquare,
  Phone,
  Send,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const contactSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  company: z.string().min(2, "Company name is required"),
  jobTitle: z.string().min(2, "Job title is required"),
  inquiryType: z.string().min(1, "Please select an inquiry type"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const inquiryTypes = [
  { value: "sales", label: "Sales Inquiry" },
  { value: "support", label: "Technical Support" },
  { value: "demo", label: "Request Demo" },
  { value: "partnership", label: "Partnership" },
  { value: "billing", label: "Billing Question" },
  { value: "other", label: "Other" },
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const inquiryType = watch("inquiryType");

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Contact form submitted:", data);
      setIsSubmitted(true);
      reset();
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <main className="pt-16 pb-8">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 border border-green-200/60">
              <div className="w-16 h-16 bg-gradient-to-br from-green-50 to-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-200">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Message Sent Successfully!
              </h1>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Thank you for contacting us. We'll get back to you within 24
                hours.
              </p>
              <Button
                onClick={() => setIsSubmitted(false)}
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold px-6 py-3 transition-all duration-200"
              >
                Send Another Message
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <main className="pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 text-secondary px-5 py-2.5 rounded-full text-sm font-medium mb-6 border border-blue-200/60">
              <MessageSquare className="h-4 w-4 text-secondary" />
              <span>Get in Touch</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight leading-tight">
              Let's Start a{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Conversation
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed font-light">
              Have questions about HirePlan? We're here to help. Reach out to
              our team and we'll get back to you within 24 hours.
            </p>
          </div>

          {/* Contact Information & Form Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Contact Cards */}
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-gray-200/60 hover:border-gray-300/60 transition-all duration-300 group">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-blue-200 group-hover:scale-110 transition-transform duration-200">
                      <Mail className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2 text-base">
                        Email Us
                      </h3>
                      <p className="text-gray-600 text-sm mb-2 leading-relaxed">
                        Send us an email and we'll respond promptly
                      </p>
                      <a
                        href="mailto:hello@hireplan.co"
                        className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 text-sm"
                      >
                        hello@hireplan.co
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-gray-200/60 hover:border-gray-300/60 transition-all duration-300 group">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-green-200 group-hover:scale-110 transition-transform duration-200">
                      <Phone className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2 text-base">
                        Call Us
                      </h3>
                      <p className="text-gray-600 text-sm mb-2 leading-relaxed">
                        Speak directly with our team
                      </p>
                      <a
                        href="tel:+1-555-123-4567"
                        className="text-green-600 hover:text-green-700 font-medium transition-colors duration-200 text-sm"
                      >
                        +1 (555) 123-4567
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-gray-200/60 hover:border-gray-300/60 transition-all duration-300 group">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-orange-200 group-hover:scale-110 transition-transform duration-200">
                      <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2 text-base">
                        Business Hours
                      </h3>
                      <p className="text-gray-600 text-sm mb-2 leading-relaxed">
                        When you can reach us
                      </p>
                      <div className="text-orange-600 text-sm space-y-1 font-medium">
                        <div>Monday - Friday: 9:00 AM - 6:00 PM PST</div>
                        <div>Saturday: 10:00 AM - 2:00 PM PST</div>
                        <div>Sunday: Closed</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 border border-gray-200/60">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Send us a Message
                  </h2>
                  <p className="text-gray-600 leading-relaxed text-base">
                    Fill out the form below and we'll get back to you as soon as
                    possible.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Input
                        id="firstName"
                        {...register("firstName")}
                        className={`h-12 border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-base ${
                          errors.firstName
                            ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                            : ""
                        }`}
                        placeholder="First Name *"
                      />
                      {errors.firstName && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.firstName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Input
                        id="lastName"
                        {...register("lastName")}
                        className={`h-12 border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-base ${
                          errors.lastName
                            ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                            : ""
                        }`}
                        placeholder="Last Name *"
                      />
                      {errors.lastName && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      className={`h-12 border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-base ${
                        errors.email
                          ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                          : ""
                      }`}
                      placeholder="Email Address *"
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Company and Job Title */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Input
                        id="company"
                        {...register("company")}
                        className={`h-12 border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-base ${
                          errors.company
                            ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                            : ""
                        }`}
                        placeholder="Company *"
                      />
                      {errors.company && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.company.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Input
                        id="jobTitle"
                        {...register("jobTitle")}
                        className={`h-12 border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-base ${
                          errors.jobTitle
                            ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                            : ""
                        }`}
                        placeholder="Job Title *"
                      />
                      {errors.jobTitle && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.jobTitle.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Inquiry Type */}
                  <div>
                    <Select
                      value={inquiryType}
                      onValueChange={(value) => setValue("inquiryType", value)}
                    >
                      <SelectTrigger
                        className={`h-12 border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-base ${
                          errors.inquiryType
                            ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                            : ""
                        }`}
                      >
                        <SelectValue placeholder="Select Inquiry Type *" />
                      </SelectTrigger>
                      <SelectContent>
                        {inquiryTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.inquiryType && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.inquiryType.message}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <Textarea
                      id="message"
                      {...register("message")}
                      rows={5}
                      className={`border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 resize-none text-base ${
                        errors.message
                          ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                          : ""
                      }`}
                      placeholder="Tell us how we can help you... *"
                    />
                    {errors.message && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium px-8 py-3 h-12 transition-all duration-200 group text-base"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform duration-200" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* FAQ Section */}
      <div className="mt-20 py-16 bg-gradient-to-r from-primary to-secondary relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/90 to-secondary/90"></div>

        {/* Floating Elements */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-medium mb-6 border border-white/30">
              <Zap className="h-4 w-4 text-white" />
              <span>Quick Answers</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto leading-relaxed font-light">
              Quick answers to common questions. Can't find what you're looking
              for? Contact us directly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 border border-white/30 hover:border-white/50 transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center mb-4 border border-blue-200 group-hover:scale-110 transition-transform duration-200">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-3 text-lg">
                How does HirePlan work?
              </h3>
              <p className="text-gray-700 leading-relaxed text-base">
                Our AI analyzes resumes and job requirements to find the best
                matches, reducing screening time by 90%.
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 border border-white/30 hover:border-white/50 transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg flex items-center justify-center mb-4 border border-green-200 group-hover:scale-110 transition-transform duration-200">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-3 text-lg">
                What's included in the free trial?
              </h3>
              <p className="text-gray-700 leading-relaxed text-base">
                14-day access to all features, up to 50 candidate profiles, and
                full AI matching capabilities.
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 border border-white/30 hover:border-white/50 transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg flex items-center justify-center mb-4 border border-purple-200 group-hover:scale-110 transition-transform duration-200">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-3 text-lg">
                How quickly can I get started?
              </h3>
              <p className="text-gray-700 leading-relaxed text-base">
                Setup takes less than 5 minutes. Upload your job requirements
                and start matching candidates immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
