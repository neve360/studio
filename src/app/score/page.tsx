
"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Award, RotateCcw, Trophy, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function ScorePage() {
  const [username, setUsername] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [totalQuestions, setTotalQuestions] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    const storedUsername = localStorage.getItem('quizUsername');
    const storedScore = localStorage.getItem('quizScore');
    const storedTotalQuestions = localStorage.getItem('quizTotalQuestions');

    if (storedUsername) setUsername(storedUsername);
    if (storedScore) setScore(parseInt(storedScore, 10));
    if (storedTotalQuestions) setTotalQuestions(parseInt(storedTotalQuestions, 10));

    if (!storedUsername || storedScore === null || storedTotalQuestions === null) {
      setTimeout(() => router.push('/'), 0);
    }
  }, [router]);

  useEffect(() => {
    if (isClient && username && score !== null) {
      const saveScore = async () => {
        setIsSaving(true);
        try {
          const response = await fetch('/api/leaderboard', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, punteggio: score }),
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Errore nel salvataggio del punteggio.');
          }
          // Non è necessario mostrare un toast di successo qui,
          // la pagina stessa è la conferma.
        } catch (error) {
          console.error("Failed to save score:", error);
          toast({
            title: "Errore",
            description: (error as Error).message || "Impossibile salvare il punteggio. Riprova più tardi.",
            variant: "destructive",
          });
        } finally {
          setIsSaving(false);
        }
      };
      saveScore();
    }
  }, [isClient, username, score, toast]);

  const handlePlayAgain = () => {
    if (isClient) {
      // Username can be kept, or cleared if a new user is expected
      // localStorage.removeItem('quizUsername'); 
      localStorage.removeItem('quizScore');
      localStorage.removeItem('quizTotalQuestions');
    }
    router.push('/');
  };

  const handleViewLeaderboard = () => {
    router.push('/leaderboard');
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
    feedbackMessage = "Risultato perfetto! Sei un esperto di Tridm Lab!";
  } else if (percentage >= 75) {
    feedbackMessage = "Ottimo lavoro! Conosci molto bene il mondo Tridm Lab.";
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
          {isSaving && (
            <div className="flex items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvataggio punteggio...
            </div>
          )}
        </CardContent>
        <CardFooter className="mt-6 flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
          <Button onClick={handlePlayAgain} className="w-full text-lg" size="lg" variant="outline">
            <RotateCcw className="mr-2 h-5 w-5" />
            Gioca Ancora
          </Button>
          <Button onClick={handleViewLeaderboard} className="w-full text-lg" size="lg">
            <Trophy className="mr-2 h-5 w-5" />
            Vedi Classifica
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
