
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import type { LeaderboardEntry } from '@/types/leaderboard';

const dataDir = path.join(process.cwd(), 'data');
const leaderboardFilePath = path.join(dataDir, 'leaderboard.json');

async function ensureDataDirExists() {
  try {
    await fs.access(dataDir);
  } catch (error) {
    // Directory does not exist, create it
    await fs.mkdir(dataDir, { recursive: true });
  }
}

async function readLeaderboardFile(): Promise<LeaderboardEntry[]> {
  await ensureDataDirExists();
  try {
    await fs.access(leaderboardFilePath);
    const fileContent = await fs.readFile(leaderboardFilePath, 'utf-8');
    if (fileContent.trim() === '') {
      return [];
    }
    return JSON.parse(fileContent) as LeaderboardEntry[];
  } catch (error) {
    // File does not exist or other read error, return empty array
    return [];
  }
}

async function writeLeaderboardFile(data: LeaderboardEntry[]): Promise<void> {
  await ensureDataDirExists();
  await fs.writeFile(leaderboardFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  try {
    let leaderboardData = await readLeaderboardFile();
    
    // Sort and assign rank
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

    return NextResponse.json(rankedLeaderboard.slice(0, 100)); // Limit to top 100
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
    if (punteggio === undefined || typeof punteggio !== 'number' || punteggio < 0 || punteggio > 10) { // Assuming max score is 10 based on quizData
      return NextResponse.json({ message: 'Punteggio non valido.' }, { status: 400 });
    }

    let leaderboard = await readLeaderboardFile();
    const now = new Date().toISOString();

    const existingUserIndex = leaderboard.findIndex(entry => entry.username.toLowerCase() === username.toLowerCase());

    if (existingUserIndex !== -1) {
      // Update existing user's score if the new score is higher, or if it's the same but newer (though typically we update regardless for simplicity or based on rules)
      // For this quiz, we'll update if the score is higher, or keep the existing if it's lower.
      // If a user replays and gets a lower score, we might not want to update.
      // However, the SQL version used ON DUPLICATE KEY UPDATE, which would update. Let's mirror that.
      leaderboard[existingUserIndex].punteggio = punteggio;
      leaderboard[existingUserIndex].data_partecipazione = now;
    } else {
      // Add new user
      leaderboard.push({
        id: Date.now(), // Simple ID generation
        username: username,
        punteggio: punteggio,
        data_partecipazione: now,
      });
    }

    // Sort before writing
    leaderboard.sort((a, b) => {
      if (b.punteggio === a.punteggio) {
        return new Date(a.data_partecipazione).getTime() - new Date(b.data_partecipazione).getTime();
      }
      return b.punteggio - a.punteggio;
    });
    
    // Keep only top N if needed, e.g. top 200 entries in the file to prevent it from growing indefinitely
    // For now, we'll let it grow, or the GET can slice. If storage is a concern, slice here.
    // leaderboard = leaderboard.slice(0, 200); 


    await writeLeaderboardFile(leaderboard);

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
