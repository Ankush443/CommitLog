import api from '../lib/api';
import { Log, LogFormData, LogFilters, PaginationData, ActivityData } from '../types/log';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: PaginationData;
}

export const logApi = {
  getAll: async (filters?: LogFilters): Promise<{ logs: Log[]; pagination: PaginationData }> => {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.projectId) params.append('projectId', filters.projectId);
    if (filters?.from) params.append('from', filters.from);
    if (filters?.to) params.append('to', filters.to);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get<ApiResponse<Log[]>>(`/logs?${params.toString()}`);
    return {
      logs: response.data.data,
      pagination: response.data.pagination!,
    };
  },

  getById: async (id: string): Promise<Log> => {
    const response = await api.get<ApiResponse<Log>>(`/logs/${id}`);
    return response.data.data;
  },

  create: async (data: LogFormData): Promise<Log> => {
    const response = await api.post<ApiResponse<Log>>('/logs', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<LogFormData>): Promise<Log> => {
    const response = await api.patch<ApiResponse<Log>>(`/logs/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/logs/${id}`);
  },

  getActivity: async (from?: string, to?: string): Promise<ActivityData[]> => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);

    const response = await api.get<ApiResponse<ActivityData[]>>(`/logs/activity?${params.toString()}`);
    return response.data.data;
  },
};
