export type Role = "ADMIN" | "SALES" | "WAREHOUSE" | "ACCOUNTS";

export type Permission =
  | "dashboard.view"
  | "customers.view"
  | "customers.manage"
  | "followups.manage"
  | "products.view"
  | "products.manage"
  | "inventory.view"
  | "inventory.manage"
  | "challans.view"
  | "challans.manage"
  | "reports.view"
  | "users.manage";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarInitials: string;
  department?: string;
  phone?: string;
  notifyLowStock?: boolean;
  notifyFollowUps?: boolean;
  notifyChallans?: boolean;
  notifySystem?: boolean;
}

export interface UserManagement {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  phone: string | null;
  isDeleted: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  user: string;
  role: string;
  action: string;
  module: string;
  timestamp: string;
}

export type CustomerType = "RETAILER" | "DISTRIBUTOR" | "WHOLESALER" | "LEAD";
export type CustomerStatus = "ACTIVE" | "INACTIVE" | "PROSPECT";

export interface FollowUp {
  id: string;
  customerId: string;
  date: string;
  note: string;
  createdBy: string;
  outcome: "PENDING" | "DONE" | "MISSED";
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  businessName: string;
  gst: string;
  address: string;
  city: string;
  type: CustomerType;
  status: CustomerStatus;
  followUpDate: string | null;
  notes: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minimumStock: number;
  warehouse: string;
  createdAt: string;
}

export type MovementType = "IN" | "OUT";

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  type: MovementType;
  reason: string;
  createdBy: string;
  createdAt: string;
}

export type ChallanStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";

export interface ChallanItem {
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
}

export interface Challan {
  id: string;
  challanNo: string;
  customerId: string;
  customerName: string;
  status: ChallanStatus;
  items: ChallanItem[];
  totalQuantity: number;
  totalValue: number;
  createdBy: string;
  createdAt: string;
  notes: string;
}

export interface Paginated<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface QueryParams {
  search?: string | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
  sortBy?: string | undefined;
  sortDir?: "asc" | "desc" | undefined;
  filters?: Record<string, string | undefined> | undefined;
}
