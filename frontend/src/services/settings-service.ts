import api from "@/lib/api";

export const settingsService = {
  updateProfile: async (payload: { name: string; department?: string; phone?: string }) => {
    await api.put("/auth/profile", payload);
  },
  changePassword: async (payload: any) => {
    await api.post("/auth/change-password", payload);
  },
  logoutAll: async () => {
    await api.post("/auth/logout-all");
  },
  updateNotifications: async (payload: { 
    notifyLowStock: boolean;
    notifyFollowUps: boolean;
    notifyChallans: boolean;
    notifySystem: boolean;
  }) => {
    await api.put("/settings/notifications", payload);
  }
};
