/**
 * WeldingTorch.ts
 * Welding torch entity with heat tracking and activation state.
 *
 * CODER-B Task B5
 */

import * as THREE from 'three';
import type { IWeldingTorch } from '../types/interfaces';
import {
  WELD_MAX_HEAT,
  WELD_HEAT_RATE,
  WELD_COOL_RATE,
  WELD_INTENSITY_MIN,
  WELD_INTENSITY_MAX,
  WELD_INTENSITY_DEFAULT,
} from '../core/Constants';

/**
 * Welding torch with emissive tip, heat tracking, and intensity control
 */
export class WeldingTorch implements IWeldingTorch {
  public readonly mesh: THREE.Group;

  private _isActive: boolean = false;
  private _heat: number = 0;
  private _intensity: number = WELD_INTENSITY_DEFAULT;

  private tipLight: THREE.PointLight;
  private tipMesh: THREE.Mesh;
  private tipMaterial: THREE.MeshStandardMaterial;

  constructor() {
    this.mesh = new THREE.Group();
    this.mesh.name = 'WeldingTorch';

    // Create torch components
    this.tipMaterial = this.createTipMaterial();
    this.tipMesh = this.createTip();
    this.tipLight = this.createTipLight();

    this.createBody();
    this.mesh.add(this.tipMesh);
    this.mesh.add(this.tipLight);

    // Initially inactive
    this.tipLight.visible = false;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get heat(): number {
    return this._heat;
  }

  get intensity(): number {
    return this._intensity;
  }

  /**
   * Create the torch body cylinder
   */
  private createBody(): void {
    const bodyGeometry = new THREE.CylinderGeometry(0.02, 0.025, 0.15, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.8,
      roughness: 0.3,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = Math.PI / 2; // Point forward
    body.position.z = 0.075;
    body.name = 'TorchBody';
    this.mesh.add(body);

    // Handle/grip
    const gripGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.08, 8);
    const gripMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.9,
    });
    const grip = new THREE.Mesh(gripGeometry, gripMaterial);
    grip.rotation.x = Math.PI / 2;
    grip.position.z = -0.02;
    grip.name = 'TorchGrip';
    this.mesh.add(grip);
  }

  /**
   * Create the emissive tip material
   */
  private createTipMaterial(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0x444444,
      emissive: 0x000000,
      emissiveIntensity: 0,
      metalness: 0.9,
      roughness: 0.2,
    });
  }

  /**
   * Create the torch tip mesh
   */
  private createTip(): THREE.Mesh {
    const tipGeometry = new THREE.ConeGeometry(0.015, 0.04, 8);
    const tip = new THREE.Mesh(tipGeometry, this.tipMaterial);
    tip.rotation.x = -Math.PI / 2; // Point forward
    tip.position.z = 0.17;
    tip.name = 'TorchTip';
    return tip;
  }

  /**
   * Create the point light at the tip
   */
  private createTipLight(): THREE.PointLight {
    const light = new THREE.PointLight(0x4488ff, 2, 3);
    light.position.z = 0.18;
    light.name = 'TorchLight';
    return light;
  }

  /**
   * Activate the welding torch
   */
  public activate(): void {
    if (this._isActive) return;

    this._isActive = true;
    this.tipLight.visible = true;
    this.updateVisuals();
  }

  /**
   * Deactivate the welding torch
   */
  public deactivate(): void {
    if (!this._isActive) return;

    this._isActive = false;
    this.tipLight.visible = false;
    this.updateVisuals();
  }

  /**
   * Set torch intensity (clamped to valid range)
   */
  public setIntensity(intensity: number): void {
    this._intensity = Math.max(
      WELD_INTENSITY_MIN,
      Math.min(WELD_INTENSITY_MAX, intensity)
    );
    this.updateVisuals();
  }

  /**
   * Update torch state (called every frame)
   */
  public update(delta: number): void {
    // Heat management
    if (this._isActive) {
      // Heat builds up while active
      this._heat = Math.min(
        WELD_MAX_HEAT,
        this._heat + WELD_HEAT_RATE * this._intensity * delta
      );
    } else {
      // Heat dissipates while inactive
      this._heat = Math.max(0, this._heat - WELD_COOL_RATE * delta);
    }

    this.updateVisuals();
  }

  /**
   * Update visual appearance based on state
   */
  private updateVisuals(): void {
    if (this._isActive) {
      // Active: blue-white glow based on intensity
      const heatFactor = this._heat / WELD_MAX_HEAT;
      const intensityFactor = this._intensity;

      // Color shifts from blue to white as heat increases
      const r = 0.3 + heatFactor * 0.7;
      const g = 0.5 + heatFactor * 0.3;
      const b = 1.0;

      this.tipMaterial.emissive.setRGB(r, g, b);
      this.tipMaterial.emissiveIntensity = intensityFactor * 2;

      this.tipLight.intensity = intensityFactor * 3;
      this.tipLight.color.setRGB(r, g, b);

      // Warning color when overheating
      if (this._heat > WELD_MAX_HEAT * 0.8) {
        this.tipMaterial.emissive.setRGB(1, 0.3, 0.1);
        this.tipLight.color.setRGB(1, 0.3, 0.1);
      }
    } else {
      // Inactive: residual glow based on remaining heat
      const residualHeat = this._heat / WELD_MAX_HEAT;
      this.tipMaterial.emissive.setRGB(residualHeat * 0.8, residualHeat * 0.2, 0);
      this.tipMaterial.emissiveIntensity = residualHeat;
    }
  }

  /**
   * Get the world position of the torch tip
   */
  public getTipWorldPosition(): THREE.Vector3 {
    const worldPos = new THREE.Vector3();
    this.tipMesh.getWorldPosition(worldPos);
    return worldPos;
  }

  /**
   * Get the torch direction in world space
   */
  public getTipWorldDirection(): THREE.Vector3 {
    const direction = new THREE.Vector3(0, 0, 1);
    direction.applyQuaternion(this.mesh.getWorldQuaternion(new THREE.Quaternion()));
    return direction.normalize();
  }

  /**
   * Check if torch is overheated
   */
  public isOverheated(): boolean {
    return this._heat >= WELD_MAX_HEAT;
  }
}
