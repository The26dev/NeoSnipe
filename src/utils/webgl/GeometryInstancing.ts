import { WebGLResourceManager } from '../webgl-resource-manager';
import { VertexBufferPool } from './VertexBufferPool';

interface InstanceData {
  id: number;
  buffer: WebGLBuffer;
  count: number;
  attributes: InstanceAttribute[];
}

interface InstanceAttribute {
  location: number;
  size: number;
  type: number;
  normalized: boolean;
  stride: number;
  offset: number;
}

/**
 * Handles efficient rendering of repeated geometry through WebGL instancing
 */
export class GeometryInstancing {
  private resourceManager: WebGLResourceManager;
  private bufferPool: VertexBufferPool;
  private instances: Map<number, InstanceData> = new Map();
  private nextInstanceId: number = 1;

  constructor(resourceManager: WebGLResourceManager, bufferPool: VertexBufferPool) {
    this.resourceManager = resourceManager;
    this.bufferPool = bufferPool;
  }

  /**
   * Create a new instanced geometry configuration
   */
  createInstance(
    baseGeometry: Float32Array,
    instanceData: Float32Array,
    attributes: InstanceAttribute[]
  ): number {
    const instanceId = this.nextInstanceId++;
    
    // Create buffers for base geometry and instance data
    const geometryBuffer = this.bufferPool.requestBuffer({
      size: baseGeometry.byteLength,
      usage: WebGL2RenderingContext.STATIC_DRAW
    });

    const instanceBuffer = this.bufferPool.requestBuffer({
      size: instanceData.byteLength,
      usage: WebGL2RenderingContext.DYNAMIC_DRAW
    });

    // Store instance configuration
    this.instances.set(instanceId, {
      id: instanceId,
      buffer: instanceBuffer,
      count: instanceData.length / this.getStrideFromAttributes(attributes),
      attributes
    });

    // Update buffers with initial data
    this.resourceManager.updateBuffer(geometryBuffer, baseGeometry, WebGL2RenderingContext.STATIC_DRAW);
    this.resourceManager.updateBuffer(instanceBuffer, instanceData, WebGL2RenderingContext.DYNAMIC_DRAW);

    return instanceId;
  }

  /**
   * Update instance data for an existing instanced geometry
   */
  updateInstanceData(instanceId: number, newData: Float32Array): void {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Instance ${instanceId} not found`);
    }

    this.resourceManager.updateBuffer(
      instance.buffer,
      newData,
      WebGL2RenderingContext.DYNAMIC_DRAW
    );
    
    instance.count = newData.length / this.getStrideFromAttributes(instance.attributes);
  }

  /**
   * Set up vertex attributes for instanced rendering
   */
  setupAttributes(gl: WebGL2RenderingContext, instanceId: number): void {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Instance ${instanceId} not found`);
    }

    // Bind instance buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, instance.buffer);

    // Set up attributes with instancing
    instance.attributes.forEach(attr => {
      gl.enableVertexAttribArray(attr.location);
      gl.vertexAttribPointer(
        attr.location,
        attr.size,
        attr.type,
        attr.normalized,
        attr.stride,
        attr.offset
      );
      gl.vertexAttribDivisor(attr.location, 1); // Use instancing
    });
  }

  /**
   * Draw instanced geometry
   */
  drawInstanced(
    gl: WebGL2RenderingContext,
    instanceId: number,
    mode: number,
    count: number
  ): void {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Instance ${instanceId} not found`);
    }

    gl.drawArraysInstanced(mode, 0, count, instance.count);
  }

  /**
   * Clean up instance resources
   */
  deleteInstance(instanceId: number): void {
    const instance = this.instances.get(instanceId);
    if (instance) {
      this.bufferPool.releaseBuffer(instance.buffer, WebGL2RenderingContext.DYNAMIC_DRAW);
      this.instances.delete(instanceId);
    }
  }

  private getStrideFromAttributes(attributes: InstanceAttribute[]): number {
    let totalSize = 0;
    attributes.forEach(attr => {
      totalSize += attr.size;
    });
    return totalSize;
  }

  /**
   * Dispose of all instances
   */
  dispose(): void {
    this.instances.forEach((instance, id) => {
      this.deleteInstance(id);
    });
  }
}