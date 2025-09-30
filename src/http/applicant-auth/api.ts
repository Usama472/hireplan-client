import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://hireplan.co/api/v1';

// Create separate axios instance for applicant auth
const applicantAxios = axios.create({
  baseURL: API_URL,
});

// Add interceptor to use applicant token
applicantAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('applicant_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const BASE_URL = "/applicant-auth";

// Public endpoints
export const sendMagicLink = (data: { email: string }) => {
  return applicantAxios.post(`${BASE_URL}/magic-link`, data);
};

export const magicLinkLogin = (token: string) => {
  return applicantAxios.get(`${BASE_URL}/magic-link/${token}`);
};

export const login = (data: { email: string; password?: string }) => {
  return applicantAxios.post(`${BASE_URL}/login`, data);
};

// Protected endpoints (require applicant authentication)
export const getProfile = () => {
  return applicantAxios.get(`${BASE_URL}/profile`);
};

export const updateProfile = (data: any) => {
  return applicantAxios.put(`${BASE_URL}/profile`, data);
};

export const getApplications = () => {
  return applicantAxios.get(`${BASE_URL}/applications`);
};

// Chat endpoints
export const getChatConversations = () => {
  return applicantAxios.get(`${BASE_URL}/chat/conversations`);
};

export const getConversationMessages = (conversationId: string) => {
  return applicantAxios.get(`${BASE_URL}/chat/conversations/${conversationId}/messages`);
};

export const sendMessage = (conversationId: string, data: { message: string }) => {
  return applicantAxios.post(`${BASE_URL}/chat/conversations/${conversationId}/messages`, data);
};

export const createConversation = (data: { jobId: string; message: string }) => {
  return applicantAxios.post(`${BASE_URL}/chat/conversations`, data);
};

export const markConversationAsRead = (conversationId: string) => {
  return applicantAxios.patch(`${BASE_URL}/chat/conversations/${conversationId}/read`);
};
