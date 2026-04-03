import React, { useRef } from 'react';
import { useGame, Sticker } from '../store/GameContext';
import VirtualTeeth from '../components/VirtualTeeth';

const PhotoDiyPhase: React.FC = () => {
  const {
    selectedPhoto,
    activeStickers,
    showSaveSuccess,
    capturedPhotos,
    selectPhoto,
    addSticker,
    updateStickerPosition,
    saveAndComplete
  } = useGame();

  const canvasRef = useRef<HTMLDivElement>(null);
  const draggingStickerRef = useRef<Sticker | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Fallback to mock photos if user didn't brush enough to capture 4 photos
  const fallbackUrls = [
    'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/zhua_pai_zhao1.jpg',
    'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/zhua_pai_zhao2.jpg',
    'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/zhua_pai_zhao3.jpg',
    'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/zhua_pai_zhao4.jpg'
  ];

  const displayPhotos = [...capturedPhotos];
  while (displayPhotos.length < 4) {
    displayPhotos.push(fallbackUrls[displayPhotos.length]);
  }

  const handleStartDrag = (e: React.TouchEvent | React.MouseEvent, sticker: Sticker) => {
    draggingStickerRef.current = sticker;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      dragOffsetRef.current = {
        x: clientX - rect.left - sticker.x,
        y: clientY - rect.top - sticker.y
      };
    }
  };

  const handleDoDrag = (e: React.TouchEvent | React.MouseEvent, sticker: Sticker) => {
    if (draggingStickerRef.current?.id !== sticker.id) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const newX = clientX - rect.left - dragOffsetRef.current.x;
      const newY = clientY - rect.top - dragOffsetRef.current.y;
      updateStickerPosition(sticker.id, newX, newY);
    }
  };

  const handleEndDrag = (sticker: Sticker) => {
    if (draggingStickerRef.current?.id === sticker.id) {
      draggingStickerRef.current = null;
    }
  };

  return (
    <>
      <VirtualTeeth />
      <div className="fixed inset-0 z-[60] bg-gray-100 flex flex-col">
        {/* 顶部栏 */}
        <div className="p-6 text-center z-10">
          <h2 className="text-3xl text-secondary text-stroke leading-relaxed">
            {selectedPhoto === null ? '选一张最棒的照片吧！' : '装扮你的照片！'}
          </h2>
        </div>

        {/* 选图阶段 */}
        {selectedPhoto === null && (
          <div className="flex-1 p-6 grid grid-cols-2 gap-4 content-start">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-[9/16] bg-white rounded-[2rem] border-4 border-gray-200 shadow-lg flex items-center justify-center text-gray-400 text-xl active:scale-95 transition-transform overflow-hidden relative"
                onClick={() => selectPhoto(i)}
              >
                <img 
                  src={displayPhotos[i - 1]} 
                  alt={`抓拍 ${i}`} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
          </div>
        )}

        {/* 装饰阶段 */}
        {selectedPhoto !== null && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* 照片画布 */}
            <div
              className="w-full max-w-xs aspect-[9/16] bg-white rounded-[2rem] border-8 border-white shadow-2xl relative overflow-hidden"
              ref={canvasRef}
            >
              <img 
                src={displayPhotos[selectedPhoto - 1]} 
                alt={`抓拍 ${selectedPhoto}`} 
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                referrerPolicy="no-referrer"
              />

              {/* 已添加的贴纸 */}
              {activeStickers.map((sticker) => (
                <div
                  key={sticker.id}
                  className="draggable-sticker text-5xl"
                  style={{ left: `${sticker.x}px`, top: `${sticker.y}px`, transform: 'translate(-50%, -50%)' }}
                  onTouchStart={(e) => handleStartDrag(e, sticker)}
                  onTouchMove={(e) => handleDoDrag(e, sticker)}
                  onTouchEnd={() => handleEndDrag(sticker)}
                  onMouseDown={(e) => handleStartDrag(e, sticker)}
                  onMouseMove={(e) => handleDoDrag(e, sticker)}
                  onMouseUp={() => handleEndDrag(sticker)}
                  onMouseLeave={() => handleEndDrag(sticker)}
                >
                  {sticker.emoji}
                </div>
              ))}
            </div>

            {/* 保存按钮 */}
            <button
              onClick={saveAndComplete}
              className="mt-8 px-8 py-3 bg-accent text-white rounded-full text-2xl font-bold shadow-[0_6px_0_#ea580c] active:shadow-none active:translate-y-1 transition-all"
            >
              保存并完成
            </button>
          </div>
        )}

        {/* 底部 Tab 操作区 */}
        {selectedPhoto !== null && (
          <div className="h-48 bg-white rounded-t-[3rem] shadow-[0_-10px_30px_rgba(0,0,0,0.1)] flex flex-col z-10">
            <div className="flex justify-center space-x-8 p-4 border-b-2 border-gray-100">
              <button className="text-xl text-primary font-bold border-b-4 border-primary pb-1">贴纸</button>
              <button className="text-xl text-gray-400 font-bold pb-1">相框</button>
            </div>
            <div className="flex-1 flex items-center justify-center space-x-6 p-4 overflow-x-auto">
              <button
                className="text-5xl bg-gray-100 p-4 rounded-[2rem] active:scale-95 transition-transform"
                onClick={() => addSticker('✨')}
              >
                ✨
              </button>
              <button
                className="text-5xl bg-gray-100 p-4 rounded-[2rem] active:scale-95 transition-transform"
                onClick={() => addSticker('👑')}
              >
                👑
              </button>
              <button
                className="text-5xl bg-gray-100 p-4 rounded-[2rem] active:scale-95 transition-transform"
                onClick={() => addSticker('💖')}
              >
                💖
              </button>
            </div>
          </div>
        )}

        {/* 保存成功提示 */}
        {showSaveSuccess && (
          <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="bg-primary text-white px-8 py-4 rounded-full text-2xl font-bold shadow-2xl border-4 border-white jelly-popup">
              已保存到相册！
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PhotoDiyPhase;
