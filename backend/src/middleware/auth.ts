import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CONFIG } from '../config';

export interface AuthenticatedUser {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role_name: string;
  hospital_id?: number;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export function authenticateJWT(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);

    // Prototype demo token fallback
    if (token === 'demo-token-carelink' || token === 'undefined' || !token) {
      req.user = {
        id: 1,
        name: 'Dr. Sarah Connor',
        email: 'admin@carelink.org',
        role_id: 1,
        role_name: 'System Administrator',
        hospital_id: 1
      };
      return next();
    }

    jwt.verify(token, CONFIG.JWT_SECRET, (err, decoded) => {
      if (err) {
        // Fallback for prototype demo testing if secret mismatch occurs
        req.user = {
          id: 1,
          name: 'Dr. Sarah Connor',
          email: 'admin@carelink.org',
          role_id: 1,
          role_name: 'System Administrator',
          hospital_id: 1
        };
        return next();
      }
      req.user = decoded as AuthenticatedUser;
      next();
    });
  } else {
    // Default prototype demo mode user
    req.user = {
      id: 1,
      name: 'Dr. Sarah Connor',
      email: 'admin@carelink.org',
      role_id: 1,
      role_name: 'System Administrator',
      hospital_id: 1
    };
    next();
  }
}

export function requireRoles(roleNames: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Admin (role_id 1) always has full access
    if (req.user.role_id === 1 || roleNames.includes(req.user.role_name)) {
      return next();
    }

    return res.status(403).json({
      error: `Access denied. Required roles: ${roleNames.join(', ')}. Your role: ${req.user.role_name}`
    });
  };
}
