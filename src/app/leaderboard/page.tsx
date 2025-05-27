
"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, RotateCcw, Trophy } from 'lucide-react';
import type { LeaderboardEntry } from '@/types/leaderboard';
import { useToast } from "@/hooks/use-toast";
import Logo from '@/components/Logo';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/leaderboard');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Impossibile caricare la classifica.');
        }
        const data: LeaderboardEntry[] = await response.json();
        setLeaderboard(data.map((entry, index) => ({ ...entry, rank: index + 1 })));
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
        const errorMessage = (err as Error).message;
        setError(errorMessage);
        toast({
          title: "Errore",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [toast]);

  const handlePlayAgain = () => {
    localStorage.removeItem('quizScore');
    localStorage.removeItem('quizTotalQuestions');
    // Optional: localStorage.removeItem('quizUsername'); 
    router.push('/');
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full">
        <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
        <p className="text-xl text-muted-foreground">Caricamento classifica...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full max-w-2xl mx-auto p-4">
      <Card className="w-full shadow-2xl">
        <CardHeader className="items-center text-center">
          <Trophy className="h-20 w-20 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold">Classifica Tridm Lab</CardTitle>
          <CardDescription className="text-lg mt-1">
            Guarda chi sono i migliori giocatori!
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="text-red-500 text-center mb-4">{error}</p>
          )}
          {leaderboard.length === 0 && !error && (
            <p className="text-muted-foreground text-center">Nessun punteggio registrato ancora. Sii il primo!</p>
          )}
          {leaderboard.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px] text-center">Pos.</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead className="text-right">Punteggio</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium text-center">{entry.rank}</TableCell>
                    <TableCell>{entry.username}</TableCell>
                    <TableCell className="text-right">{entry.punteggio}</TableCell>
                    <TableCell className="text-right hidden sm:table-cell">
                      {new Date(entry.data_partecipazione).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="mt-6">
          <Button onClick={handlePlayAgain} className="w-full text-lg" size="lg">
            <RotateCcw className="mr-2 h-5 w-5" />
            Gioca Ancora
          </Button>
        </CardFooter>
      </Card>
       <div className="mt-8">
        <Logo size={32} />
      </div>
    </div>
  );
}
