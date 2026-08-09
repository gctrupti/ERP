import type { QueryParams } from "@/types";

/**
 * Centralised React Query cache keys. Keeps invalidation predictable across
 * feature modules.
 */
export const queryKeys = {
  dashboard: ["dashboard"] as const,
  reports: ["reports"] as const,
  customers: (params?: QueryParams) => ["customers", params ?? {}] as const,
  customer: (id: string) => ["customers", "detail", id] as const,
  followUps: (id: string) => ["customers", "followups", id] as const,
  products: (params?: QueryParams) => ["products", params ?? {}] as const,
  productOptions: ["products", "options"] as const,
  product: (id: string) => ["products", "detail", id] as const,
  movements: (params?: QueryParams) => ["movements", params ?? {}] as const,
  productMovements: (id: string) => ["movements", "product", id] as const,
  challans: (params?: QueryParams) => ["challans", params ?? {}] as const,
  challan: (id: string) => ["challans", "detail", id] as const,
};
