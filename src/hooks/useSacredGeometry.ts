import { useContext, useCallback, useEffect } from 'react';
import { SacredGeometryContext } from '@/components/sacred-geometry/SacredGeometryProvider';
import { AnimationConfig, PatternConfig } from '@/types/sacred-geometry/types';

export const useSacredGeometry = () => {
  const context = useContext(SacredGeometryContext);

  const updatePattern = useCallback((pattern: string, config: Partial<PatternConfig> = {}) => {
    if (!context.renderer) return;
    
    try {
      context.renderer.updatePattern(pattern, config);
    } catch (error) {
      console.error('Failed to update pattern:', error);
    }
  }, [context.renderer]);

  const updateAnimation = useCallback((config: Partial<AnimationConfig>) => {
    if (!context.flowerAnimation) return;
    
    try {
      context.flowerAnimation.setConfig(config);
    } catch (error) {
      console.error('Failed to update animation:', error);
    }
  }, [context.flowerAnimation]);

  const pause = useCallback(() => {
    if (context.flowerAnimation) {
      context.flowerAnimation.pause();
    }
  }, [context.flowerAnimation]);

  const resume = useCallback(() => {
    if (context.flowerAnimation) {
      context.flowerAnimation.resume();
    }
  }, [context.flowerAnimation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (context.flowerAnimation) {
        context.flowerAnimation.dispose();
      }
      if (context.renderer) {
        context.renderer.dispose();
      }
    };
  }, [context.flowerAnimation, context.renderer]);

  return {
    ...context,
    updatePattern,
    updateAnimation,
    pause,
    resume,
  };
};

export default useSacredGeometry;