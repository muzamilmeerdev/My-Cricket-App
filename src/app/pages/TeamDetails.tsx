import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Users, Edit2 } from 'lucide-react';
import { storage } from '../utils/storage';
import { Team, Player } from '../types/cricket';
import { EditPlayerModal } from '../components/EditPlayerModal';
import { calculateStrikeRate } from '../utils/cricket-stats';

export function TeamDetails() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  useEffect(() => {
    if (!teamId) return;
    loadTeam();
  }, [teamId]);

  const loadTeam = () => {
    if (!teamId) return;
    const loadedTeam = storage.getTeam(teamId);
    if (!loadedTeam) {
      navigate('/');
      return;
    }
    setTeam(loadedTeam);
  };

  const handleSavePlayer = (updatedPlayer: Player) => {
    if (!team) return;

    const updatedTeam: Team = {
      ...team,
      players: team.players.map(p => 
        p.id === updatedPlayer.id ? updatedPlayer : p
      ),
    };

    storage.saveTeam(updatedTeam);
    setTeam(updatedTeam);
    setEditingPlayer(null);
  };

  if (!team) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
  }

  const captain = team.players.find(p => p.isCaptain);
  const viceCaptain = team.players.find(p => p.isViceCaptain);

  const batsmen = team.players.filter(p => p.role === 'Batsman');
  const bowlers = team.players.filter(p => p.role === 'Bowler');
  const allRounders = team.players.filter(p => p.role === 'All-rounder');

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 via-green-800 to-gray-900">
      {/* Header */}
      <div className="bg-green-950 border-b border-green-700 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-green-200 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-10 h-10 text-green-400" />
              <div>
                <h1 className="text-3xl font-bold text-white">{team.name}</h1>
                <p className="text-green-200 text-sm">
                  {team.players.length} players • Created {new Date(team.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Team Leadership */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Leadership</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Captain</div>
              <div className="text-xl font-bold text-yellow-400">
                {captain?.name || 'Not assigned'}
              </div>
              {captain && (
                <div className="text-sm text-gray-400 mt-1">{captain.role}</div>
              )}
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Vice-Captain</div>
              <div className="text-xl font-bold text-blue-400">
                {viceCaptain?.name || 'Not assigned'}
              </div>
              {viceCaptain && (
                <div className="text-sm text-gray-400 mt-1">{viceCaptain.role}</div>
              )}
            </div>
          </div>
        </div>

        {/* Squad Composition */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Squad Composition</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-3xl font-bold text-green-400">{batsmen.length}</div>
              <div className="text-sm text-gray-400 mt-1">Batsmen</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-400">{bowlers.length}</div>
              <div className="text-sm text-gray-400 mt-1">Bowlers</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-3xl font-bold text-purple-400">{allRounders.length}</div>
              <div className="text-sm text-gray-400 mt-1">All-rounders</div>
            </div>
          </div>
        </div>

        {/* Full Squad List */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Full Squad</h2>
          <div className="space-y-2">
            {team.players.map((player, index) => {
              const strikeRate = calculateStrikeRate(player.runs, player.ballsFaced);
              return (
                <div
                  key={player.id}
                  className="bg-gray-900 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-gray-500 font-mono text-sm w-8">#{index + 1}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{player.name}</span>
                          {player.isCaptain && (
                            <span className="bg-yellow-900 text-yellow-200 px-2 py-0.5 rounded text-xs font-semibold">
                              C
                            </span>
                          )}
                          {player.isViceCaptain && (
                            <span className="bg-blue-900 text-blue-200 px-2 py-0.5 rounded text-xs font-semibold">
                              VC
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">{player.role}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingPlayer(player)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                  </div>

                  {/* Player Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-gray-800">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Runs</div>
                      <div className="text-lg font-bold text-green-400">{player.runs}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Balls</div>
                      <div className="text-lg font-bold text-white">{player.ballsFaced}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Strike Rate</div>
                      <div className="text-lg font-bold text-yellow-400">
                        {strikeRate > 0 ? strikeRate.toFixed(2) : '0.00'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Wickets</div>
                      <div className="text-lg font-bold text-blue-400">{player.wickets}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Edit Player Modal */}
      {editingPlayer && (
        <EditPlayerModal
          player={editingPlayer}
          onSave={handleSavePlayer}
          onClose={() => setEditingPlayer(null)}
        />
      )}
    </div>
  );
}