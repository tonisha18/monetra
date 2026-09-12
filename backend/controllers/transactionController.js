import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../services/transactionService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getAllTransactions = async (req, res) => {
  try {
    const filters = {
      type: req.query.type,
      category: req.query.category,
      search: req.query.search,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    };
    const list = await getTransactions(req.user, filters);
    return successResponse(res, list);
  } catch (err) {
    console.error('getAllTransactions error:', err);
    return errorResponse(res, err.message || 'Failed to retrieve transactions', err.statusCode || 500);
  }
};

export const getTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await getTransactionById(req.user, id);
    return successResponse(res, item);
  } catch (err) {
    console.error('getTransaction error:', err);
    return errorResponse(res, err.message || 'Transaction not found', err.statusCode || 404);
  }
};

export const create = async (req, res) => {
  try {
    const item = await createTransaction(req.user, req.body);
    return successResponse(res, item, 201, 'Transaction recorded successfully');
  } catch (err) {
    console.error('createTransaction error:', err);
    return errorResponse(res, err.message || 'Failed to record transaction', err.statusCode || 400);
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await updateTransaction(req.user, id, req.body);
    return successResponse(res, updated, 200, 'Transaction updated successfully');
  } catch (err) {
    console.error('updateTransaction error:', err);
    return errorResponse(res, err.message || 'Failed to update transaction', err.statusCode || 400);
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteTransaction(req.user, id);
    return successResponse(res, deleted, 200, 'Transaction deleted successfully');
  } catch (err) {
    console.error('removeTransaction error:', err);
    return errorResponse(res, err.message || 'Failed to delete transaction', err.statusCode || 400);
  }
};
