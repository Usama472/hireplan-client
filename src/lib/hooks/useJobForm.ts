import { JOB_FORM_DEFAULT_VALUES } from "@/constants/job-form-defaults";
import { JOB_FORM_TEST_DATA } from "@/constants/job-form-defaults";
import {
  jobFormSchema,
  type JobFormSchema,
} from "@/lib/validations/forms/job-form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function useJobForm() {
  const form = useForm<JobFormSchema>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: JOB_FORM_DEFAULT_VALUES,
    mode: "onChange",
  });

  const { setValue } = form;

  const loadTestData = () => {
    Object.keys(JOB_FORM_TEST_DATA).forEach((key) => {
      setValue(key as keyof JobFormSchema, (JOB_FORM_TEST_DATA as any)[key]);
    });
    toast.success("Test data loaded successfully!");
  };

  const resetForm = () => {
    form.reset(JOB_FORM_DEFAULT_VALUES);
    toast.success("Form reset to default values!");
  };

  return {
    form,
    loadTestData,
    resetForm,
  };
}
