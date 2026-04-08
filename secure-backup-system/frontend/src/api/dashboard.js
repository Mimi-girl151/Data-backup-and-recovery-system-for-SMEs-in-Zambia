import apiClient from './client';

export const getDashboardStats = async () => {
  try {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    throw error;
  }
};

export const getRecentActivity = async (limit = 10) => {
  try {
    const response = await apiClient.get(`/dashboard/activity?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch recent activity:', error);
    throw error;
  }
};