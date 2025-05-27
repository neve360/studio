
"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/Logo';
import { useToast } from "@/hooks/use-toast";

export default function UsernamePage() {
  const [username, setUsername] = useState('');
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    // Clear previous quiz session data if any, except username for convenience
    localStorage.removeItem('quizScore');
    localStorage.removeItem('quizTotalQuestions');
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === '') {
      toast({
        title: "Errore",
        description: "Per favore, inserisci un nome utente.",
        variant: "destructive",
      });
      return;
    }
    if (isClient) {
      localStorage.setItem('quizUsername', username);
      router.push('/quiz');
    }
  };

  if (!isClient) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full max-w-md mx-auto p-4 animate-pulse">
            <div className="w-full bg-card p-8 rounded-lg shadow-2xl space-y-6">
                <div className="h-12 bg-muted rounded w-3/4 mx-auto"></div>
                <div className="h-8 bg-muted rounded w-1/2 mx-auto"></div>
                <div className="h-10 bg-muted rounded w-full"></div>
                <div className="h-12 bg-muted rounded w-full"></div>
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full max-w-md mx-auto p-4">
      <Card className="w-full shadow-2xl">
        <CardHeader className="items-center">
          <Logo className="mb-4" />
          <CardTitle className="text-3xl font-bold text-center">Benvenuto al Quiz di Tridm Lab!</CardTitle>
          <CardDescription className="text-center">Inserisci il tuo nome utente per iniziare.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              id="username"
              type="text"
              placeholder="Il tuo nome utente"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="text-lg"
              aria-label="Username"
            />
            <Button type="submit" className="w-full text-lg" size="lg">
              Inizia il Quiz
            </Button>
          </form>
        </CardContent>
        <CardFooter className="mt-4">
          <p className="text-xs text-muted-foreground text-center w-full">
            Metti alla prova la tua conoscenza con Tridm Lab.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
