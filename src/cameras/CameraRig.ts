/**
 * CameraRig.ts
 * Reusable camera rig with follow, orbit, and fixed modes.
 *
 * CODER-B Task B6
 */

import * as THREE from 'three';
import { CAMERA_FOV, CAMERA_NEAR, CAMERA_FAR } from '../core/Constants';

/**
 * Camera tracking modes
 */
export type CameraMode = 'follow' | 'orbit' | 'fixed';

/**
 * Configuration for camera rig
 */
export interface CameraRigConfig {
  fov?: number;
  aspect?: number;
  near?: number;
  far?: number;
  offset?: THREE.Vector3;
  mode?: CameraMode;
  smoothing?: number;
  orbitSpeed?: number;
  useOrthographic?: boolean;
  orthoSize?: number;
}

/**
 * Camera rig that can follow targets, orbit around them, or stay fixed
 */
export class CameraRig {
  public readonly camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  public readonly isPerspective: boolean;

  private target: THREE.Object3D | null = null;
  private targetPosition: THREE.Vector3 = new THREE.Vector3();
  private offset: THREE.Vector3;
  private mode: CameraMode;
  private smoothing: number;
  private orbitSpeed: number;
  private orbitAngle: number = 0;

  // For smooth camera movement
  private currentPosition: THREE.Vector3 = new THREE.Vector3();
  private currentLookAt: THREE.Vector3 = new THREE.Vector3();

  constructor(config: CameraRigConfig = {}) {
    const {
      fov = CAMERA_FOV,
      aspect = 16 / 9,
      near = CAMERA_NEAR,
      far = CAMERA_FAR,
      offset = new THREE.Vector3(0, 2, -5),
      mode = 'follow',
      smoothing = 5,
      orbitSpeed = 0.5,
      useOrthographic = false,
      orthoSize = 20,
    } = config;

    this.offset = offset.clone();
    this.mode = mode;
    this.smoothing = smoothing;
    this.orbitSpeed = orbitSpeed;
    this.isPerspective = !useOrthographic;

    if (useOrthographic) {
      const halfSize = orthoSize / 2;
      this.camera = new THREE.OrthographicCamera(
        -halfSize * aspect,
        halfSize * aspect,
        halfSize,
        -halfSize,
        near,
        far
      );
    } else {
      this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    }

    this.currentPosition.copy(this.camera.position);
  }

  /**
   * Set the target object to track
   */
  public setTarget(target: THREE.Object3D | null): void {
    this.target = target;
    if (target) {
      target.getWorldPosition(this.targetPosition);
      this.snapToTarget();
    }
  }

  /**
   * Set the offset from target
   */
  public setOffset(offset: THREE.Vector3): void {
    this.offset.copy(offset);
  }

  /**
   * Set camera mode
   */
  public setMode(mode: CameraMode): void {
    this.mode = mode;
  }

  /**
   * Get current mode
   */
  public getMode(): CameraMode {
    return this.mode;
  }

  /**
   * Set smoothing factor (higher = smoother but slower)
   */
  public setSmoothing(smoothing: number): void {
    this.smoothing = Math.max(0, smoothing);
  }

  /**
   * Immediately snap camera to target position
   */
  public snapToTarget(): void {
    if (!this.target) return;

    this.target.getWorldPosition(this.targetPosition);
    const desiredPosition = this.calculateDesiredPosition();

    this.currentPosition.copy(desiredPosition);
    this.currentLookAt.copy(this.targetPosition);
    this.camera.position.copy(desiredPosition);
    this.camera.lookAt(this.targetPosition);
  }

  /**
   * Make camera look at a specific position
   */
  public lookAt(position: THREE.Vector3): void {
    this.currentLookAt.copy(position);
    this.camera.lookAt(position);
  }

  /**
   * Set camera position directly (for fixed mode)
   */
  public setPosition(position: THREE.Vector3): void {
    this.camera.position.copy(position);
    this.currentPosition.copy(position);
  }

  /**
   * Update camera position (called every frame)
   */
  public update(delta: number): void {
    if (!this.target && this.mode !== 'fixed') return;

    // Get target world position
    if (this.target) {
      this.target.getWorldPosition(this.targetPosition);
    }

    switch (this.mode) {
      case 'follow':
        this.updateFollow(delta);
        break;
      case 'orbit':
        this.updateOrbit(delta);
        break;
      case 'fixed':
        this.updateFixed(delta);
        break;
    }
  }

  /**
   * Update in follow mode - camera follows behind target
   */
  private updateFollow(delta: number): void {
    const desiredPosition = this.calculateDesiredPosition();
    const lerpFactor = 1 - Math.exp(-this.smoothing * delta);

    // Smooth position
    this.currentPosition.lerp(desiredPosition, lerpFactor);
    this.camera.position.copy(this.currentPosition);

    // Smooth look-at
    this.currentLookAt.lerp(this.targetPosition, lerpFactor);
    this.camera.lookAt(this.currentLookAt);
  }

  /**
   * Update in orbit mode - camera orbits around target
   */
  private updateOrbit(delta: number): void {
    this.orbitAngle += this.orbitSpeed * delta;

    const distance = this.offset.length();
    const height = this.offset.y;

    const desiredPosition = new THREE.Vector3(
      this.targetPosition.x + Math.sin(this.orbitAngle) * distance,
      this.targetPosition.y + height,
      this.targetPosition.z + Math.cos(this.orbitAngle) * distance
    );

    const lerpFactor = 1 - Math.exp(-this.smoothing * delta);
    this.currentPosition.lerp(desiredPosition, lerpFactor);
    this.camera.position.copy(this.currentPosition);

    this.currentLookAt.lerp(this.targetPosition, lerpFactor);
    this.camera.lookAt(this.currentLookAt);
  }

  /**
   * Update in fixed mode - camera stays in place, looks at target
   */
  private updateFixed(delta: number): void {
    if (this.target) {
      const lerpFactor = 1 - Math.exp(-this.smoothing * delta);
      this.currentLookAt.lerp(this.targetPosition, lerpFactor);
      this.camera.lookAt(this.currentLookAt);
    }
  }

  /**
   * Calculate desired camera position based on target and offset
   */
  private calculateDesiredPosition(): THREE.Vector3 {
    if (!this.target) {
      return this.currentPosition.clone();
    }

    // Get target's world quaternion for offset rotation
    const targetQuaternion = new THREE.Quaternion();
    this.target.getWorldQuaternion(targetQuaternion);

    // Rotate offset by target's rotation
    const rotatedOffset = this.offset.clone().applyQuaternion(targetQuaternion);

    return this.targetPosition.clone().add(rotatedOffset);
  }

  /**
   * Handle resize for perspective cameras
   */
  public resize(width: number, height: number): void {
    const aspect = width / height;

    if (this.camera instanceof THREE.PerspectiveCamera) {
      this.camera.aspect = aspect;
      this.camera.updateProjectionMatrix();
    } else if (this.camera instanceof THREE.OrthographicCamera) {
      const frustumSize = (this.camera.top - this.camera.bottom);
      this.camera.left = -frustumSize * aspect / 2;
      this.camera.right = frustumSize * aspect / 2;
      this.camera.updateProjectionMatrix();
    }
  }

  /**
   * Get the Three.js camera object
   */
  public getCamera(): THREE.Camera {
    return this.camera;
  }
}
