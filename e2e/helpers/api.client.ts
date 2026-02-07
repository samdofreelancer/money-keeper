import axios, { AxiosInstance } from 'axios';
import { logger } from '@/utils/logger';

/**
 * API Client Helper
 *
 * Low-level HTTP client for API interactions.
 * Used by AccountAPI to make actual requests.
 *
 * Responsibilities:
 * - HTTP request/response handling
 * - Error logging
 * - Status code validation (but does NOT throw on HTTP errors)
 */

export interface ApiResponse<T> {
  data: T | null;
  status: number;
  error?: string;
}

export class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL = process.env.API_BASE_URL || 'http://localhost:8080/api') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      validateStatus: () => true, // Never throw on status code
    });
  }

  async get<T>(path: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<T>(path);
      if (response.status >= 400) {
        logger.warn(`GET ${path} returned ${response.status}`);
      }
      return {
        data: response.data || null,
        status: response.status,
      };
    } catch (error) {
      logger.error(`GET ${path} failed`);
      return { data: null, status: 0, error: String(error) };
    }
  }

  async post<T>(path: string, payload: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<T>(path, payload);
      if (response.status >= 400) {
        logger.warn(`POST ${path} returned ${response.status}`);
      }
      return {
        data: response.data || null,
        status: response.status,
      };
    } catch (error) {
      logger.error(`POST ${path} failed`);
      return { data: null, status: 0, error: String(error) };
    }
  }

  async put<T>(path: string, payload: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<T>(path, payload);
      if (response.status >= 400) {
        logger.warn(`PUT ${path} returned ${response.status}`);
      }
      return {
        data: response.data || null,
        status: response.status,
      };
    } catch (error) {
      logger.error(`PUT ${path} failed`);
      return { data: null, status: 0, error: String(error) };
    }
  }

  async delete(path: string): Promise<ApiResponse<null>> {
    try {
      const response = await this.client.delete(path);
      if (response.status >= 400) {
        logger.warn(`DELETE ${path} returned ${response.status}`);
      }
      return {
        data: null,
        status: response.status,
      };
    } catch (error) {
      logger.error(`DELETE ${path} failed`);
      return { data: null, status: 0, error: String(error) };
    }
  }
}
