import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export type GameState = 'loading' | 'prep' | 'brush_normal' | 'brush_boss' | 'rinse' | 'settlement' | 'photo_diy';
export type Quadrant = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';

export interface Bacteria {
  id: number;
  x: number;
  y: number;
  imageUrl: string;
  hp: number;
  quadrant: Quadrant;
}

export interface AttackEffect {
  id: number;
  targetX: number;
  targetY: number;
  originX: number;
  originY: number;
}

interface GameContextType {
  gameState: GameState;
  timeLeft: number;
  mainTimeLeft: number;
  guidePosition: Quadrant;
  bacteriaList: Bacteria[];
  bossHp: number;
  bossPos: { quadrant: Quadrant; x: number; y: number };
  isBossHit: boolean;
  showMotivation: boolean;
  motivationText: string;
  isFlashing: boolean;
  isSpitting: boolean;
  isSweepLight: boolean;
  showStartGif: boolean;
  selectedPhoto: number | null;
  activeStickers: Sticker[];
  showSaveSuccess: boolean;
  attackEffects: AttackEffect[];
  capturedPhotos: string[];
  
  // Actions
  finishLoading: () => void;
  skipToBoss: () => void;
  simulateBrush: (quadrant: Quadrant, originX?: number, originY?: number) => void;
  goToPhotoDiy: () => void;
  selectPhoto: (index: number) => void;
  addSticker: (emoji: string) => void;
  updateStickerPosition: (id: number, x: number, y: number) => void;
  saveAndComplete: () => void;
  addCapturedPhoto: (photo: string) => void;
  triggerSpit: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>('loading');
  const [timeLeft, setTimeLeft] = useState(15);
  const [mainTimeLeft, setMainTimeLeft] = useState(120);
  
  const [guidePosition, setGuidePosition] = useState<Quadrant>('top-left');
  const guidePositionRef = useRef<Quadrant>('top-left');
  const [bacteriaList, setBacteriaList] = useState<Bacteria[]>([]);
  const bacteriaIdCounter = useRef(0);
  
  const [bossHp, setBossHp] = useState(100);
  const [bossPos, setBossPos] = useState<{ quadrant: Quadrant; x: number; y: number }>({ quadrant: 'center', x: 50, y: 50 });
  const [isBossHit, setIsBossHit] = useState(false);
  
  const [showMotivation, setShowMotivation] = useState(false);
  const [motivationText, setMotivationText] = useState('戴好帽子，来练习一下！');
  const motivationTimer = useRef<NodeJS.Timeout | null>(null);
  
  const [isFlashing, setIsFlashing] = useState(false);
  const [isSpitting, setIsSpitting] = useState(false);
  const spitTimer = useRef<NodeJS.Timeout | null>(null);
  
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [activeStickers, setActiveStickers] = useState<Sticker[]>([]);
  const stickerIdCounter = useRef(0);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  
  const [attackEffects, setAttackEffects] = useState<AttackEffect[]>([]);
  const attackEffectIdCounter = useRef(0);

  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [spitCount, setSpitCount] = useState(0);
  const [isSweepLight, setIsSweepLight] = useState(false);
  const [showStartGif, setShowStartGif] = useState(false);

  const lastFeedbackTime = useRef<number>(0);
  const guideInterval = useRef<NodeJS.Timeout | null>(null);
  const bossInterval = useRef<NodeJS.Timeout | null>(null);
  const bgmAudioRef = useRef<HTMLAudioElement | null>(null);
  const feedbackAudioRef = useRef<HTMLAudioElement | null>(null);

  // BGM Control
  useEffect(() => {
    if (!bgmAudioRef.current) {
      bgmAudioRef.current = new Audio('https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/bgm.mp3');
      bgmAudioRef.current.loop = true;
    }

    if (['prep', 'brush_normal', 'brush_boss', 'rinse'].includes(gameState)) {
      bgmAudioRef.current.play().catch(e => console.warn('BGM play failed:', e));
    } else {
      bgmAudioRef.current.pause();
      bgmAudioRef.current.currentTime = 0;
    }
  }, [gameState]);

  // Cleanup BGM and feedback audio on unmount
  useEffect(() => {
    return () => {
      if (bgmAudioRef.current) {
        bgmAudioRef.current.pause();
      }
      if (feedbackAudioRef.current) {
        feedbackAudioRef.current.pause();
      }
    };
  }, []);

  const playSound = (type: string) => {
    console.log(`[Audio] 播放音效: ${type}`);
    if (type === 'sfx_attack') {
      const audio = new Audio('https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/Attack_audio.mp3');
      audio.play().catch(e => console.warn('Audio play failed:', e));
    }
  };

  const showBubble = (text: string, duration: number) => {
    setMotivationText(text);
    setShowMotivation(true);
    if (motivationTimer.current) clearTimeout(motivationTimer.current);
    if (duration > 0) {
      motivationTimer.current = setTimeout(() => {
        setShowMotivation(false);
      }, duration);
    }

    // Play corresponding audio
    let audioUrl = '';
    if (text.includes('戴好帽子')) {
      audioUrl = 'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/ready.mp3';
    } else if (text.includes('正式开始')) {
      audioUrl = 'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/Stage_Audio_start.mp3';
    } else if (text.includes('太棒了')) {
      audioUrl = 'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/feedback1.mp3';
    } else if (text.includes('就是这样')) {
      audioUrl = 'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/feedback3.mp3';
    } else if (text.includes('继续保持')) {
      audioUrl = 'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/feedback2.mp3';
    } else if (text.includes('消灭它们')) {
      audioUrl = 'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/feedback4.mp3';
    } else if (text.includes('大魔王出现')) {
      audioUrl = 'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/Stage_Audio_boss.mp3';
    } else if (text.includes('漱口阶段')) {
      audioUrl = 'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/Stage_Audio_final.mp3';
    }

    if (audioUrl) {
      if (feedbackAudioRef.current) {
        feedbackAudioRef.current.pause();
        feedbackAudioRef.current.currentTime = 0;
      }
      feedbackAudioRef.current = new Audio(audioUrl);
      feedbackAudioRef.current.play().catch(e => console.warn('Feedback audio play failed:', e));
    }
  };

  const bacteriaImages = [
    'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/%E7%BB%86%E8%8F%8C1.png',
    'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/%E7%BB%86%E8%8F%8C2.png',
    'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/%E7%BB%86%E8%8F%8C3.png'
  ];

  const spawnBacteria = (count: number, currentGuidePos: Quadrant = guidePositionRef.current) => {
    setBacteriaList(prev => {
      const newBacteria: Bacteria[] = [];
      for (let i = 0; i < count; i++) {
        let baseX = 50, baseY = 50;
        if (currentGuidePos === 'top-left') { baseX = 25; baseY = 25; }
        if (currentGuidePos === 'top-right') { baseX = 75; baseY = 25; }
        if (currentGuidePos === 'bottom-left') { baseX = 25; baseY = 75; }
        if (currentGuidePos === 'bottom-right') { baseX = 75; baseY = 75; }
        
        const randomImage = bacteriaImages[Math.floor(Math.random() * bacteriaImages.length)];
        
        let bestX = baseX;
        let bestY = baseY;
        let maxMinDist = -1;
        
        const allBacteria = [...prev, ...newBacteria];
        
        for (let attempt = 0; attempt < 15; attempt++) {
          const candX = baseX + (Math.random() * 36 - 18);
          const candY = baseY + (Math.random() * 36 - 18);
          
          if (allBacteria.length === 0) {
            bestX = candX;
            bestY = candY;
            break;
          }
          
          let minDist = Infinity;
          for (const b of allBacteria) {
            const dist = Math.sqrt(Math.pow(b.x - candX, 2) + Math.pow(b.y - candY, 2));
            if (dist < minDist) minDist = dist;
          }
          
          if (minDist > maxMinDist) {
            maxMinDist = minDist;
            bestX = candX;
            bestY = candY;
          }
        }
        
        newBacteria.push({
          id: bacteriaIdCounter.current++,
          x: bestX,
          y: bestY,
          imageUrl: randomImage,
          hp: 2,
          quadrant: currentGuidePos
        });
      }
      return [...prev, ...newBacteria];
    });
  };

  const moveBoss = () => {
    const quadrants: { q: Quadrant; x: number; y: number }[] = [
      { q: 'top-left', x: 25, y: 25 },
      { q: 'top-right', x: 75, y: 25 },
      { q: 'bottom-left', x: 25, y: 75 },
      { q: 'bottom-right', x: 75, y: 75 }
    ];
    setBossPos(prev => {
      let available = quadrants.filter(q => q.q !== prev.quadrant);
      if (available.length === 0) available = quadrants;
      const next = available[Math.floor(Math.random() * available.length)];
      return { 
        quadrant: next.q, 
        x: next.x + (Math.random() * 20 - 10), 
        y: next.y + (Math.random() * 20 - 10) 
      };
    });
  };

  // Game Loop
  useEffect(() => {
    if (gameState === 'brush_normal') {
      let audioUrl = '';
      if (mainTimeLeft === 90) {
        audioUrl = 'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/HuanBian_Audio1.mp3';
      } else if (mainTimeLeft === 60) {
        audioUrl = 'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/HuanBian_Audio2.mp3';
      } else if (mainTimeLeft === 30) {
        audioUrl = 'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/HuanBian_Audio3.mp3';
      }

      if (audioUrl) {
        if (feedbackAudioRef.current) {
          feedbackAudioRef.current.pause();
          feedbackAudioRef.current.currentTime = 0;
        }
        feedbackAudioRef.current = new Audio(audioUrl);
        feedbackAudioRef.current.play().catch(e => console.warn('HuanBian audio play failed:', e));
      }
    }
  }, [mainTimeLeft, gameState]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (gameState === 'prep') {
        const randomPos: Quadrant = Math.random() > 0.5 ? 'top-left' : 'top-right';
        spawnBacteria(1, randomPos);
        setTimeLeft(prev => {
          if (prev <= 1) {
            enterBrushNormal();
            return 0;
          }
          return prev - 1;
        });
      } else if (['brush_normal', 'brush_boss', 'rinse'].includes(gameState)) {
        if (gameState === 'brush_normal') {
          spawnBacteria(1, guidePositionRef.current);
        } else if (gameState === 'brush_boss') {
          const randomPos: Quadrant = Math.random() > 0.5 ? 'top-left' : 'top-right';
          spawnBacteria(1, randomPos);
        }
        setMainTimeLeft(prev => {
          const nextTime = prev - 1;
          if (nextTime <= 0 && gameState === 'brush_normal') {
            enterBrushBoss();
            return 30; // 10s for boss, 20s for rinse
          } else if (nextTime === 20 && gameState === 'brush_boss') {
            enterRinse();
          } else if (nextTime <= 0 && gameState === 'rinse') {
            enterSettlement();
          }
          return nextTime;
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  // Bacteria Movement Loop
  useEffect(() => {
    if (['prep', 'brush_normal', 'brush_boss', 'rinse'].includes(gameState) && !isSpitting) {
      const moveTimer = setInterval(() => {
        setBacteriaList(prev => prev.map(b => {
          let minX = 10, maxX = 40, minY = 10, maxY = 90;
          if (b.quadrant.includes('right')) {
            minX = 60;
            maxX = 90;
          }
          
          // Move slowly: max step of 15% in any direction
          const dx = (Math.random() * 30 - 15);
          const dy = (Math.random() * 30 - 15);
          
          let newX = b.x + dx;
          let newY = b.y + dy;
          
          // Clamp to bounds
          newX = Math.max(minX, Math.min(maxX, newX));
          newY = Math.max(minY, Math.min(maxY, newY));
          
          return { ...b, x: newX, y: newY };
        }));
      }, 2000);
      return () => clearInterval(moveTimer);
    }
  }, [gameState, isSpitting]);

  const enterBrushNormal = () => {
    console.log('[State] 进入常规刷牙阶段');
    setGameState('brush_normal');
    setBacteriaList([]); // 清除准备阶段的细菌
    setGuidePosition('top-left');
    guidePositionRef.current = 'top-left';
    playSound('bgm_brush');
    showBubble('正式开始！跟着指示刷牙！', 4000);
    
    setShowStartGif(true);
    setTimeout(() => {
      setShowStartGif(false);
    }, 4000);
    
    const positions: Quadrant[] = ['top-left', 'top-right', 'top-left', 'top-right'];
    let posIndex = 0;
    
    if (guideInterval.current) clearInterval(guideInterval.current);
    guideInterval.current = setInterval(() => {
      posIndex = (posIndex + 1) % positions.length;
      const nextPos = positions[posIndex];
      setGuidePosition(nextPos);
      guidePositionRef.current = nextPos;
    }, 30000); // Changed to 30 seconds per quadrant
  };

  const enterBrushBoss = () => {
    console.log('[State] 进入 Boss 战阶段');
    setGameState('brush_boss');
    playSound('bgm_boss_warning');
    showBubble('警告！大魔王出现了！', 4000);
    setBossHp(100);
    moveBoss();
    
    // Preload spit gif
    const img = new Image();
    img.src = 'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/ShuiLiu.gif';
    
    if (bossInterval.current) clearInterval(bossInterval.current);
    
    bossInterval.current = setInterval(() => {
      setBossHp(currentHp => {
        if (currentHp > 0) {
          moveBoss();
        } else {
          if (bossInterval.current) clearInterval(bossInterval.current);
        }
        return currentHp;
      });
    }, 1500);
  };

  const enterRinse = () => {
    console.log('[State] 进入漱口阶段');
    setGameState('rinse');
    setSpitCount(0);
    playSound('sfx_water_rinse');
    showBubble('漱口阶段，把细菌咕噜咕噜冲走吧！', 0);
    if (bossInterval.current) clearInterval(bossInterval.current);
  };

  const enterSettlement = () => {
    console.log('[State] 进入结算阶段');
    setGameState('settlement');
    playSound('bgm_win');
  };

  const finishLoading = () => {
    enterBrushNormal();
  };

  const skipToBoss = () => {
    if (gameState === 'brush_normal') {
      console.log('[Debug] 跳过常规刷牙，直接进入 Boss 战');
      setMainTimeLeft(30);
      enterBrushBoss();
    }
  };

  const simulateBrush = (quadrant: Quadrant, originX: number = 50, originY: number = 30) => {
    if (['prep', 'brush_normal', 'brush_boss'].includes(gameState)) {
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 500);
      
      // Trigger attack effect
      let targetX = 50;
      let targetY = 50;
      if (quadrant === 'top-left') { targetX = 25; targetY = 25; }
      if (quadrant === 'top-right') { targetX = 75; targetY = 25; }
      if (quadrant === 'bottom-left') { targetX = 25; targetY = 75; }
      if (quadrant === 'bottom-right') { targetX = 75; targetY = 75; }
      
      const effectId = attackEffectIdCounter.current++;
      setAttackEffects(prev => [...prev, { id: effectId, targetX, targetY, originX, originY }]);
      playSound('sfx_attack');
      
      setTimeout(() => {
        setAttackEffects(prev => prev.filter(e => e.id !== effectId));
      }, 500); // Effect duration
    }

    if (['prep', 'brush_normal'].includes(gameState)) {
      setBacteriaList(prev => {
        if (prev.length === 0) return prev;
        
        let targetIndex = prev.findIndex(b => b.quadrant === quadrant);
        if (targetIndex === -1) targetIndex = prev.length - 1;
        
        const target = prev[targetIndex];
        const newList = [...prev];
        
        if (target.hp > 1) {
          newList[targetIndex] = { ...target, hp: target.hp - 1 };
          playSound('sfx_hit');
        } else {
          newList.splice(targetIndex, 1);
          playSound('sfx_hit');
          
          const now = Date.now();
          if (now - lastFeedbackTime.current > 1000) {
            lastFeedbackTime.current = now;
            const texts = ['太棒了！', '就是这样！', '继续保持！', '消灭它们！'];
            showBubble(texts[Math.floor(Math.random() * texts.length)], 2000);
          }
        }
        return newList;
      });
    } else if (gameState === 'brush_boss') {
      let hitBoss = false;
      if (quadrant === bossPos.quadrant && bossHp > 0) {
        hitBoss = true;
        setBossHp(prev => {
          const newHp = Math.max(0, prev - 15);
          setIsBossHit(true);
          playSound('sfx_boss_hit');
          setTimeout(() => setIsBossHit(false), 400);
          
          if (newHp <= 0) {
            showBubble('大魔王被击晕了！', 3000);
            if (bossInterval.current) clearInterval(bossInterval.current);
          } else {
            const now = Date.now();
            if (now - lastFeedbackTime.current > 1000) {
              lastFeedbackTime.current = now;
              showBubble('暴击！', 1000);
            }
          }
          return newHp;
        });
      } else if (bossHp > 0) {
        const now = Date.now();
        if (now - lastFeedbackTime.current > 1000) {
          lastFeedbackTime.current = now;
          showBubble('哎呀，没刷到！', 1000);
        }
      }

      setBacteriaList(prev => {
        if (prev.length === 0) return prev;
        
        let targetIndex = prev.findIndex(b => b.quadrant === quadrant);
        if (targetIndex === -1) targetIndex = prev.length - 1;
        
        const target = prev[targetIndex];
        const newList = [...prev];
        
        if (target.hp > 1) {
          newList[targetIndex] = { ...target, hp: target.hp - 1 };
          if (!hitBoss) playSound('sfx_hit');
        } else {
          newList.splice(targetIndex, 1);
          if (!hitBoss) playSound('sfx_hit');
        }
        return newList;
      });
    }
  };

  const goToPhotoDiy = () => {
    console.log('[State] 进入拍照打卡 DIY');
    setGameState('photo_diy');
    setSelectedPhoto(null);
    setActiveStickers([]);
  };

  const selectPhoto = (index: number) => {
    setSelectedPhoto(index);
    playSound('sfx_hit');
  };

  const addSticker = (emoji: string) => {
    setActiveStickers(prev => [
      ...prev,
      {
        id: stickerIdCounter.current++,
        emoji,
        x: 150, // Default centerish
        y: 150
      }
    ]);
    playSound('sfx_hit');
  };

  const updateStickerPosition = (id: number, x: number, y: number) => {
    setActiveStickers(prev => prev.map(s => s.id === id ? { ...s, x, y } : s));
  };

  const addCapturedPhoto = (photo: string) => {
    setCapturedPhotos(prev => {
      if (prev.length < 4) return [...prev, photo];
      return [...prev.slice(1), photo]; // Keep the latest 4 photos
    });
  };

  const triggerSpit = () => {
    if (isSpitting) return;
    console.log('[Action] 检测到吐水动作');
    setIsSpitting(true);
    
    const newCount = spitCount + 1;
    setSpitCount(newCount);
    
    if (spitTimer.current) clearTimeout(spitTimer.current);
    spitTimer.current = setTimeout(() => {
      setIsSpitting(false);
      if (newCount === 1) {
        setBacteriaList(list => {
          const shuffled = [...list].sort(() => 0.5 - Math.random());
          return shuffled.slice(0, Math.ceil(list.length / 2));
        });
      } else {
        setBacteriaList([]);
        setBossHp(0);
        
        // Trigger sweep light effect
        setIsSweepLight(true);
        setTimeout(() => {
          setIsSweepLight(false);
        }, 1500); // Sweep light duration
      }
    }, 2000);
  };

  const saveAndComplete = () => {
    setShowSaveSuccess(true);
    playSound('bgm_win');
    setTimeout(() => {
      setShowSaveSuccess(false);
      // Reset game
      setGameState('loading');
      setTimeLeft(15);
      setMainTimeLeft(120);
      setBossHp(100);
      setBacteriaList([]);
      setActiveStickers([]);
      setSelectedPhoto(null);
      setCapturedPhotos([]);
      setShowMotivation(false);
      setGuidePosition('top-left');
      guidePositionRef.current = 'top-left';
    }, 2000);
  };

  return (
    <GameContext.Provider value={{
      gameState, timeLeft, mainTimeLeft, guidePosition, bacteriaList,
      bossHp, bossPos, isBossHit, showMotivation, motivationText, isFlashing, isSpitting, isSweepLight, showStartGif,
      selectedPhoto, activeStickers, showSaveSuccess, attackEffects, capturedPhotos,
      finishLoading, skipToBoss, simulateBrush, goToPhotoDiy, selectPhoto, addSticker, updateStickerPosition, saveAndComplete, addCapturedPhoto, triggerSpit
    }}>
      {children}
    </GameContext.Provider>
  );
};
