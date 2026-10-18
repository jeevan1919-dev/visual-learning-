import { request } from './api';
import { QuizData, QuizAttemptResult } from '../types';

export const quizService = {
  async getQuizzes(documentId: string): Promise<QuizData[]> {
    return request<QuizData[]>(`/documents/${documentId}/quizzes`);
  },

  async getQuiz(quizId: string): Promise<QuizData> {
    return request<QuizData>(`/quizzes/${quizId}`);
  },

  async submitAttempt(quizId: string, answers: Record<string, number>): Promise<QuizAttemptResult> {
    return request<QuizAttemptResult>(`/quizzes/${quizId}/attempts`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  },

  async getAttempts(quizId: string): Promise<any[]> {
    return request(`/quizzes/${quizId}/attempts`);
  },
};
