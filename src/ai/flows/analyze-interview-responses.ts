'use server';

/**
 * @fileOverview A flow for analyzing transcribed interview responses to assess clarity, relevance, and completeness.
 *
 * - analyzeInterviewResponses - A function that handles the analysis of interview responses.
 * - AnalyzeInterviewResponsesInput - The input type for the analyzeInterviewResponses function.
 * - AnalyzeInterviewResponsesOutput - The return type for the analyzeInterviewResponses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeInterviewResponsesInputSchema = z.object({
  question: z.string().describe('The interview question asked.'),
  response: z.string().describe('The transcribed response from the candidate.'),
  role: z.string().describe('The role the candidate is interviewing for.'),
});
export type AnalyzeInterviewResponsesInput = z.infer<
  typeof AnalyzeInterviewResponsesInputSchema
>;

const AnalyzeInterviewResponsesOutputSchema = z.object({
  clarityScore: z
    .number()
    .describe(
      'A score (0-100) indicating the clarity of the response. Higher is better.'
    ),
  relevanceScore: z
    .number()
    .describe(
      'A score (0-100) indicating the relevance of the response to the question. Higher is better.'
    ),
  completenessScore: z
    .number()
    .describe(
      'A score (0-100) indicating how completely the response answered the question. Higher is better.'
    ),
  feedback: z
    .string()
    .describe(
      'Constructive feedback on how the candidate can improve their response.'
    ),
});
export type AnalyzeInterviewResponsesOutput = z.infer<
  typeof AnalyzeInterviewResponsesOutputSchema
>;

export async function analyzeInterviewResponses(
  input: AnalyzeInterviewResponsesInput
): Promise<AnalyzeInterviewResponsesOutput> {
  return analyzeInterviewResponsesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeInterviewResponsesPrompt',
  input: {schema: AnalyzeInterviewResponsesInputSchema},
  output: {schema: AnalyzeInterviewResponsesOutputSchema},
  prompt: `You are an expert interview coach. You are provided with an interview question, the candidate's response, and the role the candidate is interviewing for. You will assess the response for clarity, relevance, and completeness, providing a score from 0-100 for each.  You will also provide constructive feedback on how the candidate can improve their response.

Role: {{{role}}}
Question: {{{question}}}
Response: {{{response}}}`,
});

const analyzeInterviewResponsesFlow = ai.defineFlow(
  {
    name: 'analyzeInterviewResponsesFlow',
    inputSchema: AnalyzeInterviewResponsesInputSchema,
    outputSchema: AnalyzeInterviewResponsesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
