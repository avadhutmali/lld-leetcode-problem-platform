import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Make sure this matches your backend port

export const api = axios.create({
    baseURL: API_URL,
});

export const getProblems = async () => {
    const response = await api.get('/problems');
    return response.data;
};

export const submitCode = async (problemId: string, code: string) => {
    const response = await api.post('/submit', { problemId, code });
    return response.data; // This contains the AI JSON result
};