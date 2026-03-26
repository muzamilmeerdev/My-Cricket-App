import { Team, Match } from '../types/cricket';

const TEAMS_KEY = 'cricket_teams';
const MATCHES_KEY = 'cricket_matches';

export const storage = {
  // Teams
  getTeams: (): Team[] => {
    try {
      const teams = localStorage.getItem(TEAMS_KEY);
      return teams ? JSON.parse(teams) : [];
    } catch (error) {
      console.error('Error loading teams:', error);
      return [];
    }
  },

  saveTeam: (team: Team): void => {
    try {
      const teams = storage.getTeams();
      const existingIndex = teams.findIndex(t => t.id === team.id);
      
      if (existingIndex >= 0) {
        teams[existingIndex] = team;
      } else {
        teams.push(team);
      }
      
      localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
    } catch (error) {
      console.error('Error saving team:', error);
    }
  },

  deleteTeam: (teamId: string): void => {
    try {
      const teams = storage.getTeams().filter(t => t.id !== teamId);
      localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  },

  getTeam: (teamId: string): Team | undefined => {
    return storage.getTeams().find(t => t.id === teamId);
  },

  // Matches
  getMatches: (): Match[] => {
    try {
      const matches = localStorage.getItem(MATCHES_KEY);
      return matches ? JSON.parse(matches) : [];
    } catch (error) {
      console.error('Error loading matches:', error);
      return [];
    }
  },

  saveMatch: (match: Match): void => {
    try {
      const matches = storage.getMatches();
      const existingIndex = matches.findIndex(m => m.id === match.id);
      
      if (existingIndex >= 0) {
        matches[existingIndex] = match;
      } else {
        matches.push(match);
      }
      
      localStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
    } catch (error) {
      console.error('Error saving match:', error);
    }
  },

  deleteMatch: (matchId: string): void => {
    try {
      const matches = storage.getMatches().filter(m => m.id !== matchId);
      localStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
    } catch (error) {
      console.error('Error deleting match:', error);
    }
  },

  getMatch: (matchId: string): Match | undefined => {
    return storage.getMatches().find(m => m.id === matchId);
  },
};
