export interface RoleRecommendation {
  roles: string[];
  reasoning: string;
}

export interface InterviewQuestion {
  question: string;
}

export interface InterviewAnalysis {
  clarityScore: number;
  relevanceScore: number;
  completenessScore: number;
  feedback: string;
}

export interface InterviewResult {
  question: string;
  response: string;
  analysis: InterviewAnalysis;
}

export interface FullInterview {
  id: string;
  role: string;
  date: string;
  results: InterviewResult[];
  overallScore: number;
}
