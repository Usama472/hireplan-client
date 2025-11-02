import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import type { FieldValues } from "react-hook-form";
import { useFormContext } from "react-hook-form";

// Add calendar imports
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { InputFieldProps } from "@/interfaces";
import { INPUT_TYPES } from "@/interfaces";
import { capitalizeText, cn } from "@/lib/utils";
import { Textarea } from "@components/ui/textarea";
import { TiptapEditor } from "./TiptapEditor";

export const InputField = <TFieldValues extends FieldValues = FieldValues>({
  name,
  defaultValue,
  type = INPUT_TYPES.TEXT,
  disabled,
  label,
  placeholder,
  selectOptions,
  className,
  multiline = false,
  showIsRequired = false,
  description,
  validation,
  minHeight,
  enableAI,
  aiContext,
  editorRef,
  step,
  min,
}: InputFieldProps<TFieldValues> & {
  validation?: { status: string; message: string };
  minHeight?: number;
  enableAI?: boolean;
  aiContext?: {
    jobTitle?: string;
    company?: string;
    requirements?: string[];
  };
  editorRef?: (editor: any) => void;
}) => {
  const { control, formState } = useFormContext();
  const [showPassword, setShowPassword] = useState(false);
  const { errors, dirtyFields } = formState;

  const fieldError = name.split(".").reduce((acc: any, part) => {
    return acc && acc[part] ? acc[part] : undefined;
  }, errors);

  const isDirty = name.split(".").reduce((acc: any, part) => {
    return acc && acc[part] !== undefined;
  }, dirtyFields);

  const renderFormLabel = (labelText?: string) => {
    if (!labelText) return null;
    return (
      <FormLabel
        className={cn(
          "paragraph-medium text-dark400_light700",
          fieldError && "text-red-500"
        )}
      >
        {capitalizeText(labelText || "")}
        {showIsRequired && <span className="text-red-400">{` * `}</span>}
      </FormLabel>
    );
  };

  const commonInputProps = {
    placeholder,
    type:
      type === INPUT_TYPES.PASSWORD
        ? showPassword
          ? "text"
          : "password"
        : type,
    defaultValue,
    step,
    min,
    disabled,
    className: cn(
      "bg-white border border-gray-300 rounded-md focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 placeholder:text-gray-400",
      fieldError && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
    ),
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const handleChange = (
          e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string
        ) => {
          let value: any = typeof e === "string" ? e : e.target.value;

          if (type === INPUT_TYPES.NUMBER) {
            const parsed = parseFloat(value);
            value = isNaN(parsed) ? "" : parsed;
          }

          field.onChange(value);
        };

        switch (type) {
          case INPUT_TYPES.CHECKBOX:
            return (
              <FormItem
                className={cn(
                  className,
                  "flex items-center w-full flex-col gap-2.5"
                )}
              >
                {renderFormLabel(label)}
                <FormControl>
                  <Input
                    {...field}
                    type="checkbox"
                    checked={field.value}
                    className="size-4 rounded-sm"
                    disabled={disabled}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500 mt-1.5" />
                {description && (
                  <FormDescription className="body-regular mt-2.5 text-light-400">
                    {description}
                  </FormDescription>
                )}
              </FormItem>
            );

          case INPUT_TYPES.SELECT:
            return (
              <FormItem className={className}>
                {renderFormLabel(label)}
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                  }}
                  disabled={disabled}
                >
                  <FormControl>
                    <SelectTrigger
                      className={cn(
                        "h-12 bg-white border border-gray-300 rounded-md focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900",
                        fieldError &&
                          "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      )}
                    >
                      <SelectValue
                        placeholder={placeholder || ""}
                        className="text-gray-400"
                      />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    {selectOptions?.map(({ value, label }) => (
                      <SelectItem key={value} value={value.toString()}>
                        {capitalizeText(label)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs text-red-500 mt-1.5" />
                {description && (
                  <FormDescription className="body-regular mt-2.5 text-light-400">
                    {description}
                  </FormDescription>
                )}
              </FormItem>
            );

          // case INPUT_TYPES.EDITOR:
          //   return (
          //     <FormItem className={cn(className, " w-full gap-2.5")}>
          //       {renderFormLabel(label)}
          //       <FormControl>
          //         <div className="w-full">
          //           {editorRef ? (
          //             <Editor
          //               value={field.value}
          //               fieldChange={(value) => {
          //                 field.onChange(value);
          //               }}
          //               editorRef={editorRef}
          //             />
          //           ) : (
          //             <div className="text-red-400">
          //               Editor ref is not provided
          //             </div>
          //           )}
          //         </div>
          //       </FormControl>
          //       <FormMessage />
          //       <FormDescription className="body-regular mt-2.5 text-light-400">
          //         {description}
          //       </FormDescription>
          //     </FormItem>
          //   );
          case INPUT_TYPES.EDITOR:
            return (
              <FormItem className={cn(className, "w-full gap-2.5")}>
                {renderFormLabel(label)}
                <FormControl>
                  <div className="w-full">
                    <TiptapEditor
                      name={name}
                      placeholder={placeholder}
                      validation={validation}
                      minHeight={minHeight}
                      enableAI={enableAI}
                      aiContext={aiContext}
                      onEditorReady={editorRef}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs text-red-500 mt-1.5" />
                {description && (
                  <FormDescription className="body-regular mt-2.5 text-light-400">
                    {description}
                  </FormDescription>
                )}
              </FormItem>
            );

          // New calendar input type
          case INPUT_TYPES.DATE:
            return (
              <FormItem className={className}>
                {renderFormLabel(label)}
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                          fieldError && "border-red-500 focus:border-red-500"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>{placeholder || "Pick a date"}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={disabled}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage className="text-xs text-red-500 mt-1.5" />
                {description && (
                  <FormDescription className="body-regular mt-2.5 text-light-400">
                    {description}
                  </FormDescription>
                )}
              </FormItem>
            );

          default:
            if (multiline) {
              return (
                <FormItem className={className}>
                  {renderFormLabel(label)}
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={5}
                      placeholder={placeholder}
                      value={field.value ?? ""}
                      disabled={disabled}
                      className={cn(
                        commonInputProps.className,
                        fieldError && "border-red-500 focus:border-red-500"
                      )}
                      onChange={handleChange}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500 mt-1.5" />
                  {description && (
                    <FormDescription className="body-regular mt-2.5 text-light-400">
                      {description}
                    </FormDescription>
                  )}
                </FormItem>
              );
            }

            return (
              <FormItem className={className}>
                {renderFormLabel(label)}
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      {...commonInputProps}
                      value={field.value ?? ""}
                      onChange={handleChange}
                    />
                    {type === INPUT_TYPES.PASSWORD && (
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    )}
                  </div>
                </FormControl>
                <FormMessage className="text-xs text-red-500 mt-1.5" />
                {description && (
                  <FormDescription className="body-regular mt-2.5 text-light-400">
                    {description}
                  </FormDescription>
                )}
              </FormItem>
            );
        }
      }}
    />
  );
};
