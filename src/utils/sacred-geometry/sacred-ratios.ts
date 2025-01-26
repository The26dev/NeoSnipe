import { GeometryData, GeometricRatio } from '../../types/sacred-geometry';
import { PHI, SQRT_PHI, TAU } from './geometry';

export const SACRED_RATIOS = {
    PHI,
    SQRT_PHI,
    PI: Math.PI,
    TAU,
    SQRT_3: Math.sqrt(3),
    SQRT_5: Math.sqrt(5)
};

export const calculateSacredRatios = (points: number[]): GeometricRatio[] => {
    const ratios: GeometricRatio[] = [];
    
    // Calculate Phi-based ratios
    for (let i = 1; i < points.length; i++) {
        const current = points[i];
        const previous = points[i - 1];
        const ratio = current / previous;
        
        // Check alignment with sacred ratios
        const phiAlignment = Math.abs(ratio - PHI);
        const sqrtPhiAlignment = Math.abs(ratio - SQRT_PHI);
        const piAlignment = Math.abs(ratio - Math.PI);
        
        ratios.push({
            ratio,
            significance: calculateSignificance(phiAlignment, sqrtPhiAlignment, piAlignment),
            type: determineSacredRatioType(ratio)
        });
    }
    
    return ratios;
};

const calculateSignificance = (phiAlign: number, sqrtPhiAlign: number, piAlign: number): number => {
    const minAlignment = Math.min(phiAlign, sqrtPhiAlign, piAlign);
    const tolerance = 0.1;
    return Math.max(0, 1 - (minAlignment / tolerance));
};

const determineSacredRatioType = (ratio: number): string => {
    const tolerance = 0.1;
    
    if (Math.abs(ratio - PHI) <= tolerance) return 'phi';
    if (Math.abs(ratio - SQRT_PHI) <= tolerance) return 'sqrt_phi';
    if (Math.abs(ratio - Math.PI) <= tolerance) return 'pi';
    if (Math.abs(ratio - TAU) <= tolerance) return 'tau';
    
    return 'other';
};