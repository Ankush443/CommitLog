import { Log } from '../models/Log';
import { Request, Response, NextFunction } from 'express';

// Helper to get Monday of a week from any date
export const getMonday = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00Z');
  const day = date.getUTCDay();
  const diff = date.getUTCDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  date.setUTCDate(diff);
  return date.toISOString().split('T')[0];
};

// Helper to get Sunday of a week
export const getSunday = (mondayString: string): string => {
  const date = new Date(mondayString + 'T00:00:00Z');
  date.setUTCDate(date.getUTCDate() + 6);
  return date.toISOString().split('T')[0];
};

// Helper to add days to a date
export const addDays = (dateString: string, days: number): string => {
  const date = new Date(dateString + 'T00:00:00Z');
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().split('T')[0];
};

export interface WeeklyRecapData {
  weekStart: string;
  weekEnd: string;
  totalLogs: number;
  activeDays: number;
  projects: Array<{ _id: string; name: string; color: string; count: number }>;
  completedWork: Array<{ date: string; title: string; completed: string; projectName?: string }>;
  blockers: Array<{ date: string; title: string; blockers: string; projectName?: string }>;
  nextSteps: Array<{ date: string; title: string; nextSteps: string; projectName?: string }>;
}

export const getWeeklyRecap = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let { weekStart } = req.query;

    // Default to current week if not provided
    if (!weekStart || typeof weekStart !== 'string') {
      const today = new Date().toISOString().split('T')[0];
      weekStart = getMonday(today);
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) {
      res.status(400).json({
        success: false,
        message: 'weekStart must be in YYYY-MM-DD format',
      });
      return;
    }

    const weekEnd = getSunday(weekStart);

    // Fetch logs for the week
    const logs = await Log.find({
      date: { $gte: weekStart, $lte: weekEnd },
    })
      .populate('projectId', 'name color')
      .sort({ date: 1 });

    // Calculate metrics
    const totalLogs = logs.length;
    const uniqueDates = new Set(logs.map((log) => log.date));
    const activeDays = uniqueDates.size;

    // Get unique projects worked on
    const projectMap = new Map<string, { name: string; color: string; count: number }>();
    logs.forEach((log) => {
      if (log.projectId && typeof log.projectId === 'object') {
        const project = log.projectId as any;
        const id = project._id.toString();
        if (projectMap.has(id)) {
          projectMap.get(id)!.count++;
        } else {
          projectMap.set(id, {
            name: project.name,
            color: project.color,
            count: 1,
          });
        }
      }
    });

    const projects = Array.from(projectMap.entries()).map(([_id, data]) => ({
      _id,
      ...data,
    }));

    // Aggregate completed work
    const completedWork = logs.map((log) => ({
      date: log.date,
      title: log.title,
      completed: log.completed,
      projectName: log.projectId && typeof log.projectId === 'object' 
        ? (log.projectId as any).name 
        : undefined,
    }));

    // Aggregate blockers (only non-empty)
    const blockers = logs
      .filter((log) => log.blockers && log.blockers.trim().length > 0)
      .map((log) => ({
        date: log.date,
        title: log.title,
        blockers: log.blockers!,
        projectName: log.projectId && typeof log.projectId === 'object'
          ? (log.projectId as any).name
          : undefined,
      }));

    // Aggregate next steps (only non-empty)
    const nextSteps = logs
      .filter((log) => log.nextSteps && log.nextSteps.trim().length > 0)
      .map((log) => ({
        date: log.date,
        title: log.title,
        nextSteps: log.nextSteps!,
        projectName: log.projectId && typeof log.projectId === 'object'
          ? (log.projectId as any).name
          : undefined,
      }));

    const recapData: WeeklyRecapData = {
      weekStart,
      weekEnd,
      totalLogs,
      activeDays,
      projects,
      completedWork,
      blockers,
      nextSteps,
    };

    res.json({
      success: true,
      data: recapData,
    });
  } catch (error) {
    next(error);
  }
};
