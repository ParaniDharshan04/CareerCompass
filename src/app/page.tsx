import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Compass, Bot, FileText, BarChart, LogIn } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/logo';

export default function Home() {
  const features = [
    {
      icon: <FileText className="h-10 w-10 text-primary" />,
      title: 'Intelligent Resume Parsing',
      description:
        'Upload your resume and our AI will extract key details to understand your unique profile.',
    },
    {
      icon: <Compass className="h-10 w-10 text-primary" />,
      title: 'Personalized Role Matching',
      description:
        'Discover job roles that perfectly match your skills and experience, recommended by our advanced AI.',
    },
    {
      icon: <Bot className="h-10 w-10 text-primary" />,
      title: 'AI-Powered Mock Interviews',
      description:
        'Practice with AI-generated, role-specific questions and get instant feedback on your answers.',
    },
    {
      icon: <BarChart className="h-10 w-10 text-primary" />,
      title: 'Track Your Progress',
      description:
        'Monitor your interview performance over time with our detailed analytics and personalized dashboard.',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Logo />
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 md:py-32">
          <div className="container text-center">
            <div className="mx-auto max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl font-headline">
                Find Your True North with CareerCompass
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Leverage AI to analyze your resume, match you with the perfect roles, and ace your interviews. Your next career move starts here.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button size="lg" asChild>
                  <Link href="/signup">Start Your Journey</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">I have an account</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-16 bg-secondary">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">
                Everything You Need to Succeed
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                CareerCompass provides a full suite of tools to empower your job search.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <Card key={feature.title} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                      {feature.icon}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-xl font-semibold mb-2 font-headline">{feature.title}</CardTitle>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by professionals. Powered by AI.
          </p>
          <p className="text-center text-sm text-muted-foreground">&copy; {new Date().getFullYear()} CareerCompass. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
