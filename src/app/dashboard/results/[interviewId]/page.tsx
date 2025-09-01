
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { FullInterview } from "@/lib/types";
import { BarChart, ChevronLeft, CheckCircle, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";


function ResultsLoadingSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-6 w-48" />
      <div>
        <Skeleton className="h-9 w-1/2 mb-2" />
        <Skeleton className="h-5 w-1/4" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-7 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col items-center justify-center space-y-4 rounded-lg bg-secondary p-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="text-center space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="h-[250px]">
             <Skeleton className="h-full w-full" />
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline mb-4">
          <Skeleton className="h-8 w-64" />
        </h2>
        <div className="w-full space-y-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full"/>)}
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const params = useParams();
  const interviewId = params.interviewId as string;
  const [interview, setInterview] = useState<FullInterview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLoading(true);
      const pastInterviews = JSON.parse(
        localStorage.getItem("careercompass_interviews") || "[]"
      ) as FullInterview[];
      const foundInterview = pastInterviews.find((i) => i.id === interviewId);
      setInterview(foundInterview || null);
      setLoading(false);
    }
  }, [interviewId]);

  const chartData = useMemo(() => {
    if (!interview) return [];
    return interview.results.map((r, index) => ({
      question: `Q${index + 1}`,
      clarity: r.analysis.clarityScore,
      relevance: r.analysis.relevanceScore,
      completeness: r.analysis.completenessScore,
    }));
  }, [interview]);
  
  const chartConfig = {
    clarity: { label: "Clarity", color: "hsl(var(--chart-1))" },
    relevance: { label: "Relevance", color: "hsl(var(--chart-2))" },
    completeness: { label: "Completeness", color: "hsl(var(--primary))" },
  } satisfies ChartConfig;


  if (loading) {
    return <ResultsLoadingSkeleton />;
  }

  if (!interview) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-2xl font-bold">Interview Not Found</h2>
        <div className="text-muted-foreground">The requested interview results could not be found.</div>
        <Button asChild className="mt-4">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-accent text-accent-foreground";
    if (score >= 60) return "bg-yellow-400 text-yellow-900";
    return "bg-destructive text-destructive-foreground";
  };
  
  return (
    <div className="space-y-8">
       <Link href="/dashboard/profile" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Profile
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Interview Results: {interview.role}</h1>
        <div className="text-muted-foreground">
          Completed on {new Date(interview.date).toLocaleDateString()}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overall Performance</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col items-center justify-center space-y-4 rounded-lg bg-secondary p-6">
                <p className="text-sm font-medium text-muted-foreground">Overall Score</p>
                <div className={`flex items-center justify-center h-32 w-32 rounded-full border-8 border-primary/20 ${getScoreColor(interview.overallScore)}`}>
                    <span className="text-4xl font-bold">{interview.overallScore}</span>
                </div>
                <div className="text-center text-sm text-muted-foreground">A measure of your performance across all questions.</div>
            </div>
          <div className="h-[250px]">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <RechartsBarChart data={chartData}>
                    <XAxis dataKey="question" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="clarity" fill="var(--color-clarity)" radius={4} />
                    <Bar dataKey="relevance" fill="var(--color-relevance)" radius={4} />
                    <Bar dataKey="completeness" fill="var(--color-completeness)" radius={4} />
                  </RechartsBarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
      
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline mb-4">Detailed Breakdown</h2>
        <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
          {interview.results.map((result, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="font-semibold text-lg hover:no-underline">
                Question {index + 1}: {result.question.length > 50 ? `${result.question.substring(0, 50)}...` : result.question}
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
                <div>
                  <h4 className="font-semibold mb-2">Your Answer:</h4>
                  <p className="text-muted-foreground italic p-4 bg-secondary rounded-md">"{result.response}"</p>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary"/>
                                Performance Scores
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ScoreIndicator label="Clarity" score={result.analysis.clarityScore} />
                            <ScoreIndicator label="Relevance" score={result.analysis.relevanceScore} />
                            <ScoreIndicator label="Completeness" score={result.analysis.completenessScore} />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-accent"/>
                                AI Feedback
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">{result.analysis.feedback}</p>
                        </CardContent>
                    </Card>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

       <div className="text-center mt-8">
        <Button asChild>
          <Link href="/dashboard">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

    </div>
  );
}

function ScoreIndicator({label, score}: {label:string, score:number}) {
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-medium">{label}</p>
                <Badge variant={score >= 80 ? "default" : score >= 60 ? "secondary" : "destructive"} className="bg-opacity-20 text-foreground">
                    {score}/100
                </Badge>
            </div>
            <Progress value={score} />
        </div>
    )
}
