import React, { useEffect, useRef } from 'react';
import { useGame } from '../store/GameContext';

const CameraOverlay: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { simulateBrush, gameState, guidePosition, bossPos, addCapturedPhoto, triggerSpit } = useGame();
  
  // Keep track of latest state for the camera callback
  const stateRef = useRef({ gameState, guidePosition, bossPos, simulateBrush, addCapturedPhoto, triggerSpit });
  useEffect(() => {
    stateRef.current = { gameState, guidePosition, bossPos, simulateBrush, addCapturedPhoto, triggerSpit };
  }, [gameState, guidePosition, bossPos, simulateBrush, addCapturedPhoto, triggerSpit]);

  const motionCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastImageDataRef = useRef<Uint8ClampedArray | null>(null);
  const lastBrushTimeRef = useRef<number>(0);
  const lastCaptureTimeRef = useRef<number>(0);

  useEffect(() => {
    console.log('[Camera] 正在初始化前置摄像头...');
    const videoElement = videoRef.current;
    if (!videoElement) return;

    motionCanvasRef.current = document.createElement('canvas');
    motionCanvasRef.current.width = 64;
    motionCanvasRef.current.height = 64;
    const motionCtx = motionCanvasRef.current.getContext('2d', { willReadFrequently: true });

    captureCanvasRef.current = document.createElement('canvas');

    try {
      // @ts-ignore
      if (typeof FaceMesh !== 'undefined' && typeof Camera !== 'undefined') {
        // @ts-ignore
        const faceMesh = new FaceMesh({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
          }
        });
        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
        faceMesh.onResults((results: any) => {
          const hatEl = document.getElementById('ar-hat');
          if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            const landmarks = results.multiFaceLandmarks[0];
            // 10 is the top of the head (forehead)
            const top = landmarks[10];
            // 234 is left cheek, 454 is right cheek
            const left = landmarks[234];
            const right = landmarks[454];
            
            if (hatEl && videoElement.videoWidth) {
              hatEl.style.opacity = '1';
              const videoRatio = videoElement.videoWidth / videoElement.videoHeight;
              const screenRatio = window.innerWidth / window.innerHeight;
              
              let renderWidth, renderHeight, offsetX, offsetY;
              
              if (screenRatio > videoRatio) {
                renderWidth = window.innerWidth;
                renderHeight = window.innerWidth / videoRatio;
                offsetX = 0;
                offsetY = (window.innerHeight - renderHeight) / 2;
              } else {
                renderHeight = window.innerHeight;
                renderWidth = window.innerHeight * videoRatio;
                offsetX = (window.innerWidth - renderWidth) / 2;
                offsetY = 0;
              }
              
              const mirroredX = 1 - top.x;
              const screenX = offsetX + mirroredX * renderWidth;
              const screenY = offsetY + top.y * renderHeight;
              
              const faceWidth = Math.abs(right.x - left.x);
              const screenFaceWidth = faceWidth * renderWidth;
              const hatWidth = screenFaceWidth * 1.8; // Make it a bit larger to fit well
              
              const dx = right.x - left.x;
              const dy = right.y - left.y;
              // 添加负号反转角度，保证贴纸旋转与镜像画面中的歪头方向一致
              const angle = -Math.atan2(dy, dx) * (180 / Math.PI);
              
              hatEl.style.left = `${screenX}px`;
              hatEl.style.top = `${screenY}px`;
              hatEl.style.width = `${hatWidth}px`;
              hatEl.style.transform = `translate(-50%, -75%) rotate(${angle}deg)`;
            }

            // --- Smile & Teeth Detection ---
            const mouthLeft = landmarks[61];
            const mouthRight = landmarks[291];
            const innerTop = landmarks[13];
            const innerBottom = landmarks[14];
            const faceLeft = landmarks[234];
            const faceRight = landmarks[454];

            const faceWidth = Math.hypot(faceRight.x - faceLeft.x, faceRight.y - faceLeft.y);
            const mouthWidth = Math.hypot(mouthRight.x - mouthLeft.x, mouthRight.y - mouthLeft.y);
            const mouthOpen = Math.hypot(innerBottom.x - innerTop.x, innerBottom.y - innerTop.y);

            const smileRatio = mouthWidth / faceWidth;
            const openRatio = mouthOpen / faceWidth;

            // Thresholds for smiling and showing teeth
            const isSmilingAndShowingTeeth = smileRatio > 0.40 && openRatio > 0.02 && openRatio < 0.20;
            
            // --- Head Pose Detection (Pitch) ---
            const topOfHead = landmarks[10];
            const noseTip = landmarks[1];
            const chin = landmarks[152];

            const upperFaceHeight = noseTip.y - topOfHead.y;
            const lowerFaceHeight = chin.y - noseTip.y;
            
            // 当低头时，下半张脸在2D投影中会变短，上半张脸会变长
            // 正常平视时比例大约在 1.0 - 1.2 左右，低头时比例会显著增大
            const isHeadDown = lowerFaceHeight > 0 && (upperFaceHeight / lowerFaceHeight) > 1.8;

            // --- Motion Detection for Brushing ---
            let isBrushingMotion = false;
            if (motionCtx && videoElement.videoWidth) {
              const mouthTopOuter = landmarks[0];
              const mouthBottomOuter = landmarks[17];

              let minX = Math.min(mouthLeft.x, mouthRight.x, mouthTopOuter.x, mouthBottomOuter.x);
              let maxX = Math.max(mouthLeft.x, mouthRight.x, mouthTopOuter.x, mouthBottomOuter.x);
              let minY = Math.min(mouthLeft.y, mouthRight.y, mouthTopOuter.y, mouthBottomOuter.y);
              let maxY = Math.max(mouthLeft.y, mouthRight.y, mouthTopOuter.y, mouthBottomOuter.y);

              const w = maxX - minX;
              const h = maxY - minY;
              // Expand box to catch hand/brush movement around mouth
              minX = Math.max(0, minX - w * 1.5);
              maxX = Math.min(1, maxX + w * 1.5);
              minY = Math.max(0, minY - h * 1.0);
              maxY = Math.min(1, maxY + h * 1.0);

              const sx = minX * videoElement.videoWidth;
              const sy = minY * videoElement.videoHeight;
              const sw = (maxX - minX) * videoElement.videoWidth;
              const sh = (maxY - minY) * videoElement.videoHeight;

              motionCtx.drawImage(videoElement, sx, sy, sw, sh, 0, 0, 64, 64);
              const imageData = motionCtx.getImageData(0, 0, 64, 64).data;

              if (lastImageDataRef.current) {
                let diff = 0;
                for (let i = 0; i < imageData.length; i += 4) {
                  diff += Math.abs(imageData[i] - lastImageDataRef.current[i]);
                  diff += Math.abs(imageData[i+1] - lastImageDataRef.current[i+1]);
                  diff += Math.abs(imageData[i+2] - lastImageDataRef.current[i+2]);
                }
                const avgDiff = diff / (64 * 64 * 3);

                // Threshold for brushing motion (pixel difference)
                if (avgDiff > 15) {
                  isBrushingMotion = true;
                }
              }
              lastImageDataRef.current = new Uint8ClampedArray(imageData);
            }

            // --- Combine Both Conditions ---
            const currentGameState = stateRef.current.gameState;
            const now = Date.now();

            if (currentGameState === 'rinse' && isHeadDown) {
              stateRef.current.triggerSpit();
            }

            if (isSmilingAndShowingTeeth && isBrushingMotion) {
              if (now - lastBrushTimeRef.current > 500) { // 500ms cooldown
                lastBrushTimeRef.current = now;
                const { guidePosition: currentGuide, bossPos: currentBoss, simulateBrush: doBrush, addCapturedPhoto: doAddPhoto } = stateRef.current;
                
                if (['prep', 'brush_normal', 'brush_boss'].includes(currentGameState)) {
                   const targetQuadrant = currentGameState === 'brush_boss' ? currentBoss.quadrant : currentGuide;
                   
                   // Calculate mouth center in screen coordinates (percentages)
                   // Note: video is mirrored (-scale-x-100), so x is 1 - x
                   const mirroredX = 1 - (mouthLeft.x + mouthRight.x) / 2;
                   const mouthY = (innerTop.y + innerBottom.y) / 2;
                   
                   doBrush(targetQuadrant, mirroredX * 100, mouthY * 100);

                   // --- Capture Photo Logic ---
                   // Capture only when successfully brushing and smiling, with a 2-second cooldown
                   if (['brush_normal', 'brush_boss'].includes(currentGameState) && now - lastCaptureTimeRef.current > 2000) {
                     lastCaptureTimeRef.current = now;
                     if (captureCanvasRef.current && videoElement.videoWidth) {
                       const canvas = captureCanvasRef.current;
                       const ctx = canvas.getContext('2d');
                       if (ctx) {
                         canvas.width = videoElement.videoWidth;
                         canvas.height = videoElement.videoHeight;
                         ctx.save();
                         // Mirror the canvas so the captured photo matches the preview
                         ctx.translate(canvas.width, 0);
                         ctx.scale(-1, 1);
                         ctx.drawImage(videoElement, 0, 0);
                         ctx.restore();
                         const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                         doAddPhoto(dataUrl);
                       }
                     }
                   }
                }
              }
            }
          } else {
            if (hatEl) hatEl.style.opacity = '0';
            lastImageDataRef.current = null;
          }
        });

        // @ts-ignore
        const camera = new Camera(videoElement, {
          onFrame: async () => {
            await faceMesh.send({ image: videoElement });
          },
          width: 1280,
          height: 720
        });
        camera.start();
        console.log('[Camera] 摄像头与 Face Mesh 初始化成功');
      } else {
        console.warn('[Camera] MediaPipe 库未完全加载，使用占位模式');
      }
    } catch (e) {
      console.warn('[Camera] 初始化失败 (可能是环境不支持或缺少权限):', e);
    }
  }, []);

  return (
    <div className="fixed inset-0 z-0">
      <video
        ref={videoRef}
        className="w-full h-full object-cover transform -scale-x-100"
        playsInline
        autoPlay
        muted
      ></video>
    </div>
  );
};

export default CameraOverlay;
