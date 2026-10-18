import { request } from './api';
import { DashboardStats, NoteItem } from '../types';

export const progressService = {
  async getDashboardStats(): Promise<DashboardStats> {
    return request<DashboardStats>('/stats/dashboard');
  },

  async updateProgress(documentId: string, status: 'not_started' | 'in_progress' | 'mastered'): Promise<any> {
    return request('/progress', {
      method: 'POST',
      body: JSON.stringify({ document_id: documentId, status }),
    });
  },

  async getNotes(documentId?: string): Promise<NoteItem[]> {
    const query = documentId ? `?document_id=${documentId}` : '';
    return request<NoteItem[]>(`/notes${query}`);
  },

  async createNote(documentId: string, content: string, isBookmarked: boolean = false, lessonId?: string): Promise<NoteItem> {
    return request<NoteItem>('/notes', {
      method: 'POST',
      body: JSON.stringify({
        document_id: documentId,
        content,
        is_bookmarked: isBookmarked,
        lesson_id: lessonId,
      }),
    });
  },

  async deleteNote(noteId: string): Promise<any> {
    return request(`/notes/${noteId}`, {
      method: 'DELETE',
    });
  },
};
