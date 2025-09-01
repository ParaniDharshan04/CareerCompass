"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent, ChangeEvent } from "react";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const description = formData.get("description") as string;

    const userProfile = {
      name,
      email,
      description,
      avatar: avatarPreview || `https://i.pravatar.cc/150?u=${email}`,
      initials: name.split(" ").map(n => n[0]).join("").toUpperCase(),
    };

    // In a real app, you'd handle registration and authentication.
    // For this demo, we'll save to localStorage and redirect.
    localStorage.setItem("careercompass_user", JSON.stringify(userProfile));
    
    // This is to ensure other components react to the change
    window.dispatchEvent(new Event('storage'));

    router.push("/dashboard");
  };

  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold font-headline">Create an Account</CardTitle>
        <CardDescription>Enter your details below to get started</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center space-y-2">
            <Avatar className="w-24 h-24">
                <AvatarImage src={avatarPreview || undefined} alt="Avatar Preview" />
                <AvatarFallback className="text-3xl">
                    {avatarPreview ? '' : '?'}
                </AvatarFallback>
            </Avatar>
            <Label htmlFor="avatar-upload" className="cursor-pointer text-sm text-primary hover:underline">
                Upload Profile Photo
            </Label>
            <Input id="avatar-upload" name="avatar" type="file" onChange={handleAvatarChange} accept="image/*" className="sr-only" required/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" type="text" placeholder="John Doe" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">About Me</Label>
            <Textarea id="description" name="description" placeholder="A short description about your professional background..." required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full">
            Create Account
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
