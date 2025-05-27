
"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Award, RotateCcw, Zap, Loader2 } from 'lucide-react';

export default function ScorePage() {
  const [username, setUsername] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [totalQuestions, setTotalQuestions] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const storedUsername = localStorage.getItem('quizUsername');
    const storedScore = localStorage.getItem('quizScore');
    const storedTotalQuestions = localStorage.getItem('quizTotalQuestions');

    if (storedUsername) setUsername(storedUsername);
    if (storedScore) setScore(parseInt(storedScore, 10));
    if (storedTotalQuestions) setTotalQuestions(parseInt(storedTotalQuestions, 10));

    if (!storedUsername || storedScore === null || storedTotalQuestions === null) {
      // Delay redirect to allow rendering something before router action
      setTimeout(() => router.push('/'), 0);
    }
  }, [router]);

  const handlePlayAgain = () => {
    if (isClient) {
      localStorage.removeItem('quizScore');
      localStorage.removeItem('quizTotalQuestions');
      // Username is kept for convenience if the user wants to play again with the same name
    }
    router.push('/');
  };

  if (!isClient || username === null || score === null || totalQuestions === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full">
        <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
        <p className="text-xl text-muted-foreground">Calcolo del punteggio...</p>
      </div>
    );
  }

  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  let feedbackMessage = "";
  if (percentage === 100) {
    feedbackMessage = "Risultato perfetto! Sei un esperto di stampa 3D!";
  } else if (percentage >= 75) {
    feedbackMessage = "Ottimo lavoro! Conosci molto bene la stampa 3D.";
  } else if (percentage >= 50) {
    feedbackMessage = "Buon punteggio! Continua così per migliorare.";
  } else {
    feedbackMessage = "Non male, ma c'è spazio per migliorare. Riprova!";
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full max-w-md mx-auto p-4">
      <Card className="w-full shadow-2xl">
        <CardHeader className="items-center text-center">
          <Award className="h-20 w-20 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold">Quiz Completato!</CardTitle>
          <CardDescription className="text-lg mt-1">
            Congratulazioni, <span className="font-semibold text-primary">{username}</span>!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div>
            <p className="text-5xl font-bold text-primary">{score} / {totalQuestions}</p>
            <p className="text-muted-foreground">risposte corrette</p>
          </div>
          <div className="w-full px-4">
            <Progress value={percentage} className="h-4" />
            <p className="text-sm text-primary font-semibold mt-2">{percentage}%</p>
          </div>
          <p className="text-md italic">{feedbackMessage}</p>
        </CardContent>
        <CardFooter className="mt-6">
          <Button onClick={handlePlayAgain} className="w-full text-lg" size="lg">
            <RotateCcw className="mr-2 h-5 w-5" />
            Gioca Ancora
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
