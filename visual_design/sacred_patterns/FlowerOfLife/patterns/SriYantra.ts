import { GeometryData } from '../../../../src/types/sacred-geometry/geometry-data.d';
import { vec2 } from 'gl-matrix';

export function createSriYantra(segments: number, complexity: number): GeometryData {
    const vertices: number[] = [];
    const indices: number[] = [];
    const normals: number[] = [];

    // Create the nine interlocking triangles
    const trianglePairs = 4; // Number of triangle pairs
    const baseSize = 2.0;
    
    for (let pair = 0; pair < trianglePairs; pair++) {
        const scale = baseSize * (1 - pair * 0.15);
        const upwardShift = pair * 0.1;
        
        // Upward-pointing triangle
        const upTriangleStart = vertices.length / 3;
        vertices.push(
            0, scale + upwardShift, 0,  // Top
            -scale, -scale + upwardShift, 0,  // Bottom left
            scale, -scale + upwardShift, 0   // Bottom right
        );
        
        // Downward-pointing triangle
        const downTriangleStart = vertices.length / 3;
        vertices.push(
            0, -scale + upwardShift, 0,  // Bottom
            -scale, scale + upwardShift, 0,  // Top left
            scale, scale + upwardShift, 0   // Top right
        );
        
        // Add indices for both triangles
        indices.push(
            upTriangleStart, upTriangleStart + 1, upTriangleStart + 2,
            downTriangleStart, downTriangleStart + 1, downTriangleStart + 2
        );
        
        // Add normals for all vertices
        for (let i = 0; i < 6; i++) {
            normals.push(0, 0, 1);
        }
    }
    
    // Add central dot (bindu)
    const binduSegments = 32;
    const binduRadius = 0.1;
    const binduCenter = vertices.length / 3;
    
    // Create bindu vertices
    vertices.push(0, 0, 0); // Center point
    normals.push(0, 0, 1);
    
    for (let i = 0; i <= binduSegments; i++) {
        const angle = (i * Math.PI * 2) / binduSegments;
        vertices.push(
            binduRadius * Math.cos(angle),
            binduRadius * Math.sin(angle),
            0
        );
        normals.push(0, 0, 1);
        
        if (i < binduSegments) {
            indices.push(
                binduCenter,
                binduCenter + i + 1,
                binduCenter + i + 2
            );
        }
    }

    return {
        vertices: new Float32Array(vertices),
        indices: new Uint16Array(indices),
        normals: new Float32Array(normals)
    };
}