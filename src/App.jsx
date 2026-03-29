import Game from './components/Game';
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0a0a2a 100%)',
      }}
    >
      <Game />
      <Analytics />
    </div>
  );
}

export default App;
