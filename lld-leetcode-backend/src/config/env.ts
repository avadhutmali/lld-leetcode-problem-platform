import dotenv from 'dotenv';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

const readEnv = (key: string, fallback?: string): string => {
	const value = process.env[key] ?? fallback;
	if (!value) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
	return value;
};

export const env = {
	nodeEnv: process.env.NODE_ENV ?? 'development',
	port: Number(process.env.PORT ?? 5000),
	frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
	accessTokenTtl: process.env.ACCESS_TOKEN_TTL ?? '15m',
	refreshTokenTtl: process.env.REFRESH_TOKEN_TTL ?? '7d',
	jwtSecret: readEnv('JWT_SECRET', 'dev-insecure-secret-change-me'),
	secureCookies: isProd,
};

export const requireDatabaseUrl = (): string => readEnv('DATABASE_URL');
