import { vec2, vec3, mat4 } from 'gl-matrix';
import { GeometryData } from '../../../../src/types/sacred-geometry/geometry-data.d';

export interface TransformConfig {
  rotation?: number;
  scale?: number;
  translation?: [number, number];
  mirror?: boolean;
  recursive?: number;
}

export function applyTransforms(geometry: GeometryData, config: TransformConfig): GeometryData {
  const { vertices, indices, normals } = geometry;
  const transformMatrix = mat4.create();
  
  // Apply transformations in order: scale -> rotation -> translation
  if (config.scale) {
    mat4.scale(transformMatrix, transformMatrix, [config.scale, config.scale, 1]);
  }
  
  if (config.rotation) {
    mat4.rotate(transformMatrix, transformMatrix, config.rotation, [0, 0, 1]);
  }
  
  if (config.translation) {
    mat4.translate(transformMatrix, transformMatrix, [config.translation[0], config.translation[1], 0]);
  }
  
  // Transform vertices
  const transformedVertices = new Float32Array(vertices.length);
  for (let i = 0; i < vertices.length; i += 3) {
    const vertex = vec3.fromValues(vertices[i], vertices[i + 1], vertices[i + 2]);
    vec3.transformMat4(vertex, vertex, transformMatrix);
    transformedVertices[i] = vertex[0];
    transformedVertices[i + 1] = vertex[1];
    transformedVertices[i + 2] = vertex[2];
  }
  
  // Transform normals if needed
  const normalMatrix = mat4.create();
  mat4.invert(normalMatrix, transformMatrix);
  mat4.transpose(normalMatrix, normalMatrix);
  
  const transformedNormals = new Float32Array(normals.length);
  for (let i = 0; i < normals.length; i += 3) {
    const normal = vec3.fromValues(normals[i], normals[i + 1], normals[i + 2]);
    vec3.transformMat4(normal, normal, normalMatrix);
    vec3.normalize(normal, normal);
    transformedNormals[i] = normal[0];
    transformedNormals[i + 1] = normal[1];
    transformedNormals[i + 2] = normal[2];
  }
  
  return {
    vertices: transformedVertices,
    indices,
    normals: transformedNormals
  };
}

export function createRecursivePattern(
  geometry: GeometryData, 
  depth: number,
  scale: number = 0.5,
  rotationStep: number = Math.PI / 3
): GeometryData {
  if (depth <= 0) return geometry;
  
  const result: GeometryData = {
    vertices: new Float32Array([]),
    indices: new Uint16Array([]),
    normals: new Float32Array([])
  };
  
  // Add base geometry
  appendGeometry(result, geometry);
  
  // Create recursive patterns
  for (let i = 0; i < 6; i++) {
    const rotation = i * rotationStep;
    const translation: [number, number] = [
      Math.cos(rotation) * (1 - scale),
      Math.sin(rotation) * (1 - scale)
    ];
    
    const transformed = applyTransforms(geometry, {
      scale,
      rotation,
      translation
    });
    
    const recursive = createRecursivePattern(transformed, depth - 1, scale, rotationStep);
    appendGeometry(result, recursive);
  }
  
  return result;
}

function appendGeometry(target: GeometryData, source: GeometryData): void {
  const vertexOffset = target.vertices.length / 3;
  
  // Combine vertices
  const newVertices = new Float32Array(target.vertices.length + source.vertices.length);
  newVertices.set(target.vertices);
  newVertices.set(source.vertices, target.vertices.length);
  target.vertices = newVertices;
  
  // Combine normals
  const newNormals = new Float32Array(target.normals.length + source.normals.length);
  newNormals.set(target.normals);
  newNormals.set(source.normals, target.normals.length);
  target.normals = newNormals;
  
  // Combine and offset indices
  const newIndices = new Uint16Array(target.indices.length + source.indices.length);
  newIndices.set(target.indices);
  const offsetIndices = source.indices.map(i => i + vertexOffset);
  newIndices.set(offsetIndices, target.indices.length);
  target.indices = newIndices;
}