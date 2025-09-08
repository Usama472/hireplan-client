import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Phone, Shield, CheckCircle, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

export function SMSOptIn() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");

    // Format as (XXX) XXX-XXXX
    if (digits.length >= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(
        6,
        10
      )}`;
    } else if (digits.length >= 3) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return digits;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !agreed) return;

    setIsSubmitting(true);

    try {
      // TODO: Implement SMS opt-in API call with subscription check
      // This feature requires Professional+ subscription
      // await API.sms.optIn({ phoneNumber: phoneNumber.replace(/\D/g, '') })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsSubmitted(true);
    } catch (error) {
      console.error("SMS opt-in failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm border-2 border-purple-200/60">
        <CardContent className="p-8 text-center">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-purple-200">
            <CheckCircle className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-purple-800 mb-3">
            Successfully Subscribed!
          </h3>
          <p className="text-gray-600 mb-4 leading-relaxed">
            You'll receive updates about new job opportunities and hiring tips.
          </p>
          <div className="inline-flex items-center space-x-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm border border-purple-200">
            <Shield className="w-4 h-4" />
            <span>Secure & Private</span>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Reply STOP to unsubscribe at any time.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="bg-white border-2 border-gray-200 shadow-lg">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-gray-600 transition-colors duration-200 z-10" />
              <Input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="(555) 123-4567"
                className="pl-12 h-14 text-base bg-white border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 transition-all duration-200 placeholder:text-gray-500 shadow-sm"
                maxLength={14}
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={!phoneNumber || !agreed || isSubmitting}
            variant="secondary"
            className="h-14 px-8 font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 group z-10 shadow-lg hover:shadow-xl"
          >
            {isSubmitting ? "Joining..." : "Join Now"}
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
          </Button>
        </div>

        <div className="flex items-start space-x-3">
          <Checkbox
            id="sms-consent"
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked as boolean)}
            className="mt-1 flex-shrink-0"
          />
          <div className="text-sm text-gray-700 leading-relaxed space-y-2">
            <p>
              I agree to receive hiring tips and platform updates from HirePlan
              (frequency varies). Msg & data rates may apply. Reply STOP to opt
              out or HELP for help. Not required to use our services.
            </p>
            <p>
              See our{" "}
              <span
                onClick={() => navigate("/privacy")}
                className="text-blue-600 hover:text-blue-700 underline font-semibold cursor-pointer"
              >
                Privacy Policy
              </span>{" "}
              and{" "}
              <span
                onClick={() => navigate("/terms")}
                className="text-blue-600 hover:text-blue-700 underline font-semibold cursor-pointer"
              >
                Terms
              </span>
              .
            </p>
          </div>
        </div>
          </form>

          <div className="mt-8 text-center">
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>All carriers supported</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>support@hireplan.co</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
