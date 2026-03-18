import { Request, Response } from 'express';
import { UserRole } from '@prisma/client';
import { env } from '../config/env';
import { login, logout, refresh, register, sanitizeUser } from '../services/auth.service';

const REFRESH_COOKIE = 'refreshToken';

const refreshCookieOptions = {
  httpOnly: true,
  sameSite: (env.nodeEnv === 'production' ? 'strict' : 'lax') as 'strict' | 'lax',
  secure: env.secureCookies,
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const registerHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body as {
      email?: string;
      password?: string;
      role?: UserRole;
    };

    if (!email || !password || password.length < 8) {
      res.status(400).json({ success: false, message: 'Email and password (>= 8 chars) are required' });
      return;
    }

    const user = await register(email.toLowerCase().trim(), password, role ?? UserRole.USER);
    res.status(201).json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    if (error instanceof Error && error.message === 'EMAIL_ALREADY_EXISTS') {
      res.status(409).json({ success: false, message: 'Email already exists' });
      return;
    }

    console.error(error);
    res.status(500).json({ success: false, message: 'Unable to register user' });
  }
};

export const loginHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    const result = await login(email.toLowerCase().trim(), password);

    res.cookie(REFRESH_COOKIE, result.refreshToken, refreshCookieOptions);
    res.json({
      success: true,
      data: {
        accessToken: result.accessToken,
        user: sanitizeUser(result.user),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_CREDENTIALS') {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    console.error(error);
    res.status(500).json({ success: false, message: 'Unable to login' });
  }
};

export const refreshHandler = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
  if (!token) {
    // No refresh cookie: treat as no active session, but not an error
    res.status(204).end();
    return;
  }

  try {
    const result = await refresh(token);
    res.cookie(REFRESH_COOKIE, result.refreshToken, refreshCookieOptions);

    res.json({
      success: true,
      data: {
        accessToken: result.accessToken,
        user: sanitizeUser(result.user),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_REFRESH_TOKEN') {
      // Expected case for expired/invalid session: clear cookie and return 204 (no active session)
      res.clearCookie(REFRESH_COOKIE, {
        path: refreshCookieOptions.path,
        httpOnly: refreshCookieOptions.httpOnly,
        sameSite: refreshCookieOptions.sameSite,
        secure: refreshCookieOptions.secure,
      });
      res.status(204).end();
      return;
    }

    console.error(error);
    res.status(500).json({ success: false, message: 'Unable to refresh session' });
  }
};

export const logoutHandler = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
  await logout(token);
  res.clearCookie(REFRESH_COOKIE, {
    path: refreshCookieOptions.path,
    httpOnly: refreshCookieOptions.httpOnly,
    sameSite: refreshCookieOptions.sameSite,
    secure: refreshCookieOptions.secure,
  });
  res.json({ success: true });
};

export const meHandler = (req: Request, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  res.json({ success: true, data: req.user });
};
