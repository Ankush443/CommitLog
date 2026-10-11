import { Request, Response, NextFunction } from 'express';
import { Project } from '../models/Project';
import { Log } from '../models/Log';

// Get all projects
export const getAllProjects = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

// Get single project
export const getProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found',
      });
      return;
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// Create project
export const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, description, color } = req.body;

    // Check for duplicate name (case-insensitive)
    const existingProject = await Project.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    });

    if (existingProject) {
      res.status(409).json({
        success: false,
        message: 'A project with this name already exists',
      });
      return;
    }

    const project = await Project.create({
      name,
      description,
      color,
    });

    res.status(201).json({
      success: true,
      data: project,
      message: 'Project created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Update project
export const updateProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, description, color } = req.body;

    // Check for duplicate name if name is being changed
    if (name) {
      const existingProject = await Project.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        _id: { $ne: req.params.id },
      });

      if (existingProject) {
        res.status(409).json({
          success: false,
          message: 'A project with this name already exists',
        });
        return;
      }
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, color },
      { new: true, runValidators: true }
    );

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found',
      });
      return;
    }

    res.json({
      success: true,
      data: project,
      message: 'Project updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Delete project (preserves logs by setting projectId to null)
export const deleteProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found',
      });
      return;
    }

    // Count affected logs
    const affectedLogsCount = await Log.countDocuments({ projectId: req.params.id });

    // Set projectId to null for all logs associated with this project
    await Log.updateMany(
      { projectId: req.params.id },
      { $set: { projectId: null } }
    );

    // Delete the project
    await Project.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: `Project deleted successfully. ${affectedLogsCount} log(s) preserved with project reference removed.`,
      data: {
        deletedProjectId: req.params.id,
        affectedLogsCount,
      },
    });
  } catch (error) {
    next(error);
  }
};
