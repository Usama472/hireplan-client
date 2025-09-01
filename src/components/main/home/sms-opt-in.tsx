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
      <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm border-2 border-green-200/60">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-50 to-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-200">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-green-800 mb-3">
            Successfully Subscribed!
          </h3>
          <p className="text-gray-600 mb-4 leading-relaxed">
            You'll receive updates about new job opportunities and hiring tips.
          </p>
          <div className="inline-flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm border border-green-200">
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
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5 group-focus-within:text-white transition-colors duration-200 z-10" />
              <Input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="(555) 123-4567"
                className="pl-12 h-14 text-base bg-white/20 backdrop-blur-sm border-2 border-white/30 focus:border-white/50 text-white transition-all duration-200 placeholder:text-gray-200/80"
                maxLength={14}
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={!phoneNumber || !agreed || isSubmitting}
            className="h-14 px-8 bg-primary text-white font-semibold border-0 transition-all duration-200 group z-10"
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
          <div className="text-xs text-white/90 leading-relaxed space-y-2">
            <p>
              I agree to receive hiring tips and platform updates from HirePlan
              (frequency varies). Msg & data rates may apply. Reply STOP to opt
              out or HELP for help. Not required to use our services.
            </p>
            <p>
              See our{" "}
              <span
                onClick={() => navigate("/privacy")}
                className="text-blue-200 hover:text-blue-100 underline font-medium cursor-pointer"
              >
                Privacy Policy
              </span>{" "}
              and{" "}
              <span
                onClick={() => navigate("/terms")}
                className="text-blue-200 hover:text-blue-100 underline font-medium cursor-pointer"
              >
                Terms
              </span>
              .
            </p>
          </div>
        </div>
      </form>

      <div className="mt-8 text-center">
        <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-white/80">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-300 rounded-full"></div>
            <span>Secure & Private</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
            <span>All carriers supported</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
            <span>support@hireplan.co</span>
          </div>
        </div>
      </div>
    </div>
  );
}
