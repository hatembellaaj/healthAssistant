import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { recommendationRequestSchema } from './utils/validation';
import { buildRecommendationsTemplate, buildUserSummary } from './utils/promptBuilder';
import { RecommendationRequest, RecommendationResponse } from './types/health';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') ?? '*' }));
app.use(helmet());

const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  message: 'Too many requests, please try again shortly.',
});
app.use('/api/', limiter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'DailyLife Health Coach backend ready' });
});

app.post('/api/assistant/recommendations', async (req, res) => {
  try {
    const parsed = recommendationRequestSchema.parse(req.body) as RecommendationRequest;
    const profile = parsed.profile;

    const userSummary = buildUserSummary(profile);
    const prompt = buildRecommendationsTemplate(profile);

    // In production, replace this stub with a call to an LLM provider using the prompt above.
    const responseText = `## Summary of situation\n${userSummary || 'Profile data not provided.'}\n\n` +
      `## Key observations\n- Data captured for personalized coaching.\n- Remember: this app is not a medical device.\n\n` +
      `## Recommendations for next weeks\n- Keep consistent movement most days of the week.\n- Focus meals on vegetables, lean proteins, and whole grains.\n- Aim for regular sleep and stress-management breaks.\n\n` +
      `## Location-adapted notes\n- If weather or environment limits exercise, prioritize indoor routines.\n\n` +
      `## Red flags & when to see a doctor\n- Chest pain, sudden shortness of breath, or neurological symptoms warrant urgent care.\n\n` +
      `## Tracking & next steps\n- Record vitals weekly and update this profile to refresh guidance.\n\nPrompt summary used:\n\n${prompt}`;

    const response: RecommendationResponse = {
      recommendations_text: responseText,
      created_at: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    console.error('Validation or processing error', error);
    if (error instanceof Error && 'issues' in (error as any)) {
      res.status(400).json({ message: 'Invalid data', issues: (error as any).issues });
      return;
    }
    res.status(500).json({ message: 'Unexpected error' });
  }
});

app.get('/api/profile', (_req, res) => {
  res.json({ profile: null, message: 'Profile storage not configured in demo mode.' });
});

app.put('/api/profile', (req, res) => {
  res.json({ saved: true, profile: req.body });
});

const port = Number(process.env.PORT) || 9500;
app.listen(port, () => {
  console.log(`DailyLife Health Coach backend listening on port ${port}`);
});

export default app;
