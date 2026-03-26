import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Trophy, TrendingUp, Award } from 'lucide-react';
import { storage } from '../utils/storage';
import { Match, Team, PlayerStats } from '../types/cricket';
import { getPlayerBattingStats, getPlayerBowlingStats, getInningsStats } from '../utils/cricket-stats';

export function MatchSummary() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState<Match | null>(null);
  const [team1, setTeam1] = useState<Team | null>(null);
  const [team2, setTeam2] = useState<Team | null>(null);

  useEffect(() => {
    if (!matchId) return;
    const loadedMatch = storage.getMatch(matchId);
    if (!loadedMatch) {
      navigate('/');
      return;
    }
    setMatch(loadedMatch);
    setTeam1(storage.getTeam(loadedMatch.team1Id) || null);
    setTeam2(storage.getTeam(loadedMatch.team2Id) || null);
  }, [matchId]);

  if (!match || !team1 || !team2) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
  }

  const innings1Stats = getInningsStats(match.innings1);
  const innings2Stats = getInningsStats(match.innings2);

  const innings1Team = match.innings1?.teamId === team1.id ? team1 : team2;
  const innings2Team = match.innings2?.teamId === team1.id ? team1 : team2;

  // Get batting stats
  const innings1Batting: PlayerStats[] = match.innings1
    ? innings1Team.players
        .map(p => getPlayerBattingStats(p.id, match.innings1!.balls, p.name))
        .filter(s => s.ballsFaced > 0)
        .sort((a, b) => b.runs - a.runs)
    : [];

  const innings2Batting: PlayerStats[] = match.innings2
    ? innings2Team.players
        .map(p => getPlayerBattingStats(p.id, match.innings2!.balls, p.name))
        .filter(s => s.ballsFaced > 0)
        .sort((a, b) => b.runs - a.runs)
    : [];

  // Get bowling stats
  const innings1Bowling: PlayerStats[] = match.innings1
    ? (match.innings1.teamId === team1.id ? team2 : team1).players
        .map(p => getPlayerBowlingStats(p.id, match.innings1!.balls, p.name))
        .filter(s => s.ballsBowled > 0)
        .sort((a, b) => b.wickets - a.wickets)
    : [];

  const innings2Bowling: PlayerStats[] = match.innings2
    ? (match.innings2.teamId === team1.id ? team2 : team1).players
        .map(p => getPlayerBowlingStats(p.id, match.innings2!.balls, p.name))
        .filter(s => s.ballsBowled > 0)
        .sort((a, b) => b.wickets - a.wickets)
    : [];

  // Top performers
  const allBatting = [...innings1Batting, ...innings2Batting];
  const topBatsman = allBatting.reduce((max, player) => player.runs > max.runs ? player : max, allBatting[0] || null);

  const allBowling = [...innings1Bowling, ...innings2Bowling];
  const topBowler = allBowling.reduce((max, player) => 
    player.wickets > max.wickets || (player.wickets === max.wickets && player.economy < max.economy) 
      ? player 
      : max, 
    allBowling[0] || null
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 via-green-800 to-gray-900">
      {/* Header */}
      <div className="bg-green-950 border-b border-green-700 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-green-200 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-10 h-10 text-yellow-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">Match Summary</h1>
              <p className="text-green-200 text-sm">
                {new Date(match.createdAt).toLocaleDateString()} • {match.totalOvers} overs
              </p>
            </div>
          </div>

          {/* Match Result */}
          {match.winner && (
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Trophy className="w-8 h-8 text-white" />
                <h2 className="text-2xl font-bold text-white">
                  {match.winner === 'Draw' ? "Match Drawn" : `${match.winner} Won!`}
                </h2>
                <Trophy className="w-8 h-8 text-white" />
              </div>
              {match.winner !== 'Draw' && match.innings1 && match.innings2 && (
                <p className="text-yellow-100">
                  {match.innings2.totalRuns > match.innings1.totalRuns
                    ? `by ${10 - match.innings2.wickets} wickets`
                    : `by ${match.innings1.totalRuns - match.innings2.totalRuns} runs`}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Score Summary */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Innings 1 */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">{innings1Team.name}</h3>
            <div className="text-4xl font-bold text-white mb-2">
              {innings1Stats.runs}/{innings1Stats.wickets}
            </div>
            <div className="text-gray-400 mb-4">
              {innings1Stats.overs} overs • RR: {innings1Stats.runRate.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">
              Extras: {innings1Stats.extras}
            </div>
          </div>

          {/* Innings 2 */}
          {match.innings2 && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">{innings2Team.name}</h3>
              <div className="text-4xl font-bold text-white mb-2">
                {innings2Stats.runs}/{innings2Stats.wickets}
              </div>
              <div className="text-gray-400 mb-4">
                {innings2Stats.overs} overs • RR: {innings2Stats.runRate.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">
                Extras: {innings2Stats.extras}
              </div>
            </div>
          )}
        </div>

        {/* Top Performers */}
        {(topBatsman || topBowler) && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-400" />
              Top Performers
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {topBatsman && topBatsman.runs > 0 && (
                <div className="bg-gray-900 rounded-lg p-5">
                  <div className="text-sm text-gray-400 mb-2">Top Batsman</div>
                  <div className="text-xl font-bold text-white mb-2">{topBatsman.playerName}</div>
                  <div className="text-3xl font-bold text-green-400 mb-2">{topBatsman.runs}</div>
                  <div className="text-sm text-gray-400">
                    {topBatsman.ballsFaced} balls • SR: {topBatsman.strikeRate.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {topBatsman.fours > 0 && `${topBatsman.fours}×4 `}
                    {topBatsman.sixes > 0 && `${topBatsman.sixes}×6`}
                  </div>
                </div>
              )}
              {topBowler && topBowler.wickets > 0 && (
                <div className="bg-gray-900 rounded-lg p-5">
                  <div className="text-sm text-gray-400 mb-2">Top Bowler</div>
                  <div className="text-xl font-bold text-white mb-2">{topBowler.playerName}</div>
                  <div className="text-3xl font-bold text-blue-400 mb-2">{topBowler.wickets} wickets</div>
                  <div className="text-sm text-gray-400">
                    {topBowler.runsConceded} runs • Econ: {topBowler.economy.toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Detailed Scorecards */}
        <div className="space-y-8">
          {/* Innings 1 Scorecard */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">
              {innings1Team.name} - 1st Innings
            </h2>
            
            {/* Batting */}
            <div className="mb-6">
              <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Batting
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
                      <th className="pb-2">Batsman</th>
                      <th className="pb-2 text-right">R</th>
                      <th className="pb-2 text-right">B</th>
                      <th className="pb-2 text-right">4s</th>
                      <th className="pb-2 text-right">6s</th>
                      <th className="pb-2 text-right">SR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {innings1Batting.map((player) => (
                      <tr key={player.playerId} className="text-white border-b border-gray-700">
                        <td className="py-2">
                          {player.playerName}
                          {player.isOut && <span className="text-red-400 ml-2 text-xs">OUT</span>}
                        </td>
                        <td className="text-right">{player.runs}</td>
                        <td className="text-right">{player.ballsFaced}</td>
                        <td className="text-right">{player.fours}</td>
                        <td className="text-right">{player.sixes}</td>
                        <td className="text-right">{player.strikeRate.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bowling */}
            {innings1Bowling.length > 0 && (
              <div>
                <h3 className="font-bold text-white mb-3">Bowling</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
                        <th className="pb-2">Bowler</th>
                        <th className="pb-2 text-right">O</th>
                        <th className="pb-2 text-right">R</th>
                        <th className="pb-2 text-right">W</th>
                        <th className="pb-2 text-right">Econ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {innings1Bowling.map((player) => (
                        <tr key={player.playerId} className="text-white border-b border-gray-700">
                          <td className="py-2">{player.playerName}</td>
                          <td className="text-right">{(player.ballsBowled / 6).toFixed(1)}</td>
                          <td className="text-right">{player.runsConceded}</td>
                          <td className="text-right">{player.wickets}</td>
                          <td className="text-right">{player.economy.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Innings 2 Scorecard */}
          {match.innings2 && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">
                {innings2Team.name} - 2nd Innings
              </h2>
              
              {/* Batting */}
              <div className="mb-6">
                <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Batting
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
                        <th className="pb-2">Batsman</th>
                        <th className="pb-2 text-right">R</th>
                        <th className="pb-2 text-right">B</th>
                        <th className="pb-2 text-right">4s</th>
                        <th className="pb-2 text-right">6s</th>
                        <th className="pb-2 text-right">SR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {innings2Batting.map((player) => (
                        <tr key={player.playerId} className="text-white border-b border-gray-700">
                          <td className="py-2">
                            {player.playerName}
                            {player.isOut && <span className="text-red-400 ml-2 text-xs">OUT</span>}
                          </td>
                          <td className="text-right">{player.runs}</td>
                          <td className="text-right">{player.ballsFaced}</td>
                          <td className="text-right">{player.fours}</td>
                          <td className="text-right">{player.sixes}</td>
                          <td className="text-right">{player.strikeRate.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bowling */}
              {innings2Bowling.length > 0 && (
                <div>
                  <h3 className="font-bold text-white mb-3">Bowling</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
                          <th className="pb-2">Bowler</th>
                          <th className="pb-2 text-right">O</th>
                          <th className="pb-2 text-right">R</th>
                          <th className="pb-2 text-right">W</th>
                          <th className="pb-2 text-right">Econ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {innings2Bowling.map((player) => (
                          <tr key={player.playerId} className="text-white border-b border-gray-700">
                            <td className="py-2">{player.playerName}</td>
                            <td className="text-right">{(player.ballsBowled / 6).toFixed(1)}</td>
                            <td className="text-right">{player.runsConceded}</td>
                            <td className="text-right">{player.wickets}</td>
                            <td className="text-right">{player.economy.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
