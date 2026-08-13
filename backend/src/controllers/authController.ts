import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../database/db';
import { CONFIG } from '../config';

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = await getDb();
    const user = await db.get(
      `SELECT u.*, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.email = ?`,
      [email]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        role_name: user.role_name,
        hospital_id: user.hospital_id
      },
      String(CONFIG.JWT_SECRET),
      { expiresIn: '24h' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        role_name: user.role_name,
        hospital_id: user.hospital_id
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getDemoAccounts(req: Request, res: Response) {
  try {
    const db = await getDb();
    const accounts = await db.all(
      `SELECT u.id, u.name, u.email, u.phone, u.role_id, u.hospital_id, r.name as role_name, h.name as hospital_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN hospitals h ON u.hospital_id = h.id`
    );
    return res.json(accounts);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getCurrentUser(req: Request, res: Response) {
  return res.json({ user: (req as any).user });
}
