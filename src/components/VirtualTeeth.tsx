import React from 'react';
import { useGame } from '../store/GameContext';

const VirtualTeeth: React.FC = () => {
  const {
    gameState,
    mainTimeLeft,
    isFlashing,
    bacteriaList,
    bossHp,
    bossPos,
    isBossHit,
    simulateBrush,
    attackEffects,
    isSpitting,
    isSweepLight
  } = useGame();

  const isGlowing =
    ['settlement', 'photo_diy'].includes(gameState) ||
    (gameState === 'rinse' && mainTimeLeft <= 15);

  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col z-50">
      <div
        className={`absolute bottom-0 left-0 w-full pointer-events-auto z-10 transition-all duration-500 ${
          isFlashing ? 'flash-white ' : ''
        }${isGlowing ? 'teeth-glowing' : ''}`}
      >
        <div className="relative">
          <img 
            src="https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/%E4%B8%8B%E7%89%99.png" 
            alt="Virtual Teeth" 
            className="w-full h-auto block pointer-events-none"
            referrerPolicy="no-referrer"
          />
          {/* 扫光特效层 */}
          {isSweepLight && (
            <>
              <div 
                className="absolute inset-0 pointer-events-none z-20"
                style={{
                  maskImage: 'url(https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/%E4%B8%8B%E7%89%99.png)',
                  maskSize: '100% 100%',
                  maskRepeat: 'no-repeat',
                  maskPosition: 'bottom left',
                  WebkitMaskImage: 'url(https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/%E4%B8%8B%E7%89%99.png)',
                  WebkitMaskSize: '100% 100%',
                  WebkitMaskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'bottom left',
                }}
              >
                <div className="sweep-light-bar"></div>
              </div>
              {/* 闪亮星星特效 */}
              <div className="sparkle-star" style={{ top: '25%', left: '22%', animationDelay: '0.1s' }}></div>
              <div className="sparkle-star" style={{ top: '35%', right: '18%', animationDelay: '0.4s' }}></div>
              <div className="sparkle-star" style={{ bottom: '25%', left: '35%', animationDelay: '0.7s' }}></div>
              <div className="sparkle-star" style={{ bottom: '20%', right: '38%', animationDelay: '0.3s' }}></div>
              <div className="sparkle-star" style={{ bottom: '15%', left: '48%', animationDelay: '0.6s' }}></div>
            </>
          )}
        </div>

        {/* 绝对定位的覆盖层，用于放置交互区域和特效 */}
        <div className="absolute inset-0 flex flex-wrap pointer-events-none">
          {/* 4个区域 (仅占位，不再支持点击) */}
          <div className="w-1/2 h-1/2 relative"></div>
          <div className="w-1/2 h-1/2 relative"></div>
          <div className="w-1/2 h-1/2 relative"></div>
          <div className="w-1/2 h-1/2 relative"></div>
        </div>

        {/* 蛀牙菌占位符 */}
        {bacteriaList.map((b) => (
          <div
            key={b.id}
            className="absolute w-18 h-18 slow-move-transition pointer-events-none"
            style={{ left: `${b.x}%`, top: `${b.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <div className={`w-full h-full ${gameState === 'rinse' && isSpitting ? 'wash-away' : ''}`}>
              <img 
                src={b.imageUrl} 
                alt="细菌" 
                className={`w-full h-full object-contain block drop-shadow-lg ${b.hp === 1 ? 'opacity-70 scale-90' : ''}`}
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        ))}

        {/* Boss 占位符 */}
        {['brush_boss', 'rinse'].includes(gameState) && bossHp > 0 && (
          <div
            className="absolute w-20 h-20 jelly-transition pointer-events-none"
            style={{ left: `${bossPos.x}%`, top: `${bossPos.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <div className={`w-full h-full ${gameState === 'rinse' && isSpitting ? 'wash-away' : 'float-anim'}`}>
              <div className={`w-full h-full ${isBossHit ? 'shake' : ''}`}>
                <img 
                  src="https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/boss.png" 
                  alt="Boss细菌" 
                  className={`w-full h-full object-contain block drop-shadow-2xl ${isBossHit ? 'brightness-150' : ''}`}
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        )}

        {/* 攻击光波特效 */}
        {attackEffects.map((effect) => (
          <div
            key={effect.id}
            className="absolute w-24 h-24 pointer-events-none z-50 lightwave-anim"
            style={{
              '--origin-x': `${effect.originX}%`,
              '--origin-y': `calc(${effect.originY}vh - 100vh + 100%)`,
              '--target-x': `${effect.targetX}%`,
              '--target-y': `${effect.targetY}%`
            } as React.CSSProperties}
          >
            <img 
              src="https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/guang_bo.png" 
              alt="光波" 
              className="w-full h-full object-contain drop-shadow-lg"
              referrerPolicy="no-referrer"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default VirtualTeeth;
