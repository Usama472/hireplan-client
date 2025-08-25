"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, Star } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  recommended?: boolean;
}

interface PlanCardProps {
  plan: Plan;
  isSelected: boolean;
  onSelect: (planId: string) => void;
  disabled?: boolean;
  showUpgrade?: boolean;
  onCancel?: () => void;
  cancelLoading?: boolean;
  cancelAtPeriodEnd?: boolean;
}

export function PlanCard({ plan, isSelected, onSelect, disabled = false, showUpgrade = true, onCancel, cancelLoading = false, cancelAtPeriodEnd = false }: PlanCardProps) {
  return (
    <Card
      className={cn(
        "relative cursor-pointer transition-all duration-200 hover:shadow-lg",
        isSelected
          ? "ring-2 ring-blue-500 shadow-lg border-blue-200"
          : "hover:shadow-md border-gray-200",
        plan.popular && "border-blue-300 shadow-md"
      )}
      onClick={() => onSelect(plan.id)}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <Badge className="bg-blue-500 hover:bg-blue-500 text-white px-3 py-1 text-xs font-medium">
            <Star className="w-3 h-3 mr-1" />
            Most Popular
          </Badge>
        </div>
      )}

      {plan.recommended && (
        <div className="absolute -top-3 right-4 z-10">
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 px-2 py-1 text-xs font-medium"
          >
            Recommended
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <CardTitle className="text-lg font-bold text-gray-900">
          {plan.name}
        </CardTitle>
        <div className="flex items-baseline justify-center">
          <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
          <span className="text-gray-500 ml-1 text-sm">{plan.period}</span>
        </div>
        <CardDescription className="mt-2 text-sm">
          {plan.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <ul className="space-y-2 mb-6">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start text-sm">
              <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>

        {isSelected ? (
          <div className="space-y-2">
            <Button
              type="button"
              disabled={true}
              className="w-full bg-blue-600 text-white cursor-default"
            >
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Current Plan
              </span>
            </Button>
            {onCancel && (
              <>
                {cancelAtPeriodEnd ? (
                  <div className="text-center">
                    <p className="text-xs text-yellow-600 mb-2">Canceling at period end</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      disabled={cancelLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        onCancel();
                      }}
                    >
                      {cancelLoading ? 'Reactivating...' : 'Reactivate'}
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={cancelLoading}
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancel();
                    }}
                  >
                    {cancelLoading ? 'Canceling...' : 'Cancel Subscription'}
                  </Button>
                )}
              </>
            )}
          </div>
        ) : (
          <Button
            type="button"
            disabled={disabled}
            className={cn(
              "w-full transition-all duration-200",
              "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
            )}
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled) onSelect(plan.id);
            }}
          >
            {showUpgrade ? "Upgrade to This Plan" : "Select Plan"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
