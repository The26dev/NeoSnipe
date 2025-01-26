import { PatternAnalysisResult, GeometricRatio } from './pattern-types';
import { PATTERN_THRESHOLDS } from '../../src/shared/constants';

export class PatternValidator {
    public validatePattern(result: PatternAnalysisResult): ValidationResult {
        const warnings: string[] = [];
        const errors: string[] = [];

        // Validate confidence
        if (result.confidence < PATTERN_THRESHOLDS.CONFIDENCE_THRESHOLD) {
            warnings.push(`Low confidence pattern (${result.confidence.toFixed(2)})`);
        }

        // Validate probability
        if (result.pattern.probability < 0.5) {
            warnings.push(`Low probability pattern (${result.pattern.probability.toFixed(2)})`);
        }

        // Validate geometric ratios
        this.validateGeometricRatios(result.geometricRatios, warnings, errors);

        // Calculate final confidence score
        const validationConfidence = this.calculateValidationConfidence(
            result.pattern.probability,
            result.confidence,
            warnings.length,
            errors.length
        );

        return {
            isValid: errors.length === 0 && validationConfidence >= PATTERN_THRESHOLDS.CONFIDENCE_THRESHOLD,
            confidence: validationConfidence,
            warnings,
            errors
        };
    }

    private validateGeometricRatios(ratios: GeometricRatio[], warnings: string[], errors: string[]): void {
        if (!ratios || ratios.length === 0) {
            errors.push('No geometric ratios found');
            return;
        }

        const significantRatios = ratios.filter(r => r.significance > PATTERN_THRESHOLDS.SIGNIFICANCE_THRESHOLD);
        
        if (significantRatios.length === 0) {
            errors.push('No significant geometric ratios found');
            return;
        }

        if (significantRatios.length < ratios.length * 0.3) {
            warnings.push('Low ratio of significant geometric patterns');
        }

        // Check for golden ratio alignments
        const goldenRatioCount = ratios.filter(r => 
            Math.abs(r.ratio - 1.618033988749895) < PATTERN_THRESHOLDS.GOLDEN_RATIO_TOLERANCE
        ).length;

        if (goldenRatioCount === 0) {
            warnings.push('No golden ratio alignments found');
        }
    }

    private calculateValidationConfidence(
        probability: number,
        baseConfidence: number,
        warningCount: number,
        errorCount: number
    ): number {
        let confidence = (probability + baseConfidence) / 2;

        // Reduce confidence based on warnings and errors
        confidence *= (1 - (warningCount * 0.1));
        confidence *= (1 - (errorCount * 0.3));

        return Math.max(0, Math.min(1, confidence));
    }
}

export interface ValidationResult {
    isValid: boolean;
    confidence: number;
    warnings: string[];
    errors: string[];
}