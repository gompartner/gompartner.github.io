import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", { year: "numeric", month: "long" });
}

export function formatDateRange(start: string, end?: string): string {
  const startFormatted = formatDate(start);
  const endFormatted = end ? formatDate(end) : "현재";
  return `${startFormatted} — ${endFormatted}`;
}

export function calculateDuration(start: string, end?: string): string {
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();
  const months =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth());
  if (months < 12) return `${months}개월`;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return remainingMonths > 0 ? `${years}년 ${remainingMonths}개월` : `${years}년`;
}
