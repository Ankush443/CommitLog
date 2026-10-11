import api from '../lib/api';
import { Project, ProjectFormData } from '../types/project';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const projectApi = {
  getAll: async (): Promise<Project[]> => {
    const response = await api.get<ApiResponse<Project[]>>('/projects');
    return response.data.data;
  },

  getById: async (id: string): Promise<Project> => {
    const response = await api.get<ApiResponse<Project>>(`/projects/${id}`);
    return response.data.data;
  },

  create: async (data: ProjectFormData): Promise<Project> => {
    const response = await api.post<ApiResponse<Project>>('/projects', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<ProjectFormData>): Promise<Project> => {
    const response = await api.patch<ApiResponse<Project>>(`/projects/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};
