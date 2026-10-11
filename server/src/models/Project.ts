import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      minlength: [2, 'Project name must be at least 2 characters'],
      maxlength: [60, 'Project name cannot exceed 60 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    color: {
      type: String,
      enum: ['blue', 'green', 'purple', 'orange', 'pink', 'teal', 'red', 'amber'],
      default: 'blue',
    },
  },
  {
    timestamps: true,
  }
);

// Index for case-insensitive unique name check
projectSchema.index({ name: 1 });

// Normalize name for duplicate checking
projectSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.name = this.name.trim();
  }
  next();
});

export const Project = mongoose.model<IProject>('Project', projectSchema);
