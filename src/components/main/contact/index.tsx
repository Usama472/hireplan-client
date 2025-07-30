import { Footer } from "@/components/common/navigation/main/footer";
import { Header } from "@/components/common/navigation/main/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  MapPin,
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
      <div className="min-h-screen bg-gray-50">
        <main className="pt-16 pb-8">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Message Sent Successfully!
              </h1>
              <p className="text-gray-600 mb-8">
                Thank you for contacting us. We'll get back to you within 24
                hours.
              </p>
              <Button
                onClick={() => setIsSubmitted(false)}
                className="bg-blue-600 hover:bg-blue-700"
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions about HirePlan? We're here to help. Reach out to
              our team and we'll get back to you within 24 hours.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <div className="space-y-4">
                {/* Contact Cards */}
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Mail className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Email Us
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          Send us an email and we'll respond promptly
                        </p>
                        <a
                          href="mailto:hello@hireplan.co"
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          hello@hireplan.co
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Phone className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Call Us
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          Speak directly with our team
                        </p>
                        <a
                          href="tel:+1-555-123-4567"
                          className="text-green-600 hover:text-green-700 font-medium"
                        >
                          +1 (555) 123-4567
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

<Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Clock className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Business Hours
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          When you can reach us
                        </p>
                        <div className="text-orange-600 text-sm">
                          <div>Monday - Friday: 9:00 AM - 6:00 PM PST</div>
                          <div>Saturday: 10:00 AM - 2:00 PM PST</div>
                          <div>Sunday: Closed</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Send us a Message
                    </h2>
                    <p className="text-gray-600">
                      Fill out the form below and we'll get back to you as soon
                      as possible.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <Label
                          htmlFor="firstName"
                          className="text-sm font-medium text-gray-700"
                        >
                          First Name *
                        </Label>
                        <Input
                          id="firstName"
                          {...register("firstName")}
                          className={`mt-1 ${
                            errors.firstName ? "border-red-500" : ""
                          }`}
                          placeholder="Enter your first name"
                        />
                        {errors.firstName && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.firstName.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label
                          htmlFor="lastName"
                          className="text-sm font-medium text-gray-700"
                        >
                          Last Name *
                        </Label>
                        <Input
                          id="lastName"
                          {...register("lastName")}
                          className={`mt-1 ${
                            errors.lastName ? "border-red-500" : ""
                          }`}
                          placeholder="Enter your last name"
                        />
                        {errors.lastName && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <Label
                        htmlFor="email"
                        className="text-sm font-medium text-gray-700"
                      >
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        className={`mt-1 ${
                          errors.email ? "border-red-500" : ""
                        }`}
                        placeholder="Enter your email address"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Company and Job Title */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <Label
                          htmlFor="company"
                          className="text-sm font-medium text-gray-700"
                        >
                          Company *
                        </Label>
                        <Input
                          id="company"
                          {...register("company")}
                          className={`mt-1 ${
                            errors.company ? "border-red-500" : ""
                          }`}
                          placeholder="Enter your company name"
                        />
                        {errors.company && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.company.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label
                          htmlFor="jobTitle"
                          className="text-sm font-medium text-gray-700"
                        >
                          Job Title *
                        </Label>
                        <Input
                          id="jobTitle"
                          {...register("jobTitle")}
                          className={`mt-1 ${
                            errors.jobTitle ? "border-red-500" : ""
                          }`}
                          placeholder="Enter your job title"
                        />
                        {errors.jobTitle && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.jobTitle.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Inquiry Type */}
                    <div>
                      <Label
                        htmlFor="inquiryType"
                        className="text-sm font-medium text-gray-700"
                      >
                        Inquiry Type *
                      </Label>
                      <Select
                        value={inquiryType}
                        onValueChange={(value) =>
                          setValue("inquiryType", value)
                        }
                      >
                        <SelectTrigger
                          className={`mt-1 ${
                            errors.inquiryType ? "border-red-500" : ""
                          }`}
                        >
                          <SelectValue placeholder="Select inquiry type" />
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
                        <p className="mt-1 text-sm text-red-600">
                          {errors.inquiryType.message}
                        </p>
                      )}
                    </div>

                    {/* Message */}
                    <div>
                      <Label
                        htmlFor="message"
                        className="text-sm font-medium text-gray-700"
                      >
                        Message *
                      </Label>
                      <Textarea
                        id="message"
                        {...register("message")}
                        rows={6}
                        className={`mt-1 ${
                          errors.message ? "border-red-500" : ""
                        }`}
                        placeholder="Tell us how we can help you..."
                      />
                      {errors.message && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.message.message}
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 px-8 py-3"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Quick answers to common questions. Can't find what you're
                looking for? Contact us directly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    How does HirePlan work?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Our AI analyzes resumes and job requirements to find the
                    best matches, reducing screening time by 90%.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    What's included in the free trial?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    14-day access to all features, up to 50 candidate profiles,
                    and full AI matching capabilities.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Zap className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    How quickly can I get started?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Setup takes less than 5 minutes. Upload your job
                    requirements and start matching candidates immediately.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
