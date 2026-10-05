import { Request, Response } from 'express';
import { User, UserRole } from '../models/User.js';
import { AuthRequest, generateToken } from '../middleware/authMiddleware.js';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password, role, phone, drivingLicense } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
      return;
    }

    const assignedRole: UserRole = role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER';

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: assignedRole,
      phone: phone?.trim(),
      drivingLicense: drivingLicense?.trim(),
    });

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const responsePayload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      drivingLicense: user.drivingLicense,
    };

    res.status(201).json({
      success: true,
      message: `Account registered successfully as ${user.role}.`,
      token,
      user: responsePayload,
      data: {
        token,
        user: responsePayload,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const userPayload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      drivingLicense: user.drivingLicense,
    };

    res.json({
      success: true,
      message: `Signed in successfully as ${user.role}.`,
      token,
      user: userPayload,
      data: {
        token,
        user: userPayload,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
}

export async function getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const userPayload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      drivingLicense: user.drivingLicense,
    };

    res.json({
      success: true,
      user: userPayload,
      data: {
        user: userPayload,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
}

export async function demoLogin(req: Request, res: Response): Promise<void> {
  try {
    const requestedRole: UserRole = req.body.role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER';
    const email = requestedRole === 'ADMIN' ? 'admin@velocefleet.com' : 'customer@velocefleet.com';
    const name = requestedRole === 'ADMIN' ? 'Fleet Dispatcher Admin' : 'Rajesh Kumar (Client)';

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        password: 'password123',
        role: requestedRole,
        phone: requestedRole === 'ADMIN' ? '+91 99000 11000' : '+91 98765 43210',
        drivingLicense: requestedRole === 'CUSTOMER' ? 'DL-04202100889' : undefined,
      });
    }

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const userPayload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      drivingLicense: user.drivingLicense,
    };

    res.json({
      success: true,
      message: `Demo sign-in granted as ${user.role}.`,
      token,
      user: userPayload,
      data: {
        token,
        user: userPayload,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
}
