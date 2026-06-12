import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import SchedulePage from './pages/SchedulePage';
import StandingsPage from './pages/StandingsPage';
import BracketPage from './pages/BracketPage';
import ThirdPlacePage from './pages/ThirdPlacePage';
import ScorersPage from './pages/ScorersPage';
import PlayersPage from './pages/PlayersPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/standings" element={<StandingsPage />} />
        <Route path="/bracket" element={<BracketPage />} />
        <Route path="/third" element={<ThirdPlacePage />} />
        <Route path="/scorers" element={<ScorersPage />} />
        <Route path="/players" element={<PlayersPage />} />
        <Route path="*" element={<HomePage />} />
      </Route>
    </Routes>
  );
}
