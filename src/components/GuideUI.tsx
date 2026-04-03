import React from 'react';
import { useGame } from '../store/GameContext';

// ============================================================================
// ⚠️ 替换图片说明 (Image Replacement Instructions):
// 请将下面的 5 个 URL 替换为您自己的 PNG 图片链接。
// 第 1 张图片是准备阶段（练习阶段）的图片。
// 后 4 张图片分别对应正式刷牙的 4 个阶段，每 30 秒会自动切换一张。
// ============================================================================
const GUIDE_IMAGES = [
  // 替换这里: 准备阶段图片 (练习阶段)
  'https://img.heliar.top/file/1774949363912_0.png',

  // 替换这里: 左上区域图片 (0-30秒)
  'https://img.heliar.top/file/1774866546523_1.png',    
  
  // 替换这里: 右上区域图片 (30-60秒)
  'https://img.heliar.top/file/1774866544754_2.png',   
  
  // 替换这里: 左上区域图片 (60-90秒)
  'https://img.heliar.top/file/1774866553376_3.png', 
  
  // 替换这里: 右上区域图片 (90-120秒)
  'https://img.heliar.top/file/1774866561205_4.png' 
];

const GuideUI: React.FC = () => {
  const { gameState, mainTimeLeft } = useGame();

  if (gameState !== 'brush_normal') return null;

  let imageSrc = '';
  if (mainTimeLeft > 90) {
    imageSrc = GUIDE_IMAGES[1]; // 0-30秒
  } else if (mainTimeLeft > 60) {
    imageSrc = GUIDE_IMAGES[2]; // 30-60秒
  } else if (mainTimeLeft > 30) {
    imageSrc = GUIDE_IMAGES[3]; // 60-90秒
  } else {
    imageSrc = GUIDE_IMAGES[4]; // 90-120秒
  }

  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col z-50">
      <div className="absolute bottom-12 right-6 w-32 h-32 bg-white/90 rounded-full border-4 border-secondary shadow-2xl flex items-center justify-center p-2 pointer-events-auto z-50 jelly-transition overflow-hidden">
        {/* 
          这里显示对应的区域图片 
          图片会根据当前的 mainTimeLeft 自动切换
        */}
        <img 
          src={imageSrc} 
          alt="Brush Guide"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};

export default GuideUI;
