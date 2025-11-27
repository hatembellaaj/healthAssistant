import { describe, it, expect } from 'vitest';
import { buildUserSummary, buildRecommendationsTemplate } from '../src/utils/promptBuilder';

const sampleProfile = {
  age: 40,
  sex: 'female',
  height_cm: 165,
  weight_kg: 70,
  blood_pressure: { systolic: 120, diastolic: 80 },
  lifestyle: {
    activity_level: 'moderate',
    steps_per_day: 8000,
    exercise: { sessions_per_week: 3, minutes_per_session: 45, types: ['running'] },
    diet_description: 'plant-forward with lean proteins',
  },
  location: { city: 'Paris', country: 'France' },
};

describe('prompt builder', () => {
  it('builds a human-readable summary', () => {
    const summary = buildUserSummary(sampleProfile);
    expect(summary).toContain('Age: 40');
    expect(summary).toContain('BMI:');
    expect(summary).toContain('Location: Paris, France');
  });

  it('includes structured sections', () => {
    const prompt = buildRecommendationsTemplate(sampleProfile);
    expect(prompt).toContain('Summary of situation');
    expect(prompt).toContain('Key observations');
    expect(prompt).toContain('Recommendations for next weeks');
  });
});
