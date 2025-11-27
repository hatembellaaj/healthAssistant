import { z } from 'zod';

const bloodPressureSchema = z.object({
  systolic: z.number().min(50).max(260),
  diastolic: z.number().min(30).max(200),
  measured_at: z.string().optional(),
});

const exerciseSchema = z.object({
  sessions_per_week: z.number().min(0).max(21).optional(),
  types: z.array(z.string()).optional(),
  minutes_per_session: z.number().min(0).max(500).optional(),
});

const lifestyleSchema = z.object({
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'high']).optional(),
  steps_per_day: z.number().min(0).max(50000).optional(),
  exercise: exerciseSchema.optional(),
  diet_description: z.string().max(2000).optional(),
  sleep_hours: z.number().min(0).max(24).optional(),
  sleep_quality: z.number().min(1).max(5).optional(),
  stress_level: z.number().min(1).max(5).optional(),
  smoking: z.string().max(200).optional(),
  alcohol: z.string().max(200).optional(),
});

const locationSchema = z.object({
  city: z.string().max(200).optional(),
  country: z.string().max(200).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const healthProfileSchema = z.object({
  age: z.number().min(0).max(120).optional(),
  sex: z.string().max(100).optional(),
  height_cm: z.number().min(50).max(260).optional(),
  weight_kg: z.number().min(1).max(400).optional(),
  blood_pressure: bloodPressureSchema.optional(),
  heart_rate: z.number().min(20).max(220).optional(),
  conditions: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  lifestyle: lifestyleSchema.optional(),
  location: locationSchema.optional(),
  work_type: z.string().max(200).optional(),
});

export const recommendationRequestSchema = z.object({
  userId: z.string().max(200).nullable().optional(),
  profile: healthProfileSchema,
});

export type HealthProfileInput = z.infer<typeof healthProfileSchema>;
export type RecommendationRequestInput = z.infer<typeof recommendationRequestSchema>;
