import React, { useRef, useState } from 'react';
import { useGame } from '../store/GameContext';
import VirtualTeeth from '../components/VirtualTeeth';
import * as htmlToImage from 'html-to-image';

const PhotoDiyPhase: React.FC = () => {
  const {
    selectedPhoto,
    showSaveSuccess,
    capturedPhotos,
    selectPhoto,
    saveAndComplete
  } = useGame();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);

  const frames = [
    'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/XiangKuang1.png',
    'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/XiangKuang2.png',
    'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/XiangKuang3.png'
  ];

  const handleSaveAndComplete = async () => {
    if (!canvasRef.current || isSaving) return;
    
    setIsSaving(true);
    try {
      const filterOptions = {
        filter: (node: HTMLElement) => {
          if (node.tagName === 'BUTTON') return false;
          return true;
        }
      };

      // First call forces image loads and CSS recalculations 
      // (a known workaround for html-to-image missing elements rendering)
      await htmlToImage.toPng(canvasRef.current, { cacheBust: true, pixelRatio: 2, ...filterOptions });
      
      const dataUrl = await htmlToImage.toPng(canvasRef.current, {
        cacheBust: true,
        pixelRatio: 2, // Boost resolution for a better output
        ...filterOptions
      });
      
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `brush_teeth_photo_${new Date().getTime()}.png`;
      a.click();
      
      saveAndComplete();
    } catch (error) {
      console.error('Failed to save image:', error);
      // Fallback: proceed with completion even if saving failed
      saveAndComplete();
    } finally {
      setIsSaving(false);
    }
  };

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

  return (
    <>
      <VirtualTeeth />
      <div 
        className="fixed inset-0 z-[60] bg-gray-100 bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: 'url(https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/PhotoDIY-bg.png)' }}
        ref={canvasRef}
      >
        {/* 全局比例换算依据: 750*1334 (width=100vw, height=100vh) */}

        {/* 返回按钮 (x20, y45 -> left: 2.66vw, top: 3.37vh) */}
        <button 
          className="absolute left-[2.66vw] top-[3.37vh] z-20 active:scale-95 transition-transform"
          onClick={() => window.location.reload()}
        >
          <img 
            src="https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/BackButton.png" 
            alt="返回" 
            className="w-[10.6vw] max-w-[40px] h-auto"
            referrerPolicy="no-referrer"
          />
        </button>

        {/* 标题图 (左右居中, y40 -> top: 3vh) */}
        <img 
          src="https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/PhotoDIY-title.png" 
          alt="装扮你的照片" 
          className="absolute left-1/2 -translate-x-1/2 top-[3vh] z-20 w-[46.6vw] max-w-[350px] h-auto pointer-events-none"
          referrerPolicy="no-referrer"
        />

        {/* 选图阶段 */}
        {selectedPhoto === null && (
          // 放在和DIY照片类似的垂直位置向下延伸
          <div className="absolute top-[12.5vh] bottom-[11.24vh] left-0 right-0 w-full px-[6vw] grid grid-cols-2 gap-[4vw] content-start overflow-y-auto z-10 pb-10 custom-scrollbar">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-full aspect-[545/817] bg-white rounded-[2rem] border-[1vw] border-gray-200 shadow-lg flex items-center justify-center text-gray-400 text-xl active:scale-95 transition-transform overflow-hidden relative cursor-pointer"
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
          <>
            {/* 相框图 (左右居中, y117 -> top: 8.77vh) */}
            <img 
              src={frames[frameIndex]} 
              alt="相框" 
              className="absolute left-1/2 -translate-x-1/2 top-[8.77vh] w-[100vw] sm:w-auto h-auto max-w-[750px] max-h-[85vh] object-contain pointer-events-none z-20"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
            />

            {/* 照片画布 (左右居中, y167 -> top: 12.51vh, w: 545/750 -> 72.6vw) */}
            <div
              className="absolute left-1/2 -translate-x-1/2 top-[12.51vh] w-[72.6vw] max-w-[545px] aspect-[545/817] bg-white rounded-[2rem] border-[1vw] border-white shadow-2xl overflow-hidden bg-cover bg-center z-10"
              style={{ backgroundImage: `url(${displayPhotos[selectedPhoto - 1]})` }}
            >
            </div>

            {/* 按钮区 (左右居中, 距底部150 -> bottom: 11.24vh, 间距15 -> space-x-[2vw]) */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-[11.24vh] flex items-center justify-center space-x-[2vw] z-30 w-[95vw]">
              {/* 更换相框按钮 */}
              <button
                onClick={() => setFrameIndex((prev) => (prev + 1) % frames.length)}
                className="transition-all active:scale-[0.85] flex-shrink-0"
              >
                <img 
                  src="https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/PhotoDIY-ChangeBtn.png" 
                  alt="更换相框" 
                  className="h-[7.8vh] max-h-[77px] w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </button>

              {/* 保存按钮 */}
              <button
                onClick={handleSaveAndComplete}
                disabled={isSaving}
                className={`transition-all active:scale-[0.85] flex-shrink-0 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <img 
                  src="https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/PhotoDIY-SaveBtn.png" 
                  alt="保存" 
                  className="h-[7.8vh] max-h-[77px] w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </button>
            </div>
          </>
        )}

        {/* 保存成功提示 */}
        {showSaveSuccess && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none">
            <div className="bg-primary text-white px-[8vw] py-[4vw] rounded-full text-[6vw] md:text-3xl font-bold shadow-2xl border-[1vw] border-white jelly-popup">
              已保存到相册！
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PhotoDiyPhase;
