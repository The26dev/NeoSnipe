import React, { useEffect, useRef } from 'react';
import { useSacredGeometry } from './SacredGeometryProvider';
import { useTheme } from '@/hooks/useTheme';
import { useWindowSize } from '@/hooks/useWindowSize';

interface AnimatedBackgroundProps {
  pattern?: string;
  intensity?: number;
  colorOverride?: string;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  pattern = 'flowerOfLife',
  intensity = 1.0,
  colorOverride
}) => {
  const { flowerAnimation, renderer } = useSacredGeometry();
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const { width, height } = useWindowSize();

  // Apply theme colors
  useEffect(() => {
    if (renderer && flowerAnimation) {
      const color = colorOverride || theme.colors.primary;
      renderer.setColorPalette([color]);
      
      flowerAnimation.setConfig({
        energyFlow: true,
        harmonicResonance: true,
        transformations: ['spiral', 'golden'],
        renderQuality: 'high',
        optimizationLevel: 'balanced'
      });
    }
  }, [renderer, flowerAnimation, theme, colorOverride]);

  // Handle resize
  useEffect(() => {
    if (renderer) {
      renderer.resize(width, height);
    }
  }, [width, height, renderer]);

  // Handle mouse interaction
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !renderer) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      renderer.updateInteraction(x, y);
    };

    container.addEventListener('mousemove', handleMouseMove);
    return () => container.removeEventListener('mousemove', handleMouseMove);
  }, [renderer]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 w-full h-full z-0"
      style={{ 
        background: theme.colors.background,
        opacity: 0.8,
        transition: 'opacity 0.3s ease-in-out'
      }}
      role="presentation"
      aria-hidden="true"
    />
  );
};