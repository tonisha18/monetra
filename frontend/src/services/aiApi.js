import api from './api.js';

/**
 * Fetch comprehensive AI financial analysis, score, and investment report.
 */
export const fetchAIFinancialReport = async () => {
  const response = await api.get('/ai/report');
  return response.data?.data;
};

/**
 * Send an interactive question to AI FinSight.
 * @param {string} question 
 * @param {Array<{role: string, content: string}>} history 
 */
export const sendAIFinancialChat = async (question, history = []) => {
  const response = await api.post('/ai/chat', { question, history });
  return response.data?.data;
};
