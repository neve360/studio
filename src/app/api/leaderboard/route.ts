
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import type { LeaderboardEntry } from '@/types/leaderboard';

// Path to the JSON file
const DATA_DIR = path.join(process.cwd(), 'data');
const LEADERBOARD_FILE_PATH = path.join(DATA_DIR, 'leaderboard.json');

// Helper function to ensure directory and file exist
async function ensureLeaderboardFile() {
  try {
    await fs.access(DATA_DIR);
  } catch (error) {
    console.log('Data directory does not exist, attempting to create...');
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      console.log('Data directory created.');
    } catch (mkdirError) {
      console.error('Failed to create data directory:', mkdirError);
      // We might not be able to create dir on Vercel, but file might be there from repo
    }
  }

  try {
    await fs.access(LEADERBOARD_FILE_PATH);
  } catch (error) {
    console.log('Leaderboard file does not exist, attempting to create with empty array...');
    try {
      await fs.writeFile(LEADERBOARD_FILE_PATH, JSON.stringify([]), 'utf-8');
      console.log('Leaderboard file created.');
    } catch (writeFileError) {
      console.error('Failed to create leaderboard file:', writeFileError);
      // This might fail on Vercel if the directory isn't writable
      // The file should be present from the repository deployment anyway.
    }
  }
}

// Helper function to get leaderboard data
async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  // On Vercel, ensureLeaderboardFile might not be able to create,
  // but it will try. The file should be present from the git deployment.
  await ensureLeaderboardFile();
  try {
    const fileContents = await fs.readFile(LEADERBOARD_FILE_PATH, 'utf-8');
    if (!fileContents) { // Handle case where file is empty but exists
        return [];
    }
    return JSON.parse(fileContents) as LeaderboardEntry[];
  } catch (error) {
    console.error('Error reading leaderboard file or file is empty/corrupted:', error);
    // If there's an error reading (e.g., corrupted file, or it truly doesn't exist despite ensureLeaderboardFile)
    // return empty array. This is important for Vercel where file might be deployed but not accessible initially.
    return [];
  }
}

// Helper function to save leaderboard data
async function saveLeaderboard(data: LeaderboardEntry[]): Promise<void> {
  // ensureLeaderboardFile will attempt to create if not present, but on Vercel, writing might fail.
  await ensureLeaderboardFile();
  try {
    await fs.writeFile(LEADERBOARD_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    console.log('Leaderboard data saved to file successfully.');
  } catch (error) {
    console.error('Error writing to leaderboard file (this is expected on Vercel/serverless environments with read-only filesystems for deployed files):', error);
    // This error is critical as data saving failed.
    // On Vercel, this write will likely not persist.
    throw new Error('Failed to save leaderboard data to file. Writes may not be persistent on this hosting environment.');
  }
}

export async function GET() {
  try {
    let leaderboardData = await getLeaderboard();
    
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

    let leaderboard = await getLeaderboard();
    const now = new Date().toISOString();

    const existingUserIndex = leaderboard.findIndex(entry => entry.username.toLowerCase() === username.toLowerCase());

    if (existingUserIndex !== -1) {
      // Update existing user's score and participation date
      leaderboard[existingUserIndex].punteggio = punteggio;
      leaderboard[existingUserIndex].data_partecipazione = now;
    } else {
      // Add new user
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
    
    await saveLeaderboard(leaderboard);

    return NextResponse.json({ message: 'Punteggio salvato con successo (potrebbe non essere persistente su Vercel)!' }, { status: 201 });
  } catch (error) {
    console.error('API POST /api/leaderboard Error:', error);
    let errorMessage = 'Errore nel salvataggio del punteggio.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    // Provide a more specific message if the error is due to file saving issues
    if (errorMessage.includes('Failed to save leaderboard data to file')) {
        return NextResponse.json({ message: `Errore nel salvataggio del punteggio nel file. Le modifiche potrebbero non essere permanenti su questa piattaforma di hosting.` }, { status: 500 });
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
