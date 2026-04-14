import React, { useEffect, useRef } from 'react';
import { useGame } from '../store/GameContext';
import VirtualTeeth from '../components/VirtualTeeth';

const SettlementPhase: React.FC = () => {
  const { goToPhotoDiy } = useGame();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/Congratulations_Audio.mp3');
    audioRef.current.play().catch(e => console.warn('Congratulations audio play failed:', e));

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const handleGoToPhotoDiy = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    goToPhotoDiy();
  };

  return (
    <>
      <VirtualTeeth />
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="w-11/12 max-w-sm bg-white rounded-[3rem] p-8 flex flex-col items-center shadow-2xl border-8 border-secondary jelly-popup">
          <h2 className="text-3xl text-accent text-stroke text-center mb-6 leading-relaxed">
            恭喜打败<br />蛀牙大魔王！
          </h2>

          {/* 3颗星星 */}
          <div className="flex space-x-4 mb-6">
            <span className="text-5xl animate-bounce" style={{ animationDelay: '0s' }}>⭐</span>
            <span className="text-6xl animate-bounce" style={{ animationDelay: '0.2s' }}>⭐</span>
            <span className="text-5xl animate-bounce" style={{ animationDelay: '0.4s' }}>⭐</span>
          </div>

          {/* 奖励 */}
          <div className="bg-yellow-100 rounded-[2rem] p-4 mb-8 flex flex-col items-center border-4 border-yellow-300 w-full">
            <span className="text-gray-600 text-sm mb-2 font-bold">本次解锁奖励</span>
            <img 
              src="https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/Huizhang.png" 
              alt="奖励徽章" 
              className="w-20 h-20 object-contain drop-shadow-md"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* 按钮 */}
          <button
            onClick={handleGoToPhotoDiy}
            className="w-full py-4 bg-primary text-white rounded-full text-2xl font-bold shadow-[0_8px_0_#0d9488] active:shadow-[0_0px_0_#0d9488] active:translate-y-2 transition-all"
          >
            去拍照打卡 ➔
          </button>
        </div>
      </div>
    </>
  );
};

export default SettlementPhase;
