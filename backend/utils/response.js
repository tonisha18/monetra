/**
 * Standardized JSON response utilities
 */

export const successResponse = (res, data = null, statusCode = 200, message = null) => {
  const payload = {
    success: true,
  };
  if (message) payload.message = message;
  if (data !== null) payload.data = data;
  return res.status(statusCode).json(payload);
};

export const errorResponse = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
  const payload = {
    success: false,
    message,
  };
  if (errors) payload.errors = errors;
  return res.status(statusCode).json(payload);
};
