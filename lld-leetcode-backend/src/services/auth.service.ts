import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { User, UserRole } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { env } from '../config/env';

const ACCESS_TOKEN_AUDIENCE = 'lld-leetcode-api';
const REFRESH_TOKEN_AUDIENCE = 'lld-leetcode-refresh';
const ISSUER = 'lld-leetcode-backend';
const BCRYPT_ROUNDS = 12;

const refreshAllowList = new Map<string, { userId: string; expiresAt: number }>();

type AuthMode = 'prisma' | 'memory';
const authMode: AuthMode = (process.env.AUTH_MODE === 'memory' ? 'memory' : 'prisma');

type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
  tokenId?: string;
};

const jwtSecret = env.jwtSecret;

type MemoryUser = User & { passwordHash: string };
const memoryUsersById = new Map<string, MemoryUser>();
const memoryUsersByEmail = new Map<string, MemoryUser>();

const toMemoryUser = (user: Omit<User, 'createdAt'> & { createdAt?: Date } & { passwordHash: string }): MemoryUser => {
  return {
    ...(user as MemoryUser),
    createdAt: user.createdAt ?? new Date(),
  };
};

const signToken = (
  payload: JwtPayload,
  expiresIn: SignOptions['expiresIn'],
  audience: string,
  tokenId?: string
): string => {
  const options: SignOptions = {
    expiresIn,
    audience,
    issuer: ISSUER,
    algorithm: 'HS256',
  };

  if (tokenId) {
    options.jwtid = tokenId;
  }

  return jwt.sign(payload, jwtSecret, options);
};

const verifyToken = (token: string, audience: string): JwtPayload => {
  const decoded = jwt.verify(token, jwtSecret, {
    audience,
    issuer: ISSUER,
    algorithms: ['HS256'],
  });

  return decoded as JwtPayload;
};

const buildAuthPayload = (user: User): JwtPayload => ({
  sub: user.id,
  email: user.email,
  role: user.role,
});

const parseTtlToMs = (ttl: string): number => {
  const match = ttl.match(/^(\d+)([smhd])$/);
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const value = Number(match[1]);
  const unit = match[2];

  if (unit === 's') return value * 1000;
  if (unit === 'm') return value * 60 * 1000;
  if (unit === 'h') return value * 60 * 60 * 1000;
  return value * 24 * 60 * 60 * 1000;
};

export const sanitizeUser = (user: User) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

export const register = async (email: string, password: string, role: UserRole = UserRole.USER) => {
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  if (authMode === 'memory') {
    const existing = memoryUsersByEmail.get(email);
    if (existing) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    const user = toMemoryUser({
      id: crypto.randomUUID(),
      email,
      role,
      createdAt: new Date(),
      passwordHash,
    });

    memoryUsersById.set(user.id, user);
    memoryUsersByEmail.set(user.email, user);
    return user;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('EMAIL_ALREADY_EXISTS');
  }

  return prisma.user.create({
    data: {
      email,
      passwordHash,
      role,
    },
  });
};

export const login = async (email: string, password: string) => {
  const user =
    authMode === 'memory'
      ? memoryUsersByEmail.get(email) ?? null
      : await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const tokenId = crypto.randomUUID();
  const accessToken = signToken(
    buildAuthPayload(user),
    env.accessTokenTtl as SignOptions['expiresIn'],
    ACCESS_TOKEN_AUDIENCE
  );
  const refreshToken = signToken(
    buildAuthPayload(user),
    env.refreshTokenTtl as SignOptions['expiresIn'],
    REFRESH_TOKEN_AUDIENCE,
    tokenId
  );

  refreshAllowList.set(tokenId, {
    userId: user.id,
    expiresAt: Date.now() + parseTtlToMs(env.refreshTokenTtl),
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
};

export const refresh = async (refreshToken: string) => {
  const payload = verifyToken(refreshToken, REFRESH_TOKEN_AUDIENCE);
  const tokenId = payload.tokenId;

  if (!tokenId) {
    throw new Error('INVALID_REFRESH_TOKEN');
  }

  const allowEntry = refreshAllowList.get(tokenId);
  if (!allowEntry || allowEntry.userId !== payload.sub || allowEntry.expiresAt < Date.now()) {
    refreshAllowList.delete(tokenId);
    throw new Error('INVALID_REFRESH_TOKEN');
  }

  refreshAllowList.delete(tokenId);

  const user =
    authMode === 'memory'
      ? memoryUsersById.get(payload.sub) ?? null
      : await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    throw new Error('INVALID_REFRESH_TOKEN');
  }

  const newTokenId = crypto.randomUUID();
  const accessToken = signToken(
    buildAuthPayload(user),
    env.accessTokenTtl as SignOptions['expiresIn'],
    ACCESS_TOKEN_AUDIENCE
  );
  const newRefreshToken = signToken(
    buildAuthPayload(user),
    env.refreshTokenTtl as SignOptions['expiresIn'],
    REFRESH_TOKEN_AUDIENCE,
    newTokenId
  );

  refreshAllowList.set(newTokenId, {
    userId: user.id,
    expiresAt: Date.now() + parseTtlToMs(env.refreshTokenTtl),
  });

  return {
    user,
    accessToken,
    refreshToken: newRefreshToken,
  };
};

export const logout = (refreshToken?: string) => {
  if (!refreshToken) return;

  try {
    const payload = verifyToken(refreshToken, REFRESH_TOKEN_AUDIENCE);
    if (payload.tokenId) {
      refreshAllowList.delete(payload.tokenId);
    }
  } catch {
    // Ignore invalid token errors at logout.
  }
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return verifyToken(token, ACCESS_TOKEN_AUDIENCE);
};
