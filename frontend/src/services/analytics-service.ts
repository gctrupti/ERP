import api from "@/lib/api";
import type { DashboardSummary, ReportSummary } from "@/types";

export const analyticsService = {
  async dashboard(): Promise<DashboardSummary> {
    try {
      const { data } = await api.get('/dashboard/kpis');
      const kpis = data.data;
      
      return {
        totalCustomers: kpis.totalCustomers,
        activeCustomers: kpis.activeCustomers,
        totalProducts: kpis.totalProducts,
        lowStockCount: kpis.lowStockProducts,
        todaysFollowUps: kpis.todaysFollowups || [],
        recentChallans: kpis.recentChallans || [],
        lowStockItems: kpis.lowStockItems || [],
        stockValue: kpis.inventoryValue,
        confirmedThisMonth: kpis.challans?.Confirmed || 0,
        salesTrend: kpis.salesTrend || [],
        categoryMix: kpis.categoryMix || [],
      };
    } catch {
      return {
        totalCustomers: 0,
        activeCustomers: 0,
        totalProducts: 0,
        lowStockCount: 0,
        todaysFollowUps: [],
        recentChallans: [],
        lowStockItems: [],
        stockValue: 0,
        confirmedThisMonth: 0,
        salesTrend: [],
        categoryMix: [],
      };
    }
  },

  async reports(): Promise<ReportSummary> {
    try {
      const { data } = await api.get('/reports');
      return data.data;
    } catch {
      return {
        inventory: [],
        customers: [],
        sales: []
      };
    }
  },
};
