import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
  userId?: string;
  customApiKey?: string;
}

export const JWT_SECRET = process.env.JWT_SECRET || 'college_assistant_jwt_secret_key_2026';

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401).json({ success: false, message: 'User session not found or expired.' });
      return;
    }

    req.user = user;
    req.userId = user._id.toString();
    req.customApiKey = user.customApiKey || (req.headers['x-gemini-api-key'] as string);
    next();
  } catch (err: any) {
    res.status(401).json({ success: false, message: 'Invalid or expired token.', error: err.message });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user;
        req.userId = user._id.toString();
        req.customApiKey = user.customApiKey;
      }
    }
  } catch {
    // ignore optional auth errors
  }

  // Also check header override
  if (!req.customApiKey && req.headers['x-gemini-api-key']) {
    req.customApiKey = req.headers['x-gemini-api-key'] as string;
  }

  next();
};
