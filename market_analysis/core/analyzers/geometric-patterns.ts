import { GeometricRatio, WaveCycleAnalysis, HarmonicPattern } from './pattern-types';

export class GeometricPatternAnalyzer {
    private readonly PHI = 1.618033988749895;  // Golden ratio
    private readonly FIBONACCI_LEVELS = [0.236, 0.382, 0.500, 0.618, 0.786, 1.000, 1.618, 2.618];

    public detectHarmonicPatterns(ratios: number[]): { probability: number; patterns: HarmonicPattern[] } {
        const patterns: HarmonicPattern[] = [];
        let totalProbability = 0;

        // Check for Gartley Pattern
        const gartleyProb = this.checkGartleyPattern(ratios);
        if (gartleyProb > 0.7) {
            patterns.push({
                name: 'Gartley',
                probability: gartleyProb,
                pivotPoints: this.calculatePivotPoints(ratios)
            });
            totalProbability = Math.max(totalProbability, gartleyProb);
        }

        // Check for Butterfly Pattern
        const butterflyProb = this.checkButterflyPattern(ratios);
        if (butterflyProb > 0.7) {
            patterns.push({
                name: 'Butterfly',
                probability: butterflyProb,
                pivotPoints: this.calculatePivotPoints(ratios)
            });
            totalProbability = Math.max(totalProbability, butterflyProb);
        }

        return {
            probability: totalProbability,
            patterns
        };
    }

    public analyzeWaveCycles(ratios: number[]): WaveCycleAnalysis {
        const waves = this.identifyWaves(ratios);
        const completeness = this.calculateWaveCompleteness(waves);
        
        return {
            probability: completeness,
            waveCount: waves.length,
            isComplete: completeness > 0.8,
            currentWave: waves.length % 5 || 5
        };
    }

    private checkGartleyPattern(ratios: number[]): number {
        if (ratios.length < 4) return 0;
        
        const [ab, bc, cd] = ratios.slice(-3);
        const abFib = this.closestFibLevel(ab);
        const bcFib = this.closestFibLevel(bc);
        const cdFib = this.closestFibLevel(cd);

        // Gartley pattern typical ratios: AB=0.618, BC=0.382, CD=1.272
        const abMatch = Math.abs(abFib - 0.618) < 0.05;
        const bcMatch = Math.abs(bcFib - 0.382) < 0.05;
        const cdMatch = Math.abs(cdFib - 1.272) < 0.05;

        return (abMatch && bcMatch && cdMatch) ? 0.9 : 0;
    }

    private checkButterflyPattern(ratios: number[]): number {
        if (ratios.length < 4) return 0;
        
        const [ab, bc, cd] = ratios.slice(-3);
        const abFib = this.closestFibLevel(ab);
        const bcFib = this.closestFibLevel(bc);
        const cdFib = this.closestFibLevel(cd);

        // Butterfly pattern typical ratios: AB=0.786, BC=0.382, CD=1.618
        const abMatch = Math.abs(abFib - 0.786) < 0.05;
        const bcMatch = Math.abs(bcFib - 0.382) < 0.05;
        const cdMatch = Math.abs(cdFib - 1.618) < 0.05;

        return (abMatch && bcMatch && cdMatch) ? 0.9 : 0;
    }

    private closestFibLevel(ratio: number): number {
        return this.FIBONACCI_LEVELS.reduce((prev, curr) =>
            Math.abs(curr - ratio) < Math.abs(prev - ratio) ? curr : prev
        );
    }

    private calculatePivotPoints(ratios: number[]): number[] {
        return ratios.map((ratio, index) => {
            const baseline = 100;
            return baseline * ratio * (index + 1);
        });
    }

    private identifyWaves(ratios: number[]): number[] {
        const waves: number[] = [];
        let currentTrend = 0;
        
        for (let i = 1; i < ratios.length; i++) {
            const change = ratios[i] - ratios[i - 1];
            if (Math.abs(change) > 0.01) {
                if (currentTrend === 0 || 
                    (currentTrend > 0 && change < 0) || 
                    (currentTrend < 0 && change > 0)) {
                    waves.push(ratios[i]);
                    currentTrend = change;
                }
            }
        }
        
        return waves;
    }

    private calculateWaveCompleteness(waves: number[]): number {
        const idealWaveCount = 5; // Elliott Wave principle
        const actualWaves = waves.length;
        
        if (actualWaves === 0) return 0;
        if (actualWaves >= idealWaveCount) return 1;
        
        return actualWaves / idealWaveCount;
    }
}