export interface BloodPressure {
  systolic: number;
  diastolic: number;
  measured_at?: string;
}

export interface ExerciseDetails {
  sessions_per_week?: number;
  types?: string[];
  minutes_per_session?: number;
}

export interface Lifestyle {
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'high';
  steps_per_day?: number;
  exercise?: ExerciseDetails;
  diet_description?: string;
  sleep_hours?: number;
  sleep_quality?: number;
  stress_level?: number;
  smoking?: string;
  alcohol?: string;
}

export interface LocationInfo {
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface HealthProfile {
  age?: number;
  sex?: string;
  height_cm?: number;
  weight_kg?: number;
  blood_pressure?: BloodPressure;
  heart_rate?: number;
  conditions?: string[];
  medications?: string[];
  allergies?: string[];
  lifestyle?: Lifestyle;
  location?: LocationInfo;
  work_type?: string;
}

export interface RecommendationRequest {
  userId?: string | null;
  profile: HealthProfile;
}

export interface RecommendationResponse {
  recommendations_text: string;
  created_at: string;
}
