import { z } from 'zod';

export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    mobile: z.string().min(10, 'Mobile must be at least 10 digits'),
    email: z.string().email('Invalid email').optional().nullable(),
    businessName: z.string().optional().nullable(),
    gstNumber: z.string().optional().nullable(),
    type: z.enum(['Retail', 'Wholesale', 'Distributor']),
    address: z.string().optional().nullable(),
    status: z.enum(['Lead', 'Active', 'Inactive']),
    notes: z.string().optional().nullable()
  })
});

export const updateCustomerSchema = z.object({
  body: createCustomerSchema.shape.body.partial()
});
