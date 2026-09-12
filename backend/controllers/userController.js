import { getUserProfile, updateUserProfile } from '../services/userService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getProfile = async (req, res) => {
  try {
    const profile = await getUserProfile(req.user);
    return successResponse(res, profile);
  } catch (err) {
    console.error('getProfile error:', err);
    return errorResponse(res, err.message || 'Failed to fetch user profile', err.statusCode || 500);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { full_name } = req.body;
    const updated = await updateUserProfile(req.user, { full_name });
    return successResponse(res, updated, 200, 'Profile updated successfully');
  } catch (err) {
    console.error('updateProfile error:', err);
    return errorResponse(res, err.message || 'Failed to update profile', err.statusCode || 400);
  }
};
