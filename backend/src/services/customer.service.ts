// @ts-nocheck
import { AppError } from '../errors/AppError';
import { customerRepository } from '../repositories/customer.repository';
import { userRepository } from '../repositories/user.repository';
import { Prisma } from '@prisma/client';

export const customerService = {
  getAllCustomers: async (page: number, limit: number, search?: string, status?: string, type?: string) => {
    const skip = (page - 1) * limit;
    const conditions: Prisma.CustomerWhereInput[] = [];

    if (status && status.toLowerCase() !== 'all') {
      conditions.push({
        OR: [
          { status: status },
          { status: status.toUpperCase() },
          { status: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() },
          { status: status.toLowerCase() }
        ]
      });
    }

    if (type && type.toLowerCase() !== 'all') {
      conditions.push({
        OR: [
          { type: type },
          { type: type.toUpperCase() },
          { type: type.charAt(0).toUpperCase() + type.slice(1).toLowerCase() },
          { type: type.toLowerCase() }
        ]
      });
    }

    if (search) {
      conditions.push({
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { mobile: { contains: search } },
          { gstNumber: { contains: search } }
        ]
      });
    }

    const where: Prisma.CustomerWhereInput = conditions.length > 0 ? { AND: conditions } : {};

    const [data, total] = await Promise.all([
      customerRepository.findMany({ skip, take: limit, where, orderBy: { createdAt: 'desc' } }),
      customerRepository.count(where)
    ]);

    const mappedData = data.map(c => ({
      ...c,
      gst: c.gstNumber || '',
      city: c.address ? c.address.split(',').pop()?.trim() : 'Unknown',
      status: c.status.toUpperCase(),
      type: c.type.toUpperCase()
    }));

    return { data: mappedData, total, page, totalPages: Math.ceil(total / limit) };
  },

  getCustomerById: async (id: string) => {
    const customer = await customerRepository.findById(id);
    if (!customer) throw new AppError('Customer not found', 404);
    
    return {
      ...customer,
      gst: customer.gstNumber || '',
      city: customer.address ? customer.address.split(',').pop()?.trim() : 'Unknown',
      status: customer.status.toUpperCase(),
      type: customer.type.toUpperCase(),
      followups: customer.followups?.map(f => ({
        id: f.id,
        customerId: f.customerId,
        date: f.date.toISOString(),
        note: f.note,
        createdBy: f.user?.name || 'System',
        outcome: 'PENDING'
      })) || []
    };
  },

  createCustomer: async (userId: string, frontendData: any) => {
    const data: Prisma.CustomerCreateInput = {
      name: frontendData.name,
      mobile: frontendData.mobile,
      email: frontendData.email || undefined,
      businessName: frontendData.businessName || undefined,
      gstNumber: frontendData.gst || undefined,
      type: frontendData.type,
      status: frontendData.status,
      address: frontendData.city ? `${frontendData.address}, ${frontendData.city}` : frontendData.address,
      notes: frontendData.notes || undefined,
      followUpDate: frontendData.followUpDate ? new Date(frontendData.followUpDate) : undefined,
    };
    // Check for duplicates
    const existing = await customerRepository.findByEmailOrMobile(data.email || undefined, data.mobile);
    if (existing) {
      if (existing.email === data.email) throw new AppError('Email already registered to another customer', 400);
      if (existing.mobile === data.mobile) throw new AppError('Mobile already registered to another customer', 400);
    }
    
    const customer = await customerRepository.create(data);
    await userRepository.logActivity(userId, 'CREATE_CUSTOMER', `Created customer ${customer.id}`);
    return customer;
  },

  updateCustomer: async (userId: string, id: string, frontendData: any) => {
    const existing = await customerRepository.findById(id);
    if (!existing) throw new AppError('Customer not found', 404);

    const data: Prisma.CustomerUpdateInput = {
      name: frontendData.name,
      mobile: frontendData.mobile,
      email: frontendData.email || undefined,
      businessName: frontendData.businessName || undefined,
      gstNumber: frontendData.gst || undefined,
      type: frontendData.type,
      status: frontendData.status,
      address: frontendData.city ? `${frontendData.address}, ${frontendData.city}` : frontendData.address,
      notes: frontendData.notes || undefined,
      followUpDate: frontendData.followUpDate ? new Date(frontendData.followUpDate) : undefined,
    };

    const updated = await customerRepository.update(id, data);
    await userRepository.logActivity(userId, 'UPDATE_CUSTOMER', `Updated customer ${id}`);
    return updated;
  },

  deleteCustomer: async (userId: string, id: string) => {
    const existing = await customerRepository.findById(id);
    if (!existing) throw new AppError('Customer not found', 404);
    
    await customerRepository.softDelete(id);
    await userRepository.logActivity(userId, 'DELETE_CUSTOMER', `Soft deleted customer ${id}`);
  },

  addFollowUp: async (userId: string, customerId: string, data: { date: string; note: string }) => {
    const customer = await customerRepository.findById(customerId);
    if (!customer) throw new AppError('Customer not found', 404);

    const prisma = new PrismaClient();
    const followup = await prisma.followup.create({
      data: {
        customerId,
        userId,
        date: new Date(data.date),
        note: data.note
      },
      include: { user: { select: { name: true } } }
    });

    await userRepository.logActivity(userId, 'CREATE_FOLLOWUP', `Added followup to customer ${customerId}`);

    return {
      id: followup.id,
      customerId: followup.customerId,
      date: followup.date.toISOString(),
      note: followup.note,
      createdBy: followup.user?.name || 'System',
      outcome: 'PENDING'
    };
  }
};
