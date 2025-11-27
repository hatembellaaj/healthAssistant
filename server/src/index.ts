import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { recommendationRequestSchema } from './utils/validation';
import { buildRecommendationsTemplate } from './utils/promptBuilder';
import { RecommendationRequest, RecommendationResponse } from './types/health';
import { requestAssistantRecommendations } from './utils/assistantClient';

dotenv.config();

const app = express();
app.use(express.json());

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map((origin) => origin.trim()).filter(Boolean) ?? [];
const allowAllOrigins = allowedOrigins.length === 0 || allowedOrigins.includes('*');

const corsOptions = allowAllOrigins
  ? {}
  : {
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
    };

app.use(cors(corsOptions));
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

    const prompt = buildRecommendationsTemplate(profile);

    const responseText = await requestAssistantRecommendations(prompt);

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
    const message = error instanceof Error ? error.message : 'Unexpected error';
    res.status(500).json({ message: 'Failed to generate recommendations', detail: message });
  }
});

app.get('/api/profile', (_req, res) => {
  res.json({ profile: null, message: 'Profile storage not configured in demo mode.' });
});

app.put('/api/profile', (req, res) => {
  res.json({ saved: true, profile: req.body });
});

const port = Number(process.env.PORT) || 9500;

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`DailyLife Health Coach backend listening on port ${port}`);
  });
}

export default app;
