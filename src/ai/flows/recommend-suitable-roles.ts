'use server';

/**
 * @fileOverview A flow that recommends suitable job roles based on the parsed resume data.
 *
 * - recommendSuitableRoles - A function that handles the role recommendation process.
 * - RecommendSuitableRolesInput - The input type for the recommendSuitableRoles function.
 * - RecommendSuitableRolesOutput - The return type for the recommendSuitableRoles function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendSuitableRolesInputSchema = z.object({
  resumeData: z
    .string()
    .describe('The parsed data extracted from the user resume.'),
});
export type RecommendSuitableRolesInput = z.infer<typeof RecommendSuitableRolesInputSchema>;

const RecommendSuitableRolesOutputSchema = z.object({
  roles: z
    .array(z.string())
    .describe('An array of job roles recommended for the user.'),
  reasoning: z
    .string()
    .describe('The reasoning behind the role recommendations.'),
});
export type RecommendSuitableRolesOutput = z.infer<typeof RecommendSuitableRolesOutputSchema>;

export async function recommendSuitableRoles(
  input: RecommendSuitableRolesInput
): Promise<RecommendSuitableRolesOutput> {
  return recommendSuitableRolesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendSuitableRolesPrompt',
  input: {schema: RecommendSuitableRolesInputSchema},
  output: {schema: RecommendSuitableRolesOutputSchema},
  prompt: `You are an expert career advisor. Given the following resume data, recommend the 3 most suitable job roles for the user.
\nResume Data: {{{resumeData}}}
\nExplain your reasoning for each recommendation.
\nOutput the job roles as an array of strings, and the reasoning as a single string.
\nEnsure the output is valid JSON.`,
});

const recommendSuitableRolesFlow = ai.defineFlow(
  {
    name: 'recommendSuitableRolesFlow',
    inputSchema: RecommendSuitableRolesInputSchema,
    outputSchema: RecommendSuitableRolesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
