export interface WeeklyRecap {
  weekStart: string;
  weekEnd: string;
  totalLogs: number;
  activeDays: number;
  projects: RecapProject[];
  completedWork: RecapItem[];
  blockers: RecapItem[];
  nextSteps: RecapItem[];
}

export interface RecapProject {
  _id: string;
  name: string;
  color: string;
  count: number;
}

export interface RecapItem {
  date: string;
  title: string;
  completed?: string;
  blockers?: string;
  nextSteps?: string;
  projectName?: string;
}
