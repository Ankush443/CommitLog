import api from '../lib/api';
import { WeeklyRecap } from '../types/recap';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const recapApi = {
  getWeeklyRecap: async (weekStart: string): Promise<WeeklyRecap> => {
    const response = await api.get<ApiResponse<WeeklyRecap>>(
      `/logs/recap?weekStart=${weekStart}`
    );
    return response.data.data;
  },
};
