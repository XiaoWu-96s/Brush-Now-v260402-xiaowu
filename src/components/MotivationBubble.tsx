import React from "react";
import { useGame } from "../store/GameContext";

export const MotivationBubble: React.FC = () => {
  const { showMotivation, motivationText } = useGame();

  if (!showMotivation) return null;

  return (
    <div className="absolute top-40 left-1/2 transform -translate-x-1/2 w-full flex justify-center z-50 pointer-events-none">
      <div className="px-8 py-3 bg-accent text-white rounded-3xl text-3xl font-bold shadow-xl border-4 border-white text-center jelly-popup leading-relaxed">
        <span>{motivationText}</span>
      </div>
    </div>
  );
};
