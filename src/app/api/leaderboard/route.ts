
import { NextResponse } from 'next/server';
import type { LeaderboardEntry } from '@/types/leaderboard';
import { kv } from '@vercel/kv'; // Import Vercel KV

const LEADERBOARD_KEY = 'leaderboard';

// Helper function to get leaderboard data from KV
async function getLeaderboardFromKV(): Promise<LeaderboardEntry[]> {
  try {
    const data = await kv.get<LeaderboardEntry[]>(LEADERBOARD_KEY);
    return data || []; // Return empty array if no data or null
  } catch (error) {
    console.error('Error fetching leaderboard from Vercel KV:', error);
    // In case of error fetching from KV, you might return an empty array or throw
    // For robustness, let's return an empty array so the app can still function
    return []; 
  }
}

// Helper function to save leaderboard data to KV
async function saveLeaderboardToKV(data: LeaderboardEntry[]): Promise<void> {
  try {
    await kv.set(LEADERBOARD_KEY, data);
  } catch (error) {
    console.error('Error saving leaderboard to Vercel KV:', error);
    // Handle error appropriately, maybe throw to let the caller know
    throw new Error('Failed to save leaderboard to Vercel KV.');
  }
}

export async function GET() {
  try {
    let leaderboardData = await getLeaderboardFromKV();
    
    leaderboardData.sort((a, b) => {
      if (b.punteggio === a.punteggio) {
        return new Date(a.data_partecipazione).getTime() - new Date(b.data_partecipazione).getTime();
      }
      return b.punteggio - a.punteggio;
    });

    const rankedLeaderboard = leaderboardData.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    return NextResponse.json(rankedLeaderboard.slice(0, 100));
  } catch (error) {
    console.error('API GET /api/leaderboard Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Errore nel recupero della classifica.';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, punteggio } = body;

    if (!username || typeof username !== 'string' || username.length > 50) {
      return NextResponse.json({ message: 'Username non valido.' }, { status: 400 });
    }
    if (punteggio === undefined || typeof punteggio !== 'number' || punteggio < 0 || punteggio > 10) {
      return NextResponse.json({ message: 'Punteggio non valido.' }, { status: 400 });
    }

    let leaderboard = await getLeaderboardFromKV();
    const now = new Date().toISOString();

    const existingUserIndex = leaderboard.findIndex(entry => entry.username.toLowerCase() === username.toLowerCase());

    if (existingUserIndex !== -1) {
      leaderboard[existingUserIndex].punteggio = punteggio;
      leaderboard[existingUserIndex].data_partecipazione = now;
    } else {
      leaderboard.push({
        id: Date.now(), 
        username: username,
        punteggio: punteggio,
        data_partecipazione: now,
      });
    }
    
    leaderboard.sort((a, b) => {
      if (b.punteggio === a.punteggio) {
        return new Date(a.data_partecipazione).getTime() - new Date(b.data_partecipazione).getTime();
      }
      return b.punteggio - a.punteggio;
    });
    
    // Optional: limit the size of the leaderboard stored in KV
    // leaderboard = leaderboard.slice(0, 200); 

    await saveLeaderboardToKV(leaderboard);

    return NextResponse.json({ message: 'Punteggio salvato con successo!' }, { status: 201 });
  } catch (error) {
    console.error('API POST /api/leaderboard Error:', error);
    let errorMessage = 'Errore nel salvataggio del punteggio.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
