import { Project } from './project';

export interface Log {
  _id: string;
  date: string; // YYYY-MM-DD format
  title: string;
  completed: string;
  blockers?: string;
  nextSteps?: string;
  projectId?: Project | null;
  repositoryUrl?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LogFormData {
  date: string;
  title: string;
  completed: string;
  blockers?: string;
  nextSteps?: string;
  projectId?: string | null;
  repositoryUrl?: string;
  tags?: string[];
}

export interface LogFilters {
  search?: string;
  projectId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ActivityData {
  date: string;
  count: number;
}
