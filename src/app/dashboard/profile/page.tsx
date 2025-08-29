"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import type { FullInterview } from "@/lib/types";
import { ArrowRight, BarChart3, Edit } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const [interviews, setInterviews] = useState<FullInterview[]>([]);

  useEffect(() => {
    // Mock data seeding if no data exists
    if (typeof window !== "undefined") {
      let pastInterviews = JSON.parse(
        localStorage.getItem("careercompass_interviews") || "[]"
      ) as FullInterview[];

      if(pastInterviews.length === 0) {
        pastInterviews = [
          {id: "mock_1", role: "Frontend Developer", date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), results: [], overallScore: 75},
          {id: "mock_2", role: "Product Manager", date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), results: [], overallScore: 82},
          {id: "mock_3", role: "UX Designer", date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), results: [], overallScore: 88},
        ];
        localStorage.setItem("careercompass_interviews", JSON.stringify(pastInterviews));
      }
      
      setInterviews(pastInterviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
  }, []);

  const chartData = useMemo(() => {
    return [...interviews].reverse().map(interview => ({
      date: new Date(interview.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: interview.overallScore,
    }));
  }, [interviews]);

  const chartConfig = {
    score: {
      label: "Overall Score",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and track your progress.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl font-bold">John Doe</CardTitle>
              <p className="text-muted-foreground">john.doe@example.com</p>
            </div>
          </div>
          <Button variant="outline" size="icon">
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit Profile</span>
          </Button>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 1 ? (
            <div className="h-[300px]">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} stroke="hsl(var(--foreground))" fontSize={12} />
                        <YAxis domain={[0, 100]} tickLine={false} axisLine={false} stroke="hsl(var(--foreground))" fontSize={12} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="score" stroke="var(--color-score)" strokeWidth={2} dot={{r: 4, fill: "var(--color-score)"}} activeDot={{r: 6}} />
                    </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          ) : (
             <div className="text-center py-10">
                <p className="text-muted-foreground">Complete more interviews to see your progress chart.</p>
             </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interview History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Overall Score</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interviews.length > 0 ? interviews.map((interview) => (
                <TableRow key={interview.id}>
                  <TableCell>{new Date(interview.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{interview.role}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={interview.overallScore >= 80 ? "default" : interview.overallScore >= 60 ? "secondary": "destructive"}>{interview.overallScore}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild disabled={interview.id.startsWith("mock_")}>
                      <Link href={interview.id.startsWith("mock_") ? "#" : `/dashboard/results/${interview.id}`}>
                        View <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No interviews completed yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
