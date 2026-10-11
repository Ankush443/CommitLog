import { Request, Response, NextFunction } from 'express';
import { Log } from '../models/Log';

// Get all logs with search, filtering, and pagination
export const getAllLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      search,
      projectId,
      from,
      to,
      page = '1',
      limit = '50',
    } = req.query;

    // Build query
    const query: any = {};

    // Text search across multiple fields
    if (search && typeof search === 'string') {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { completed: { $regex: search, $options: 'i' } },
        { blockers: { $regex: search, $options: 'i' } },
        { nextSteps: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by project
    if (projectId && typeof projectId === 'string') {
      query.projectId = projectId;
    }

    // Date range filter
    if (from && typeof from === 'string') {
      query.date = { ...query.date, $gte: from };
    }
    if (to && typeof to === 'string') {
      query.date = { ...query.date, $lte: to };
    }

    // Pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const logs = await Log.find(query)
      .populate('projectId', 'name color')
      .sort({ date: -1, createdAt: -1 })
      .limit(limitNum)
      .skip(skip);

    const total = await Log.countDocuments(query);

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get single log
export const getLog = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const log = await Log.findById(req.params.id).populate('projectId', 'name color');

    if (!log) {
      res.status(404).json({
        success: false,
        message: 'Log not found',
      });
      return;
    }

    res.json({
      success: true,
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

// Create log
export const createLog = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      date,
      title,
      completed,
      blockers,
      nextSteps,
      projectId,
      repositoryUrl,
      tags,
    } = req.body;

    const log = await Log.create({
      date,
      title,
      completed,
      blockers,
      nextSteps,
      projectId: projectId || null,
      repositoryUrl,
      tags,
    });

    const populatedLog = await Log.findById(log._id).populate('projectId', 'name color');

    res.status(201).json({
      success: true,
      data: populatedLog,
      message: 'Log created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Update log
export const updateLog = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      date,
      title,
      completed,
      blockers,
      nextSteps,
      projectId,
      repositoryUrl,
      tags,
    } = req.body;

    const log = await Log.findByIdAndUpdate(
      req.params.id,
      {
        date,
        title,
        completed,
        blockers,
        nextSteps,
        projectId: projectId || null,
        repositoryUrl,
        tags,
      },
      { new: true, runValidators: true }
    ).populate('projectId', 'name color');

    if (!log) {
      res.status(404).json({
        success: false,
        message: 'Log not found',
      });
      return;
    }

    res.json({
      success: true,
      data: log,
      message: 'Log updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Delete log
export const deleteLog = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const log = await Log.findByIdAndDelete(req.params.id);

    if (!log) {
      res.status(404).json({
        success: false,
        message: 'Log not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Log deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get activity data for calendar (dates with logs)
export const getActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { from, to } = req.query;

    const query: any = {};

    if (from && typeof from === 'string') {
      query.date = { ...query.date, $gte: from };
    }
    if (to && typeof to === 'string') {
      query.date = { ...query.date, $lte: to };
    }

    // Get distinct dates with log counts
    const activity = await Log.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$date',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const formattedActivity = activity.map((item) => ({
      date: item._id,
      count: item.count,
    }));

    res.json({
      success: true,
      data: formattedActivity,
    });
  } catch (error) {
    next(error);
  }
};
