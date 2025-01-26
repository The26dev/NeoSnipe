import { PatternRecognizer } from '../../market_analysis/core/analyzers/pattern_recognition';
import { GeometricPatternAnalyzer } from '../../market_analysis/core/analyzers/geometric-patterns';
import { PatternValidator } from '../../market_analysis/core/analyzers/pattern-validation';
import { PATTERN_THRESHOLDS } from '../shared/constants';

describe('Pattern Recognition System', () => {
    let recognizer: PatternRecognizer;
    let validator: PatternValidator;

    beforeEach(() => {
        recognizer = new PatternRecognizer();
        validator = new PatternValidator();
    });

    afterEach(() => {
        recognizer.cleanup();
    });

    describe('Pattern Detection', () => {
        test('should detect Gartley pattern with correct ratios', async () => {
            const priceData = [100, 161.8, 61.8, 38.2, 127.2]; // Gartley pattern ratios
            const result = await recognizer.analyzePattern(priceData);
            
            expect(result.pattern.type).toBe('Gartley');
            expect(result.pattern.probability).toBeGreaterThan(0.7);
            expect(result.confidence).toBeGreaterThan(PATTERN_THRESHOLDS.CONFIDENCE_THRESHOLD);
        });

        test('should detect Butterfly pattern with correct ratios', async () => {
            const priceData = [100, 178.6, 38.2, 88.6, 161.8]; // Butterfly pattern ratios
            const result = await recognizer.analyzePattern(priceData);
            
            expect(result.pattern.type).toBe('Butterfly');
            expect(result.pattern.probability).toBeGreaterThan(0.7);
            expect(result.confidence).toBeGreaterThan(PATTERN_THRESHOLDS.CONFIDENCE_THRESHOLD);
        });

        test('should identify wave patterns correctly', async () => {
            const priceData = [100, 120, 90, 140, 110, 160]; // 5-wave pattern
            const result = await recognizer.analyzePattern(priceData);
            
            expect(result.pattern.type).toBe('Elliott Wave');
            expect(result.confidence).toBeGreaterThan(0.6);
        });

        test('should handle invalid or insufficient data', async () => {
            const invalidData = [100];
            const result = await recognizer.analyzePattern(invalidData);
            
            expect(result.pattern.type).toBe('No Significant Pattern');
            expect(result.confidence).toBeLessThan(PATTERN_THRESHOLDS.CONFIDENCE_THRESHOLD);
        });
    });

    describe('Pattern Validation', () => {
        test('should validate high-confidence patterns', async () => {
            const priceData = [100, 161.8, 61.8, 38.2, 127.2];
            const result = await recognizer.analyzePattern(priceData);
            const validation = validator.validatePattern(result);
            
            expect(validation.isValid).toBe(true);
            expect(validation.warnings).toHaveLength(0);
            expect(validation.errors).toHaveLength(0);
        });

        test('should identify low-confidence patterns', async () => {
            const priceData = [100, 150, 120, 140, 130]; // Non-geometric ratios
            const result = await recognizer.analyzePattern(priceData);
            const validation = validator.validatePattern(result);
            
            expect(validation.isValid).toBe(false);
            expect(validation.warnings.length).toBeGreaterThan(0);
        });
    });

    describe('Historical Accuracy', () => {
        test('should track pattern accuracy correctly', async () => {
            const priceData = [100, 161.8, 61.8, 38.2, 127.2];
            const result = await recognizer.analyzePattern(priceData);
            
            recognizer.updatePatternAccuracy(result.pattern.type, true);
            recognizer.updatePatternAccuracy(result.pattern.type, true);
            recognizer.updatePatternAccuracy(result.pattern.type, false);
            
            const accuracy = recognizer['getHistoricalAccuracy'](result.pattern.type);
            expect(accuracy).toBe(2/3);
        });
    });
});