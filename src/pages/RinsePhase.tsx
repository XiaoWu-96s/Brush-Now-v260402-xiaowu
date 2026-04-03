import React from 'react';
import VirtualTeeth from '../components/VirtualTeeth';
import { useGame } from '../store/GameContext';

const RinsePhase: React.FC = () => {
  const { isSpitting } = useGame();

  return (
    <>
      <VirtualTeeth />
      {isSpitting && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          <img 
            src="https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/ShuiLiu.gif" 
            alt="吐水特效" 
            className="w-full h-full object-cover opacity-90"
            referrerPolicy="no-referrer"
          />
        </div>
      )}
    </>
  );
};

export default RinsePhase;
