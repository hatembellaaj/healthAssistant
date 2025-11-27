import { describe, it, expect } from 'vitest';
import { recommendationRequestSchema } from '../src/utils/validation';

describe('recommendationRequestSchema', () => {
  it('validates a well-formed payload', () => {
    const payload = {
      userId: null,
      profile: {
        age: 30,
        sex: 'male',
        height_cm: 180,
        weight_kg: 80,
        blood_pressure: { systolic: 120, diastolic: 80 },
        lifestyle: { activity_level: 'light', sleep_hours: 7, sleep_quality: 4, stress_level: 2 },
        location: { city: 'Berlin', country: 'Germany', latitude: 52.52, longitude: 13.405 },
      },
    };

    const parsed = recommendationRequestSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
  });

  it('rejects invalid values', () => {
    const payload = {
      profile: {
        age: 200,
        lifestyle: { activity_level: 'extreme' },
      },
    } as any;

    const parsed = recommendationRequestSchema.safeParse(payload);
    expect(parsed.success).toBe(false);
  });
});
