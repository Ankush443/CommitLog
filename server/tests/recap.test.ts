import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../src/app';
import { Log } from '../src/models/Log';
import { Project } from '../src/models/Project';
import { getMonday, getSunday, addDays } from '../src/utils/recapCalculator';

const app = createApp();

describe('Weekly Recap', () => {
  let testProjectId: string;

  beforeAll(async () => {
    const testDbUri = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/commitlog-test';
    await mongoose.connect(testDbUri);
  });

  beforeEach(async () => {
    await Log.deleteMany({});
    await Project.deleteMany({});

    const project = await Project.create({
      name: 'Recap Test Project',
      color: 'green',
    });
    testProjectId = project._id.toString();
  });

  afterAll(async () => {
    await Log.deleteMany({});
    await Project.deleteMany({});
    await mongoose.connection.close();
  });

  describe('Date helpers', () => {
    it('should get Monday from any date', () => {
      expect(getMonday('2024-01-17')).toBe('2024-01-15'); // Wednesday -> Monday
      expect(getMonday('2024-01-15')).toBe('2024-01-15'); // Monday -> Monday
      expect(getMonday('2024-01-21')).toBe('2024-01-15'); // Sunday -> previous Monday
    });

    it('should get Sunday from Monday', () => {
      expect(getSunday('2024-01-15')).toBe('2024-01-21');
    });

    it('should add days correctly', () => {
      expect(addDays('2024-01-15', 1)).toBe('2024-01-16');
      expect(addDays('2024-01-15', 7)).toBe('2024-01-22');
    });
  });

  describe('GET /api/logs/recap', () => {
    it('should return empty recap for week with no logs', async () => {
      const response = await request(app)
        .get('/api/logs/recap?weekStart=2024-01-15')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.weekStart).toBe('2024-01-15');
      expect(response.body.data.weekEnd).toBe('2024-01-21');
      expect(response.body.data.totalLogs).toBe(0);
      expect(response.body.data.activeDays).toBe(0);
      expect(response.body.data.projects).toEqual([]);
      expect(response.body.data.completedWork).toEqual([]);
      expect(response.body.data.blockers).toEqual([]);
      expect(response.body.data.nextSteps).toEqual([]);
    });

    it('should calculate recap metrics correctly for week with logs', async () => {
      // Create logs for a specific week (Mon 2024-01-15 to Sun 2024-01-21)
      await Log.create([
        {
          date: '2024-01-15',
          title: 'Monday Work',
          completed: 'Implemented feature A',
          blockers: 'API rate limiting',
          nextSteps: 'Add caching layer',
          projectId: testProjectId,
        },
        {
          date: '2024-01-15',
          title: 'Monday Work 2',
          completed: 'Fixed bug B',
        },
        {
          date: '2024-01-17',
          title: 'Wednesday Work',
          completed: 'Wrote tests',
          nextSteps: 'Deploy to staging',
          projectId: testProjectId,
        },
      ]);

      const response = await request(app)
        .get('/api/logs/recap?weekStart=2024-01-15')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalLogs).toBe(3);
      expect(response.body.data.activeDays).toBe(2); // Monday and Wednesday
      expect(response.body.data.projects.length).toBe(1);
      expect(response.body.data.projects[0].count).toBe(2);
      expect(response.body.data.completedWork.length).toBe(3);
      expect(response.body.data.blockers.length).toBe(1);
      expect(response.body.data.nextSteps.length).toBe(2);
    });

    it('should only include non-empty blockers and nextSteps', async () => {
      await Log.create([
        {
          date: '2024-01-15',
          title: 'Log with blocker',
          completed: 'Work done',
          blockers: 'Database issue',
        },
        {
          date: '2024-01-16',
          title: 'Log without blocker',
          completed: 'Work done',
          blockers: '',
        },
        {
          date: '2024-01-17',
          title: 'Log with next steps',
          completed: 'Work done',
          nextSteps: 'Review PR',
        },
      ]);

      const response = await request(app)
        .get('/api/logs/recap?weekStart=2024-01-15')
        .expect(200);

      expect(response.body.data.blockers.length).toBe(1);
      expect(response.body.data.blockers[0].blockers).toBe('Database issue');
      expect(response.body.data.nextSteps.length).toBe(1);
    });

    it('should use current week if weekStart not provided', async () => {
      const today = new Date().toISOString().split('T')[0];
      const monday = getMonday(today);

      await Log.create({
        date: monday,
        title: 'Current Week Log',
        completed: 'Work done',
      });

      const response = await request(app)
        .get('/api/logs/recap')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.weekStart).toBe(monday);
    });

    it('should reject invalid date format', async () => {
      const response = await request(app)
        .get('/api/logs/recap?weekStart=invalid-date')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should aggregate multiple projects correctly', async () => {
      const project2 = await Project.create({
        name: 'Second Project',
        color: 'blue',
      });

      await Log.create([
        {
          date: '2024-01-15',
          title: 'Project 1 Work',
          completed: 'Work A',
          projectId: testProjectId,
        },
        {
          date: '2024-01-16',
          title: 'Project 1 Work Again',
          completed: 'Work B',
          projectId: testProjectId,
        },
        {
          date: '2024-01-17',
          title: 'Project 2 Work',
          completed: 'Work C',
          projectId: project2._id,
        },
      ]);

      const response = await request(app)
        .get('/api/logs/recap?weekStart=2024-01-15')
        .expect(200);

      expect(response.body.data.projects.length).toBe(2);
      
      const proj1 = response.body.data.projects.find(
        (p: any) => p.name === 'Recap Test Project'
      );
      const proj2 = response.body.data.projects.find(
        (p: any) => p.name === 'Second Project'
      );

      expect(proj1.count).toBe(2);
      expect(proj2.count).toBe(1);
    });

    it('should not include logs from outside the week', async () => {
      await Log.create([
        {
          date: '2024-01-14', // Sunday before the week
          title: 'Before Week',
          completed: 'Work',
        },
        {
          date: '2024-01-15', // Monday (start of week)
          title: 'During Week',
          completed: 'Work',
        },
        {
          date: '2024-01-21', // Sunday (end of week)
          title: 'End of Week',
          completed: 'Work',
        },
        {
          date: '2024-01-22', // Monday of next week
          title: 'After Week',
          completed: 'Work',
        },
      ]);

      const response = await request(app)
        .get('/api/logs/recap?weekStart=2024-01-15')
        .expect(200);

      expect(response.body.data.totalLogs).toBe(2);
      expect(response.body.data.completedWork.length).toBe(2);
    });
  });
});
