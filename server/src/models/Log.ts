import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILog extends Document {
  date: string; // YYYY-MM-DD format
  title: string;
  completed: string;
  blockers?: string;
  nextSteps?: string;
  projectId?: Types.ObjectId | null;
  repositoryUrl?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const logSchema = new Schema<ILog>(
  {
    date: {
      type: String,
      required: [true, 'Date is required'],
      validate: {
        validator: function (v: string) {
          return /^\d{4}-\d{2}-\d{2}$/.test(v);
        },
        message: 'Date must be in YYYY-MM-DD format',
      },
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    completed: {
      type: String,
      required: [true, 'Completed work is required'],
      trim: true,
      maxlength: [2000, 'Completed work cannot exceed 2000 characters'],
    },
    blockers: {
      type: String,
      trim: true,
      maxlength: [2000, 'Blockers cannot exceed 2000 characters'],
    },
    nextSteps: {
      type: String,
      trim: true,
      maxlength: [2000, 'Next steps cannot exceed 2000 characters'],
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    repositoryUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string) {
          if (!v) return true;
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Repository URL must be a valid HTTP or HTTPS URL',
      },
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (v: string[]) {
          return v.length <= 10;
        },
        message: 'Cannot have more than 10 tags',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
logSchema.index({ date: -1 }); // Most recent first
logSchema.index({ projectId: 1 });
logSchema.index({ title: 'text', completed: 'text', blockers: 'text', nextSteps: 'text' });

export const Log = mongoose.model<ILog>('Log', logSchema);
