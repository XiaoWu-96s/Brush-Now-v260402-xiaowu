import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '../store/GameContext';
import { motion } from 'motion/react';

// ============================================================================
// ⚠️ 替换背景视频说明 (Background Video Replacement Instructions):
// 请将下面的 URL 替换为您自己的 MP4 视频链接。
// 这个视频会在开始页（加载页）作为背景循环自动播放。
// ============================================================================
const BACKGROUND_VIDEO_URL = 'https://img.heliar.top/file/1774877215453_剪辑.mp4'; // 替换这里的 MP4 链接

const AUDIO_URLS = [
  'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/ready.mp3',
  'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/start.mp3',
  'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/feedback1.mp3',
  'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/feedback2.mp3',
  'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/feedback3.mp3',
  'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/feedback4.mp3',
  'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/Stage_Audio_start.mp3',
  'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/Stage_Audio_boss.mp3',
  'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/Stage_Audio_final.mp3',
  'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/HuanBian_Audio1.mp3',
  'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/HuanBian_Audio2.mp3',
  'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/HuanBian_Audio3.mp3',
  'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/Congratulations_Audio.mp3',
  'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/Attack_audio.mp3',
  'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/bgm.mp3',
  'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/Loading_Audio.mp3'
];

const IMAGE_URLS = [
  'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/Stage_Image_start.gif',
  'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/ShuiLiu.gif',
  'https://img.heliar.top/file/1775046965018_Stage_title1.png',
  'https://img.heliar.top/file/1775046966538_Stage_title2.png',
  'https://img.heliar.top/file/1775046970871_Stage_title3.png',
  'https://img.heliar.top/file/1775046963599_Stage_title4.png',
  'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/start-button.png'
];

const LoadingPhase: React.FC = () => {
  const { finishLoading } = useGame();
  const [progress, setProgress] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleInteraction = () => {
    setHasInteracted(true);
    
    // Play video
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.warn('Video play failed:', e));
    }

    // Play loading audio once
    if (!audioRef.current) {
      audioRef.current = new Audio('https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/Loading_Audio.mp3');
      audioRef.current.loop = false;
    }
    audioRef.current.play().catch(e => console.warn('Loading audio play failed:', e));
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    if (!hasInteracted) return;

    let loadedCount = 0;
    const totalCount = AUDIO_URLS.length + IMAGE_URLS.length;

    const loadAudio = async (url: string) => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        await response.blob();
      } catch (error) {
        console.warn(`Failed to preload audio: ${url}`, error);
      }
    };

    const loadImage = (url: string) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.src = url;
        img.onload = () => resolve();
        img.onerror = () => {
          console.warn(`Failed to preload image: ${url}`);
          resolve();
        };
      });
    };

    const preloadAll = async () => {
      const audioPromises = AUDIO_URLS.map(async (url) => {
        await loadAudio(url);
        loadedCount++;
        setProgress(Math.round((loadedCount / totalCount) * 100));
      });

      const imagePromises = IMAGE_URLS.map(async (url) => {
        await loadImage(url);
        loadedCount++;
        setProgress(Math.round((loadedCount / totalCount) * 100));
      });

      await Promise.all([...audioPromises, ...imagePromises]);
    };

    preloadAll();
  }, [hasInteracted]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center text-white overflow-hidden"
    >
      {/* 背景视频 */}
      <video
        ref={videoRef}
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-[-1]"
        src={BACKGROUND_VIDEO_URL}
      />
      
      {/* 交互遮罩 */}
      {!hasInteracted && (
        <div 
          className="absolute inset-0 z-50 bg-black/20 flex flex-col justify-end items-center pb-20 cursor-pointer"
          onClick={handleInteraction}
        >
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-white text-2xl font-bold drop-shadow-md tracking-widest"
          >
            点击屏幕继续
          </motion.div>
        </div>
      )}

      {/* 进度条和文字容器：使用 -mt-32 向上偏移 */}
      {hasInteracted && progress !== 100 && (
        <div className="flex flex-col items-center -mt-32">
          <div className="text-4xl font-extrabold mb-8 text-white drop-shadow-lg">
            加载中...
          </div>
          <div className="w-64 h-4 bg-gray-700/80 rounded-full overflow-hidden mb-8 backdrop-blur-sm">
            <motion.div 
              className="h-full bg-white"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <div className="text-xl text-gray-300 drop-shadow-md font-bold">
            {progress}%
          </div>
        </div>
      )}
      
      {hasInteracted && progress === 100 && (
        /* ============================================================================ */
        /* ⚠️ 调整开始按钮位置说明 (Adjust Start Button Position Instructions):         */
        /* 修改下面 className 中的 `bottom-32` 可以调整按钮距离底部的距离。             */
        /* 例如: bottom-10 (更靠下), bottom-20, bottom-40 (更靠上) 等                   */
        /* ============================================================================ */
        <div className="absolute bottom-22 left-0 right-0 flex justify-center">
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileTap={{ scale: 0.9 }}
            onClick={finishLoading}
            className="focus:outline-none"
          >
            <motion.img 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              src="https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/start-button.png" 
              alt="开始刷牙" 
              className="w-[200px] max-w-[80vw] h-auto object-contain drop-shadow-xl"
              referrerPolicy="no-referrer"
            />
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};

export default LoadingPhase;
