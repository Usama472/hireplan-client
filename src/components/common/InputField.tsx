import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import type { FieldValues } from "react-hook-form";
import { useFormContext } from "react-hook-form";

// Add calendar imports
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import Editor from "@/components/editor";
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
}: InputFieldProps<TFieldValues> & {
  validation?: { status: string; message: string };
  minHeight?: number;
  enableAI?: boolean;
  aiContext?: {
    jobTitle?: string;
    company?: string;
    requirements?: string[];
  };
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

  const renderFormLabel = (labelText?: string) => (
    <FormLabel
      className={cn(
        "text-sm font-medium text-foreground",
        fieldError && "text-destructive"
      )}
    >
      {capitalizeText(labelText || "")}
      {showIsRequired && <span className="text-destructive">{` * `}</span>}
    </FormLabel>
  );

  const commonInputProps = {
    placeholder,
    type:
      type === INPUT_TYPES.PASSWORD
        ? showPassword
          ? "text"
          : "password"
        : type,
    defaultValue,
    disabled,
    className: cn(
      "flex h-12 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      fieldError && "border-destructive focus-visible:ring-destructive"
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
                <FormMessage />
                <FormDescription className="text-sm text-muted-foreground mt-2.5">
                  {description}
                </FormDescription>
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
                        "flex h-12 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        fieldError &&
                        "border-destructive focus-visible:ring-destructive",
                        isDirty &&
                        !fieldError &&
                        "border-primary focus-visible:ring-primary"
                      )}
                    >
                      <SelectValue
                        placeholder={capitalizeText(placeholder || "")}
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
                <FormMessage />
                <FormDescription className="text-sm text-muted-foreground mt-2.5">
                  {description}
                </FormDescription>
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
                    />
                  </div>
                </FormControl>
                <FormMessage />
                <FormDescription className="text-sm text-muted-foreground mt-2.5">
                  {description}
                </FormDescription>
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
                          "flex h-12 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                          !field.value && "text-muted-foreground",
                          fieldError && "border-destructive focus-visible:ring-destructive"
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
                <FormMessage />
                <FormDescription className="text-sm text-muted-foreground mt-2.5">
                  {description}
                </FormDescription>
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
                        "flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        fieldError && "border-destructive focus-visible:ring-destructive"
                      )}
                      onChange={handleChange}
                    />
                  </FormControl>
                  <FormMessage />
                  <FormDescription className="body-regular mt-2.5 text-light-400">
                    {description}
                  </FormDescription>
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
                      <Button
                        type="button"
                        variant="icon"
                        size="sm"
                        className="absolute right-0 top-1 h-10 w-10 px-3 py-2"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </FormControl>
                <FormMessage className="text-destructive" />
                <FormDescription className="text-sm text-muted-foreground mt-2.5">
                  {description}
                </FormDescription>
              </FormItem>
            );
        }
      }}
    />
  );
};
