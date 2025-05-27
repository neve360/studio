
"use client";

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { quizQuestions, type QuizQuestion, type QuizOption } from '@/lib/quizData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Logo from '@/components/Logo';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, HelpCircle, Loader2 } from 'lucide-react';

export default function QuizPage() {
  const [username, setUsername] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const storedUsername = localStorage.getItem('quizUsername');
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      router.push('/'); // Redirect if no username
    }
  }, [router]);

  const currentQuestion: QuizQuestion | undefined = quizQuestions[currentQuestionIndex];

  const handleAnswer = useCallback((answerId: string) => {
    if (isAnswered || !currentQuestion) return;

    setSelectedAnswerId(answerId);
    setIsAnswered(true);

    if (answerId === currentQuestion.correctAnswerId) {
      setScore((prevScore) => prevScore + 1);
    }
  }, [isAnswered, currentQuestion]);

  const handleNextQuestion = () => {
    setIsAnswered(false);
    setSelectedAnswerId(null);
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      if (isClient) {
        localStorage.setItem('quizScore', score.toString());
        localStorage.setItem('quizTotalQuestions', quizQuestions.length.toString());
      }
      router.push('/score');
    }
  };
  
  if (!isClient || !username || !currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full">
        <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
        <p className="text-xl text-muted-foreground">Caricamento del quiz...</p>
      </div>
    );
  }

  const progressValue = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full max-w-2xl mx-auto p-4">
      <Card className="w-full shadow-2xl">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <Logo size={32} className="mb-0" />
            <p className="text-sm text-primary font-semibold">Utente: {username}</p>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Domanda {currentQuestionIndex + 1} di {quizQuestions.length}</CardTitle>
          <Progress value={progressValue} className="w-full mt-2" />
           <CardDescription className="text-center pt-4 text-lg font-medium">
            {currentQuestion.text}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQuestion.options.map((option: QuizOption) => {
            const isCorrect = option.id === currentQuestion.correctAnswerId;
            const isSelected = option.id === selectedAnswerId;
            
            let feedbackIcon = null;
            let buttonClasses = "bg-card hover:bg-accent/10 border-border";

            if (isAnswered) {
              if (isSelected) {
                if (isCorrect) {
                  buttonClasses = "bg-green-500 hover:bg-green-600 border-green-600 text-primary-foreground";
                  feedbackIcon = <CheckCircle className="mr-2 h-5 w-5" />;
                } else {
                  buttonClasses = "bg-red-500 hover:bg-red-600 border-red-600 text-primary-foreground";
                  feedbackIcon = <XCircle className="mr-2 h-5 w-5" />;
                }
              } else if (isCorrect) {
                 buttonClasses = "bg-green-100 border-green-500 text-green-700 hover:bg-green-200";
                 feedbackIcon = <CheckCircle className="mr-2 h-5 w-5 text-green-500" />;
              }
            }
            
            return (
              <Button
                key={option.id}
                onClick={() => handleAnswer(option.id)}
                disabled={isAnswered}
                className={cn(
                  "w-full justify-start text-left p-4 h-auto text-base",
                  buttonClasses
                )}
                variant="outline" 
              >
                {feedbackIcon}
                <span className="font-semibold mr-2">{option.id}.</span> {option.text}
              </Button>
            );
          })}
        </CardContent>
        <CardFooter className="mt-6">
          {isAnswered && (
            <Button onClick={handleNextQuestion} className="w-full text-lg" size="lg">
              {currentQuestionIndex < quizQuestions.length - 1 ? 'Prossima Domanda' : 'Vedi Risultati'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
