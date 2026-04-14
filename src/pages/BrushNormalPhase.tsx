import React from 'react';
import VirtualTeeth from '../components/VirtualTeeth';
import GuideUI from '../components/GuideUI';
import { useGame } from '../store/GameContext';

const BrushNormalPhase: React.FC = () => {
  const { showStartGif } = useGame();

  return (
    <>
      <VirtualTeeth />
      <GuideUI />
      {showStartGif && (
        <div className="absolute bottom-0 left-0 w-full flex justify-center z-50 pointer-events-none">
          <img 
            src="https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/Stage_Image_start.gif" 
            alt="Start Animation" 
            className="w-3/4 max-w-sm object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
      )}
    </>
  );
};

export default BrushNormalPhase;
