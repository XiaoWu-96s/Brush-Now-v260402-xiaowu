import React, { useEffect, useRef } from "react";

export const CameraLayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    console.log("[Camera] 正在初始化前置摄像头...");
    const videoElement = videoRef.current;
    if (!videoElement) return;

    try {
      if (
        typeof (window as any).FaceMesh !== "undefined" &&
        typeof (window as any).Camera !== "undefined"
      ) {
        const faceMesh = new (window as any).FaceMesh({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
          },
        });
        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        faceMesh.onResults(() => {
          // 面部关键点处理逻辑（预留）
        });

        const camera = new (window as any).Camera(videoElement, {
          onFrame: async () => {
            await faceMesh.send({ image: videoElement });
          },
          width: 1280,
          height: 720,
        });
        camera.start();
        console.log("[Camera] 摄像头与 Face Mesh 初始化成功");
      } else {
        console.warn("[Camera] MediaPipe 库未完全加载，使用占位模式");
      }
    } catch (e) {
      console.warn("[Camera] 初始化失败 (可能是环境不支持或缺少权限):", e);
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
