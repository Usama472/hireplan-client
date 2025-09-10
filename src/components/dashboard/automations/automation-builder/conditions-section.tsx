import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AlertCircle, Filter, FilterX, Plus, Trash2 } from "lucide-react";
import { useFieldArray } from "react-hook-form";

export default function ConditionsSection({ form }: { form: any }) {
  // Use field array to handle dynamic conditions
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "conditions",
  });

  // Define field options
  const fieldOptions = [
    { value: "resumeScore", label: "Resume Score" },
    { value: "applicationAge", label: "Application Age (days)" },
    { value: "jobTitle", label: "Job Title" },
    { value: "department", label: "Department" },
    { value: "location", label: "Location" },
  ];

  // Define operator options
  const operatorOptions = [
    { value: ">", label: "Greater than" },
    { value: "<", label: "Less than" },
    { value: "=", label: "Equal to" },
    { value: "!=", label: "Not equal to" },
    { value: "contains", label: "Contains" },
    { value: "starts_with", label: "Starts with" },
    { value: "ends_with", label: "Ends with" },
  ];

  // Add new condition
  const addCondition = (e?: React.MouseEvent) => {
    // Prevent default form submission if this is triggered by a button
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    append({
      field: "resumeScore",
      operator: ">",
      value: "",
    });
  };

  return (
    <div className="space-y-5">
      {fields.length === 0 ? (
        <div className="rounded-lg p-6 bg-gradient-to-r from-amber-50 to-amber-100/20 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="mx-auto mb-4 bg-gradient-to-br from-amber-100 to-amber-200 h-14 w-14 rounded-full flex items-center justify-center">
              <FilterX className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="text-base font-medium text-amber-900 mb-2">
              No conditions added
            </h3>
            <p className="text-sm text-amber-700 mb-4 max-w-xs mx-auto">
              Without conditions, your automation will run every time the
              trigger event occurs.
            </p>
            <Button
              type="button"
              onClick={(e) => addCondition(e)}
              className="bg-amber-600 hover:bg-amber-700 text-white border-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Condition
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className={cn(
                  "bg-white py-4 px-5 rounded-lg border-l-2 border-amber-300",
                  "transition-all duration-200 hover:border-l-amber-500"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-amber-500" />
                    <h4 className="text-sm font-medium text-gray-700">
                      Condition {index + 1}
                    </h4>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          remove(index);
                        }}
                        className="h-7 w-7 p-0 opacity-70 hover:opacity-100 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Remove condition</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <FormField
                    control={form.control}
                    name={`conditions.${index}.field`}
                    render={({ field: formField }) => (
                      <FormItem className="md:col-span-4">
                        <FormLabel className="text-sm text-gray-600 mb-1.5">
                          Field
                        </FormLabel>
                        <Select
                          onValueChange={formField.onChange}
                          defaultValue={formField.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 text-sm bg-white border-gray-200">
                              <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {fieldOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                                className="cursor-pointer"
                              >
                                {option.label}
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
                    render={({ field: formField }) => (
                      <FormItem className="md:col-span-3">
                        <FormLabel className="text-sm text-gray-600 mb-1.5">
                          Operator
                        </FormLabel>
                        <Select
                          onValueChange={formField.onChange}
                          defaultValue={formField.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 text-sm bg-white border-gray-200">
                              <SelectValue placeholder="Select operator" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {operatorOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                                className="cursor-pointer"
                              >
                                {option.label}
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
                    render={({ field: formField }) => (
                      <FormItem className="md:col-span-5">
                        <FormLabel className="text-sm text-gray-600 mb-1.5">
                          Value
                        </FormLabel>
                        <FormControl>
                          <input
                            className="h-10 px-3 w-full text-sm rounded-md border border-gray-200 bg-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Enter value"
                            {...formField}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-3">
            <Button
              type="button"
              onClick={(e) => addCondition(e)}
              variant="ghost"
              size="sm"
              className="text-sm font-medium text-amber-700 hover:text-amber-800 hover:bg-amber-50/50"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Another Condition
            </Button>

            <p className="text-sm text-gray-500">
              All conditions must be met to run the automation
            </p>
          </div>

          <div className="mt-4 bg-gray-50 border border-gray-100 rounded-md p-3 flex items-start">
            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 mr-2.5" />
            <p className="text-sm text-gray-600 leading-relaxed">
              Multiple conditions are combined with logical AND. Create separate
              automations if you need OR logic.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
