/**
 * ViewportDisplay.ts
 * Renders WebGLRenderTarget textures to canvas elements for UI viewport panels.
 *
 * CODER-B FIX-B1 (Issue #9)
 */

import * as THREE from 'three';

/**
 * Displays a WebGLRenderTarget texture in an HTML canvas element
 */
export class ViewportDisplay {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private renderer: THREE.WebGLRenderer;
  private width: number;
  private height: number;
  private pixelBuffer: Uint8Array;

  constructor(
    container: HTMLElement,
    renderer: THREE.WebGLRenderer,
    width: number,
    height: number
  ) {
    this.renderer = renderer;
    this.width = width;
    this.height = height;

    // Create canvas element
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.objectFit = 'contain';

    // Get 2D context
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D canvas context');
    }
    this.ctx = ctx;

    // Pre-allocate pixel buffer for performance
    this.pixelBuffer = new Uint8Array(width * height * 4);

    // Append to container
    container.appendChild(this.canvas);
  }

  /**
   * Update the canvas with pixels from a WebGLRenderTarget
   */
  public updateFromRenderTarget(renderTarget: THREE.WebGLRenderTarget): void {
    // Read pixels from render target
    this.renderer.readRenderTargetPixels(
      renderTarget,
      0,
      0,
      this.width,
      this.height,
      this.pixelBuffer
    );

    // Create ImageData (need to flip Y-axis as WebGL is bottom-up)
    const imageData = this.ctx.createImageData(this.width, this.height);
    const data = imageData.data;

    // Copy pixels with Y-flip
    for (let y = 0; y < this.height; y++) {
      const srcY = this.height - 1 - y;
      for (let x = 0; x < this.width; x++) {
        const srcIndex = (srcY * this.width + x) * 4;
        const dstIndex = (y * this.width + x) * 4;
        data[dstIndex] = this.pixelBuffer[srcIndex]; // R
        data[dstIndex + 1] = this.pixelBuffer[srcIndex + 1]; // G
        data[dstIndex + 2] = this.pixelBuffer[srcIndex + 2]; // B
        data[dstIndex + 3] = this.pixelBuffer[srcIndex + 3]; // A
      }
    }

    // Draw to canvas
    this.ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Get the canvas element
   */
  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Clean up resources
   */
  public dispose(): void {
    this.canvas.remove();
  }
}
