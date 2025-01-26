import { GeometryPattern } from '../../types/sacred-geometry';
import { PHI, SQRT_PHI, TAU } from './geometry';

export const generatePentagram = (scale: number): GeometryPattern => {
    const vertices: number[] = [];
    const indices: number[] = [];
    const textureCoords: number[] = [];

    // Generate pentagram vertices
    for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5;
        const x = Math.cos(angle) * scale;
        const y = Math.sin(angle) * scale;
        vertices.push(x, y);
        textureCoords.push(0.5 + x/(2*scale), 0.5 + y/(2*scale));
    }

    // Generate pentagram indices (star pattern)
    indices.push(0, 2, 2, 4, 4, 1, 1, 3, 3, 0);

    return {
        type: 'pentagram',
        metrics: {
            symmetry: 1.0,
            complexity: 0.8,
            ratios: [PHI]
        },
        visualization: {
            vertices,
            indices,
            textureCoords
        },
        shaderConfig: {
            vertexShader: PENTAGRAM_VERTEX_SHADER,
            fragmentShader: PENTAGRAM_FRAGMENT_SHADER,
            uniforms: {
                uScale: scale,
                uRotation: 0,
                uTime: 0
            }
        }
    };
};

export const generateFibonacciSpiral = (scale: number): GeometryPattern => {
    const vertices: number[] = [];
    const indices: number[] = [];
    const textureCoords: number[] = [];

    // Generate Fibonacci spiral points
    let a = 0, b = 1;
    let angle = 0;
    for (let i = 0; i < 13; i++) {
        const radius = Math.sqrt(b) * scale * 0.1;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        vertices.push(x, y);
        textureCoords.push(0.5 + x/(2*scale), 0.5 + y/(2*scale));
        
        const temp = a + b;
        a = b;
        b = temp;
        angle += Math.PI / 2;
    }

    // Connect spiral points
    for (let i = 0; i < vertices.length/2 - 1; i++) {
        indices.push(i, i + 1);
    }

    return {
        type: 'fibonacci',
        metrics: {
            symmetry: 0.8,
            complexity: 0.9,
            ratios: [PHI, SQRT_PHI]
        },
        visualization: {
            vertices,
            indices,
            textureCoords
        },
        shaderConfig: {
            vertexShader: FIBONACCI_VERTEX_SHADER,
            fragmentShader: FIBONACCI_FRAGMENT_SHADER,
            uniforms: {
                uScale: scale,
                uRotation: 0,
                uTime: 0
            }
        }
    };
};

export const generateTorusPattern = (scale: number): GeometryPattern => {
    const vertices: number[] = [];
    const indices: number[] = [];
    const textureCoords: number[] = [];
    
    const majorRadius = scale * 0.7;
    const minorRadius = scale * 0.3;
    const segments = 32;
    const rings = 24;

    // Generate torus vertices
    for (let ring = 0; ring <= rings; ring++) {
        const theta = ring * TAU / rings;
        for (let segment = 0; segment <= segments; segment++) {
            const phi = segment * TAU / segments;
            
            const x = (majorRadius + minorRadius * Math.cos(phi)) * Math.cos(theta);
            const y = (majorRadius + minorRadius * Math.cos(phi)) * Math.sin(theta);
            const z = minorRadius * Math.sin(phi);
            
            vertices.push(x, y, z);
            textureCoords.push(segment/segments, ring/rings);
        }
    }

    // Generate indices for the torus mesh
    for (let ring = 0; ring < rings; ring++) {
        for (let segment = 0; segment < segments; segment++) {
            const first = (ring * (segments + 1)) + segment;
            const second = first + segments + 1;
            
            indices.push(first, second, first + 1);
            indices.push(second, second + 1, first + 1);
        }
    }

    return {
        type: 'torus',
        metrics: {
            symmetry: 1.0,
            complexity: 0.7,
            ratios: [TAU, PHI]
        },
        visualization: {
            vertices,
            indices,
            textureCoords
        },
        shaderConfig: {
            vertexShader: TORUS_VERTEX_SHADER,
            fragmentShader: TORUS_FRAGMENT_SHADER,
            uniforms: {
                uScale: scale,
                uRotation: 0,
                uTime: 0
            }
        }
    };
};