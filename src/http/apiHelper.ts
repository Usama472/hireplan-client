import { clientAccessToken } from '@/constants'
import axios from 'axios'

export const API_URL = import.meta.env.VITE_API_URL || 'https://hireplan.co/api/v1'

// Enhanced axios configuration with mobile optimizations
export const axiosApi = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 second timeout for mobile connections
})

// Add custom properties to axios config interface
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: number;
      requestId: string;
    };
  }
}

// Remove duplicate interceptor

// Enhanced request/response interceptors with network handling
axiosApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(clientAccessToken)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add request ID for deduplication
    config.metadata = { startTime: Date.now(), requestId: generateRequestId() };
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axiosApi.interceptors.response.use(
  (response) => {
    // Log response time for monitoring
    const duration = Date.now() - response.config.metadata?.startTime;
    if (duration > 5000) {
      console.warn(`⚠️ Slow request detected: ${response.config.url} took ${duration}ms`);
    }
    return response
  },
  (error) => {
    // Enhanced error handling with network awareness
    const config = error.config;
    const currentPath = window.location.pathname;
    
    // Network error handling
    if (!error.response) {
      console.warn('🌐 Network error detected:', error.message);
      
      // For mobile users, provide helpful error messages
      if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        error.isMobileNetworkError = true;
        error.userMessage = navigator.onLine 
          ? 'Connection issue detected. Please check your signal and try again.'
          : 'You appear to be offline. Please check your connection.';
      }
    }
    
    // Auth error handling (existing logic)
    if (error.response && error.response.status === 401) {
      const isLoginPage = currentPath === '/login'
      const isSignupPage = currentPath === '/signup'
      const isForgotPasswordPage = currentPath === '/forgot-password'
      const isOwnerLoginPage = currentPath === '/owner/login'
      const isOwnerPage = currentPath.startsWith('/owner/')

      // Don't redirect if user is already on auth pages
      if (!isLoginPage && !isSignupPage && !isForgotPasswordPage && !isOwnerLoginPage) {
        localStorage.removeItem(clientAccessToken)
        localStorage.removeItem('cachedUserProfile'); // Clear cached profile
        // Redirect to appropriate login page based on current route
        window.location.href = isOwnerPage ? '/owner/login' : '/login'
      } else {
        // For auth pages, just reject the error without redirect
        console.log('🚫 Auth request failed on auth page, not redirecting');
      }
    }
    
    return Promise.reject(error)
  }
)

// Request deduplication cache
const pendingRequests = new Map<string, Promise<any>>();

function generateRequestId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function getRequestKey(method: string, url: string, data?: any): string {
  return `${method}:${url}:${JSON.stringify(data || {})}`;
}

async function deduplicateRequest<T>(
  method: string, 
  url: string, 
  executor: () => Promise<T>,
  data?: any
): Promise<T> {
  const key = getRequestKey(method, url, data);
  
  // Check if same request is already pending
  if (pendingRequests.has(key)) {
    console.log('🔄 Deduplicating request:', key);
    return pendingRequests.get(key) as Promise<T>;
  }
  
  // Execute request and cache promise
  const promise = executor().finally(() => {
    // Remove from cache when complete
    pendingRequests.delete(key);
  });
  
  pendingRequests.set(key, promise);
  return promise;
}

export async function get(
  url: string,
  config: Record<string, any> = {}
): Promise<any> {
  return deduplicateRequest('GET', url, () => 
    axiosApi.get(url, { ...config }).then((response) => response.data)
  );
}

export async function post(
  url: string,
  data: object,
  config: Record<string, any> = {}
): Promise<any> {
  // Don't deduplicate POST requests by default (unless explicitly safe)
  if (config.deduplicate) {
    return deduplicateRequest('POST', url, () => 
      axiosApi.post(url, data, { ...config }).then((response) => response.data), 
      data
    );
  }
  return axiosApi.post(url, data, { ...config }).then((response) => response.data);
}

export async function put(
  url: string,
  data: object = {},
  config: Record<string, any> = {}
): Promise<any> {
  return await axiosApi
    .put(url, data, { ...config })
    .then((response) => response.data)
}

export async function del(
  url: string,
  config: Record<string, any> = {}
): Promise<any> {
  return await axiosApi
    .delete(url, { ...config })
    .then((response) => response.data)
}

export async function patch(
  url: string,
  data: object = {},
  config: Record<string, any> = {}
): Promise<any> {
  return await axiosApi
    .patch(url, data, { ...config })
    .then((response) => response.data)
}

// Unified API helper object for consistent imports
export const apiHelper = {
  get,
  post,
  put,
  del,
  patch,
}

// Alias for backward compatibility and consistency
export const apiHelperUnAuth = apiHelper
