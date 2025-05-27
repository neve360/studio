
// IMPORTANT: You must configure these environment variables in your hosting environment.
// For local development, you can create a .env.local file in the root of your project:
// DB_HOST=your_db_host
// DB_USER=your_db_user
// DB_PASSWORD=your_db_password
// DB_NAME=your_db_name

import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import type { LeaderboardEntry } from '@/types/leaderboard';

// Database connection configuration
// Ensure these environment variables are set
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Consider adding connection pooling for production
};

async function getDbConnection() {
  if (!dbConfig.host || !dbConfig.user || !dbConfig.database) {
    console.error('Database configuration is missing. Please set DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME environment variables.');
    throw new Error('Database configuration is incomplete.');
  }
  try {
    const connection = await mysql.createConnection(dbConfig);
    return connection;
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    throw new Error('Could not connect to the database.');
  }
}

export async function GET() {
  let connection;
  try {
    connection = await getDbConnection();
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      'SELECT id, username, punteggio, data_partecipazione FROM ClassificaQuiz3D ORDER BY punteggio DESC, data_partecipazione ASC LIMIT 100' // Limit to top 100 for example
    );
    
    // Convert dates to ISO strings or a consistent format if necessary
    const leaderboardData = rows.map(row => ({
      ...row,
      data_partecipazione: row.data_partecipazione instanceof Date ? row.data_partecipazione.toISOString() : String(row.data_partecipazione)
    })) as LeaderboardEntry[];

    return NextResponse.json(leaderboardData);
  } catch (error) {
    console.error('API GET /api/leaderboard Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Errore nel recupero della classifica.';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export async function POST(request: Request) {
  let connection;
  try {
    const body = await request.json();
    const { username, punteggio } = body;

    if (!username || typeof username !== 'string' || username.length > 50) {
      return NextResponse.json({ message: 'Username non valido.' }, { status: 400 });
    }
    if (punteggio === undefined || typeof punteggio !== 'number' || punteggio < 0 || punteggio > 10) { // Assuming max score is 10 based on quizData
      return NextResponse.json({ message: 'Punteggio non valido.' }, { status: 400 });
    }

    connection = await getDbConnection();
    
    // Insert or update score. If username exists, update score and timestamp.
    const query = `
      INSERT INTO ClassificaQuiz3D (username, punteggio) 
      VALUES (?, ?) 
      ON DUPLICATE KEY UPDATE 
        punteggio = VALUES(punteggio), 
        data_partecipazione = CURRENT_TIMESTAMP
    `;
    
    await connection.execute(query, [username, punteggio]);

    return NextResponse.json({ message: 'Punteggio salvato con successo!' }, { status: 201 });
  } catch (error) {
    console.error('API POST /api/leaderboard Error:', error);
    let errorMessage = 'Errore nel salvataggio del punteggio.';
    if (error instanceof Error) {
        // Check for specific MySQL errors, e.g., unique constraint, connection error
        // For now, a generic message or the original error message
        errorMessage = error.message;
    }
    // Avoid exposing too many details of SQL errors to the client
    if (errorMessage.includes('ER_DBACCESS_DENIED_ERROR') || errorMessage.includes('ECONNREFUSED')) {
        errorMessage = 'Errore di connessione al database. Controlla la configurazione.';
    }

    return NextResponse.json({ message: errorMessage }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
