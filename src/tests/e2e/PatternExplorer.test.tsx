import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../theme';
import { DiscoveryInterface } from '../../components/token-discovery/DiscoveryInterface';

jest.mock('../../hooks/useTokenScanner');
jest.mock('../../hooks/usePatternRecognition');
jest.mock('../../hooks/usePerformanceMonitor');

describe('Pattern Explorer End-to-End', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock performance API
    global.performance.now = jest.fn(() => 1000);
  });

  const renderWithTheme = (component: React.ReactElement) => {
    return render(
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    );
  };

  test('complete pattern exploration workflow', async () => {
    renderWithTheme(<DiscoveryInterface />);

    // 1. Verify initial render
    expect(screen.getByText('Token Discovery Interface')).toBeInTheDocument();
    expect(screen.getByLabelText('Search for tokens')).toBeInTheDocument();

    // 2. Search for tokens
    const searchInput = screen.getByLabelText('Search for tokens');
    fireEvent.change(searchInput, { target: { value: 'test token' } });

    // 3. Wait for token results
    await screen.findByText('Loading tokens, please wait...');
    await waitForElementToBeRemoved(() => screen.getByText('Loading tokens, please wait...'));

    // 4. Select a token
    const firstToken = screen.getByText('Test Token');
    fireEvent.click(firstToken);

    // 5. Verify pattern analysis started
    expect(screen.getByText('Analyzing patterns...')).toBeInTheDocument();

    // 6. Wait for pattern analysis
    await waitForElementToBeRemoved(() => screen.getByText('Analyzing patterns...'));

    // 7. Verify pattern controls are available
    expect(screen.getByLabelText('Pattern Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Pattern scale')).toBeInTheDocument();
    expect(screen.getByLabelText('Pattern rotation')).toBeInTheDocument();

    // 8. Interact with pattern controls
    const patternSelect = screen.getByLabelText('Pattern Type');
    fireEvent.mouseDown(patternSelect);
    const metatronOption = screen.getByText('Metatron\'s Cube');
    fireEvent.click(metatronOption);

    // 9. Verify performance metrics
    expect(screen.getByText(/FPS:/)).toBeInTheDocument();
    expect(screen.getByText(/Frame Time:/)).toBeInTheDocument();

    // 10. Test error handling
    const errorButton = screen.getByRole('button', { name: 'Reset application state' });
    fireEvent.click(errorButton);
    
    // 11. Verify reset
    expect(screen.queryByText('Analyzing patterns...')).not.toBeInTheDocument();
  });

  test('handles WebGL context failures gracefully', async () => {
    // Mock WebGL context failure
    HTMLCanvasElement.prototype.getContext = jest.fn(() => null);

    renderWithTheme(<DiscoveryInterface />);

    // Search and select token
    const searchInput = screen.getByLabelText('Search for tokens');
    fireEvent.change(searchInput, { target: { value: 'test token' } });
    
    const firstToken = await screen.findByText('Test Token');
    fireEvent.click(firstToken);

    // Verify error handling
    expect(screen.getByText(/WebGL initialization failed/)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  test('maintains performance under load', async () => {
    renderWithTheme(<DiscoveryInterface />);

    // Generate multiple pattern changes
    const patternSelect = screen.getByLabelText('Pattern Type');
    
    for (let i = 0; i < 10; i++) {
      act(() => {
        fireEvent.mouseDown(patternSelect);
        const option = screen.getByText(i % 2 === 0 ? 'Metatron\'s Cube' : 'Flower of Life');
        fireEvent.click(option);
      });
    }

    // Verify performance metrics are still being updated
    const fpsText = await screen.findByText(/FPS:/);
    expect(fpsText).toBeInTheDocument();
    
    // Verify no memory leaks
    const memoryText = screen.getByText(/Memory Usage:/);
    const memory = parseInt(memoryText.textContent!.match(/\d+/)![0]);
    expect(memory).toBeLessThan(100); // MB
  });
});