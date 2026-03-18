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

type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
  tokenId?: string;
  jti?: string;
};

const jwtSecret = env.jwtSecret;

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

const getRefreshTokenId = (payload: JwtPayload): string | undefined => {
  return payload.tokenId ?? payload.jti;
};

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
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const tokenId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + parseTtlToMs(env.refreshTokenTtl));
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

  await prisma.refreshToken.create({
    data: { tokenId, userId: user.id, expiresAt },
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
};

export const refresh = async (refreshToken: string) => {
  const payload = verifyToken(refreshToken, REFRESH_TOKEN_AUDIENCE);
  const tokenId = getRefreshTokenId(payload);

  if (!tokenId) {
    throw new Error('INVALID_REFRESH_TOKEN');
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenId },
    include: { user: true },
  });

  if (
    !storedToken ||
    storedToken.userId !== payload.sub ||
    storedToken.expiresAt < new Date()
  ) {
    await prisma.refreshToken.deleteMany({ where: { tokenId } });
    throw new Error('INVALID_REFRESH_TOKEN');
  }

  // Use deleteMany to avoid P2025 under concurrent refresh attempts.
  const deleteResult = await prisma.refreshToken.deleteMany({ where: { tokenId } });
  if (deleteResult.count === 0) {
    throw new Error('INVALID_REFRESH_TOKEN');
  }

  const user = storedToken.user;

  const newTokenId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + parseTtlToMs(env.refreshTokenTtl));
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

  await prisma.refreshToken.create({
    data: { tokenId: newTokenId, userId: user.id, expiresAt },
  });

  return {
    user,
    accessToken,
    refreshToken: newRefreshToken,
  };
};

export const logout = async (refreshToken?: string) => {
  if (!refreshToken) return;

  try {
    const payload = verifyToken(refreshToken, REFRESH_TOKEN_AUDIENCE);
    const tokenId = getRefreshTokenId(payload);
    if (tokenId) {
      await prisma.refreshToken.deleteMany({ where: { tokenId } });
    }
  } catch {
    // Ignore invalid token errors at logout.
  }
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return verifyToken(token, ACCESS_TOKEN_AUDIENCE);
};
