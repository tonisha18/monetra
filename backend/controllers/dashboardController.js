import { getDashboardSummary, getDashboardCharts } from '../services/dashboardService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getSummary = async (req, res) => {
  try {
    const summary = await getDashboardSummary(req.user);
    return successResponse(res, summary);
  } catch (err) {
    console.error('getSummary error:', err);
    return errorResponse(res, err.message || 'Failed to calculate summary', 500);
  }
};

export const getCharts = async (req, res) => {
  try {
    const charts = await getDashboardCharts(req.user);
    return successResponse(res, charts);
  } catch (err) {
    console.error('getCharts error:', err);
    return errorResponse(res, err.message || 'Failed to generate charts', 500);
  }
};
