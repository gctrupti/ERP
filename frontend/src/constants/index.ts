import {
  LayoutDashboard,
  Users,
  Package,
  Warehouse,
  FileText,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { Permission, Role } from "@/types";

export const APP_NAME = "Nexora ERP";
export const APP_TAGLINE = "Operations portal for wholesale & distribution";

export const DEFAULT_PAGE_SIZE = 8;
export const PAGE_SIZE_OPTIONS = [8, 16, 32];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    "dashboard.view",
    "customers.view",
    "customers.manage",
    "followups.manage",
    "products.view",
    "products.manage",
    "inventory.view",
    "inventory.manage",
    "challans.view",
    "challans.manage",
    "reports.view",
    "users.manage",
  ],
  SALES: [
    "dashboard.view",
    "customers.view",
    "customers.manage",
    "followups.manage",
    "products.view",
    "challans.view",
    "challans.manage",
    "reports.view",
  ],
  WAREHOUSE: [
    "dashboard.view",
    "products.view",
    "products.manage",
    "inventory.view",
    "inventory.manage",
    "challans.view",
    "reports.view",
  ],
  ACCOUNTS: ["dashboard.view", "customers.view", "challans.view", "reports.view"],
};

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrator",
  SALES: "Sales Executive",
  WAREHOUSE: "Warehouse Lead",
  ACCOUNTS: "Accounts",
};

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  permission: Permission;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, permission: "dashboard.view" },
  { label: "Customers", to: "/customers", icon: Users, permission: "customers.view" },
  { label: "Products", to: "/products", icon: Package, permission: "products.view" },
  { label: "Inventory", to: "/inventory", icon: Warehouse, permission: "inventory.view" },
  { label: "Sales Challans", to: "/challans", icon: FileText, permission: "challans.view" },
  { label: "Reports", to: "/reports", icon: BarChart3, permission: "reports.view" },
  { label: "Settings", to: "/settings", icon: Settings, permission: "dashboard.view" },
];

export const CUSTOMER_TYPES = ["RETAILER", "DISTRIBUTOR", "WHOLESALER", "LEAD"] as const;
export const CUSTOMER_STATUSES = ["ACTIVE", "INACTIVE", "PROSPECT"] as const;
export const PRODUCT_CATEGORIES = [
  "Packaging",
  "Stationery",
  "Hardware",
  "Consumables",
  "Electricals",
] as const;
export const WAREHOUSES = ["Pune Central", "Nashik Hub", "Mumbai Dock"] as const;
export const MOVEMENT_REASONS = [
  "Purchase received",
  "Sales challan",
  "Stock audit correction",
  "Damaged goods",
  "Return from customer",
] as const;

export const DEMO_CREDENTIALS: { role: Role; email: string; password: string }[] = [
  { role: "ADMIN", email: "admin@nexora.co", password: "DEMO1234" },
  { role: "SALES", email: "sales@nexora.co", password: "DEMO1234" },
  { role: "WAREHOUSE", email: "warehouse@nexora.co", password: "DEMO1234" },
  { role: "ACCOUNTS", email: "accounts@nexora.co", password: "DEMO1234" },
];
