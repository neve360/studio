
export interface QuizOption {
  text: string;
  id: string;
}

export interface QuizQuestion {
  id: number;
  text: string;
  options: QuizOption[];
  correctAnswerId: string;
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    text: "Che cos'è una stampante 3D?",
    options: [
      { id: 'A', text: 'Una macchina per la stampa di documenti' },
      { id: 'B', text: 'Una macchina che costruisce oggetti strato per strato' },
      { id: 'C', text: 'Un dispositivo per fare disegni' },
      { id: 'D', text: 'Una stampante per foto' },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 2,
    text: 'Quale materiale non viene usato nella stampa 3D?',
    options: [
      { id: 'A', text: 'PLA' },
      { id: 'B', text: 'ABS' },
      { id: 'C', text: 'Cartone' },
      { id: 'D', text: 'PETG' },
    ],
    correctAnswerId: 'C',
  },
  {
    id: 3,
    text: 'Che cosa è il FDM in stampa 3D?',
    options: [
      { id: 'A', text: 'Un tipo di resina' },
      { id: 'B', text: 'Una tecnologia di stampa' },
      { id: 'C', text: 'Una parte della stampante' },
      { id: 'D', text: 'Un tipo di filamento' },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 4,
    text: 'Qual è una delle principali applicazioni della stampa 3D?',
    options: [
      { id: 'A', text: 'Cucina' },
      { id: 'B', text: 'Medicina' },
      { id: 'C', text: 'Sport' },
      { id: 'D', text: 'Giardinaggio' },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 5,
    text: "Cos'è il filamento PLA?",
    options: [
      { id: 'A', text: 'Un tipo di plastica biodegradabile' },
      { id: 'B', text: 'Un tipo di resina' },
      { id: 'C', text: 'Un tipo di metallo' },
      { id: 'D', text: 'Un tipo di carta' },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 6,
    text: 'Quale delle seguenti opzioni è un vantaggio della stampa 3D?',
    options: [
      { id: 'A', text: 'Costo basso di produzione per tutti i volumi' },
      { id: 'B', text: 'Creazione di oggetti solo in plastica' },
      { id: 'C', text: 'Impossibilità di errori di stampa' },
      { id: 'D', text: 'Produzione rapida di prototipi e oggetti complessi' },
    ],
    correctAnswerId: 'D',
  },
  {
    id: 7,
    text: 'Chi ha inventato la tecnologia di stampa 3D (Stereolitografia)?',
    options: [
      { id: 'A', text: 'Charles Hull' },
      { id: 'B', text: 'Steve Jobs' },
      { id: 'C', text: 'Elon Musk' },
      { id: 'D', text: 'Bill Gates' },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 8,
    text: 'Quale è la funzione principale della testina di stampa in una stampante FDM?',
    options: [
      { id: 'A', text: 'Creare la base piana della stampa' },
      { id: 'B', text: 'Riscaldare ed estrudere il filamento' },
      { id: 'C', text: 'Muovere il piatto di stampa verticalmente' },
      { id: 'D', text: 'Solidificare la resina con luce UV' },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 9,
    text: 'In quale settore la stampa 3D sta avendo un grande impatto?',
    options: [
      { id: 'A', text: 'Automotive' },
      { id: 'B', text: 'Moda' },
      { id: 'C', text: 'Alimentare' },
      { id: 'D', text: 'Tutti i precedenti' },
    ],
    correctAnswerId: 'D',
  },
  {
    id: 10,
    text: "Cosa significa la sigla 'SLA' nelle stampanti 3D?",
    options: [
      { id: 'A', text: 'Stampante Luminosa Assoluta' },
      { id: 'B', text: 'Stereo Light Absorption' },
      { id: 'C', text: 'Stereolithography Apparatus' },
      { id: 'D', text: 'Stampa Laser Avanzata' },
    ],
    correctAnswerId: 'C',
  },
];
