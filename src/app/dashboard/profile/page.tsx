"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import type { FullInterview } from "@/lib/types";
import { ArrowRight, BarChart3, Edit, Trophy, Star, Briefcase, UserCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent, type ChangeEvent } from "react";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const [interviews, setInterviews] = useState<FullInterview[]>([]);
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    initials: "JD",
    description: "A passionate software engineer with experience in building scalable web applications using modern technologies.",
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    const loadData = () => {
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("careercompass_user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

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
    };
    loadData();

    // Listen for storage changes to update the profile in real-time
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);
  
  const handleProfileSave = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newName = formData.get("name") as string;
    const newEmail = formData.get("email") as string;
    const newDescription = formData.get("description") as string;
    
    const updatedUser = {
      ...user,
      name: newName,
      email: newEmail,
      description: newDescription,
      avatar: avatarPreview || user.avatar,
      initials: newName.split(" ").map(n => n[0]).join("").toUpperCase(),
    };

    setUser(updatedUser);
    localStorage.setItem("careercompass_user", JSON.stringify(updatedUser));
    // Trigger storage event for other components like UserNav
    window.dispatchEvent(new Event('storage'));

    setAvatarPreview(null);
    setIsEditDialogOpen(false);
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const stats = useMemo(() => {
    const totalInterviews = interviews.length;
    const averageScore = totalInterviews > 0 
      ? Math.round(interviews.reduce((acc, i) => acc + i.overallScore, 0) / totalInterviews)
      : 0;
    const bestInterview = totalInterviews > 0
      ? interviews.reduce((best, current) => current.overallScore > best.overallScore ? current : best, interviews[0])
      : null;

    return { totalInterviews, averageScore, bestInterview };
  }, [interviews]);

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

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-3">
           <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl font-bold">{user.name}</CardTitle>
                <p className="text-muted-foreground">{user.email}</p>
                 <CardDescription className="mt-2 text-base text-foreground/90">{user.description}</CardDescription>
              </div>
            </div>
            <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => { setIsEditDialogOpen(isOpen); if (!isOpen) setAvatarPreview(null);}}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit Profile</span>
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleProfileSave} className="space-y-4">
                        <div className="space-y-2">
                           <Label htmlFor="avatar-upload">Profile Picture</Label>
                           <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={avatarPreview || user.avatar} />
                                <AvatarFallback>{user.initials}</AvatarFallback>
                            </Avatar>
                            <Input id="avatar-upload" name="avatar" type="file" onChange={handleAvatarChange} accept="image/*" />
                           </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="name" defaultValue={user.name} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" defaultValue={user.email} required />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="description">About Me</Label>
                            <Textarea id="description" name="description" defaultValue={user.description} required />
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="ghost">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInterviews}</div>
            <div className="text-xs text-muted-foreground">mock interviews completed</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}%</div>
             <div className="text-xs text-muted-foreground">across all interviews</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Best Performance</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {stats.bestInterview ? (
                <>
                    <div className="text-2xl font-bold">{stats.bestInterview.overallScore}%</div>
                    <div className="text-xs text-muted-foreground">in {stats.bestInterview.role}</div>
                </>
             ) : (
                <>
                    <div className="text-2xl font-bold">N/A</div>
                    <div className="text-xs text-muted-foreground">No interviews yet</div>
                </>
             )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Over Time
            </CardTitle>
            <CardDescription>
              Visualize your mock interview score trend to track improvement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 1 ? (
              <div className="h-[300px] w-full">
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
               <div className="text-center py-10 flex flex-col items-center justify-center h-[300px]">
                  <p className="text-muted-foreground">Complete at least two interviews to see your progress chart.</p>
                   <Button asChild variant="secondary" className="mt-4">
                        <Link href="/dashboard">Start a New Interview</Link>
                    </Button>
               </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Interview History</CardTitle>
            <CardDescription>A log of all your completed mock interviews.</CardDescription>
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
    </div>
  );
}
