import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../src/app';
import { Project } from '../src/models/Project';
import { Log } from '../src/models/Log';

const app = createApp();

describe('Project API', () => {
  beforeAll(async () => {
    // Connect to test database
    const testDbUri = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/commitlog-test';
    await mongoose.connect(testDbUri);
    
    // Clear test data
    await Project.deleteMany({});
    await Log.deleteMany({});
  });

  afterAll(async () => {
    await Project.deleteMany({});
    await Log.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/projects', () => {
    it('should create a new project with valid data', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({
          name: 'Test Project',
          description: 'A test project',
          color: 'blue',
        })
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test Project');
      expect(response.body.data.description).toBe('A test project');
      expect(response.body.data.color).toBe('blue');
      expect(response.body.data._id).toBeDefined();
    });

    it('should reject project with name less than 2 characters', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({ name: 'A' })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject duplicate project name (case-insensitive)', async () => {
      await request(app)
        .post('/api/projects')
        .send({ name: 'Unique Project' })
        .expect(201);

      const response = await request(app)
        .post('/api/projects')
        .send({ name: 'unique project' })
        .expect('Content-Type', /json/)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should use default color if not provided', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({ name: 'Default Color Project' })
        .expect(201);

      expect(response.body.data.color).toBe('blue');
    });
  });

  describe('GET /api/projects', () => {
    it('should return all projects', async () => {
      const response = await request(app)
        .get('/api/projects')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/projects/:id', () => {
    it('should return a single project by ID', async () => {
      const createResponse = await request(app)
        .post('/api/projects')
        .send({ name: 'Get Test Project' })
        .expect(201);

      const projectId = createResponse.body.data._id;

      const response = await request(app)
        .get(`/api/projects/${projectId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(projectId);
      expect(response.body.data.name).toBe('Get Test Project');
    });

    it('should return 404 for non-existent project', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/projects/${fakeId}`)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid ObjectId', async () => {
      const response = await request(app)
        .get('/api/projects/invalid-id')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/projects/:id', () => {
    it('should update a project', async () => {
      const createResponse = await request(app)
        .post('/api/projects')
        .send({ name: 'Update Test' })
        .expect(201);

      const projectId = createResponse.body.data._id;

      const response = await request(app)
        .patch(`/api/projects/${projectId}`)
        .send({
          name: 'Updated Name',
          color: 'green',
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
      expect(response.body.data.color).toBe('green');
    });

    it('should reject update with duplicate name', async () => {
      await request(app).post('/api/projects').send({ name: 'Existing' }).expect(201);
      const createResponse = await request(app)
        .post('/api/projects')
        .send({ name: 'ToUpdate' })
        .expect(201);

      const response = await request(app)
        .patch(`/api/projects/${createResponse.body.data._id}`)
        .send({ name: 'Existing' })
        .expect(409);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('should delete a project and preserve associated logs', async () => {
      // Create project
      const projectResponse = await request(app)
        .post('/api/projects')
        .send({ name: 'Project to Delete' })
        .expect(201);

      const projectId = projectResponse.body.data._id;

      // Create log associated with project
      await request(app)
        .post('/api/logs')
        .send({
          date: '2024-01-15',
          title: 'Test Log',
          completed: 'Some work',
          projectId,
        })
        .expect(201);

      // Delete project
      const response = await request(app)
        .delete(`/api/projects/${projectId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.affectedLogsCount).toBe(1);

      // Verify project is deleted
      await request(app).get(`/api/projects/${projectId}`).expect(404);

      // Verify log still exists with projectId set to null
      const logs = await Log.find({});
      const log = logs.find((l) => l.title === 'Test Log');
      expect(log).toBeDefined();
      expect(log?.projectId).toBeNull();
    });
  });
});
