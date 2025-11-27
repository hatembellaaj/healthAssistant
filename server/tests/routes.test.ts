import request from 'supertest';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { requestAssistantRecommendations } from '../src/utils/assistantClient';

vi.mock('../src/utils/assistantClient', () => ({
  requestAssistantRecommendations: vi.fn().mockResolvedValue('Test recommendations'),
}));

let app: import('express').Express;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  app = (await import('../src/index')).default;
});

describe('API routes', () => {
  it('returns a health check payload', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', message: 'DailyLife Health Coach backend ready' });
  });

  it('rejects invalid recommendation requests', async () => {
    const response = await request(app).post('/api/assistant/recommendations').send({ profile: { age: 200 } });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid data');
  });

  it('returns generated recommendations for valid payloads', async () => {
    const payload = {
      userId: 'user-123',
      profile: {
        age: 28,
        sex: 'female',
        height_cm: 165,
        weight_kg: 60,
        blood_pressure: { systolic: 118, diastolic: 76 },
        lifestyle: { activity_level: 'moderate', steps_per_day: 9000 },
        location: { city: 'Paris', country: 'France' },
      },
    };

    const response = await request(app).post('/api/assistant/recommendations').send(payload);
    expect(response.status).toBe(200);
    expect(response.body.recommendations_text).toBe('Test recommendations');
    expect(requestAssistantRecommendations).toHaveBeenCalledOnce();
  });
});
