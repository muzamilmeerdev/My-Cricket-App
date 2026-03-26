import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, RotateCcw, CheckCircle } from 'lucide-react';
import { storage } from '../utils/storage';
import { Match, Team, BallEvent, Innings } from '../types/cricket';
import { getOversDisplay, calculateRunRate, getTotalOvers } from '../utils/cricket-stats';

export function LiveScoring() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState<Match | null>(null);
  const [team1, setTeam1] = useState<Team | null>(null);
  const [team2, setTeam2] = useState<Team | null>(null);

  useEffect(() => {
    if (!matchId) return;
    loadMatch();
  }, [matchId]);

  const loadMatch = () => {
    if (!matchId) return;
    const loadedMatch = storage.getMatch(matchId);
    if (!loadedMatch) {
      navigate('/');
      return;
    }
    setMatch(loadedMatch);
    setTeam1(storage.getTeam(loadedMatch.team1Id) || null);
    setTeam2(storage.getTeam(loadedMatch.team2Id) || null);
  };

  const getCurrentInnings = (): Innings | undefined => {
    if (!match) return undefined;
    return match.currentInnings === 1 ? match.innings1 : match.innings2;
  };

  const getBattingTeam = (): Team | null => {
    const innings = getCurrentInnings();
    if (!innings || !team1 || !team2) return null;
    return innings.teamId === team1.id ? team1 : team2;
  };

  const getBowlingTeam = (): Team | null => {
    const innings = getCurrentInnings();
    if (!innings || !team1 || !team2) return null;
    return innings.teamId === team1.id ? team2 : team1;
  };

  const addBall = (runs: number, isWicket: boolean, isExtra: boolean, extraType?: 'wide' | 'noBall' | 'bye' | 'legBye') => {
    if (!match) return;
    
    const innings = getCurrentInnings();
    if (!innings) return;

    const battingTeam = getBattingTeam();
    if (!battingTeam) return;

    const ball: BallEvent = {
      id: Date.now().toString(),
      runs,
      isWicket,
      isExtra,
      extraType,
      batsmanId: innings.currentBatsmanIds[0], // Striker
      bowlerId: innings.currentBowlerId,
      overNumber: innings.currentOver,
      ballNumber: innings.currentBall,
    };

    const updatedBalls = [...innings.balls, ball];
    let updatedRuns = innings.totalRuns + runs;
    let updatedExtras = innings.extras;
    let updatedWickets = innings.wickets;
    let updatedOver = innings.currentOver;
    let updatedBall = innings.currentBall;
    let updatedBatsmanIds = innings.currentBatsmanIds;
    let updatedBowlerId = innings.currentBowlerId;

    // Handle extras
    if (isExtra) {
      updatedExtras += runs;
    }

    // Handle wicket
    if (isWicket) {
      updatedWickets += 1;
      
      // Get next batsman
      const playedBatsmen = new Set(updatedBalls.map(b => b.batsmanId));
      const nextBatsman = battingTeam.players.find(p => !playedBatsmen.has(p.id));
      
      if (nextBatsman) {
        // Replace striker with next batsman
        updatedBatsmanIds = [nextBatsman.id, updatedBatsmanIds[1]];
      }
    }

    // Handle ball count (wide and no-ball don't count as legal deliveries)
    if (!isExtra || (extraType !== 'wide' && extraType !== 'noBall')) {
      updatedBall += 1;
      
      // Rotate strike on odd runs
      if (runs % 2 === 1) {
        updatedBatsmanIds = [updatedBatsmanIds[1], updatedBatsmanIds[0]];
      }
    }

    // Check for over completion
    if (updatedBall === 6) {
      updatedOver += 1;
      updatedBall = 0;
      
      // Rotate strike at end of over
      updatedBatsmanIds = [updatedBatsmanIds[1], updatedBatsmanIds[0]];
      
      // Change bowler (simple rotation - next bowler)
      const bowlingTeam = getBowlingTeam();
      if (bowlingTeam) {
        const currentBowlerIndex = bowlingTeam.players.findIndex(p => p.id === updatedBowlerId);
        const nextBowlerIndex = (currentBowlerIndex + 1) % bowlingTeam.players.length;
        updatedBowlerId = bowlingTeam.players[nextBowlerIndex].id;
      }
    }

    const updatedInnings: Innings = {
      ...innings,
      balls: updatedBalls,
      totalRuns: updatedRuns,
      extras: updatedExtras,
      wickets: updatedWickets,
      currentOver: updatedOver,
      currentBall: updatedBall,
      currentBatsmanIds: updatedBatsmanIds,
      currentBowlerId: updatedBowlerId,
    };

    // Check if innings is complete
    const isInningsComplete = updatedWickets >= 10 || updatedOver >= match.totalOvers;

    if (isInningsComplete && match.currentInnings === 1) {
      // Start second innings
      const bowlingTeam = getBowlingTeam();
      if (!bowlingTeam) return;

      const openers = bowlingTeam.players.slice(0, 2);
      const firstBowler = battingTeam!.players[0];

      const innings2: Innings = {
        teamId: bowlingTeam.id,
        battingOrder: bowlingTeam.players.map(p => p.id),
        currentBatsmanIds: [openers[0].id, openers[1].id],
        currentBowlerId: firstBowler.id,
        balls: [],
        wickets: 0,
        extras: 0,
        totalRuns: 0,
        currentOver: 0,
        currentBall: 0,
      };

      const updatedMatch: Match = {
        ...match,
        innings1: updatedInnings,
        innings2,
        currentInnings: 2,
      };

      storage.saveMatch(updatedMatch);
      setMatch(updatedMatch);
    } else if (isInningsComplete && match.currentInnings === 2) {
      // Match complete
      let winner = '';
      if (match.innings1 && updatedInnings.totalRuns > match.innings1.totalRuns) {
        winner = innings.teamId === team1?.id ? team1.name : team2?.name || '';
      } else if (match.innings1 && updatedInnings.totalRuns < match.innings1.totalRuns) {
        winner = match.innings1.teamId === team1?.id ? team1.name : team2?.name || '';
      } else {
        winner = 'Draw';
      }

      const updatedMatch: Match = {
        ...match,
        innings2: updatedInnings,
        status: 'completed',
        winner,
        completedAt: new Date().toISOString(),
      };

      storage.saveMatch(updatedMatch);
      navigate(`/match/${match.id}`);
    } else {
      // Continue current innings
      const updatedMatch: Match = {
        ...match,
        [match.currentInnings === 1 ? 'innings1' : 'innings2']: updatedInnings,
      };

      storage.saveMatch(updatedMatch);
      setMatch(updatedMatch);
    }
  };

  const undoLastBall = () => {
    if (!match) return;
    
    const innings = getCurrentInnings();
    if (!innings || innings.balls.length === 0) return;

    const lastBall = innings.balls[innings.balls.length - 1];
    const updatedBalls = innings.balls.slice(0, -1);

    // Recalculate from scratch
    let totalRuns = 0;
    let extras = 0;
    let wickets = 0;
    let currentOver = 0;
    let currentBall = 0;

    updatedBalls.forEach(ball => {
      totalRuns += ball.runs;
      if (ball.isExtra) extras += ball.runs;
      if (ball.isWicket) wickets += 1;
      
      if (!ball.isExtra || (ball.extraType !== 'wide' && ball.extraType !== 'noBall')) {
        currentBall += 1;
        if (currentBall === 6) {
          currentOver += 1;
          currentBall = 0;
        }
      }
    });

    const updatedInnings: Innings = {
      ...innings,
      balls: updatedBalls,
      totalRuns,
      extras,
      wickets,
      currentOver,
      currentBall,
    };

    const updatedMatch: Match = {
      ...match,
      [match.currentInnings === 1 ? 'innings1' : 'innings2']: updatedInnings,
    };

    storage.saveMatch(updatedMatch);
    setMatch(updatedMatch);
  };

  if (!match || !team1 || !team2) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
  }

  const innings = getCurrentInnings();
  if (!innings) return null;

  const battingTeam = getBattingTeam();
  const bowlingTeam = getBowlingTeam();
  
  if (!battingTeam || !bowlingTeam) return null;

  const striker = battingTeam.players.find(p => p.id === innings.currentBatsmanIds[0]);
  const nonStriker = battingTeam.players.find(p => p.id === innings.currentBatsmanIds[1]);
  const bowler = bowlingTeam.players.find(p => p.id === innings.currentBowlerId);

  const totalOversCompleted = getTotalOvers(innings.currentOver, innings.currentBall);
  const runRate = calculateRunRate(innings.totalRuns, totalOversCompleted);

  // Calculate required run rate for second innings
  let requiredRunRate = 0;
  let target = 0;
  if (match.currentInnings === 2 && match.innings1) {
    target = match.innings1.totalRuns + 1;
    const runsNeeded = target - innings.totalRuns;
    const oversRemaining = match.totalOvers - totalOversCompleted;
    requiredRunRate = oversRemaining > 0 ? calculateRunRate(runsNeeded, oversRemaining) : 0;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 via-green-800 to-gray-900">
      {/* Header */}
      <div className="bg-green-950 border-b border-green-700 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-green-200 hover:text-white mb-3"
          >
            <ArrowLeft className="w-5 h-5" />
            Exit Match
          </button>
          
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-green-300 mb-1">
                {match.currentInnings === 1 ? '1st Innings' : '2nd Innings'}
              </div>
              <div className="flex items-center gap-2 text-white">
                <span className="font-bold text-lg">{team1.name}</span>
                <span className="text-gray-400">vs</span>
                <span className="font-bold text-lg">{team2.name}</span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-4xl font-bold text-white">
                {innings.totalRuns}/{innings.wickets}
              </div>
              <div className="text-sm text-green-300">
                {getOversDisplay(innings.currentOver * 6 + innings.currentBall)} / {match.totalOvers} overs
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-gray-800 rounded p-3">
              <div className="text-xs text-gray-400">Run Rate</div>
              <div className="text-lg font-bold text-white">{runRate.toFixed(2)}</div>
            </div>
            {match.currentInnings === 2 && (
              <>
                <div className="bg-gray-800 rounded p-3">
                  <div className="text-xs text-gray-400">Target</div>
                  <div className="text-lg font-bold text-white">{target}</div>
                </div>
                <div className="bg-gray-800 rounded p-3">
                  <div className="text-xs text-gray-400">Needed</div>
                  <div className="text-lg font-bold text-white">{Math.max(0, target - innings.totalRuns)}</div>
                </div>
                <div className="bg-gray-800 rounded p-3">
                  <div className="text-xs text-gray-400">Req. RR</div>
                  <div className="text-lg font-bold text-white">{requiredRunRate.toFixed(2)}</div>
                </div>
              </>
            )}
            <div className="bg-gray-800 rounded p-3">
              <div className="text-xs text-gray-400">Extras</div>
              <div className="text-lg font-bold text-white">{innings.extras}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Current Players */}
        <div className="bg-gray-800 rounded-lg p-5 mb-6 border border-gray-700">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs text-gray-400 mb-1">ON STRIKE</div>
              <div className="font-bold text-white text-lg">{striker?.name || 'Unknown'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">NON-STRIKER</div>
              <div className="font-bold text-white text-lg">{nonStriker?.name || 'Unknown'}</div>
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">BOWLER</div>
            <div className="font-bold text-white text-lg">{bowler?.name || 'Unknown'}</div>
          </div>
        </div>

        {/* Scoring Buttons */}
        <div className="bg-gray-800 rounded-lg p-5 mb-4 border border-gray-700">
          <h3 className="font-bold text-white mb-4">Runs</h3>
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[0, 1, 2, 3, 4, 6].map(runs => (
              <button
                key={runs}
                onClick={() => addBall(runs, false, false)}
                className={`py-6 rounded-lg font-bold text-2xl transition-colors ${
                  runs === 0 ? 'bg-gray-700 hover:bg-gray-600 text-white' :
                  runs === 4 ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                  runs === 6 ? 'bg-purple-600 hover:bg-purple-700 text-white' :
                  'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {runs}
              </button>
            ))}
          </div>

          <h3 className="font-bold text-white mb-4">Extras</h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => addBall(1, false, true, 'wide')}
              className="py-4 rounded-lg font-semibold bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Wide
            </button>
            <button
              onClick={() => addBall(1, false, true, 'noBall')}
              className="py-4 rounded-lg font-semibold bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              No Ball
            </button>
            <button
              onClick={() => addBall(1, false, true, 'bye')}
              className="py-4 rounded-lg font-semibold bg-orange-600 hover:bg-orange-700 text-white"
            >
              Bye
            </button>
            <button
              onClick={() => addBall(1, false, true, 'legBye')}
              className="py-4 rounded-lg font-semibold bg-orange-600 hover:bg-orange-700 text-white"
            >
              Leg Bye
            </button>
          </div>

          <h3 className="font-bold text-white mb-4">Wicket</h3>
          <button
            onClick={() => addBall(0, true, false)}
            className="w-full py-4 rounded-lg font-semibold bg-red-600 hover:bg-red-700 text-white"
          >
            Wicket
          </button>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <button
            onClick={undoLastBall}
            disabled={innings.balls.length === 0}
            className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Undo Last Ball
          </button>
        </div>

        {/* Over History */}
        {innings.balls.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-5 mt-6 border border-gray-700">
            <h3 className="font-bold text-white mb-3">This Over</h3>
            <div className="flex flex-wrap gap-2">
              {innings.balls
                .filter(b => b.overNumber === innings.currentOver)
                .map((ball, idx) => (
                  <div
                    key={ball.id}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      ball.isWicket ? 'bg-red-600 text-white' :
                      ball.isExtra ? 'bg-yellow-600 text-white' :
                      ball.runs === 4 ? 'bg-blue-600 text-white' :
                      ball.runs === 6 ? 'bg-purple-600 text-white' :
                      ball.runs === 0 ? 'bg-gray-700 text-white' :
                      'bg-green-600 text-white'
                    }`}
                  >
                    {ball.isWicket ? 'W' : ball.runs}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
