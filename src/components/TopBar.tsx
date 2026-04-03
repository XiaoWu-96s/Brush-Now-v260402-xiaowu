import React from "react";
import { useGame } from "../store/GameContext";

export const TopBar: React.FC = () => {
  const { gameState, timeLeft, mainTimeLeft, skipToBoss } = useGame();

  return (
    <div className="flex justify-between items-center p-6 z-50 pointer-events-none">
      <div className="bg-white/90 px-6 py-2 rounded-full text-primary text-2xl shadow-lg border-4 border-white jelly-transition">
        {gameState === "prep" ? (
          <span>准备: {timeLeft}s</span>
        ) : (
          <span>剩余: {mainTimeLeft}s</span>
        )}
      </div>

      {gameState === "brush_normal" && (
        <button
          onClick={skipToBoss}
          className="pointer-events-auto bg-accent/90 px-4 py-2 rounded-full text-white text-xl font-bold shadow-lg border-4 border-white jelly-transition active:scale-95"
        >
          跳过 ➔
        </button>
      )}
    </div>
  );
};
