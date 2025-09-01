"use client";

import { analyzeInterviewResponses } from "@/ai/flows/analyze-interview-responses";
import { generateInterviewQuestions } from "@/ai/flows/generate-interview-questions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { InterviewResult } from "@/lib/types";
import { Bot, ChevronLeft, Loader2, Send, Mic, MicOff } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Label } from "@/components/ui/label";

// SpeechRecognition might not be available in the window object, so we need to declare it
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}


export default function InterviewPage() {
  const router = useRouter();
  const params = useParams();
  const role = decodeURIComponent(params.role as string);

  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentResponse, setCurrentResponse] = useState("");
  const [interviewResults, setInterviewResults] = useState<InterviewResult[]>([]);
  
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            setCurrentResponse(prev => prev + finalTranscript);
        };
        
        recognitionRef.current.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            toast({
                variant: 'destructive',
                title: 'Speech Recognition Error',
                description: `An error occurred: ${event.error}`,
            })
            setIsRecording(false);
        };

        recognitionRef.current.onend = () => {
          if (isRecording) {
            // If it stops unexpectedly, try to restart it
            recognitionRef.current.start();
          }
        };

    } else {
       toast({
        variant: "destructive",
        title: "Browser Not Supported",
        description: "Your browser does not support Speech Recognition.",
      });
    }
  }, [toast, isRecording]);


  const handleToggleRecording = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setCurrentResponse("");
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsGeneratingQuestions(true);
      try {
        const mockResumeText = `
          John Doe - Software Engineer
          Experience in React, Next.js, and TypeScript.
          Led a team to build a scalable web application.
        `;
        const result = await generateInterviewQuestions({ jobRole: role, resumeText: mockResumeText });
        setQuestions(result.questions);
      } catch (error) {
        console.error("Failed to generate questions:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not generate interview questions. Please try again.",
        });
        router.back();
      } finally {
        setIsGeneratingQuestions(false);
      }
    };
    if (role) {
      fetchQuestions();
    }
  }, [role, router, toast]);

  const handleSubmitResponse = async () => {
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    if (!currentResponse.trim()) {
      toast({
        variant: "destructive",
        title: "Empty Response",
        description: "Please provide an answer to the question.",
      });
      return;
    }
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeInterviewResponses({
        question: questions[currentQuestionIndex],
        response: currentResponse,
        role: role,
      });

      const newResult: InterviewResult = {
        question: questions[currentQuestionIndex],
        response: currentResponse,
        analysis,
      };
      
      const updatedResults = [...interviewResults, newResult];
      setInterviewResults(updatedResults);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setCurrentResponse("");
      } else {
        // End of interview
        const interviewId = `interview_${Date.now()}`;
        const overallScore = updatedResults.reduce((acc, r) => {
            const avgScore = (r.analysis.clarityScore + r.analysis.relevanceScore + r.analysis.completenessScore) / 3;
            return acc + avgScore;
        }, 0) / updatedResults.length;

        const fullInterview = {
            id: interviewId,
            role: role,
            date: new Date().toISOString(),
            results: updatedResults,
            overallScore: Math.round(overallScore)
        };
        
        // Save to local storage
        const pastInterviews = JSON.parse(localStorage.getItem("careercompass_interviews") || "[]");
        localStorage.setItem("careercompass_interviews", JSON.stringify([fullInterview, ...pastInterviews]));
        
        router.push(`/dashboard/results/${interviewId}`);
      }
    } catch (error) {
      console.error("Failed to analyze response:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "There was an error analyzing your response. Please try again.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isGeneratingQuestions) {
    return <InterviewLoadingSkeleton role={role} />;
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Dashboard
      </Link>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Mock Interview: {role}</CardTitle>
          <CardDescription>Answer the following question. Your response will be analyzed for clarity, relevance, and completeness.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Question {currentQuestionIndex + 1} of {questions.length}</p>
            <Progress value={progress} className="w-full" />
          </div>

          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-lg font-semibold text-foreground">{questions[currentQuestionIndex]}</p>
          </div>
          
          <div className="space-y-4">
             <div className="flex items-center gap-4">
                <Button onClick={handleToggleRecording} variant={isRecording ? "destructive" : "outline"} size="lg" disabled={isAnalyzing}>
                  {isRecording ? <><MicOff className="mr-2 h-5 w-5"/>Stop Recording</> : <><Mic className="mr-2 h-5 w-5"/>Start Recording</>}
                </Button>
                {isRecording && <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/> <span>Recording...</span></div>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="response" className="font-semibold flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" /> Your Answer (as transcribed by AI)
                </Label>
                <Textarea
                  id="response"
                  value={currentResponse}
                  onChange={(e) => setCurrentResponse(e.target.value)}
                  placeholder="Speak your answer, and the AI will transcribe it here..."
                  rows={8}
                  disabled={isAnalyzing || isRecording}
                />
            </div>
          </div>

          <Button onClick={handleSubmitResponse} disabled={isAnalyzing || !currentResponse.trim()} className="w-full sm:w-auto">
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                {currentQuestionIndex < questions.length - 1 ? "Submit & Next Question" : "Finish Interview"}
                <Send className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function InterviewLoadingSkeleton({ role }: { role: string }) {
  return (
     <div className="max-w-4xl mx-auto space-y-8">
       <Skeleton className="h-6 w-48" />
       <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            <Skeleton className="h-8 w-1/2" />
          </CardTitle>
          <CardDescription>
             <Skeleton className="h-4 w-3/4" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div>
            <Skeleton className="h-4 w-1/4 mb-1" />
            <Skeleton className="h-4 w-full" />
          </div>
           <div className="p-4 bg-secondary rounded-lg">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3 mt-2" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12 w-48" />
             <div className="space-y-2">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-32 w-full" />
            </div>
          </div>
          <Skeleton className="h-10 w-48" />
        </CardContent>
      </Card>
    </div>
  )
}
