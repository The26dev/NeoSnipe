import { useCallback, useRef, useEffect } from 'react';

interface PatternAnimationOptions {
  onFrame: (time: number) => void;
  fps?: number;
}

export const usePatternAnimation = ({ onFrame, fps = 60 }: PatternAnimationOptions) => {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const isRunningRef = useRef(false);
  const fpsInterval = 1000 / fps;

  const animate = useCallback((currentTime: number) => {
    if (previousTimeRef.current === undefined) {
      previousTimeRef.current = currentTime;
    }

    const elapsed = currentTime - previousTimeRef.current;

    if (elapsed > fpsInterval) {
      onFrame(currentTime / 1000); // Convert to seconds
      previousTimeRef.current = currentTime - (elapsed % fpsInterval);
    }

    if (isRunningRef.current) {
      requestRef.current = requestAnimationFrame(animate);
    }
  }, [fpsInterval, onFrame]);

  const startAnimation = useCallback(() => {
    if (!isRunningRef.current) {
      isRunningRef.current = true;
      requestRef.current = requestAnimationFrame(animate);
    }
  }, [animate]);

  const stopAnimation = useCallback(() => {
    isRunningRef.current = false;
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    previousTimeRef.current = undefined;
  }, []);

  useEffect(() => {
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  return { startAnimation, stopAnimation };
};