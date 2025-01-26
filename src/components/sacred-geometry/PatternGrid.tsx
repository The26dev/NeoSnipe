import React from 'react';
import { Box, Grid, Paper, useTheme } from '@mui/material';
import { PatternDisplay } from './PatternDisplay';
import { GeometryPattern } from '../../types/sacred-geometry';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';

interface PatternGridProps {
  patterns: GeometryPattern[];
  onPatternSelect?: (pattern: GeometryPattern) => void;
  selectedPattern?: GeometryPattern;
  gridSize?: number;
  spacing?: number;
}

export const PatternGrid: React.FC<PatternGridProps> = ({
  patterns,
  onPatternSelect,
  selectedPattern,
  gridSize = 3,
  spacing = 2
}) => {
  const theme = useTheme();
  const { metrics } = usePerformanceMonitor();

  return (
    <Grid container spacing={spacing}>
      {patterns.map((pattern, index) => (
        <Grid item xs={12} sm={6} md={12 / gridSize} key={`${pattern.type}-${index}`}>
          <Paper
            elevation={selectedPattern?.type === pattern.type ? 8 : 2}
            sx={{
              cursor: 'pointer',
              transition: 'all 0.3s ease-in-out',
              transform: selectedPattern?.type === pattern.type ? 'scale(1.02)' : 'scale(1)',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: theme.shadows[8]
              }
            }}
            onClick={() => onPatternSelect?.(pattern)}
          >
            <Box sx={{ p: 2 }}>
              <PatternDisplay
                pattern={pattern}
                performanceMetrics={metrics}
                animate={selectedPattern?.type === pattern.type}
                size={200}
              />
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};