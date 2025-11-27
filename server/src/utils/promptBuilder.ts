import { HealthProfile } from '../types/health';

export const buildUserSummary = (profile: HealthProfile): string => {
  const parts: string[] = [];
  if (profile.age) parts.push(`Age: ${profile.age}`);
  if (profile.sex) parts.push(`Sex/Gender: ${profile.sex}`);
  if (profile.height_cm) parts.push(`Height: ${profile.height_cm} cm`);
  if (profile.weight_kg) parts.push(`Weight: ${profile.weight_kg} kg`);
  if (profile.height_cm && profile.weight_kg) {
    const meters = profile.height_cm / 100;
    const bmi = profile.weight_kg / (meters * meters);
    parts.push(`BMI: ${bmi.toFixed(1)}`);
  }

  if (profile.blood_pressure) {
    const { systolic, diastolic, measured_at } = profile.blood_pressure;
    const measured = measured_at ? ` measured on ${measured_at}` : '';
    parts.push(`Blood pressure: ${systolic}/${diastolic}${measured}`);
  }

  if (profile.heart_rate) parts.push(`Heart rate: ${profile.heart_rate}`);
  if (profile.conditions?.length) parts.push(`Known conditions: ${profile.conditions.join(', ')}`);
  if (profile.medications?.length) parts.push(`Medications: ${profile.medications.join('; ')}`);
  if (profile.allergies?.length) parts.push(`Allergies: ${profile.allergies.join('; ')}`);

  if (profile.lifestyle) {
    const lifestyleParts: string[] = [];
    const { activity_level, steps_per_day, exercise, diet_description, sleep_hours, sleep_quality, stress_level, smoking, alcohol } =
      profile.lifestyle;
    if (activity_level) lifestyleParts.push(`Activity level: ${activity_level}`);
    if (steps_per_day) lifestyleParts.push(`Steps per day: ${steps_per_day}`);
    if (exercise) {
      const exerciseDetails = [
        exercise.sessions_per_week !== undefined ? `${exercise.sessions_per_week} sessions/week` : null,
        exercise.minutes_per_session !== undefined ? `${exercise.minutes_per_session} minutes/session` : null,
        exercise.types?.length ? `Types: ${exercise.types.join(', ')}` : null,
      ].filter(Boolean);
      if (exerciseDetails.length) lifestyleParts.push(`Exercise: ${exerciseDetails.join('; ')}`);
    }
    if (diet_description) lifestyleParts.push(`Diet: ${diet_description}`);
    if (sleep_hours !== undefined) lifestyleParts.push(`Sleep hours: ${sleep_hours}`);
    if (sleep_quality !== undefined) lifestyleParts.push(`Sleep quality (1-5): ${sleep_quality}`);
    if (stress_level !== undefined) lifestyleParts.push(`Stress level (1-5): ${stress_level}`);
    if (smoking) lifestyleParts.push(`Smoking: ${smoking}`);
    if (alcohol) lifestyleParts.push(`Alcohol: ${alcohol}`);

    if (lifestyleParts.length) {
      parts.push(`Lifestyle: ${lifestyleParts.join(' | ')}`);
    }
  }

  if (profile.location) {
    const { city, country, latitude, longitude } = profile.location;
    const locStrings = [city, country].filter(Boolean).join(', ');
    const coords = latitude !== undefined && longitude !== undefined ? ` (${latitude}, ${longitude})` : '';
    if (locStrings || coords) parts.push(`Location: ${locStrings}${coords}`);
  }

  if (profile.work_type) parts.push(`Work type: ${profile.work_type}`);
  return parts.join('\n');
};

export const buildRecommendationsTemplate = (profile: HealthProfile): string => {
  const summary = buildUserSummary(profile);
  return `User profile summary:\n${summary}\n\nPlease return structured lifestyle recommendations with sections for:\n- Summary of situation\n- Key observations\n- Recommendations for next weeks\n- Location-adapted notes\n- Red flags & when to see a doctor\n- Tracking & next steps`;
};
