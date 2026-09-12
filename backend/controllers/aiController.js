import { generateFinancialReport, answerFinancialQuestion } from '../services/aiService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getFinancialReport = async (req, res) => {
  try {
    const report = await generateFinancialReport(req.user);
    return successResponse(res, report);
  } catch (err) {
    console.error('getFinancialReport error:', err);
    return errorResponse(res, err.message || 'Failed to generate financial report', 500);
  }
};

export const postFinancialChat = async (req, res) => {
  try {
    const { question, history } = req.body;
    if (!question || !question.trim()) {
      return errorResponse(res, 'Question is required', 400);
    }
    const answer = await answerFinancialQuestion(req.user, question.trim(), history || []);
    return successResponse(res, answer);
  } catch (err) {
    console.error('postFinancialChat error:', err);
    return errorResponse(res, err.message || 'Failed to answer financial question', 500);
  }
};
