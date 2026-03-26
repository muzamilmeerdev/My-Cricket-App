import { useState } from 'react';
import { X, TrendingUp } from 'lucide-react';
import { Player, PlayerRole } from '../types/cricket';
import { calculateStrikeRate, calculateEconomy } from '../utils/cricket-stats';

interface EditPlayerModalProps {
  player: Player;
  onSave: (updatedPlayer: Player) => void;
  onClose: () => void;
}

export function EditPlayerModal({ player, onSave, onClose }: EditPlayerModalProps) {
  const [name, setName] = useState(player.name);
  const [role, setRole] = useState<PlayerRole>(player.role);
  const [runs, setRuns] = useState(player.runs.toString());
  const [ballsFaced, setBallsFaced] = useState(player.ballsFaced.toString());
  const [wickets, setWickets] = useState(player.wickets.toString());

  const runsNum = parseInt(runs) || 0;
  const ballsNum = parseInt(ballsFaced) || 0;
  const wicketsNum = parseInt(wickets) || 0;

  const strikeRate = calculateStrikeRate(runsNum, ballsNum);

  const handleSave = () => {
    if (!name.trim()) {
      alert('Player name is required');
      return;
    }

    const updatedPlayer: Player = {
      ...player,
      name: name.trim(),
      role,
      runs: runsNum,
      ballsFaced: ballsNum,
      wickets: wicketsNum,
    };

    onSave(updatedPlayer);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 px-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Edit Player</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Basic Info */}
          <div className="mb-6">
            <h3 className="font-bold text-white mb-4">Basic Information</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Player Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                placeholder="Enter player name"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as PlayerRole)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
              >
                <option value="Batsman">Batsman</option>
                <option value="Bowler">Bowler</option>
                <option value="All-rounder">All-rounder</option>
              </select>
            </div>
          </div>

          {/* Batting Stats */}
          <div className="mb-6 bg-gray-900 rounded-lg p-5">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Batting Statistics
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Runs Scored
                </label>
                <input
                  type="number"
                  min="0"
                  value={runs}
                  onChange={(e) => setRuns(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Balls Faced
                </label>
                <input
                  type="number"
                  min="0"
                  value={ballsFaced}
                  onChange={(e) => setBallsFaced(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Auto-calculated Strike Rate */}
            <div className="bg-green-900 bg-opacity-30 border border-green-700 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Strike Rate (Auto-calculated)</div>
                  <div className="text-3xl font-bold text-green-400">
                    {strikeRate.toFixed(2)}
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  {runsNum} runs / {ballsNum} balls
                </div>
              </div>
            </div>
          </div>

          {/* Bowling Stats */}
          <div className="mb-6 bg-gray-900 rounded-lg p-5">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Bowling Statistics
            </h3>
            
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Wickets Taken
              </label>
              <input
                type="number"
                min="0"
                value={wickets}
                onChange={(e) => setWickets(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-blue-900 bg-opacity-20 border border-blue-700 rounded-lg p-4 mb-6">
            <h4 className="font-bold text-white mb-3">Player Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div>
                <div className="text-2xl font-bold text-white">{runsNum}</div>
                <div className="text-xs text-gray-400">Runs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{ballsNum}</div>
                <div className="text-xs text-gray-400">Balls</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">{strikeRate.toFixed(1)}</div>
                <div className="text-xs text-gray-400">SR</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{wicketsNum}</div>
                <div className="text-xs text-gray-400">Wickets</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
