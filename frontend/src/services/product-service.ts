import api from "@/lib/api";
import type { MovementType, Paginated, Product, QueryParams, StockMovement } from "@/types";

export type ProductInput = Omit<Product, "id" | "createdAt">;

export const productService = {
  async list(params: QueryParams = {}): Promise<Paginated<Product>> {
    const { data } = await api.get('/products', { params: {
      page: params.page,
      limit: params.pageSize,
      search: params.search,
      category: params.filters?.category,
      warehouse: params.filters?.warehouse,
      stock: params.filters?.stock
    }});
    return {
      rows: data.data || [],
      total: data.total || 0,
      page: data.page || 1,
      pageSize: data.limit || params.pageSize || 10,
    };
  },

  async all(): Promise<Product[]> {
    // Pass high limit for 'all' products dropdowns
    const { data } = await api.get('/products', { params: { limit: 1000 } });
    return data.data; // Ensure backend returns a data array
  },

  async get(id: string): Promise<Product | undefined> {
    const { data } = await api.get(`/products/${id}`);
    return data.data;
  },

  async create(input: ProductInput): Promise<Product> {
    const { data } = await api.post('/products', input);
    return data.data;
  },

  async update(id: string, input: Partial<ProductInput>): Promise<Product> {
    const { data } = await api.put(`/products/${id}`, input);
    return data.data;
  },

  async lowStock(): Promise<Product[]> {
    // Currently backend doesn't have a dedicated lowStock endpoint, 
    // relying on dashboard KPIs or generic filtering if supported. 
    // Returning empty or a simple fetch for now.
    try {
      const { data } = await api.get('/products', { params: { stock: 'LOW', limit: 100 } });
      return data.data;
    } catch {
      return [];
    }
  },
};

export const inventoryService = {
  async movements(params: QueryParams = {}): Promise<Paginated<StockMovement>> {
    // Needs a backend endpoint /api/inventory/movements
    try {
      const { data } = await api.get('/inventory/movements', { params: {
        page: params.page,
        limit: params.pageSize,
        search: params.search,
        type: params.filters?.type
      }});
      return {
        rows: data.data || [],
        total: data.total || 0,
        page: data.page || 1,
        pageSize: data.limit || params.pageSize || 10,
      };
    } catch {
      return { rows: [], total: 0, page: 1, pageSize: 10 };
    }
  },

  async byProduct(productId: string): Promise<StockMovement[]> {
    // Needs backend endpoint
    try {
      const { data } = await api.get(`/inventory/movements/product/${productId}`);
      return data.data || [];
    } catch {
      return [];
    }
  },

  async move(input: {
    productId: string;
    quantity: number;
    type: MovementType;
    reason: string;
    createdBy: string;
  }): Promise<StockMovement> {
    const { data } = await api.post('/inventory/adjust', input);
    return data.data.movement;
  },
};
