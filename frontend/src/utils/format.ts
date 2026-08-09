import { format, isSameDay, parseISO } from "date-fns";

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-IN").format(Math.round(value));

export const formatDate = (value?: string | null) => {
  if (!value) return "—";
  try {
    return format(parseISO(value), "dd MMM yyyy");
  } catch {
    return "—";
  }
};

export const formatDateTime = (value?: string | null) => {
  if (!value) return "—";
  try {
    return format(parseISO(value), "dd MMM yyyy, HH:mm");
  } catch {
    return "—";
  }
};

export const isToday = (value?: string | null) => {
  if (!value) return false;
  try {
    return isSameDay(parseISO(value), new Date());
  } catch {
    return false;
  }
};

export const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

export const titleCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
