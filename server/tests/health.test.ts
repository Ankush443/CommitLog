import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

describe('Server Health', () => {
  const app = createApp();

  it('should respond to health check endpoint', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBeDefined();
    expect(response.body.timestamp).toBeDefined();
  });

  it('should return 404 for unknown routes', async () => {
    const response = await request(app)
      .get('/api/unknown-route')
      .expect('Content-Type', /json/)
      .expect(404);

    expect(response.body.success).toBe(false);
  });
});
