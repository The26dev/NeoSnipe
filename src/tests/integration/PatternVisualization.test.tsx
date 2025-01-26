import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../theme';
import { PatternDisplay } from '../../components/sacred-geometry/PatternDisplay';
import { PatternGrid } from '../../components/sacred-geometry/PatternGrid';
import { PatternControls } from '../../components/sacred-geometry/PatternControls';
import { generatePattern } from '../../utils/sacred-geometry/patterns';

describe('Pattern Visualization Integration', () => {
  const mockPattern = generatePattern('flowerOfLife');
  
  beforeAll(() => {
    // Mock WebGL context
    const mockContext = {
      createProgram: jest.fn(() => 1),
      createShader: jest.fn(() => 1),
      shaderSource: jest.fn(),
      compileShader: jest.fn(),
      attachShader: jest.fn(),
      linkProgram: jest.fn(),
      useProgram: jest.fn(),
      createBuffer: jest.fn(),
      bindBuffer: jest.fn(),
      bufferData: jest.fn(),
      getAttribLocation: jest.fn(() => 0),
      enableVertexAttribArray: jest.fn(),
      getUniformLocation: jest.fn(),
      uniform1f: jest.fn(),
    };

    HTMLCanvasElement.prototype.getContext = jest.fn(() => mockContext);
  });

  const renderWithTheme = (component: React.ReactElement) => {
    return render(
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    );
  };

  describe('PatternDisplay Integration', () => {
    test('renders pattern with metrics and performance data', async () => {
      const mockMetrics = {
        fps: 60,
        frameTime: 16.67,
        memoryUsage: 50000000
      };

      renderWithTheme(
        <PatternDisplay
          pattern={mockPattern}
          performanceMetrics={mockMetrics}
          animate={true}
        />
      );

      expect(screen.getByText('Flower of Life')).toBeInTheDocument();
      expect(screen.getByText('Harmony: 95%')).toBeInTheDocument();
      expect(screen.getByText('FPS: 60')).toBeInTheDocument();
    });

    test('handles pattern updates correctly', async () => {
      const { rerender } = renderWithTheme(
        <PatternDisplay pattern={mockPattern} animate={false} />
      );

      const newPattern = generatePattern('metatronsCube');
      rerender(
        <ThemeProvider theme={theme}>
          <PatternDisplay pattern={newPattern} animate={false} />
        </ThemeProvider>
      );

      expect(screen.getByText('Metatron\'s Cube')).toBeInTheDocument();
    });
  });

  describe('PatternGrid Integration', () => {
    const patterns = [
      generatePattern('flowerOfLife'),
      generatePattern('metatronsCube'),
      generatePattern('vesicaPiscis')
    ];

    test('renders multiple patterns in grid layout', () => {
      const handleSelect = jest.fn();
      
      renderWithTheme(
        <PatternGrid
          patterns={patterns}
          onPatternSelect={handleSelect}
          gridSize={3}
          spacing={2}
        />
      );

      expect(screen.getAllByText('Harmony:')).toHaveLength(patterns.length);
    });

    test('handles pattern selection', () => {
      const handleSelect = jest.fn();
      
      renderWithTheme(
        <PatternGrid
          patterns={patterns}
          onPatternSelect={handleSelect}
          gridSize={3}
          spacing={2}
        />
      );

      const firstPattern = screen.getAllByText('Flower of Life')[0];
      fireEvent.click(firstPattern.parentElement!.parentElement!);
      
      expect(handleSelect).toHaveBeenCalledWith(patterns[0]);
    });
  });

  describe('PatternControls Integration', () => {
    const defaultProps = {
      patternType: 'flowerOfLife' as const,
      scale: 1,
      rotation: 0,
      animate: true,
      onPatternTypeChange: jest.fn(),
      onScaleChange: jest.fn(),
      onRotationChange: jest.fn(),
      onAnimateChange: jest.fn()
    };

    test('updates pattern type selection', () => {
      renderWithTheme(<PatternControls {...defaultProps} />);
      
      const select = screen.getByLabelText('Pattern Type');
      fireEvent.mouseDown(select);
      
      const metatronOption = screen.getByText('Metatron\'s Cube');
      fireEvent.click(metatronOption);
      
      expect(defaultProps.onPatternTypeChange).toHaveBeenCalled();
    });

    test('handles scale and rotation changes', () => {
      renderWithTheme(<PatternControls {...defaultProps} />);
      
      const scaleSlider = screen.getByLabelText('Pattern scale');
      fireEvent.change(scaleSlider, { target: { value: 1.5 } });
      
      const rotationSlider = screen.getByLabelText('Pattern rotation');
      fireEvent.change(rotationSlider, { target: { value: 90 } });
      
      expect(defaultProps.onScaleChange).toHaveBeenCalled();
      expect(defaultProps.onRotationChange).toHaveBeenCalled();
    });

    test('toggles animation state', () => {
      renderWithTheme(<PatternControls {...defaultProps} />);
      
      const animateSwitch = screen.getByRole('checkbox', { name: 'Animate Pattern' });
      fireEvent.click(animateSwitch);
      
      expect(defaultProps.onAnimateChange).toHaveBeenCalledWith(false);
    });
  });
});