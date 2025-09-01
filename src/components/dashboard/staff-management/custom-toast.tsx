import { Check, Shield } from "lucide-react";

interface CustomToastProps {
  title: string;
  description?: string;
}

export function RoleCreatedToast({ title, description }: CustomToastProps) {
  return (
    <div className="flex items-start gap-3 w-full">
      <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
        <Check className="h-5 w-5 text-green-600" />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <p className="font-semibold text-gray-900">{title}</p>
        </div>

        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}
