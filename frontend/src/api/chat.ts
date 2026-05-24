import apiClient from './client';

export const chatAPI = {
  send: (data: object) => apiClient.post('/chat/send/', data),
  getConversations: () => apiClient.get('/chat/conversations/'),
  getMessages: (conversationId: number) =>
    apiClient.get(`/chat/conversations/${conversationId}/messages/`),
  getUnreadCount: () => apiClient.get('/chat/unread-count/'),
};
