/**
 * UnderwaterEnv.ts
 * Creates and manages the underwater environment including fog, lighting, and scene background.
 *
 * CODER-B Task B2
 */

import * as THREE from 'three';

/**
 * Configuration for underwater environment
 */
export interface UnderwaterEnvConfig {
  fogColor?: number;
  fogDensity?: number;
  ambientColor?: number;
  ambientIntensity?: number;
  sunColor?: number;
  sunIntensity?: number;
  sunPosition?: THREE.Vector3;
  backgroundColor?: number;
}

/**
 * Default configuration values for deep underwater environment
 */
const DEFAULT_CONFIG: Required<UnderwaterEnvConfig> = {
  fogColor: 0x001a33,
  fogDensity: 0.015,
  ambientColor: 0x3366aa,
  ambientIntensity: 0.4,
  sunColor: 0x88aacc,
  sunIntensity: 0.3,
  sunPosition: new THREE.Vector3(0, 100, 50),
  backgroundColor: 0x001122,
};

/**
 * Manages underwater environment effects including fog, lighting, and atmosphere
 */
export class UnderwaterEnv {
  private scene: THREE.Scene;
  private fog: THREE.FogExp2;
  private ambientLight: THREE.AmbientLight;
  private sunLight: THREE.DirectionalLight;
  private config: Required<UnderwaterEnvConfig>;

  constructor(scene: THREE.Scene, config: UnderwaterEnvConfig = {}) {
    this.scene = scene;
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Initialize environment components
    this.fog = this.createFog();
    this.ambientLight = this.createAmbientLight();
    this.sunLight = this.createSunLight();

    // Apply to scene
    this.applyToScene();
  }

  /**
   * Create exponential fog for depth perception
   */
  private createFog(): THREE.FogExp2 {
    return new THREE.FogExp2(this.config.fogColor, this.config.fogDensity);
  }

  /**
   * Create ambient light for general underwater illumination
   */
  private createAmbientLight(): THREE.AmbientLight {
    return new THREE.AmbientLight(
      this.config.ambientColor,
      this.config.ambientIntensity
    );
  }

  /**
   * Create directional light simulating filtered sunlight from surface
   */
  private createSunLight(): THREE.DirectionalLight {
    const light = new THREE.DirectionalLight(
      this.config.sunColor,
      this.config.sunIntensity
    );
    light.position.copy(this.config.sunPosition);
    light.castShadow = true;

    // Configure shadow properties for underwater scene
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500;
    light.shadow.camera.left = -50;
    light.shadow.camera.right = 50;
    light.shadow.camera.top = 50;
    light.shadow.camera.bottom = -50;

    return light;
  }

  /**
   * Apply all environment settings to the scene
   */
  private applyToScene(): void {
    // Set scene background color
    this.scene.background = new THREE.Color(this.config.backgroundColor);

    // Apply fog
    this.scene.fog = this.fog;

    // Add lights to scene
    this.scene.add(this.ambientLight);
    this.scene.add(this.sunLight);
  }

  /**
   * Update fog density based on depth
   * Deeper = denser fog for realism
   */
  public setDepthBasedFog(depth: number): void {
    // Increase fog density with depth (baseline at 0, max around 100m)
    const depthFactor = Math.min(Math.abs(depth) / 100, 1);
    const minDensity = 0.01;
    const maxDensity = 0.03;
    this.fog.density = minDensity + (maxDensity - minDensity) * depthFactor;
  }

  /**
   * Update sunlight intensity based on depth
   * Less light penetrates at greater depths
   */
  public setDepthBasedLighting(depth: number): void {
    const depthFactor = Math.max(0, 1 - Math.abs(depth) / 150);
    this.sunLight.intensity = this.config.sunIntensity * depthFactor;
  }

  /**
   * Get the ambient light for external modification
   */
  public getAmbientLight(): THREE.AmbientLight {
    return this.ambientLight;
  }

  /**
   * Get the sun light for external modification
   */
  public getSunLight(): THREE.DirectionalLight {
    return this.sunLight;
  }

  /**
   * Get the fog for external modification
   */
  public getFog(): THREE.FogExp2 {
    return this.fog;
  }

  /**
   * Update environment based on submarine depth
   * Call this every frame for dynamic lighting/fog
   */
  public update(depth: number): void {
    this.setDepthBasedFog(depth);
    this.setDepthBasedLighting(depth);
  }

  /**
   * Clean up resources
   */
  public dispose(): void {
    this.scene.remove(this.ambientLight);
    this.scene.remove(this.sunLight);
    this.scene.fog = null;
    this.scene.background = null;
  }
}
