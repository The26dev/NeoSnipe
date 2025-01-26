import React, { useEffect, useRef, useMemo } from 'react';
import { Pattern, PatternType } from '../../types/market-types';
import { useWebGL } from '../../hooks/useWebGL';
import { createShader, createProgram } from '../../utils/webgl/shader-utils';
import { VERTEX_SHADER, FRAGMENT_SHADER } from '../../shaders/pattern-visualization';

interface Props {
    patterns: Pattern[];
    width: number;
    height: number;
    priceData: number[];
    onRenderComplete?: () => void;
}

export const PatternVisualization: React.FC<Props> = ({
    patterns,
    width,
    height,
    priceData,
    onRenderComplete
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { gl, initialized } = useWebGL(canvasRef);
    
    const program = useMemo(() => {
        if (!gl || !initialized) return null;
        
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
        
        if (!vertexShader || !fragmentShader) {
            console.error('Failed to create shaders');
            return null;
        }
        
        const prog = createProgram(gl, vertexShader, fragmentShader);
        if (!prog) {
            console.error('Failed to create program');
            return null;
        }
        
        return prog;
    }, [gl, initialized]);

    useEffect(() => {
        if (!gl || !program || !canvasRef.current) return;

        try {
            // Set up geometry and attributes
            const positions = new Float32Array(priceData);
            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

            // Set up pattern markers
            const patternMarkers = new Float32Array(patterns.flatMap(p => [
                p.startIndex / priceData.length,
                p.endIndex / priceData.length,
                p.type === PatternType.GOLDEN_SPIRAL ? 1.0 : 0.0
            ]));
            
            const markerBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, markerBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, patternMarkers, gl.STATIC_DRAW);

            // Set up uniforms
            const timeLocation = gl.getUniformLocation(program, 'u_time');
            const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');

            gl.useProgram(program);
            gl.uniform2f(resolutionLocation, width, height);
            gl.uniform1f(timeLocation, performance.now() / 1000.0);

            // Draw
            gl.viewport(0, 0, width, height);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.POINTS, 0, priceData.length);

            onRenderComplete?.();

        } catch (error) {
            console.error('Visualization render failed:', error);
        }

        // Cleanup
        return () => {
            if (gl && program) {
                gl.deleteProgram(program);
            }
        };
    }, [gl, program, patterns, priceData, width, height, onRenderComplete]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{ width: '100%', height: '100%' }}
            aria-label="Pattern visualization"
        />
    );
};