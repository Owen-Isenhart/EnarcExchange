/**
 * API Client - Axios instance with interceptors
 * Handles authentication, errors, and request/response transformation
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_BASE_URL, STORAGE_KEYS, REQUEST_TIMEOUT } from '@/config/api';
import { getErrorMessage } from '@/utils/helpers';

interface ApiError {
  message: string;
  status: number;
  data?: any;
}

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - add auth token
    this.instance.interceptors.request.use(
      (config: any) => {
        const token = typeof window !== 'undefined' 
          ? localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
          : null;
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
      },
      (error: any) => Promise.reject(error)
    );

    // Response interceptor - handle errors
    this.instance.interceptors.response.use(
      (response: any) => response,
      (error: AxiosError) => {
        const apiError: ApiError = {
          message: getErrorMessage(error.response?.data || error.message),
          status: error.response?.status || 0,
          data: error.response?.data,
        };

        // Handle 401 - token expired
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
            // Could trigger a store action to logout here
            window.dispatchEvent(new Event('logout'));
          }
        }

        return Promise.reject(apiError);
      }
    );
  }

  get client(): AxiosInstance {
    return this.instance;
  }

  async get<T = any>(url: string, config?: any): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: any): Promise<T> {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
export type { ApiError };
