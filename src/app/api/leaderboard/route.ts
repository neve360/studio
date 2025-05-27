
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import type { LeaderboardEntry } from '@/types/leaderboard';

// Determina la directory dei dati in modo che funzioni sia in sviluppo che in produzione (Vercel)
// Su Vercel, le uniche directory scrivibili sono /tmp. Tuttavia, vogliamo leggere/scrivere dal bundle di deploy se possibile.
// Per la persistenza reale su Vercel, è necessario uno storage esterno (es. Vercel KV, un DB, ecc.)
// Questa implementazione con file JSON avrà scritture non persistenti su Vercel.
const dataDir = path.join(process.cwd(), 'data');
const leaderboardFilePath = path.join(dataDir, 'leaderboard.json');

async function ensureDataDirAndFileExists() {
  try {
    await fs.access(dataDir);
  } catch (error) {
    // Directory does not exist, create it
    try {
      await fs.mkdir(dataDir, { recursive: true });
    } catch (mkdirError) {
      console.error('Failed to create data directory:', mkdirError);
      // Non bloccare se la directory non può essere creata, il file potrebbe comunque esistere nel bundle
    }
  }
  try {
    await fs.access(leaderboardFilePath);
  } catch (error) {
    // File does not exist, create it with an empty array
    try {
      await fs.writeFile(leaderboardFilePath, '[]', 'utf-8');
    } catch (writeFileError) {
      console.error('Failed to create leaderboard.json:', writeFileError);
      // Potrebbe non essere possibile scrivere su Vercel, ma tentiamo
    }
  }
}

async function readLeaderboardFile(): Promise<LeaderboardEntry[]> {
  await ensureDataDirAndFileExists(); // Assicura che il percorso esista, specialmente per lo sviluppo locale
  try {
    const fileContent = await fs.readFile(leaderboardFilePath, 'utf-8');
    if (fileContent.trim() === '') {
      return [];
    }
    return JSON.parse(fileContent) as LeaderboardEntry[];
  } catch (error) {
    // Se il file non può essere letto (es. non esiste ancora nel bundle o errore di permessi), restituisce un array vuoto.
    console.warn('Could not read leaderboard.json, returning empty array. Error:', error);
    return [];
  }
}

async function writeLeaderboardFile(data: LeaderboardEntry[]): Promise<void> {
  // Su Vercel, questa scrittura potrebbe essere effimera.
  try {
    await ensureDataDirAndFileExists(); // Assicura che la directory esista prima di scrivere
    await fs.writeFile(leaderboardFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write to leaderboard.json. Data might not be persisted on this environment (e.g. Vercel). Error:', error);
    // Non lanciare un errore bloccante, l'app può continuare a funzionare con dati non persistiti
  }
}

export async function GET() {
  try {
    let leaderboardData = await readLeaderboardFile();
    
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

    let leaderboard = await readLeaderboardFile();
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
    
    // Opzionale: limita la dimensione del file leaderboard
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
