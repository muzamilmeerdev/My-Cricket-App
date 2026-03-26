import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { Trophy, Users, Plus, Trash2, Calendar, UserCircle } from 'lucide-react';
import { storage } from '../utils/storage';
import { Team, Match } from '../types/cricket';
import { DeveloperProfile } from '../components/DeveloperProfile';

export function Home() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [showDeveloperProfile, setShowDeveloperProfile] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTeams(storage.getTeams());
    setMatches(storage.getMatches());
  };

  const deleteTeam = (teamId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this team?')) {
      storage.deleteTeam(teamId);
      loadData();
    }
  };

  const deleteMatch = (matchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this match?')) {
      storage.deleteMatch(matchId);
      loadData();
    }
  };

  const recentMatches = matches
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 via-green-800 to-gray-900">
      {/* Header */}
      <div className="bg-green-950 border-b border-green-700 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Trophy className="w-10 h-10 text-yellow-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">Cricket Scorer</h1>
              <p className="text-green-200 text-sm">Local Match Management</p>
            </div>
            
            {/* Developer Profile Button */}
            <button
              onClick={() => setShowDeveloperProfile(true)}
              className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
            >
              <UserCircle className="w-5 h-5" />
              <span className="hidden sm:inline">Developer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Developer Profile Modal */}
      <DeveloperProfile 
        isOpen={showDeveloperProfile} 
        onClose={() => setShowDeveloperProfile(false)} 
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => navigate('/create-team')}
            className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-6 flex items-center gap-4 transition-colors shadow-lg"
          >
            <Users className="w-8 h-8" />
            <div className="text-left">
              <div className="font-bold text-lg">Create Team</div>
              <div className="text-sm text-green-100">Add players and assign roles</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/create-match')}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-6 flex items-center gap-4 transition-colors shadow-lg"
          >
            <Trophy className="w-8 h-8" />
            <div className="text-left">
              <div className="font-bold text-lg">New Match</div>
              <div className="text-sm text-blue-100">Start scoring a match</div>
            </div>
          </button>
        </div>

        {/* Teams Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6" />
              My Teams ({teams.length})
            </h2>
          </div>

          {teams.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No teams created yet</p>
              <button
                onClick={() => navigate('/create-team')}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Your First Team
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map(team => (
                <div
                  key={team.id}
                  onClick={() => navigate(`/team/${team.id}`)}
                  className="bg-gray-800 hover:bg-gray-750 rounded-lg p-5 cursor-pointer transition-colors border border-gray-700 shadow-md"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-white">{team.name}</h3>
                    <button
                      onClick={(e) => deleteTeam(team.id, e)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-sm text-gray-400 space-y-1">
                    <div>{team.players.length} players</div>
                    <div className="text-yellow-400">
                      ⭐ {team.players.find(p => p.isCaptain)?.name || 'No captain'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Matches Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Recent Matches ({matches.length})
            </h2>
          </div>

          {matches.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
              <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No matches recorded yet</p>
              <button
                onClick={() => navigate('/create-match')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Your First Match
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentMatches.map(match => (
                <div
                  key={match.id}
                  onClick={() => {
                    if (match.status === 'inProgress') {
                      navigate(`/score/${match.id}`);
                    } else if (match.status === 'completed') {
                      navigate(`/match/${match.id}`);
                    } else {
                      navigate(`/score/${match.id}`);
                    }
                  }}
                  className="bg-gray-800 hover:bg-gray-750 rounded-lg p-5 cursor-pointer transition-colors border border-gray-700 shadow-md"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white">{match.team1Name}</span>
                        <span className="text-gray-400">vs</span>
                        <span className="font-bold text-white">{match.team2Name}</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        {match.totalOvers} overs • {new Date(match.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        match.status === 'completed' ? 'bg-green-900 text-green-200' :
                        match.status === 'inProgress' ? 'bg-yellow-900 text-yellow-200' :
                        'bg-gray-700 text-gray-300'
                      }`}>
                        {match.status === 'completed' ? 'Completed' :
                         match.status === 'inProgress' ? 'Live' : 'Upcoming'}
                      </span>
                      <button
                        onClick={(e) => deleteMatch(match.id, e)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {match.winner && (
                    <div className="text-sm text-yellow-400 font-semibold">
                      🏆 Winner: {match.winner}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}