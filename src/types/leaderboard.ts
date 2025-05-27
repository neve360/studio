
export interface LeaderboardEntry {
  id: number;
  username: string;
  punteggio: number;
  data_partecipazione: string; // Datetime string from SQL
  rank?: number; // Added client-side
}
