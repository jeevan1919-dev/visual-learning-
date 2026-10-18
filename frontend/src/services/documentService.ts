import { request } from './api';
import { DocumentItem, StatusResponse, DocumentSection } from '../types';

export const documentService = {
  async upload(file: File, title?: string, subject?: string): Promise<DocumentItem> {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    if (subject) formData.append('subject', subject);

    return request<DocumentItem>('/documents', {
      method: 'POST',
      body: formData,
    });
  },

  async list(search?: string, subject?: string, status?: string): Promise<DocumentItem[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (subject && subject !== 'all') params.append('subject', subject);
    if (status && status !== 'all') params.append('status', status);

    const query = params.toString();
    return request<DocumentItem[]>(`/documents${query ? `?${query}` : ''}`);
  },

  async getById(id: string): Promise<DocumentItem> {
    return request<DocumentItem>(`/documents/${id}`);
  },

  async update(id: string, data: { title?: string; subject?: string }): Promise<DocumentItem> {
    return request<DocumentItem>(`/documents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<{ message: string; id: string }> {
    return request(`/documents/${id}`, {
      method: 'DELETE',
    });
  },

  async retryProcessing(id: string): Promise<{ message: string; status: string }> {
    return request(`/documents/${id}/process`, {
      method: 'POST',
    });
  },

  async getStatus(id: string): Promise<StatusResponse> {
    return request<StatusResponse>(`/documents/${id}/status`);
  },

  async getSections(id: string): Promise<DocumentSection[]> {
    return request<DocumentSection[]>(`/documents/${id}/sections`);
  },

  getPdfUrl(id: string): string {
    const token = localStorage.getItem('visuallearn_token');
    return `/api/documents/${id}/file${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },
};
