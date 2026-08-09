import { Router } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';

const router = Router();
const prisma = new PrismaClient();

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, roleName } = req.body;
    
    if (!name || !email || !password || !roleName) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    let role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
      // Default to Sales if invalid role
      role = await prisma.role.findUnique({ where: { name: 'Sales' } });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId: role!.id
      }
    });

    res.status(201).json({ success: true, message: 'User created' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { role: true }
    });
    
    if (!user || user.isDeleted) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or inactive account' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user.id, user.role.name);
    const refreshToken = generateRefreshToken(user.id);

    // Save refresh token to db
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    // Set secure cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        department: user.department,
        phone: user.phone,
        notifyLowStock: user.notifyLowStock,
        notifyFollowUps: user.notifyFollowUps,
        notifyChallans: user.notifyChallans,
        notifySystem: user.notifySystem
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(401).json({ success: false, message: 'No refresh token' });

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: { include: { role: true } } }
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const newAccessToken = generateAccessToken(storedToken.user.id, storedToken.user.role.name);
    res.json({ success: true, accessToken: newAccessToken });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      await prisma.refreshToken.delete({ where: { token: refreshToken } }).catch(() => {});
    }
    res.clearCookie('refreshToken');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/logout-all', async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(401).json({ success: false });
    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (stored) {
      await prisma.refreshToken.deleteMany({ where: { userId: stored.userId } });
    }
    res.clearCookie('refreshToken');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    // We mock getting the user from token by taking the user from the refresh token for simplicity here.
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(401).json({ success: false });
    
    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken }, include: { user: true } });
    if (!stored) return res.status(401).json({ success: false });

    const isValid = await bcrypt.compare(currentPassword, stored.user.password);
    if (!isValid) return res.status(400).json({ success: false, message: 'Incorrect current password' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: stored.userId }, data: { password: hashed } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const { name, department, phone } = req.body;
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(401).json({ success: false });
    
    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored) return res.status(401).json({ success: false });

    await prisma.user.update({
      where: { id: stored.userId },
      data: { name, department, phone }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
