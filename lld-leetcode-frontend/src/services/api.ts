import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Make sure this matches your backend port

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

let accessToken: string | null = null;
let isRefreshing = false;
let pendingResolvers: Array<(token: string | null) => void> = [];

const drainPendingResolvers = (token: string | null) => {
    pendingResolvers.forEach((resolve) => resolve(token));
    pendingResolvers = [];
};

export const setAccessToken = (token: string | null) => {
    accessToken = token;
};

api.interceptors.request.use((config) => {
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config as typeof error.config & { _retry?: boolean };
        const status = error.response?.status;

        if (status !== 401 || originalRequest?._retry || originalRequest?.url?.includes('/auth/')) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (isRefreshing) {
            const token = await new Promise<string | null>((resolve) => pendingResolvers.push(resolve));
            if (!token) {
                return Promise.reject(error);
            }
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
        }

        isRefreshing = true;
        try {
            const refreshResponse = await api.post('/auth/refresh');
            const newToken = refreshResponse.data?.data?.accessToken ?? null;
            setAccessToken(newToken);
            drainPendingResolvers(newToken);

            if (!newToken) {
                return Promise.reject(error);
            }

            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
        } catch (refreshError) {
            setAccessToken(null);
            drainPendingResolvers(null);
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export const registerUser = async (email: string, password: string) => {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
};

export const loginUser = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
};

export const refreshSession = async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
};

export const logoutUser = async () => {
    const response = await api.post('/auth/logout');
    return response.data;
};

export const getMe = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

export const getProblems = async () => {
    const response = await api.get('/problems');
    return response.data;
};

export const submitCode = async (problemId: string, code: string, language: string) => {
    try {
        const response = await api.post('/submit', { problemId, code, language });
        return response.data;
    } catch (error) {
        console.error("Error submitting code:", error);
        throw error;
    }
};