import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../src/app';
import { Log } from '../src/models/Log';
import { Project } from '../src/models/Project';

const app = createApp();

describe('Log API', () => {
  let testProjectId: string;

  beforeAll(async () => {
    const testDbUri = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/commitlog-test';
    await mongoose.connect(testDbUri);
  });

  beforeEach(async () => {
    // Clear data before each test
    await Log.deleteMany({});
    await Project.deleteMany({});

    // Create a test project
    const project = await Project.create({
      name: 'Test Project',
      color: 'blue',
    });
    testProjectId = project._id.toString();
  });

  afterAll(async () => {
    await Log.deleteMany({});
    await Project.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/logs', () => {
    it('should create a new log with valid data', async () => {
      const response = await request(app)
        .post('/api/logs')
        .send({
          date: '2024-01-15',
          title: 'Implemented login feature',
          completed: 'Built authentication flow with JWT tokens',
          blockers: 'Rate limiting issues',
          nextSteps: 'Add refresh token logic',
          projectId: testProjectId,
          repositoryUrl: 'https://github.com/user/repo',
          tags: ['backend', 'auth'],
        })
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.date).toBe('2024-01-15');
      expect(response.body.data.title).toBe('Implemented login feature');
      expect(response.body.data.projectId._id).toBe(testProjectId);
      expect(response.body.data.tags).toEqual(['backend', 'auth']);
    });

    it('should reject log with missing required fields', async () => {
      const response = await request(app)
        .post('/api/logs')
        .send({
          date: '2024-01-15',
          title: 'Test',
          // missing 'completed'
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject log with invalid date format', async () => {
      const response = await request(app)
        .post('/api/logs')
        .send({
          date: '01/15/2024',
          title: 'Test Log',
          completed: 'Work done',
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject log with title less than 3 characters', async () => {
      const response = await request(app)
        .post('/api/logs')
        .send({
          date: '2024-01-15',
          title: 'AB',
          completed: 'Work done',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject log with invalid repository URL', async () => {
      const response = await request(app)
        .post('/api/logs')
        .send({
          date: '2024-01-15',
          title: 'Test Log',
          completed: 'Work done',
          repositoryUrl: 'not-a-valid-url',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should accept log without optional fields', async () => {
      const response = await request(app)
        .post('/api/logs')
        .send({
          date: '2024-01-15',
          title: 'Minimal Log',
          completed: 'Did some work',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.blockers).toBeUndefined();
      expect(response.body.data.nextSteps).toBeUndefined();
    });
  });

  describe('GET /api/logs', () => {
    beforeEach(async () => {
      // Create test logs
      await Log.create([
        {
          date: '2024-01-15',
          title: 'First Log',
          completed: 'Completed first task',
          projectId: testProjectId,
        },
        {
          date: '2024-01-16',
          title: 'Second Log',
          completed: 'Completed second task',
        },
        {
          date: '2024-01-17',
          title: 'Third Log',
          completed: 'Completed third task',
          blockers: 'Database connection issue',
        },
      ]);
    });

    it('should return all logs with pagination', async () => {
      const response = await request(app)
        .get('/api/logs')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(3);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.total).toBe(3);
    });

    it('should filter logs by project', async () => {
      const response = await request(app)
        .get(`/api/logs?projectId=${testProjectId}`)
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].title).toBe('First Log');
    });

    it('should filter logs by date range', async () => {
      const response = await request(app)
        .get('/api/logs?from=2024-01-16&to=2024-01-17')
        .expect(200);

      expect(response.body.data.length).toBe(2);
    });

    it('should search logs by text', async () => {
      const response = await request(app)
        .get('/api/logs?search=Database')
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].title).toBe('Third Log');
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/logs?page=1&limit=2')
        .expect(200);

      expect(response.body.data.length).toBe(2);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.pagination.totalPages).toBe(2);
    });
  });

  describe('GET /api/logs/:id', () => {
    it('should return a single log by ID', async () => {
      const log = await Log.create({
        date: '2024-01-15',
        title: 'Get Test Log',
        completed: 'Test completed',
      });

      const response = await request(app)
        .get(`/api/logs/${log._id}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Get Test Log');
    });

    it('should return 404 for non-existent log', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app).get(`/api/logs/${fakeId}`).expect(404);
    });
  });

  describe('PATCH /api/logs/:id', () => {
    it('should update a log', async () => {
      const log = await Log.create({
        date: '2024-01-15',
        title: 'Original Title',
        completed: 'Original work',
      });

      const response = await request(app)
        .patch(`/api/logs/${log._id}`)
        .send({
          title: 'Updated Title',
          blockers: 'New blocker added',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Title');
      expect(response.body.data.blockers).toBe('New blocker added');
      expect(response.body.data.completed).toBe('Original work');
    });

    it('should reject update with invalid data', async () => {
      const log = await Log.create({
        date: '2024-01-15',
        title: 'Test Log',
        completed: 'Work done',
      });

      const response = await request(app)
        .patch(`/api/logs/${log._id}`)
        .send({ date: 'invalid-date' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/logs/:id', () => {
    it('should delete a log', async () => {
      const log = await Log.create({
        date: '2024-01-15',
        title: 'Log to Delete',
        completed: 'Work done',
      });

      const response = await request(app)
        .delete(`/api/logs/${log._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify deletion
      await request(app).get(`/api/logs/${log._id}`).expect(404);
    });

    it('should return 404 when deleting non-existent log', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app).delete(`/api/logs/${fakeId}`).expect(404);
    });
  });

  describe('GET /api/logs/activity', () => {
    beforeEach(async () => {
      await Log.create([
        { date: '2024-01-15', title: 'Log 1', completed: 'Work 1' },
        { date: '2024-01-15', title: 'Log 2', completed: 'Work 2' },
        { date: '2024-01-16', title: 'Log 3', completed: 'Work 3' },
      ]);
    });

    it('should return activity data with date counts', async () => {
      const response = await request(app)
        .get('/api/logs/activity')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
      
      const jan15 = response.body.data.find((item: any) => item.date === '2024-01-15');
      expect(jan15.count).toBe(2);
    });

    it('should filter activity by date range', async () => {
      const response = await request(app)
        .get('/api/logs/activity?from=2024-01-16&to=2024-01-16')
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].date).toBe('2024-01-16');
    });
  });
});
