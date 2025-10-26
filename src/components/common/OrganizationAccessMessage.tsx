import { AlertCircle, Mail, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface OrganizationAccessMessageProps {
  userName?: string;
  userEmail?: string;
  supportEmail?: string;
  onContactAdmin?: () => void;
}

export function OrganizationAccessMessage({
  userName = "User",
  userEmail,
  supportEmail = "support@teamenvelope.com",
  onContactAdmin,
}: OrganizationAccessMessageProps) {
  const handleContactAdmin = () => {
    if (onContactAdmin) {
      onContactAdmin();
    } else {
      // Default action: open email client
      const subject = encodeURIComponent(
        "Request Access to Organization - Team Envelope"
      );
      const body = encodeURIComponent(
        `Hello,\n\nI need access to my organization in Team Envelope.\n\nMy email address: ${
          userEmail || "Not provided"
        }\nMy name: ${userName}\n\nPlease add me to the appropriate organization or let me know the next steps.\n\nThank you!`
      );
      window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to Team Envelope
          </h1>
          {userEmail && (
            <p className="text-sm text-gray-600">
              You're signed in as{" "}
              <span className="font-medium">{userName}</span>
            </p>
          )}
        </div>

        {/* Main Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-xl text-gray-900">
              No Organization Access
            </CardTitle>
            <CardDescription className="text-gray-600">
              You don't have access to any organizations yet. Contact your
              administrator to get invited to your team's shared workspace.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Alert */}
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Your administrator needs to invite you to your organization to
                access Team Envelope features.
              </AlertDescription>
            </Alert>

            {/* Contact Admin Section */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Contact Your Administrator
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Ask your team administrator to invite you to your
                    organization. They can add your email address to provide
                    access to your team's shared inbox and features.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <Button onClick={handleContactAdmin}>
              <Mail className="w-4 h-4 mr-2" />
              Contact Administrator
            </Button>

            {/* Help Text */}
            <p className="text-xs text-gray-500 text-center">
              Need help? Contact support at{" "}
              <a
                href={`mailto:${supportEmail}`}
                className="text-blue-600 hover:text-blue-700 underline"
              >
                {supportEmail}
              </a>
            </p>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Once your administrator adds you to an organization, you'll have
            access to all Team Envelope features including shared inboxes, team
            collaboration, and more.
          </p>
        </div>
      </div>
    </div>
  );
}
