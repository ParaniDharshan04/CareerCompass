import { config } from 'dotenv';
config();

import '@/ai/flows/recommend-suitable-roles.ts';
import '@/ai/flows/generate-interview-questions.ts';
import '@/ai/flows/analyze-interview-responses.ts';