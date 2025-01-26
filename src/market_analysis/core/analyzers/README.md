# Pattern Recognition Module

## Overview
This module implements advanced market pattern detection algorithms including Fibonacci retracements and harmonic patterns. It includes performance optimizations and caching mechanisms for efficient analysis.

## Features
- Fibonacci pattern detection with extended levels
- Harmonic pattern recognition (Gartley, Butterfly, Bat, Crab)
- Pattern validation with confidence scoring
- Performance optimization with caching
- Parallel pattern detection
- Error handling and input validation

## Performance Optimizations
- Caching of recent calculations (5-second cache)
- Parallel pattern detection using Promise.all
- Automatic cache cleanup every 5 minutes
- Performance metrics tracking

## Usage
```typescript
const analyzer = new PatternRecognition();
const patterns = await analyzer.analyzePrice(priceHistory);
```

## Pattern Types
1. Fibonacci Retracements
   - Levels: 0, 0.236, 0.382, 0.5, 0.618, 0.786, 1, 1.618, 2.618
   - Confidence calculation based on price proximity
   - Strength calculation using volume and momentum

2. Harmonic Patterns
   - Gartley (XABCD)
   - Butterfly
   - Bat
   - Crab
   - Pattern validation using ratio analysis

3. Moving Average Crosses
   - Golden Cross
   - Death Cross