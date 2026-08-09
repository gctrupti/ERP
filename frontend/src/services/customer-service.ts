import api from "@/lib/api";
import type { Customer, FollowUp, Paginated, QueryParams } from "@/types";

export type CustomerInput = Omit<Customer, "id" | "createdAt">;

export const customerService = {
  async list(params: QueryParams = {}): Promise<Paginated<Customer>> {
    const { data } = await api.get('/customers', { params: {
      page: params.page,
      limit: params.pageSize,
      search: params.search,
      status: params.filters?.status,
      type: params.filters?.type
    }});
    return {
      rows: data.data || [],
      total: data.total || 0,
      page: data.page || 1,
      pageSize: data.limit || params.pageSize || 10,
    };
  },

  async get(id: string): Promise<Customer | undefined> {
    const { data } = await api.get(`/customers/${id}`);
    return data.data;
  },

  async create(input: CustomerInput): Promise<Customer> {
    const { data } = await api.post('/customers', input);
    return data.data;
  },

  async update(id: string, input: Partial<CustomerInput>): Promise<Customer> {
    const { data } = await api.put(`/customers/${id}`, input);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/customers/${id}`);
  },

  async followUps(customerId: string): Promise<FollowUp[]> {
    // Requires a backend route for followups. Using basic GET if available or returning empty for now until backend is fully modeled
    try {
      const { data } = await api.get(`/customers/${customerId}`);
      return data.data?.followups || [];
    } catch {
      return [];
    }
  },

  async addFollowUp(input: Omit<FollowUp, "id">): Promise<FollowUp> {
    // Requires backend route. Placeholder for now.
    const { data } = await api.post(`/customers/${input.customerId}/followups`, input);
    return data.data;
  },

  async todaysFollowUps(): Promise<FollowUp[]> {
    // Needs dashboard or specific endpoint. Returning empty array for now.
    return [];
  },
};
