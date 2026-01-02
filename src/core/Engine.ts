/**
 * Core Three.js Engine
 *
 * Manages the WebGL renderer, scene, and render loop.
 * Implements IEngine interface from src/types/interfaces.ts
 */

import * as THREE from 'three';
import type { IEngine } from '../types/interfaces';

export type UpdateCallback = (delta: number, elapsed: number) => void;

export class Engine implements IEngine {
  public readonly renderer: THREE.WebGLRenderer;
  public readonly scene: THREE.Scene;
  public readonly clock: THREE.Clock;

  private updateCallbacks: Set<UpdateCallback> = new Set();
  private animationFrameId: number | null = null;
  private isRunning: boolean = false;

  constructor(container: HTMLElement) {
    // Initialize renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    container.appendChild(this.renderer.domElement);

    // Initialize scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x001a33); // Deep ocean blue

    // Initialize clock
    this.clock = new THREE.Clock(false);

    // Handle window resize
    window.addEventListener('resize', this.handleResize);
  }

  /**
   * Register a callback to be called every frame
   */
  public onUpdate(callback: UpdateCallback): void {
    this.updateCallbacks.add(callback);
  }

  /**
   * Remove an update callback
   */
  public offUpdate(callback: UpdateCallback): void {
    this.updateCallbacks.delete(callback);
  }

  /**
   * Start the render loop
   */
  public start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.clock.start();
    this.animate();
  }

  /**
   * Stop the render loop
   */
  public stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    this.clock.stop();
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Resize the renderer
   */
  public resize(width: number, height: number): void {
    this.renderer.setSize(width, height);
  }

  /**
   * Dispose of all resources
   */
  public dispose(): void {
    this.stop();
    window.removeEventListener('resize', this.handleResize);
    this.renderer.dispose();
    this.updateCallbacks.clear();
  }

  private animate = (): void => {
    if (!this.isRunning) return;

    this.animationFrameId = requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();

    // Call all update callbacks
    for (const callback of this.updateCallbacks) {
      callback(delta, elapsed);
    }
  };

  private handleResize = (): void => {
    const parent = this.renderer.domElement.parentElement;
    if (parent) {
      this.resize(parent.clientWidth, parent.clientHeight);
    }
  };
}

export default Engine;
