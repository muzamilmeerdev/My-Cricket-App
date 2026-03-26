import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, Trash2, Star, Users } from 'lucide-react';
import { storage } from '../utils/storage';
import { Team, Player, PlayerRole } from '../types/cricket';

export function CreateTeam() {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerRole, setNewPlayerRole] = useState<PlayerRole>('Batsman');

  const addPlayer = () => {
    if (!newPlayerName.trim()) return;

    const player: Player = {
      id: Date.now().toString(),
      name: newPlayerName.trim(),
      role: newPlayerRole,
      runs: 0,
      ballsFaced: 0,
      wickets: 0,
      isCaptain: players.length === 0, // First player is captain by default
      isViceCaptain: false,
    };

    setPlayers([...players, player]);
    setNewPlayerName('');
  };

  const removePlayer = (playerId: string) => {
    setPlayers(players.filter(p => p.id !== playerId));
  };

  const setCaptain = (playerId: string) => {
    setPlayers(players.map(p => ({
      ...p,
      isCaptain: p.id === playerId,
    })));
  };

  const setViceCaptain = (playerId: string) => {
    setPlayers(players.map(p => ({
      ...p,
      isViceCaptain: p.id === playerId,
    })));
  };

  const saveTeam = () => {
    if (!teamName.trim()) {
      alert('Please enter a team name');
      return;
    }

    if (players.length < 2) {
      alert('Please add at least 2 players');
      return;
    }

    const team: Team = {
      id: Date.now().toString(),
      name: teamName.trim(),
      players,
      createdAt: new Date().toISOString(),
    };

    storage.saveTeam(team);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 via-green-800 to-gray-900">
      {/* Header */}
      <div className="bg-green-950 border-b border-green-700 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-green-200 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="w-8 h-8" />
            Create New Team
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Team Name */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Team Name
          </label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Enter team name..."
            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
          />
        </div>

        {/* Add Player Form */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Add Players</h2>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
              placeholder="Player name..."
              className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
            />
            <select
              value={newPlayerRole}
              onChange={(e) => setNewPlayerRole(e.target.value as PlayerRole)}
              className="bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
            >
              <option value="Batsman">Batsman</option>
              <option value="Bowler">Bowler</option>
              <option value="All-rounder">All-rounder</option>
            </select>
            <button
              onClick={addPlayer}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 justify-center"
            >
              <Plus className="w-5 h-5" />
              Add
            </button>
          </div>

          {/* Players List */}
          {players.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm text-gray-400 mb-2">
                {players.length} player{players.length !== 1 ? 's' : ''} added
              </div>
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className="bg-gray-900 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-mono">#{index + 1}</span>
                      <span className="font-semibold text-white">{player.name}</span>
                      {player.isCaptain && (
                        <span className="bg-yellow-900 text-yellow-200 px-2 py-0.5 rounded text-xs font-semibold">
                          CAPTAIN
                        </span>
                      )}
                      {player.isViceCaptain && (
                        <span className="bg-blue-900 text-blue-200 px-2 py-0.5 rounded text-xs font-semibold">
                          VICE-CAPTAIN
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">{player.role}</div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCaptain(player.id)}
                      className={`p-2 rounded ${
                        player.isCaptain
                          ? 'bg-yellow-600 text-white'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}
                      title="Set as Captain"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViceCaptain(player.id)}
                      className={`p-2 rounded text-xs font-bold ${
                        player.isViceCaptain
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}
                      title="Set as Vice-Captain"
                    >
                      VC
                    </button>
                    <button
                      onClick={() => removePlayer(player.id)}
                      className="p-2 rounded bg-red-900 text-red-200 hover:bg-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-4 rounded-lg font-bold text-lg"
          >
            Cancel
          </button>
          <button
            onClick={saveTeam}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg font-bold text-lg"
          >
            Save Team
          </button>
        </div>
      </div>
    </div>
  );
}
