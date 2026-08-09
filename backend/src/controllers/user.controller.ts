// @ts-nocheck
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const userController = {
  getUsers: async (req: Request, res: Response) => {
    try {
      const users = await prisma.user.findMany({
        include: { role: true },
        orderBy: { createdAt: 'desc' }
      });
      res.json({ success: true, data: users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role.name,
        department: u.department,
        phone: u.phone,
        isDeleted: u.isDeleted,
        createdAt: u.createdAt
      }))});
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  createUser: async (req: Request, res: Response) => {
    try {
      const { name, email, password, roleId, department, phone } = req.body;
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) return res.status(400).json({ success: false, message: 'Email already exists' });
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword, roleId, department, phone }
      });
      res.status(201).json({ success: true, data: { id: user.id, email: user.email } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  updateUser: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, email, roleId, department, phone } = req.body;
      const user = await prisma.user.update({
        where: { id },
        data: { name, email, roleId, department, phone }
      });
      res.json({ success: true, data: { id: user.id, email: user.email } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  updateUserStatus: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { isDeleted } = req.body;
      await prisma.user.update({
        where: { id },
        data: { isDeleted }
      });
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};
