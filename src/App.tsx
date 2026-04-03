import React from 'react';
import { GameProvider, useGame } from './store/GameContext';
import LoadingPhase from './pages/LoadingPhase';
import PrepPhase from './pages/PrepPhase';
import BrushNormalPhase from './pages/BrushNormalPhase';
import BrushBossPhase from './pages/BrushBossPhase';
import RinsePhase from './pages/RinsePhase';
import SettlementPhase from './pages/SettlementPhase';
import PhotoDiyPhase from './pages/PhotoDiyPhase';
import CameraOverlay from './components/CameraOverlay';
import UIOverlay from './components/UIOverlay';

const GameController: React.FC = () => {
  const { gameState } = useGame();

  if (gameState === 'loading') {
    return <LoadingPhase />;
  }

  return (
    <div className="bg-gray-900 overflow-hidden font-extrabold select-none h-screen w-screen relative">
      {/* Camera Background */}
      <CameraOverlay />

      {/* UI Overlays (Timer, Motivation, Boss HP) */}
      <UIOverlay />

      {/* Game Phases */}
      {gameState === 'prep' && <PrepPhase />}
      {gameState === 'brush_normal' && <BrushNormalPhase />}
      {gameState === 'brush_boss' && <BrushBossPhase />}
      {gameState === 'rinse' && <RinsePhase />}
      {gameState === 'settlement' && <SettlementPhase />}
      {gameState === 'photo_diy' && <PhotoDiyPhase />}
    </div>
  );
};

function App() {
  return (
    <GameProvider>
      <GameController />
    </GameProvider>
  );
}

export default App;
