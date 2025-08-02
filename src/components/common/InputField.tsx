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
  editorRef,
}: InputFieldProps<TFieldValues>) => {
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
        "paragraph-medium text-dark400_light700",
        fieldError && "text-red-500"
      )}
    >
      {capitalizeText(labelText || "")}
      {showIsRequired && <span className="text-red-400">{` * `}</span>}
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
      "paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 no-focus min-h-12 resize-none rounded-1.5 border",
      fieldError && "border-red-500 focus:border-red-500"
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
                <FormDescription className="body-regular mt-2.5 text-light-400">
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
                        "w-full",
                        fieldError &&
                          "border-red-500 focus-visible:ring-red-500",
                        isDirty &&
                          !fieldError &&
                          "border-blue-300 focus-visible:ring-blue-500"
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
                <FormDescription className="body-regular mt-2.5 text-light-400">
                  {description}
                </FormDescription>
              </FormItem>
            );

          case INPUT_TYPES.EDITOR:
            return (
              <FormItem className={cn(className, " w-full gap-2.5")}>
                {renderFormLabel(label)}
                <FormControl>
                  <div className="w-full">
                    {editorRef ? (
                      <Editor
                        value={field.value}
                        fieldChange={(value) => {
                          field.onChange(value);
                        }}
                        editorRef={editorRef}
                      />
                    ) : (
                      <div className="text-red-400">
                        Editor ref is not provided
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
                <FormDescription className="body-regular mt-2.5 text-light-400">
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
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
                <FormDescription className="body-regular mt-2.5 text-light-400">
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
                        commonInputProps.className,
                        fieldError && "border-red-500 focus:border-red-500"
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
                <FormMessage className="text-red-500" />
                <FormDescription className="body-regular mt-2.5 text-light-400">
                  {description}
                </FormDescription>
              </FormItem>
            );
        }
      }}
    />
  );
};
