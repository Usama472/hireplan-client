import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getToken = () => {
  return false;
};

export const capitalizeText = (text: string) => {
  return text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const errorResolver = (err: any) =>
  err?.response?.data?.message ??
  err?.response?.message ??
  err?.message ??
  "Something went wrong.";

export const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200 hover:border-green-300 transition-colors";
    case "draft":
      return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 hover:border-gray-300 transition-colors";
    case "paused":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 hover:border-yellow-300 transition-colors";
    case "closed":
      return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200 hover:border-red-300 transition-colors";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 hover:border-gray-300 transition-colors";
  }
};

export const getPriorityColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200 hover:border-red-300 transition-colors";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 hover:border-yellow-300 transition-colors";
    case "low":
      return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200 hover:border-green-300 transition-colors";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 hover:border-gray-300 transition-colors";
  }
};

export const getWorkplaceTypeColor = (type: string) => {
  switch (type?.toLowerCase()) {
    case "remote":
      return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 hover:border-blue-300 transition-colors";
    case "hybrid":
      return "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200 hover:border-purple-300 transition-colors";
    case "onsite":
      return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 hover:border-gray-300 transition-colors";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 hover:border-gray-300 transition-colors";
  }
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const getDaysUntilDeadline = (deadline: string) => {
  const days = Math.ceil(
    (new Date(deadline).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );
  return Math.max(0, days);
};

export const getEmploymentTypeLabel = (employmentType: string) => {
  return employmentType
    .replace("-", " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

export const getWorkplaceTypeLabel = (workplaceType: string) => {
  switch (workplaceType) {
    case "onsite":
      return "On-site";
    case "remote":
      return "Remote";
    case "hybrid":
      return "Hybrid";
    default:
      return workplaceType;
  }
};

export const getPayTypeLabel = (payType: string) => {
  switch (payType) {
    case "base-commission":
      return "Base + Commission";
    case "base-tips":
      return "Base + Tips";
    case "base-bonus":
      return "Base + Bonus";
    case "commission-only":
      return "Commission Only";
    default:
      return payType.charAt(0).toUpperCase() + payType.slice(1);
  }
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown error";
}
