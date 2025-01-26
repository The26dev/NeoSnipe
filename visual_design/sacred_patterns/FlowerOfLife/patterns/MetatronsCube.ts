import { GeometryData } from '../../../../src/types/sacred-geometry/geometry-data.d';
import { vec2, vec3 } from 'gl-matrix';

export function createMetatronsCube(segments: number, complexity: number): GeometryData {
    const vertices: number[] = [];
    const indices: number[] = [];
    const normals: number[] = [];

    // Create the 13 circles representing the spheres of Metatron's Cube
    const centerPoints = [
        [0, 0],  // Center
        [1, 0], [-0.5, 0.866], [-0.5, -0.866],  // First ring
        [2, 0], [1, 1.732], [-1, 1.732], [-2, 0], [-1, -1.732], [1, -1.732],  // Second ring
        [0, 2], [0, -2]  // Top and bottom
    ];

    // Generate circles at each point
    const circleRadius = 0.2;
    centerPoints.forEach((center, index) => {
        const circleStart = vertices.length / 3;
        
        // Center vertex
        vertices.push(center[0], center[1], 0);
        normals.push(0, 0, 1);
        
        // Circle vertices
        for (let i = 0; i <= segments; i++) {
            const angle = (i * Math.PI * 2) / segments;
            vertices.push(
                center[0] + circleRadius * Math.cos(angle),
                center[1] + circleRadius * Math.sin(angle),
                0
            );
            normals.push(0, 0, 1);
            
            if (i < segments) {
                indices.push(
                    circleStart,
                    circleStart + i + 1,
                    circleStart + i + 2
                );
            }
        }
    });

    // Add connecting lines
    const lineWidth = 0.05;
    const connections = [
        [0, 1], [0, 2], [0, 3],  // Center to first ring
        [1, 4], [1, 5], [2, 6], [2, 7], [3, 8], [3, 9],  // First to second ring
        [2, 10], [3, 11]  // To top and bottom
    ];

    connections.forEach(([from, to]) => {
        const fromPoint = centerPoints[from];
        const toPoint = centerPoints[to];
        
        const direction = vec2.subtract(vec2.create(), 
            vec2.fromValues(toPoint[0], toPoint[1]),
            vec2.fromValues(fromPoint[0], fromPoint[1])
        );
        const length = vec2.length(direction);
        vec2.normalize(direction, direction);
        
        const perpendicular = vec2.fromValues(-direction[1], direction[0]);
        vec2.scale(perpendicular, perpendicular, lineWidth);
        
        const lineStart = vertices.length / 3;
        
        // Create rectangle vertices for the line
        vertices.push(
            fromPoint[0] + perpendicular[0], fromPoint[1] + perpendicular[1], 0,
            fromPoint[0] - perpendicular[0], fromPoint[1] - perpendicular[1], 0,
            toPoint[0] + perpendicular[0], toPoint[1] + perpendicular[1], 0,
            toPoint[0] - perpendicular[0], toPoint[1] - perpendicular[1], 0
        );
        
        // Add normals for line vertices
        for (let i = 0; i < 4; i++) {
            normals.push(0, 0, 1);
        }
        
        // Add indices for line triangles
        indices.push(
            lineStart, lineStart + 1, lineStart + 2,
            lineStart + 1, lineStart + 2, lineStart + 3
        );
    });

    return {
        vertices: new Float32Array(vertices),
        indices: new Uint16Array(indices),
        normals: new Float32Array(normals)
    };
}