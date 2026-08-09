const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma/schema.prisma');
let schemaContent = fs.readFileSync(schemaPath, 'utf8');

// Fix prisma 7 schema url issue
schemaContent = schemaContent.replace(/url\s*=\s*env\("DATABASE_URL"\)/, '');

// Add fields to User and add RefreshToken model
if (!schemaContent.includes('RefreshToken')) {
  schemaContent = schemaContent.replace(/model User \{/, \`model User {
  isDeleted            Boolean       @default(false)
  requiresPasswordChange Boolean     @default(true)
  refreshTokens        RefreshToken[]\`);
  
  schemaContent += \`

model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  expiresAt DateTime
  createdAt DateTime @default(now())
}
\`;
}

fs.writeFileSync(schemaPath, schemaContent);

const files = {
  'src/validators/auth.validator.ts': \`
import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  })
});

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(6),
    newPassword: z.string().min(8).regex(/[A-Z]/, 'Must contain uppercase').regex(/[a-z]/, 'Must contain lowercase').regex(/[0-9]/, 'Must contain number'),
  })
});
  \`,
  'src/repositories/user.repository.ts': \`
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const userRepository = {
  findByEmail: async (email: string) => {
    return prisma.user.findUnique({ where: { email }, include: { role: true } });
  },
  findById: async (id: string) => {
    return prisma.user.findUnique({ where: { id }, include: { role: true } });
  },
  update: async (id: string, data: any) => {
    return prisma.user.update({ where: { id }, data });
  },
  logActivity: async (userId: string, action: string, details?: string) => {
    return prisma.activityLog.create({ data: { userId, action, details } });
  }
};
  \`,
  'src/repositories/refreshToken.repository.ts': \`
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const refreshTokenRepository = {
  create: async (token: string, userId: string, expiresAt: Date) => {
    return prisma.refreshToken.create({ data: { token, userId, expiresAt } });
  },
  find: async (token: string) => {
    return prisma.refreshToken.findUnique({ where: { token } });
  },
  delete: async (token: string) => {
    return prisma.refreshToken.delete({ where: { token } });
  },
  deleteAllForUser: async (userId: string) => {
    return prisma.refreshToken.deleteMany({ where: { userId } });
  }
};
  \`,
  'src/services/auth.service.ts': \`
import bcrypt from 'bcrypt';
import { AppError } from '../errors/AppError';
import { userRepository } from '../repositories/user.repository';
import { refreshTokenRepository } from '../repositories/refreshToken.repository';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';

export const authService = {
  login: async (email: string, pass: string) => {
    const user = await userRepository.findByEmail(email);
    if (!user || user.isDeleted) throw new AppError('Invalid credentials', 401);
    
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      await userRepository.logActivity(user.id, 'FAILED_LOGIN', 'Invalid password attempt');
      throw new AppError('Invalid credentials', 401);
    }
    
    const accessToken = generateAccessToken(user.id, user.role.name);
    const refreshToken = generateRefreshToken(user.id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    await refreshTokenRepository.create(refreshToken, user.id, expiresAt);
    await userRepository.logActivity(user.id, 'LOGIN', 'User logged in successfully');
    
    return { user, accessToken, refreshToken };
  },
  
  refresh: async (token: string) => {
    const record = await refreshTokenRepository.find(token);
    if (!record || record.expiresAt < new Date()) {
      if (record) await refreshTokenRepository.delete(token);
      throw new AppError('Invalid or expired refresh token', 401);
    }
    
    const user = await userRepository.findById(record.userId);
    if (!user || user.isDeleted) throw new AppError('User not found', 404);
    
    // Rotate token
    await refreshTokenRepository.delete(token);
    const newAccessToken = generateAccessToken(user.id, user.role.name);
    const newRefreshToken = generateRefreshToken(user.id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    await refreshTokenRepository.create(newRefreshToken, user.id, expiresAt);
    await userRepository.logActivity(user.id, 'TOKEN_REFRESH', 'User refreshed access token');
    
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },
  
  logout: async (userId: string, token: string) => {
    await refreshTokenRepository.delete(token);
    await userRepository.logActivity(userId, 'LOGOUT', 'User logged out');
  },
  
  changePassword: async (userId: string, oldPass: string, newPass: string) => {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    
    const isMatch = await bcrypt.compare(oldPass, user.password);
    if (!isMatch) throw new AppError('Invalid old password', 400);
    
    const hashed = await bcrypt.hash(newPass, 12);
    await userRepository.update(userId, { password: hashed, requiresPasswordChange: false });
    
    // Invalidate all previous sessions
    await refreshTokenRepository.deleteAllForUser(userId);
    await userRepository.logActivity(userId, 'PASSWORD_CHANGE', 'User changed password');
  }
};
  \`,
  'src/controllers/auth.controller.ts': \`
import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { userRepository } from '../repositories/user.repository';

export const authController = {
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const { user, accessToken, refreshToken } = await authService.login(email, password);
      
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      
      const { password: _, ...userWithoutPass } = user;
      res.json({ success: true, data: { user: userWithoutPass, accessToken } });
    } catch (e) { next(e); }
  },
  
  refresh: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies.refreshToken;
      if (!token) return res.status(401).json({ success: false, message: 'No refresh token' });
      
      const { accessToken, refreshToken } = await authService.refresh(token);
      
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      
      res.json({ success: true, data: { accessToken } });
    } catch (e) { next(e); }
  },
  
  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies.refreshToken;
      if (token && req.user) {
        await authService.logout(req.user.userId, token);
      }
      res.clearCookie('refreshToken');
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (e) { next(e); }
  },
  
  me: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await userRepository.findById(req.user!.userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      const { password, ...userWithoutPass } = user;
      res.json({ success: true, data: userWithoutPass });
    } catch (e) { next(e); }
  },
  
  changePassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { oldPassword, newPassword } = req.body;
      await authService.changePassword(req.user!.userId, oldPassword, newPassword);
      res.clearCookie('refreshToken');
      res.json({ success: true, message: 'Password changed successfully' });
    } catch (e) { next(e); }
  }
};
  \`,
  'src/middlewares/auth.middleware.ts': \`
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AppError } from '../errors/AppError';

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string, role: string };
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Unauthorized', 401);
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    next(new AppError('Unauthorized or Token Expired', 401));
  }
};
  \`,
  'src/middlewares/role.middleware.ts': \`
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('Forbidden: Insufficient privileges', 403));
    }
    next();
  };
};
  \`,
  'src/routes/auth.routes.ts': \`
import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { loginSchema, changePasswordSchema } from '../validators/auth.validator';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', requireAuth, authController.logout);
router.get('/me', requireAuth, authController.me);
router.post('/change-password', requireAuth, validate(changePasswordSchema), authController.changePassword);

export default router;
  \`,
  'src/routes/index.ts': \`
import { Router } from 'express';
import authRoutes from './auth.routes';

const router = Router();

router.use('/auth', authRoutes);

export default router;
  \`
};

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, filepath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim());
}
console.log("Auth backend modules created.");
