export type PlayerRole = 'Batsman' | 'Bowler' | 'All-rounder';

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  runs: number;
  ballsFaced: number;
  wickets: number;
  isCaptain: boolean;
  isViceCaptain: boolean;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
  createdAt: string;
}

export interface BallEvent {
  id: string;
  runs: number;
  isWicket: boolean;
  isExtra: boolean;
  extraType?: 'wide' | 'noBall' | 'bye' | 'legBye';
  batsmanId: string;
  bowlerId: string;
  overNumber: number;
  ballNumber: number;
}

export interface Innings {
  teamId: string;
  battingOrder: string[];
  currentBatsmanIds: [string, string];
  currentBowlerId: string;
  balls: BallEvent[];
  wickets: number;
  extras: number;
  totalRuns: number;
  currentOver: number;
  currentBall: number;
}

export interface Match {
  id: string;
  team1Id: string;
  team2Id: string;
  team1Name: string;
  team2Name: string;
  totalOvers: number;
  currentInnings: 1 | 2;
  innings1?: Innings;
  innings2?: Innings;
  tossWonBy?: string;
  battingFirst?: string;
  status: 'upcoming' | 'inProgress' | 'completed';
  winner?: string;
  createdAt: string;
  completedAt?: string;
}

export interface PlayerStats {
  playerId: string;
  playerName: string;
  runs: number;
  ballsFaced: number;
  strikeRate: number;
  fours: number;
  sixes: number;
  isOut: boolean;
  wickets: number;
  ballsBowled: number;
  runsConceded: number;
  economy: number;
}
