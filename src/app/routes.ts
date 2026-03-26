import { createBrowserRouter } from 'react-router';
import { Home } from './pages/Home';
import { CreateTeam } from './pages/CreateTeam';
import { TeamDetails } from './pages/TeamDetails';
import { CreateMatch } from './pages/CreateMatch';
import { LiveScoring } from './pages/LiveScoring';
import { MatchSummary } from './pages/MatchSummary';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Home,
  },
  {
    path: '/create-team',
    Component: CreateTeam,
  },
  {
    path: '/team/:teamId',
    Component: TeamDetails,
  },
  {
    path: '/create-match',
    Component: CreateMatch,
  },
  {
    path: '/score/:matchId',
    Component: LiveScoring,
  },
  {
    path: '/match/:matchId',
    Component: MatchSummary,
  },
]);
