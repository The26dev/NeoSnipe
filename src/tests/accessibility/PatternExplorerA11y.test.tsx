import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../theme';
import { DiscoveryInterface } from '../../components/token-discovery/DiscoveryInterface';
import { PatternDisplay } from '../../components/sacred-geometry/PatternDisplay';
import { PatternControls } from '../../components/sacred-geometry/PatternControls';

expect.extend(toHaveNoViolations);

describe('Pattern Explorer Accessibility', () => {
  const renderWithTheme = (component: React.ReactElement) => {
    return render(
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    );
  };

  test('DiscoveryInterface meets WCAG 2.1 requirements', async () => {
    const { container } = renderWithTheme(<DiscoveryInterface />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('Pattern visualization components are keyboard navigable', () => {
    renderWithTheme(
      <DiscoveryInterface />
    );

    const searchInput = screen.getByLabelText('Search for tokens');
    expect(searchInput).toHaveFocus();

    // Verify skip link
    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toBeInTheDocument();
    
    // Verify ARIA roles
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  test('Pattern controls meet accessibility standards', () => {
    renderWithTheme(
      <PatternControls
        patternType="flowerOfLife"
        scale={1}
        rotation={0}
        animate={true}
        onPatternTypeChange={() => {}}
        onScaleChange={() => {}}
        onRotationChange={() => {}}
        onAnimateChange={() => {}}
      />
    );

    // Verify form controls are properly labeled
    expect(screen.getByLabelText('Pattern Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Pattern scale')).toBeInTheDocument();
    expect(screen.getByLabelText('Pattern rotation')).toBeInTheDocument();
    expect(screen.getByLabelText('Animate Pattern')).toBeInTheDocument();
  });

  test('Pattern display provides appropriate ARIA attributes', () => {
    const mockPattern = {
      type: 'flowerOfLife',
      metrics: {
        harmonicResonance: 0.95,
        symmetry: 1.0,
        complexity: 1.2,
        ratios: [1.618]
      },
      visualization: {
        vertices: [0, 0],
        indices: [0],
        textureCoords: [0, 0]
      },
      shaderConfig: {
        vertexShader: '',
        fragmentShader: '',
        uniforms: {}
      }
    };

    renderWithTheme(
      <PatternDisplay
        pattern={mockPattern}
        performanceMetrics={{ fps: 60, frameTime: 16, memoryUsage: 0 }}
      />
    );

    expect(screen.getByText('Harmony: 95%')).toHaveAttribute('aria-label');
    expect(screen.getByText('FPS: 60')).toBeInTheDocument();
  });

  test('Color contrast meets WCAG requirements', () => {
    const { container } = renderWithTheme(<DiscoveryInterface />);
    
    const styles = window.getComputedStyle(container);
    const backgroundColor = styles.backgroundColor;
    const textColor = styles.color;
    
    // Use WCAG contrast ratio formula
    const contrastRatio = getContrastRatio(backgroundColor, textColor);
    expect(contrastRatio).toBeGreaterThanOrEqual(4.5); // WCAG AA standard
  });
});

// Helper function to calculate contrast ratio
function getContrastRatio(background: string, foreground: string): number {
  const bg = getRGBValues(background);
  const fg = getRGBValues(foreground);
  
  const bgLuminance = getRelativeLuminance(bg);
  const fgLuminance = getRelativeLuminance(fg);
  
  const lighter = Math.max(bgLuminance, fgLuminance);
  const darker = Math.min(bgLuminance, fgLuminance);
  
  return (lighter + 0.05) / (darker + 0.05);
}

function getRGBValues(color: string): number[] {
  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return [0, 0, 0];
  return [
    parseInt(match[1], 10),
    parseInt(match[2], 10),
    parseInt(match[3], 10)
  ];
}

function getRelativeLuminance([r, g, b]: number[]): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}