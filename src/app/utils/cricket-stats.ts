import { BallEvent, Innings, PlayerStats, Team } from '../types/cricket';

export const calculateStrikeRate = (runs: number, ballsFaced: number): number => {
  if (ballsFaced === 0) return 0;
  return parseFloat(((runs / ballsFaced) * 100).toFixed(2));
};

export const calculateRunRate = (runs: number, overs: number): number => {
  if (overs === 0) return 0;
  return parseFloat((runs / overs).toFixed(2));
};

export const calculateEconomy = (runsConceded: number, oversBowled: number): number => {
  if (oversBowled === 0) return 0;
  return parseFloat((runsConceded / oversBowled).toFixed(2));
};

export const getOversDisplay = (balls: number): string => {
  const overs = Math.floor(balls / 6);
  const remainingBalls = balls % 6;
  return `${overs}.${remainingBalls}`;
};

export const getTotalOvers = (currentOver: number, currentBall: number): number => {
  return currentOver + (currentBall / 6);
};

export const getPlayerBattingStats = (
  playerId: string,
  balls: BallEvent[],
  playerName: string
): PlayerStats => {
  const playerBalls = balls.filter(b => b.batsmanId === playerId);
  
  const runs = playerBalls.reduce((sum, b) => {
    if (!b.isExtra || b.extraType === 'noBall') {
      return sum + b.runs;
    }
    return sum;
  }, 0);
  
  const ballsFaced = playerBalls.filter(b => !b.isExtra || b.extraType === 'noBall').length;
  const isOut = playerBalls.some(b => b.isWicket);
  
  const fours = playerBalls.filter(b => b.runs === 4 && !b.isExtra).length;
  const sixes = playerBalls.filter(b => b.runs === 6 && !b.isExtra).length;
  
  return {
    playerId,
    playerName,
    runs,
    ballsFaced,
    strikeRate: calculateStrikeRate(runs, ballsFaced),
    fours,
    sixes,
    isOut,
    wickets: 0,
    ballsBowled: 0,
    runsConceded: 0,
    economy: 0,
  };
};

export const getPlayerBowlingStats = (
  playerId: string,
  balls: BallEvent[],
  playerName: string
): PlayerStats => {
  const playerBalls = balls.filter(b => b.bowlerId === playerId);
  
  const ballsBowled = playerBalls.filter(b => b.extraType !== 'wide' && b.extraType !== 'noBall').length;
  const runsConceded = playerBalls.reduce((sum, b) => sum + b.runs, 0);
  const wickets = playerBalls.filter(b => b.isWicket).length;
  
  const oversBowled = ballsBowled / 6;
  
  return {
    playerId,
    playerName,
    runs: 0,
    ballsFaced: 0,
    strikeRate: 0,
    fours: 0,
    sixes: 0,
    isOut: false,
    wickets,
    ballsBowled,
    runsConceded,
    economy: calculateEconomy(runsConceded, oversBowled),
  };
};

export const getInningsStats = (innings: Innings | undefined) => {
  if (!innings) {
    return {
      runs: 0,
      wickets: 0,
      overs: '0.0',
      runRate: 0,
      extras: 0,
    };
  }

  return {
    runs: innings.totalRuns,
    wickets: innings.wickets,
    overs: getOversDisplay(innings.currentOver * 6 + innings.currentBall),
    runRate: calculateRunRate(innings.totalRuns, getTotalOvers(innings.currentOver, innings.currentBall)),
    extras: innings.extras,
  };
};

export const getTopPerformer = (innings: Innings, team: Team): { type: 'batting' | 'bowling'; player: PlayerStats } | null => {
  if (!innings.balls.length) return null;

  const battingStats = team.players.map(p => 
    getPlayerBattingStats(p.id, innings.balls, p.name)
  );

  const bowlingStats = team.players.map(p => 
    getPlayerBowlingStats(p.id, innings.balls, p.name)
  );

  const topBatsman = battingStats.reduce((max, player) => 
    player.runs > max.runs ? player : max
  );

  const topBowler = bowlingStats.reduce((max, player) => 
    player.wickets > max.wickets || (player.wickets === max.wickets && player.economy < max.economy) 
      ? player 
      : max
  );

  if (topBatsman.runs > 0 && (topBowler.wickets === 0 || topBatsman.runs >= topBowler.wickets * 15)) {
    return { type: 'batting', player: topBatsman };
  } else if (topBowler.wickets > 0) {
    return { type: 'bowling', player: topBowler };
  }

  return null;
};
