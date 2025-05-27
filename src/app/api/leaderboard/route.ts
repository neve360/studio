
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
      console.error('Failed to create data directory (this might fail on read-only filesystems):', mkdirError);
      // Allow to proceed, as directory might exist or file might be deployed.
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
      console.error('Failed to create leaderboard file (this might fail on read-only filesystems):', writeFileError);
      // Allow to proceed, file might be deployed.
    }
  }
}

// Helper function to get leaderboard data
async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  await ensureLeaderboardFile();
  try {
    const fileContents = await fs.readFile(LEADERBOARD_FILE_PATH, 'utf-8');
    if (!fileContents) {
        console.log('Leaderboard file is empty, returning empty array.');
        return [];
    }
    return JSON.parse(fileContents) as LeaderboardEntry[];
  } catch (error) {
    console.error('Error reading leaderboard file, or file is corrupted/inaccessible. Returning empty array:', error);
    // If there's an error reading (e.g., corrupted file, or it truly doesn't exist despite ensureLeaderboardFile)
    // return empty array. This is important for environments where file might be deployed but not accessible initially
    // or if ensureLeaderboardFile failed to create it due to permissions.
    return [];
  }
}

// Helper function to save leaderboard data
async function saveLeaderboard(data: LeaderboardEntry[]): Promise<void> {
  await ensureLeaderboardFile(); // Ensure directory and file attempt to exist
  try {
    await fs.writeFile(LEADERBOARD_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    console.log('Leaderboard data saved to file successfully.');
  } catch (error) {
    console.error('Error writing to leaderboard file (this is expected on some serverless environments with read-only/ephemeral filesystems for deployed files):', error);
    // This error is critical as data saving failed.
    // On Vercel, this write will likely not persist reliably.
    throw new Error('Failed to save leaderboard data to file.');
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

    return NextResponse.json({ message: 'Punteggio salvato con successo!' }, { status: 201 });
  } catch (error) {
    console.error('API POST /api/leaderboard Error:', error); // Logga l'errore completo per il debug
    
    // Default a un messaggio di errore generico
    let userFacingErrorMessage = 'Errore nel salvataggio del punteggio.'; 

    // Se l'errore è quello specifico relativo al fallimento della scrittura del file,
    // il messaggio generico di default è quello che vogliamo mostrare all'utente,
    // per evitare il testo sulla non persistenza.
    // Se si tratta di un altro tipo di errore e ha un messaggio, usiamo quello.
    if (error instanceof Error && !error.message.includes('Failed to save leaderboard data to file')) {
      userFacingErrorMessage = error.message; // Usa il messaggio dell'errore se non è quello di scrittura file
    }
    // Se error non è una Error instance, o se è l'errore di scrittura file che lancia "Failed to save...",
    // userFacingErrorMessage rimane il generico "Errore nel salvataggio del punteggio."

    return NextResponse.json({ message: userFacingErrorMessage }, { status: 500 });
  }
}
