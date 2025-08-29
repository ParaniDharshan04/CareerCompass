"use client";

import { recommendSuitableRoles } from "@/ai/flows/recommend-suitable-roles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { RoleRecommendation } from "@/lib/types";
import { Upload, Bot, Briefcase, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, type ChangeEvent } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<RoleRecommendation | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
      setRecommendations(null); // Reset recommendations on new file select
    }
  };

  const handleAnalyzeResume = async () => {
    if (!fileName) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a resume file to analyze.",
      });
      return;
    }

    setIsLoading(true);
    setRecommendations(null);

    try {
      // In a real app, you would parse the resume file to text here.
      // For this demo, we'll use a mock resume text.
      const mockResumeText = `
        John Doe - Software Engineer
        Experience in React, Next.js, and TypeScript.
        Led a team to build a scalable web application.
      `;
      const result = await recommendSuitableRoles({ resumeData: mockResumeText });
      setRecommendations(result);
    } catch (error) {
      console.error("Error analyzing resume:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "There was an error analyzing your resume. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, John! Let's get you ready for your next role.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            <span>Start Here: Analyze Your Resume</span>
          </CardTitle>
          <CardDescription>
            Upload your resume (PDF or DOCX) and our AI will suggest suitable job roles and prepare a tailored interview.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="grid w-full max-w-sm items-center gap-1.5 flex-1">
              <Label htmlFor="resume-upload" className="sr-only">Upload Resume</Label>
              <Input id="resume-upload" type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx" className="cursor-pointer" />
              {fileName && <p className="text-sm text-muted-foreground">Selected: {fileName}</p>}
            </div>
            <Button onClick={handleAnalyzeResume} disabled={isLoading || !fileName}>
              <Bot className="mr-2 h-4 w-4" />
              {isLoading ? 'Analyzing...' : 'Analyze Resume'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {isLoading && <LoadingRecommendations />}

      {recommendations && (
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline mb-4">Recommended Roles</h2>
          <div className="space-y-4">
            <Card className="bg-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">AI's Reasoning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80">{recommendations.reasoning}</p>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recommendations.roles.map((role) => (
                <Card key={role} className="flex flex-col justify-between hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="bg-secondary p-3 rounded-lg">
                        <Briefcase className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl font-headline">{role}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Prepare for a mock interview for the {role} position.
                    </p>
                    <Button asChild className="w-full">
                      <Link href={`/dashboard/interview/${encodeURIComponent(role)}`}>
                        Start Interview <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingRecommendations() {
  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight font-headline mb-4">
        <Skeleton className="h-8 w-64" />
      </h2>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle><Skeleton className="h-6 w-40" /></CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle><Skeleton className="h-6 w-1/2" /></CardTitle>
              </CardHeader>
              <CardContent>
                 <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
