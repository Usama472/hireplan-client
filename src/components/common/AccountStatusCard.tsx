import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Brain, Mail } from "lucide-react";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";

export function AccountStatusCard() {
  const { subscription } = useAuthSessionContext();

  console.log('🔍 AccountStatusCard - Subscription:', subscription);

  if (!subscription) return null;

  const planId = subscription.planId || 'starter';
  const planName = subscription.planName || 'Starter';
  const hasAI = planId === 'professional' || planId === 'enterprise';
  const customPrice = (subscription as any).customMonthlyPrice;

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Account Status</CardTitle>
        <CardDescription>Your current features and access</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Features Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${hasAI ? 'bg-purple-100' : 'bg-gray-200'}`}>
              <Brain className={`w-4 h-4 ${hasAI ? 'text-purple-600' : 'text-gray-500'}`} />
            </div>
            <div>
              <p className="font-medium text-sm">AI Features</p>
              <p className="text-xs text-gray-500">
                Automated scoring & analysis
              </p>
            </div>
          </div>
          {hasAI ? (
            <Badge className="bg-green-100 text-green-700 border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Enabled
            </Badge>
          ) : (
            <Badge variant="outline" className="text-gray-600">
              <XCircle className="w-3 h-3 mr-1" />
              Disabled
            </Badge>
          )}
        </div>

        {/* Pricing Info (if set) */}
        {customPrice && customPrice > 0 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Monthly Price</p>
                <p className="text-xs text-blue-600">Managed by your organization</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-900">${customPrice}</p>
                <p className="text-xs text-blue-600">/month</p>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade Notice */}
        {!hasAI && (
          <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-blue-900 mb-1">Want AI Features?</p>
                <p className="text-xs text-blue-800 mb-2">
                  Upgrade to Professional or Enterprise for AI-powered screening
                </p>
                <a 
                  href="mailto:support@hireplan.co" 
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  Contact us to upgrade →
                </a>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

