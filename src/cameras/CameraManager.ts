/**
 * CameraManager.ts
 * Multi-camera management with render-to-texture support.
 *
 * CODER-B Task B7
 */

import * as THREE from 'three';
import type { ICameraManager, ISubmarine } from '../types/interfaces';
import { CameraRig } from './CameraRig';
import { CAMERA_FOV, CAMERA_NEAR, CAMERA_FAR } from '../core/Constants';

/**
 * Viewport identifiers
 */
export type ViewportId = 'welding' | 'external' | 'navigation' | 'minimap';

/**
 * Viewport configuration
 */
interface ViewportConfig {
  width: number;
  height: number;
  rig: CameraRig;
  renderTarget: THREE.WebGLRenderTarget;
}

/**
 * Manages multiple cameras with render-to-texture for UI viewports
 */
export class CameraManager implements ICameraManager {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private viewports: Map<ViewportId, ViewportConfig> = new Map();
  private mainCameraId: ViewportId = 'external';
  private cameraOrder: ViewportId[] = ['external', 'navigation', 'welding', 'minimap'];

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
    this.renderer = renderer;
    this.scene = scene;

    this.initializeViewports();
  }

  /**
   * Initialize all camera viewports
   */
  private initializeViewports(): void {
    // Welding camera - close-up on torch
    this.createViewport('welding', {
      width: 256,
      height: 160,
      fov: 60,
      offset: new THREE.Vector3(0.3, 0.2, -0.5),
      mode: 'follow',
      smoothing: 8,
    });

    // External camera - third-person orbit view
    this.createViewport('external', {
      width: 320,
      height: 240,
      fov: CAMERA_FOV,
      offset: new THREE.Vector3(0, 3, -8),
      mode: 'orbit',
      smoothing: 4,
      orbitSpeed: 0.2,
    });

    // Navigation camera - cockpit forward view
    this.createViewport('navigation', {
      width: 320,
      height: 180,
      fov: 90,
      offset: new THREE.Vector3(1.2, 0.3, 0),
      mode: 'follow',
      smoothing: 10,
    });

    // Minimap camera - top-down orthographic
    this.createViewport('minimap', {
      width: 200,
      height: 200,
      useOrthographic: true,
      orthoSize: 50,
      offset: new THREE.Vector3(0, 30, 0),
      mode: 'fixed',
      smoothing: 3,
    });

    // Position minimap camera looking down
    const minimapViewport = this.viewports.get('minimap');
    if (minimapViewport) {
      minimapViewport.rig.setPosition(new THREE.Vector3(0, 30, 0));
      minimapViewport.rig.getCamera().rotation.x = -Math.PI / 2;
    }
  }

  /**
   * Create a viewport with camera rig and render target
   */
  private createViewport(
    id: ViewportId,
    config: {
      width: number;
      height: number;
      fov?: number;
      offset?: THREE.Vector3;
      mode?: 'follow' | 'orbit' | 'fixed';
      smoothing?: number;
      orbitSpeed?: number;
      useOrthographic?: boolean;
      orthoSize?: number;
    }
  ): void {
    const {
      width,
      height,
      fov = CAMERA_FOV,
      offset = new THREE.Vector3(0, 2, -5),
      mode = 'follow',
      smoothing = 5,
      orbitSpeed = 0.5,
      useOrthographic = false,
      orthoSize = 20,
    } = config;

    const rig = new CameraRig({
      fov,
      aspect: width / height,
      near: CAMERA_NEAR,
      far: CAMERA_FAR,
      offset,
      mode,
      smoothing,
      orbitSpeed,
      useOrthographic,
      orthoSize,
    });

    const renderTarget = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
    });

    this.viewports.set(id, { width, height, rig, renderTarget });
  }

  /**
   * Get the texture for a viewport (for UI display)
   */
  public getViewportTexture(id: ViewportId): THREE.Texture | null {
    const viewport = this.viewports.get(id);
    return viewport ? viewport.renderTarget.texture : null;
  }

  /**
   * Get the main camera for primary rendering
   */
  public getMainCamera(): THREE.Camera {
    const viewport = this.viewports.get(this.mainCameraId);
    if (!viewport) {
      // Fallback - return first available camera
      const first = this.viewports.values().next().value;
      return first ? first.rig.getCamera() : new THREE.PerspectiveCamera();
    }
    return viewport.rig.getCamera();
  }

  /**
   * Get current main camera ID
   */
  public getMainCameraId(): ViewportId {
    return this.mainCameraId;
  }

  /**
   * Update all camera positions based on submarine
   */
  public update(submarine: ISubmarine): void {
    // Update each camera rig
    for (const [id, viewport] of this.viewports) {
      this.updateCameraTarget(id, viewport, submarine);
      viewport.rig.update(1 / 60); // Assume 60fps, delta passed in render
    }
  }

  /**
   * Update camera target based on viewport type
   */
  private updateCameraTarget(
    id: ViewportId,
    viewport: ViewportConfig,
    submarine: ISubmarine
  ): void {
    const { rig } = viewport;

    switch (id) {
      case 'welding':
        // Follow the welding torch
        const torch = submarine.getWeldingArm().getTorch();
        rig.setTarget(torch.mesh);
        break;

      case 'external':
        // Orbit around submarine
        rig.setTarget(submarine.mesh);
        break;

      case 'navigation':
        // Follow submarine, look forward
        rig.setTarget(submarine.mesh);
        break;

      case 'minimap':
        // Fixed above, track submarine position
        rig.setTarget(submarine.mesh);
        const subPos = submarine.position;
        rig.setPosition(new THREE.Vector3(subPos.x, 30, subPos.z));
        rig.lookAt(subPos);
        break;
    }
  }

  /**
   * Render all viewports to their render targets and main view to screen
   */
  public render(): void {
    // Render each viewport to its render target (for UI textures)
    for (const viewport of this.viewports.values()) {
      this.renderer.setRenderTarget(viewport.renderTarget);
      this.renderer.render(this.scene, viewport.rig.getCamera());
    }

    // CRITICAL: Render main view to screen (canvas)
    this.renderer.setRenderTarget(null);
    const mainViewport = this.viewports.get(this.mainCameraId);
    if (mainViewport) {
      this.renderer.render(this.scene, mainViewport.rig.getCamera());
    }
  }

  /**
   * Render with delta time for smooth camera movement
   */
  public renderWithDelta(delta: number): void {
    // Update camera rigs with actual delta
    for (const viewport of this.viewports.values()) {
      viewport.rig.update(delta);
    }

    this.render();
  }

  /**
   * Cycle the main camera to the next one
   */
  public cycleMainCamera(): void {
    const currentIndex = this.cameraOrder.indexOf(this.mainCameraId);
    const nextIndex = (currentIndex + 1) % this.cameraOrder.length;
    this.mainCameraId = this.cameraOrder[nextIndex];
  }

  /**
   * Set the main camera directly
   */
  public setMainCamera(id: ViewportId): void {
    if (this.viewports.has(id)) {
      this.mainCameraId = id;
    }
  }

  /**
   * Handle window resize
   */
  public resize(width: number, height: number): void {
    // Update main camera aspect ratio
    const mainViewport = this.viewports.get(this.mainCameraId);
    if (mainViewport) {
      mainViewport.rig.resize(width, height);
    }
  }

  /**
   * Get a specific camera rig
   */
  public getCameraRig(id: ViewportId): CameraRig | undefined {
    return this.viewports.get(id)?.rig;
  }

  /**
   * Dispose of all render targets
   */
  public dispose(): void {
    for (const viewport of this.viewports.values()) {
      viewport.renderTarget.dispose();
    }
    this.viewports.clear();
  }
}
