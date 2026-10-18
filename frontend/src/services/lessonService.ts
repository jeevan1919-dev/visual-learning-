import { request } from './api';
import {
  VisualSummaryData,
  MindMapData,
  FlowchartData,
  ConceptDiagramData,
  StepByStepData,
  ChatMessage,
} from '../types';

export const lessonService = {
  async getSummary(documentId: string): Promise<VisualSummaryData> {
    return request<VisualSummaryData>(`/documents/${documentId}/summary`);
  },

  async getMindmap(documentId: string): Promise<MindMapData> {
    return request<MindMapData>(`/documents/${documentId}/mindmap`);
  },

  async getFlowchart(documentId: string): Promise<FlowchartData> {
    return request<FlowchartData>(`/documents/${documentId}/flowchart`);
  },

  async getConcepts(documentId: string): Promise<ConceptDiagramData> {
    return request<ConceptDiagramData>(`/documents/${documentId}/concepts`);
  },

  async getExplanations(documentId: string): Promise<StepByStepData> {
    return request<StepByStepData>(`/documents/${documentId}/explanations`);
  },

  async askAi(
    documentId: string,
    question: string,
    history: { role: string; content: string }[] = []
  ): Promise<{ answer: string; citations: number[]; has_sufficient_context: boolean; model_used: string }> {
    return request(`/documents/${documentId}/ask`, {
      method: 'POST',
      body: JSON.stringify({ question, history }),
    });
  },

  async getChatHistory(documentId: string): Promise<ChatMessage[]> {
    return request<ChatMessage[]>(`/documents/${documentId}/chat-history`);
  },
};
