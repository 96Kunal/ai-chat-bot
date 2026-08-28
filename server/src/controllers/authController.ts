import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthRequest, JWT_SECRET } from '../middleware/authMiddleware';

const generateToken = (userId: string) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, major, year, avatar } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
      return;
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      major: major || 'Computer Science & Engineering',
      year: year || '3rd Year',
      avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
    });

    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        major: user.major,
        year: user.year,
        avatar: user.avatar,
        hasCustomKey: Boolean(user.customApiKey),
      },
    });
  } catch (err: any) {
    console.error('[Auth] Registration error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration.', error: err.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = generateToken(user._id.toString());

    res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        major: user.major,
        year: user.year,
        avatar: user.avatar,
        hasCustomKey: Boolean(user.customApiKey),
      },
    });
  } catch (err: any) {
    console.error('[Auth] Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.', error: err.message });
  }
};

export const demoLogin = async (_req: Request, res: Response): Promise<void> => {
  try {
    let demoUser = await User.findOne({ email: 'alex.student@horizon.edu' });
    if (!demoUser) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('DemoPass2026!', salt);
      demoUser = await User.create({
        name: 'Alex Rivera',
        email: 'alex.student@horizon.edu',
        passwordHash,
        major: 'Computer Science & AI',
        year: '3rd Year',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=alex',
      });
    }

    const token = generateToken(demoUser._id.toString());

    res.json({
      success: true,
      message: 'Demo Student Session Started!',
      token,
      user: {
        id: demoUser._id,
        name: demoUser.name,
        email: demoUser.email,
        major: demoUser.major,
        year: demoUser.year,
        avatar: demoUser.avatar,
        hasCustomKey: Boolean(demoUser.customApiKey),
      },
    });
  } catch (err: any) {
    console.error('[Auth] Demo login error:', err);
    res.status(500).json({ success: false, message: 'Demo login error.', error: err.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        major: req.user.major,
        year: req.user.year,
        avatar: req.user.avatar,
        hasCustomKey: Boolean(req.user.customApiKey),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error retrieving profile.', error: err.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { name, major, year, avatar, customApiKey } = req.body;
    if (name) req.user.name = name.trim();
    if (major) req.user.major = major;
    if (year) req.user.year = year;
    if (avatar) req.user.avatar = avatar;
    if (typeof customApiKey === 'string') req.user.customApiKey = customApiKey.trim();

    await req.user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        major: req.user.major,
        year: req.user.year,
        avatar: req.user.avatar,
        hasCustomKey: Boolean(req.user.customApiKey),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error updating profile.', error: err.message });
  }
};
