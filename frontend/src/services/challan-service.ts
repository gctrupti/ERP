import api from "@/lib/api";
import type { Challan, ChallanItem, Paginated, QueryParams } from "@/types";

export type DraftChallanInput = {
  customerId: string;
  items: Omit<ChallanItem, "id" | "challanId">[];
  notes?: string;
};

export const challanService = {
  async list(params: QueryParams = {}): Promise<Paginated<Challan>> {
    const { data } = await api.get('/challans', { params: {
      page: params.page,
      limit: params.pageSize,
      search: params.search,
      status: params.filters?.status
    }});
    return {
      rows: data.data || [],
      total: data.total || 0,
      page: data.page || 1,
      pageSize: data.limit || params.pageSize || 10,
    };
  },

  async get(id: string): Promise<Challan | undefined> {
    const { data } = await api.get(`/challans/${id}`);
    return data.data;
  },

  async createDraft(input: DraftChallanInput): Promise<Challan> {
    const { data } = await api.post('/challans', input);
    return data.data;
  },

  async confirm(id: string): Promise<Challan> {
    const { data } = await api.post(`/challans/${id}/confirm`);
    return data.data;
  },

  async cancel(id: string): Promise<Challan> {
    const { data } = await api.post(`/challans/${id}/cancel`);
    return data.data;
  },

  async downloadPdf(id: string, challanNo: string): Promise<void> {
    const response = await api.get(`/challans/${id}/pdf`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Challan-${challanNo}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  }
};
