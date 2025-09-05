import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface ConditionsSectionProps {
  form: any; // Using any temporarily to avoid TypeScript errors with form types
}

export default function ConditionsSection({ form }: ConditionsSectionProps) {
  const [showHelp, setShowHelp] = useState(false);

  const availableFields = [
    { value: "resumeScore", label: "Resume Score" },
    { value: "experience", label: "Experience (years)" },
    { value: "education", label: "Education Level" },
    { value: "location", label: "Location" },
    { value: "skills", label: "Skills" },
  ];

  const operators = [
    { value: "=", label: "Equals" },
    { value: "!=", label: "Not Equals" },
    { value: ">", label: "Greater Than" },
    { value: "<", label: "Less Than" },
    { value: ">=", label: "Greater Than or Equal" },
    { value: "<=", label: "Less Than or Equal" },
    { value: "contains", label: "Contains" },
    { value: "startsWith", label: "Starts With" },
    { value: "endsWith", label: "Ends With" },
  ];

  const conditions = form.watch("conditions") || [];

  const addCondition = () => {
    const currentConditions = form.getValues("conditions") || [];
    form.setValue("conditions", [
      ...currentConditions,
      { field: "resumeScore", operator: ">", value: "50" },
    ]);
  };

  const removeCondition = (index: number) => {
    const currentConditions = form.getValues("conditions") || [];
    form.setValue(
      "conditions",
      currentConditions.filter((_, i: number) => i !== index)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-medium">Conditions</h3>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowHelp(!showHelp)}
          className="text-xs"
        >
          {showHelp ? "Hide Examples" : "Show Examples"}
        </Button>
      </div>

      {showHelp && (
        <Card className="bg-gray-50 border-gray-200 shadow-none">
          <CardContent className="p-4 space-y-3">
            <h4 className="font-medium text-gray-700">Example Conditions</h4>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
              <li>Resume Score {">"} 75 (High quality candidates)</li>
              <li>Experience {">="} 3 (At least 3 years experience)</li>
              <li>Location contains "Remote" (Remote candidates)</li>
              <li>Skills contains "JavaScript" (JavaScript developers)</li>
            </ul>
            <p className="text-xs text-gray-500">
              Conditions are optional. If no conditions are set, the automation
              will run for all matching triggers.
            </p>
          </CardContent>
        </Card>
      )}

      {conditions.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-gray-300 rounded-md bg-gray-50 shadow-none">
          <p className="text-gray-500 mb-2">No conditions added yet</p>
          <p className="text-gray-400 text-sm mb-4">
            Without conditions, this automation will run for all matching
            triggers
          </p>
          <Button
            type="button"
            onClick={addCondition}
            variant="outline"
            className="mx-auto"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Condition
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {conditions.map((_, index: number) => (
            <Card key={index} className="shadow-none">
              <CardContent className="p-4">
                <div className="flex items-start">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`conditions.${index}.field`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Field</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableFields.map((fieldOption) => (
                                <SelectItem
                                  key={fieldOption.value}
                                  value={fieldOption.value}
                                >
                                  {fieldOption.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`conditions.${index}.operator`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Operator</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {operators.map((op) => (
                                <SelectItem key={op.value} value={op.value}>
                                  {op.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`conditions.${index}.value`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Value</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCondition(index)}
                    className="ml-2 mt-6"
                  >
                    <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCondition}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Another Condition
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
