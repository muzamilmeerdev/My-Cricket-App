import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Trophy, Users } from 'lucide-react';
import { storage } from '../utils/storage';
import { Team, Match, Innings } from '../types/cricket';

export function CreateMatch() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [team1Id, setTeam1Id] = useState('');
  const [team2Id, setTeam2Id] = useState('');
  const [totalOvers, setTotalOvers] = useState(10);
  const [tossWonBy, setTossWonBy] = useState('');
  const [battingFirst, setBattingFirst] = useState('');

  useEffect(() => {
    const loadedTeams = storage.getTeams();
    setTeams(loadedTeams);
    
    if (loadedTeams.length >= 2) {
      setTeam1Id(loadedTeams[0].id);
      setTeam2Id(loadedTeams[1].id);
      setTossWonBy(loadedTeams[0].id);
      setBattingFirst(loadedTeams[0].id);
    }
  }, []);

  const createMatch = () => {
    if (!team1Id || !team2Id) {
      alert('Please select both teams');
      return;
    }

    if (team1Id === team2Id) {
      alert('Please select different teams');
      return;
    }

    const team1 = teams.find(t => t.id === team1Id);
    const team2 = teams.find(t => t.id === team2Id);

    if (!team1 || !team2) return;

    const battingTeamId = battingFirst;
    const battingTeam = battingTeamId === team1Id ? team1 : team2;

    // Select first two players as openers
    const openers = battingTeam.players.slice(0, 2);
    if (openers.length < 2) {
      alert('Batting team needs at least 2 players');
      return;
    }

    // Select first bowler from bowling team
    const bowlingTeam = battingTeamId === team1Id ? team2 : team1;
    const firstBowler = bowlingTeam.players[0];
    if (!firstBowler) {
      alert('Bowling team needs at least 1 player');
      return;
    }

    const innings1: Innings = {
      teamId: battingTeamId,
      battingOrder: battingTeam.players.map(p => p.id),
      currentBatsmanIds: [openers[0].id, openers[1].id],
      currentBowlerId: firstBowler.id,
      balls: [],
      wickets: 0,
      extras: 0,
      totalRuns: 0,
      currentOver: 0,
      currentBall: 0,
    };

    const match: Match = {
      id: Date.now().toString(),
      team1Id: team1.id,
      team2Id: team2.id,
      team1Name: team1.name,
      team2Name: team2.name,
      totalOvers,
      currentInnings: 1,
      innings1,
      tossWonBy,
      battingFirst,
      status: 'inProgress',
      createdAt: new Date().toISOString(),
    };

    storage.saveMatch(match);
    navigate(`/score/${match.id}`);
  };

  const selectedTeam1 = teams.find(t => t.id === team1Id);
  const selectedTeam2 = teams.find(t => t.id === team2Id);

  if (teams.length < 2) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 via-green-800 to-gray-900">
        <div className="bg-green-950 border-b border-green-700 shadow-lg">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-green-200 hover:text-white mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </button>
            <h1 className="text-3xl font-bold text-white">Create Match</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Not Enough Teams</h2>
            <p className="text-gray-400 mb-6">
              You need at least 2 teams to create a match
            </p>
            <button
              onClick={() => navigate('/create-team')}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Create Teams First
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            <Trophy className="w-8 h-8" />
            Create New Match
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Team Selection */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Select Teams</h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Team 1
              </label>
              <select
                value={team1Id}
                onChange={(e) => setTeam1Id(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
              >
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name} ({team.players.length} players)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Team 2
              </label>
              <select
                value={team2Id}
                onChange={(e) => setTeam2Id(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
              >
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name} ({team.players.length} players)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {team1Id === team2Id && (
            <div className="bg-red-900 text-red-200 p-3 rounded-lg text-sm">
              ⚠️ Please select different teams
            </div>
          )}
        </div>

        {/* Match Settings */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Match Settings</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Number of Overs per Innings
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={totalOvers}
              onChange={(e) => setTotalOvers(parseInt(e.target.value) || 1)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
            />
          </div>
        </div>

        {/* Toss */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Toss</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Toss Won By
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setTossWonBy(team1Id);
                  setBattingFirst(team1Id);
                }}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  tossWonBy === team1Id
                    ? 'bg-green-600 border-green-500 text-white'
                    : 'bg-gray-900 border-gray-600 text-gray-300 hover:border-gray-500'
                }`}
              >
                {selectedTeam1?.name}
              </button>
              <button
                onClick={() => {
                  setTossWonBy(team2Id);
                  setBattingFirst(team2Id);
                }}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  tossWonBy === team2Id
                    ? 'bg-green-600 border-green-500 text-white'
                    : 'bg-gray-900 border-gray-600 text-gray-300 hover:border-gray-500'
                }`}
              >
                {selectedTeam2?.name}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Chose to Bat First
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setBattingFirst(team1Id)}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  battingFirst === team1Id
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-900 border-gray-600 text-gray-300 hover:border-gray-500'
                }`}
              >
                {selectedTeam1?.name}
              </button>
              <button
                onClick={() => setBattingFirst(team2Id)}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  battingFirst === team2Id
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-900 border-gray-600 text-gray-300 hover:border-gray-500'
                }`}
              >
                {selectedTeam2?.name}
              </button>
            </div>
          </div>
        </div>

        {/* Create Button */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-4 rounded-lg font-bold text-lg"
          >
            Cancel
          </button>
          <button
            onClick={createMatch}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg font-bold text-lg"
          >
            Start Match
          </button>
        </div>
      </div>
    </div>
  );
}
