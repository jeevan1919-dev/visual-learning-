import { request } from './api';
import { AuthResponse, UserProfile } from '../types';

export const authService = {
  async signup(email: string, password: string, displayName?: string): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, display_name: displayName }),
    });
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async getMe(): Promise<UserProfile> {
    return request<UserProfile>('/auth/me');
  },

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    return request<UserProfile>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async getProviderInfo(): Promise<{ active_provider: string; has_api_key: boolean; mode_label: string; instructions: string }> {
    return request('/auth/provider-info');
  },
};
