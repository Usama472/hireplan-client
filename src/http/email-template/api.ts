import type { EmailTemplate, EmailTemplateVariable } from "@/interfaces";
import { del, get, post, put } from "../apiHelper";

export const createEmailTemplate = async (emailTemplate: EmailTemplate) =>
  post("/email-templates", emailTemplate);
export const updateEmailTemplate = async (
  emailTemplateId: string,
  emailTemplate: EmailTemplate
) => put(`/email-templates/${emailTemplateId}`, emailTemplate);

export const getEmailTemplates = async ({
  page,
  limit,
  searchQuery,
}: {
  page: number;
  limit: number;
  searchQuery?: string;
}) => get("/email-templates", { page, limit, searchQuery });

export const getEmailTemplate = async (emailTemplateId: string) =>
  get(`/email-templates/${emailTemplateId}`);

export const deleteEmailTemplate = async (emailTemplateId: string) =>
  del(`/email-templates/${emailTemplateId}`);

export const createVariableInEmailTemplate = async (
  emailTemplateId: string,
  variable: EmailTemplateVariable
) => {
  return post(`/email-templates/${emailTemplateId}/variables`, variable);
};

export const getVariablesInEmailTemplate = async (emailTemplateId: string) =>
  get(`/email-templates/${emailTemplateId}/variables`);
