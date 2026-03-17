import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import submissionRoutes from './routes/submission.routes';
import authRoutes from './routes/auth.routes';
import { env } from './config/env';

const app = express();

app.use(
	cors({
		origin: env.frontendOrigin,
		credentials: true,
	})
);
app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req, res) => {
	res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api', submissionRoutes);

export default app;
