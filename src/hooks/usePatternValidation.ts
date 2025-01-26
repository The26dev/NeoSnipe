import { useState, useCallback } from 'react';
import { PatternAnalysis } from './usePatternRecognition';
import { PATTERN_THRESHOLDS } from '../shared/constants';

interface ValidationResult {
    isValid: boolean;
    confidence: number;
    warnings: string[];
    errors: string[];
}

export const usePatternValidation = () => {
    const [validationResults, setValidationResults] = useState<ValidationResult | null>(null);

    const validatePattern = useCallback((pattern: PatternAnalysis): ValidationResult => {
        const warnings: string[] = [];
        const errors: string[] = [];

        // Check confidence threshold
        if (pattern.confidence < PATTERN_THRESHOLDS.CONFIDENCE_THRESHOLD) {
            warnings.push(`Low confidence pattern detected (${pattern.confidence.toFixed(2)})`);
        }

        // Check probability
        if (pattern.probability < 0.5) {
            warnings.push(`Low probability pattern (${pattern.probability.toFixed(2)})`);
        }

        // Validate geometric ratios
        const hasSignificantRatios = pattern.geometricRatios.some(
            ratio => ratio.significance > PATTERN_THRESHOLDS.SIGNIFICANCE_THRESHOLD
        );

        if (!hasSignificantRatios) {
            errors.push('No significant geometric ratios found');
        }

        // Calculate overall validation confidence
        const confidence = calculateValidationConfidence(pattern, warnings.length, errors.length);

        const result = {
            isValid: errors.length === 0 && confidence >= PATTERN_THRESHOLDS.CONFIDENCE_THRESHOLD,
            confidence,
            warnings,
            errors
        };

        setValidationResults(result);
        return result;
    }, []);

    const calculateValidationConfidence = (
        pattern: PatternAnalysis,
        warningCount: number,
        errorCount: number
    ): number => {
        let confidence = pattern.confidence;

        // Reduce confidence based on warnings and errors
        confidence *= (1 - (warningCount * 0.1));
        confidence *= (1 - (errorCount * 0.3));

        // Factor in geometric ratio significance
        const avgSignificance = pattern.geometricRatios.reduce(
            (sum, ratio) => sum + ratio.significance, 0
        ) / pattern.geometricRatios.length;

        confidence *= (avgSignificance + 1) / 2;

        return Math.max(0, Math.min(1, confidence));
    };

    return {
        validationResults,
        validatePattern
    };
};