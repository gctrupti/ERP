import api from "@/lib/api";
import { UserManagement } from "@/types";

export const usersService = {
  getUsers: async (): Promise<UserManagement[]> => {
    const { data } = await api.get("/users");
    return data.data;
  },
  createUser: async (payload: any): Promise<void> => {
    await api.post("/users", payload);
  },
  updateUser: async (id: string, payload: any): Promise<void> => {
    await api.put(`/users/${id}`, payload);
  },
  updateUserStatus: async (id: string, isDeleted: boolean): Promise<void> => {
    await api.patch(`/users/${id}/status`, { isDeleted });
  }
};
