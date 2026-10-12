import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Square from './pages/Square';
import CharacterCreate from './pages/CharacterCreate';
import StoryCreate from './pages/StoryCreate';
import ChatPicker from './pages/ChatPicker';
import Playground from './pages/Playground';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Square />} />
          <Route path="/create-character" element={<CharacterCreate />} />
          <Route path="/create-story" element={<StoryCreate />} />
          <Route path="/chat-picker" element={<ChatPicker />} />
          <Route path="/play/:sessionId" element={<Playground />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}