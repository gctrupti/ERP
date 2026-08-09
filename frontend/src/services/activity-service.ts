import api from "@/lib/api";
import { ActivityLog } from "@/types";

export const activityService = {
  getRecentLogs: async (): Promise<ActivityLog[]> => {
    const { data } = await api.get("/activity-logs");
    return data.data;
  }
};
