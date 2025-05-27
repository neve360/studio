
export interface LeaderboardEntry {
  id: number; // Can be a timestamp or a simple unique number for file-based storage
  username: string;
  punteggio: number;
  data_partecipazione: string; // ISO Date string
  rank?: number; // Added client-side or by GET API
}
