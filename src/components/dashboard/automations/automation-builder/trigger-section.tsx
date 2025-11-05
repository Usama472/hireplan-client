import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  allTriggers,
  triggerCategories,
} from "@/constants/automations-constants";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useAutomation } from "@/contexts/AutomationContext";

export default function TriggerSection() {
  const navigate = useNavigate();
  const { selectedTriggerType, setSelectedTriggerType, isEditMode, automationName } = useAutomation();

  return (
    <div className="space-y-3">
      <p className="text-gray-600 text-xs">
        Choose when your automation should run by selecting a trigger event
        below
      </p>

      <div className="bg-gray-50/50 p-0.5 rounded-lg">
        <RadioGroup
          onValueChange={(value) => {
            setSelectedTriggerType(value);
          }}
          value={selectedTriggerType}
          className="space-y-3"
        >
          {triggerCategories.map((category) => {
            const CategoryIcon = category.icon;
            const categoryTriggers = allTriggers.filter(
              (t) => t.category === category.id
            );

            return (
              <div key={category.id} className="space-y-2">
                <div
                  className={cn(
                    "p-2 rounded-lg flex items-center gap-2",
                    category.bgColor
                  )}
                >
                  <div
                    className={cn(
                      "p-1 rounded-md",
                      category.color,
                      "bg-white/80"
                    )}
                  >
                    <CategoryIcon className={cn("h-4 w-4", category.color)} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">
                      {category.title}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {category.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pl-1.5">
                  {categoryTriggers.map((trigger) => (
                    <div key={trigger.type} className="relative">
                      <RadioGroupItem
                        value={trigger.type}
                        id={trigger.type}
                        className="peer sr-only"
                      />
                      <label
                        htmlFor={trigger.type}
                        className={cn(
                          "flex h-full cursor-pointer rounded-lg p-2.5 border border-gray-200",
                          "transition-all duration-150 hover:border-gray-300 hover:bg-white",
                          "peer-data-[state=checked]:border-primary/60 peer-data-[state=checked]:bg-primary/5",
                          "peer-focus-visible:outline-none peer-focus-visible:ring-1 peer-focus-visible:ring-primary"
                        )}
                      >
                        <div className="flex items-start w-full">
                          <div
                            className={cn(
                              "mt-0.5 p-1 rounded-md mr-2 flex-shrink-0",
                              trigger.iconBg
                            )}
                          >
                            <div className="text-primary">{trigger.icon}</div>
                          </div>
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-xs text-gray-800 truncate pr-1.5">
                                {trigger.label}
                              </p>
                              {selectedTriggerType === trigger.type && (
                                <div className={cn("text-primary h-3.5 w-3.5")}>
                                  <CheckCircle2 className="h-full w-full" />
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {trigger.description}
                            </p>
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </RadioGroup>
      </div>

    </div>
  );
}
