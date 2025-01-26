import React, { useEffect, useRef, useMemo } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { GeometryPattern, PatternType } from '../../types/sacred-geometry';
import { PatternRecognition } from '../../shaders/pattern_recognition';
import { usePatternAnimation } from '../../hooks/usePatternAnimation';
import { SACRED_PROPORTIONS } from '../../utils/sacred-geometry/geometry';

interface PatternDisplayProps {
  pattern: GeometryPattern;
  performanceMetrics?: {
    fps: number;
    frameTime: number;
    memoryUsage: number;
  };
  animate?: boolean;
  size?: number;
}

export const PatternDisplay: React.FC<PatternDisplayProps> = ({
  pattern,
  performanceMetrics,
  animate = true,
  size = 400
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const patternRef = useRef<PatternRecognition | null>(null);
  const theme = useTheme();

  const config = useMemo(() => ({
    canvas: canvasRef.current!,
    width: size,
    height: size
  }), [size]);

  const { startAnimation, stopAnimation } = usePatternAnimation({
    onFrame: (time) => {
      if (patternRef.current) {
        patternRef.current.render(time);
      }
    },
    fps: 60
  });

  useEffect(() => {
    if (canvasRef.current && pattern) {
      // Initialize pattern recognition
      patternRef.current = new PatternRecognition(config);

      // Start animation if enabled
      if (animate) {
        startAnimation();
      }

      return () => {
        stopAnimation();
        if (patternRef.current) {
          patternRef.current.destroy();
        }
      };
    }
  }, [config, pattern, animate, startAnimation, stopAnimation]);

  return (
    <Box 
      sx={{
        position: 'relative',
        width: size,
        height: size,
        bgcolor: 'background.paper',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: 3
      }}
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{
          width: '100%',
          height: '100%'
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white'
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          {pattern.type.charAt(0).toUpperCase() + pattern.type.slice(1)}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption">
            Harmony: {Math.round(pattern.metrics.harmonicResonance * 100)}%
          </Typography>
          <Typography variant="caption">
            Symmetry: {Math.round(pattern.metrics.symmetry * 100)}%
          </Typography>
          <Typography variant="caption">
            Complexity: {pattern.metrics.complexity.toFixed(2)}
          </Typography>
        </Box>

        {performanceMetrics && (
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption">
              FPS: {Math.round(performanceMetrics.fps)}
            </Typography>
            <Typography variant="caption">
              Frame: {Math.round(performanceMetrics.frameTime)}ms
            </Typography>
          </Box>
        )}
      </Box>

      {!pattern && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.paper'
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};