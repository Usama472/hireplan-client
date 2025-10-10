import axios from 'axios';

export const OWNER_API_URL = import.meta.env.VITE_API_URL || 'https://hireplan.co/api/v1';

// Create separate axios instance for owner requests
export const ownerAxiosApi = axios.create({
  baseURL: OWNER_API_URL,
});

// Add request interceptor for owner auth
ownerAxiosApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('owner_access_token') || localStorage.getItem('hireme-client-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for owner auth errors
ownerAxiosApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      const isOwnerLoginPage = currentPath === '/owner/login';
      const isOwnerPage = currentPath.startsWith('/owner/');

      if (!isOwnerLoginPage && isOwnerPage) {
        localStorage.removeItem('owner_access_token');
        localStorage.removeItem('hireme-client-token');
        window.location.href = '/owner/login';
      }
    }
    return Promise.reject(error);
  }
);

export async function ownerGet(
  url: string,
  config: Record<string, any> = {}
): Promise<any> {
  return await ownerAxiosApi
    .get(url, { ...config })
    .then((response) => response.data);
}

export async function ownerPost(
  url: string,
  data: object,
  config: Record<string, any> = {}
): Promise<any> {
  return await ownerAxiosApi
    .post(url, data, { ...config })
    .then((response) => response.data);
}

export async function ownerPut(
  url: string,
  data: object = {},
  config: Record<string, any> = {}
): Promise<any> {
  return await ownerAxiosApi
    .put(url, data, { ...config })
    .then((response) => response.data);
}

export async function ownerDelete(
  url: string,
  config: Record<string, any> = {}
): Promise<any> {
  return await ownerAxiosApi
    .delete(url, { ...config })
    .then((response) => response.data);
}

export async function ownerPatch(
  url: string,
  data: object = {},
  config: Record<string, any> = {}
): Promise<any> {
  return await ownerAxiosApi
    .patch(url, data, { ...config })
    .then((response) => response.data);
}

// Owner API helper object
export const ownerApiHelper = {
  get: ownerGet,
  post: ownerPost,
  put: ownerPut,
  delete: ownerDelete,
  patch: ownerPatch,
};
