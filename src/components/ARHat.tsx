import React from "react";
import { useGame } from "../store/GameContext";

export const ARHat: React.FC = () => {
  const { gameState } = useGame();

  if (!["prep", "brush_normal", "brush_boss"].includes(gameState)) return null;

  return (
    <div
      className={`absolute top-52 left-1/2 transform -translate-x-1/2 w-48 h-32 bg-accent rounded-[3rem] border-4 border-white shadow-2xl flex items-center justify-center text-white text-2xl text-stroke z-10 jelly-transition ${gameState === "prep" ? "animate-bounce" : ""}`}
    >
      🦕 小火龙帽
    </div>
  );
};
