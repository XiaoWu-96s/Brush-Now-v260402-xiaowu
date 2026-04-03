import React from 'react';
import { useGame } from '../store/GameContext';

const UIOverlay: React.FC = () => {
  const {
    gameState,
    timeLeft,
    mainTimeLeft,
    skipToBoss,
    bossHp,
    showMotivation,
    motivationText
  } = useGame();

  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col z-50">
      {/* Boss 战红色呼吸灯警告边框 */}
      {gameState === 'brush_boss' && (
        <div className="fixed inset-0 pointer-events-none z-40 border-[16px] border-red-600/50 animate-pulse"></div>
      )}

      {/* 全屏水流特效 (z-index: 30) */}
      {gameState === 'rinse' && (
        <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
          <div className="absolute inset-0 bg-blue-400/50 water-flow"></div>
          <div
            className="absolute inset-0 bg-cyan-300/40 water-flow"
            style={{ animationDelay: '0.5s', animationDuration: '1.5s' }}
          ></div>
          <div id="spine-water-effect" className="absolute inset-0 w-full h-full"></div>
        </div>
      )}

      {/* 顶部 UI 容器，使用 flex-col 避免重叠 */}
      <div className="flex flex-col items-center w-full pt-6 px-6 space-y-4 z-50">
        
        {/* 顶部信息栏 */}
        {!['settlement', 'photo_diy'].includes(gameState) && (
          <div className="flex justify-between items-center w-full">
            <div className="bg-white/90 px-6 py-2 rounded-full text-primary text-2xl shadow-lg border-4 border-white jelly-transition font-bold">
              {gameState === 'prep' ? (
                <span>准备: {timeLeft}s</span>
              ) : (
                <span>剩余: {mainTimeLeft}s</span>
              )}
            </div>

            {/* 调试用：跳过到 Boss 战 */}
            {gameState === 'brush_normal' && (
              <button
                onClick={skipToBoss}
                className="pointer-events-auto bg-accent/90 px-4 py-2 rounded-full text-white text-xl shadow-lg border-4 border-white jelly-transition active:scale-95 font-bold"
              >
                跳过 ➔
              </button>
            )}
          </div>
        )}

        {/* Boss 血条 */}
        {gameState === 'brush_boss' && (
          <div className="w-3/4 max-w-md transition-all duration-300">
            <div className="h-8 bg-gray-800 rounded-full border-4 border-white shadow-xl overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-purple-600 jelly-transition"
                style={{ width: `${bossHp}%` }}
              ></div>
              <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold tracking-widest drop-shadow-md">
                大魔王 HP
              </span>
            </div>
          </div>
        )}

        {/* 动态激励区 (气泡) */}
        {!['settlement', 'photo_diy'].includes(gameState) && (
          <div className="w-full flex justify-center transition-all duration-300">
            {(() => {
              const imageMap: Record<string, string> = {
                '戴好帽子，来练习一下！': 'https://img.heliar.top/file/1775046965018_Stage_title1.png',
                '正式开始！跟着指示刷牙！': 'https://img.heliar.top/file/1775046966538_Stage_title2.png',
                '警告！大魔王出现了！': 'https://img.heliar.top/file/1775046970871_Stage_title3.png',
                '漱口阶段，把细菌咕噜咕噜冲走吧！': 'https://img.heliar.top/file/1775046963599_Stage_title4.png',
              };

              const imageUrl = imageMap[motivationText];

              if (imageUrl) {
                return (
                  <div
                    className={`jelly-transition ${
                      showMotivation ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 -translate-y-4'
                    }`}
                    style={{ transitionDuration: '300ms' }}
                  >
                    <img 
                      src={imageUrl} 
                      alt={motivationText} 
                      className="h-20 md:h-24 object-contain drop-shadow-xl animate-breath" 
                      referrerPolicy="no-referrer" 
                      crossOrigin="anonymous" 
                    />
                  </div>
                );
              }

              return (
                <div
                  className={`px-8 py-3 bg-accent text-white rounded-3xl text-3xl font-bold shadow-xl border-4 border-white text-center jelly-transition leading-relaxed ${
                    showMotivation ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 -translate-y-4'
                  }`}
                  style={{ transitionDuration: '300ms' }}
                >
                  <span>{motivationText}</span>
                </div>
              );
            })()}
          </div>
        )}

      </div>

      {/* AR 头饰占位 (z-index: 10) */}
      {['prep', 'brush_normal', 'brush_boss'].includes(gameState) && (
        <div
          id="ar-hat"
          className="absolute z-10 pointer-events-none transition-all duration-75 ease-linear"
          style={{
            left: '50%',
            top: '10%',
            width: '40%',
            transform: 'translate(-50%, 0)'
          }}
        >
          {/* ============================================================================ */}
          {/* ⚠️ 替换头部贴纸说明 (Replace Head Sticker Instructions):                       */}
          {/* 在下方的 src 属性中，将链接替换为您自己的 PNG 图片链接。                       */}
          {/* ============================================================================ */}
          <img 
            src="https://img.heliar.top/file/1774948056685_tiezhi.png" 
            alt="小火龙帽" 
            className="w-full h-auto block drop-shadow-xl"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
          />
        </div>
      )}
    </div>
  );
};

export default UIOverlay;

