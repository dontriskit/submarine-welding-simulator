/**
 * SparkEffect.ts
 * Welding spark particle system.
 *
 * CODER-B Task B15
 */

import * as THREE from 'three';

/**
 * Configuration for spark effect
 */
export interface SparkEffectConfig {
  /** Maximum number of particles */
  maxParticles?: number;
  /** Initial particle speed */
  speed?: number;
  /** Spread cone angle in radians */
  coneAngle?: number;
  /** Particle lifetime in seconds */
  lifetime?: number;
  /** Gravity (underwater = slower fall) */
  gravity?: number;
  /** Base particle size */
  size?: number;
}

const DEFAULT_CONFIG: Required<SparkEffectConfig> = {
  maxParticles: 500,
  speed: 3.0,
  coneAngle: Math.PI / 4, // 45 degrees
  lifetime: 0.6,
  gravity: 2.0, // Reduced gravity underwater
  size: 0.03,
};

/**
 * Welding spark particle system
 */
export class SparkEffect {
  private scene: THREE.Scene;
  private particles: THREE.Points;
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private config: Required<SparkEffectConfig>;

  // Particle data
  private positions: Float32Array;
  private velocities: Float32Array;
  private colors: Float32Array;
  private lifetimes: Float32Array;
  private maxLifetimes: Float32Array;

  // Emission state
  private emitting: boolean = false;
  private emissionPosition: THREE.Vector3 = new THREE.Vector3();
  private emissionDirection: THREE.Vector3 = new THREE.Vector3(0, 0, 1);
  private emissionIntensity: number = 1.0;
  private nextParticleIndex: number = 0;
  private emissionAccumulator: number = 0;

  constructor(scene: THREE.Scene, config: SparkEffectConfig = {}) {
    this.scene = scene;
    this.config = { ...DEFAULT_CONFIG, ...config };

    const count = this.config.maxParticles;

    // Initialize arrays
    this.positions = new Float32Array(count * 3);
    this.velocities = new Float32Array(count * 3);
    this.colors = new Float32Array(count * 3);
    this.lifetimes = new Float32Array(count);
    this.maxLifetimes = new Float32Array(count);

    // Initialize all particles as dead
    for (let i = 0; i < count; i++) {
      this.lifetimes[i] = 0;
      this.positions[i * 3 + 1] = -1000; // Hide offscreen
    }

    // Create geometry
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

    // Create material
    this.material = new THREE.PointsMaterial({
      size: this.config.size,
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    // Create points
    this.particles = new THREE.Points(this.geometry, this.material);
    this.particles.name = 'SparkEffect';
    this.particles.frustumCulled = false;

    // Add to scene
    this.scene.add(this.particles);
  }

  /**
   * Start emitting sparks from position in direction
   */
  public emit(position: THREE.Vector3, direction: THREE.Vector3, intensity: number = 1.0): void {
    this.emitting = true;
    this.emissionPosition.copy(position);
    this.emissionDirection.copy(direction).normalize();
    this.emissionIntensity = Math.max(0.1, Math.min(2.0, intensity));
  }

  /**
   * Stop emitting new sparks
   */
  public stop(): void {
    this.emitting = false;
  }

  /**
   * Spawn a single spark particle
   */
  private spawnParticle(): void {
    const i = this.nextParticleIndex;
    const i3 = i * 3;

    this.nextParticleIndex = (this.nextParticleIndex + 1) % this.config.maxParticles;

    // Position at emission point
    this.positions[i3] = this.emissionPosition.x;
    this.positions[i3 + 1] = this.emissionPosition.y;
    this.positions[i3 + 2] = this.emissionPosition.z;

    // Random direction within cone
    const coneAngle = this.config.coneAngle * (0.5 + Math.random() * 0.5);
    const azimuth = Math.random() * Math.PI * 2;

    // Create perpendicular vectors for cone
    const up = new THREE.Vector3(0, 1, 0);
    if (Math.abs(this.emissionDirection.dot(up)) > 0.99) {
      up.set(1, 0, 0);
    }
    const right = new THREE.Vector3().crossVectors(this.emissionDirection, up).normalize();
    const forward = new THREE.Vector3().crossVectors(right, this.emissionDirection).normalize();

    // Calculate velocity direction
    const sinCone = Math.sin(coneAngle);
    const cosCone = Math.cos(coneAngle);
    const velocityDir = new THREE.Vector3()
      .copy(this.emissionDirection)
      .multiplyScalar(cosCone)
      .add(right.clone().multiplyScalar(sinCone * Math.cos(azimuth)))
      .add(forward.clone().multiplyScalar(sinCone * Math.sin(azimuth)))
      .normalize();

    // Set velocity with randomized speed
    const speed = this.config.speed * (0.5 + Math.random() * 0.5) * this.emissionIntensity;
    this.velocities[i3] = velocityDir.x * speed;
    this.velocities[i3 + 1] = velocityDir.y * speed;
    this.velocities[i3 + 2] = velocityDir.z * speed;

    // Set lifetime
    const lifetime = this.config.lifetime * (0.5 + Math.random() * 0.5);
    this.lifetimes[i] = lifetime;
    this.maxLifetimes[i] = lifetime;

    // Initial color: bright white-yellow
    this.colors[i3] = 1.0;
    this.colors[i3 + 1] = 0.9;
    this.colors[i3 + 2] = 0.7;
  }

  /**
   * Update particle positions and colors
   */
  public update(delta: number): void {
    const count = this.config.maxParticles;

    // Emit new particles if active
    if (this.emitting) {
      // Emission rate based on intensity
      const emissionRate = 100 * this.emissionIntensity;
      this.emissionAccumulator += delta * emissionRate;

      while (this.emissionAccumulator >= 1) {
        this.spawnParticle();
        this.emissionAccumulator -= 1;
      }
    }

    // Update all particles
    for (let i = 0; i < count; i++) {
      if (this.lifetimes[i] <= 0) continue;

      const i3 = i * 3;

      // Update lifetime
      this.lifetimes[i] -= delta;

      if (this.lifetimes[i] <= 0) {
        // Hide dead particle
        this.positions[i3 + 1] = -1000;
        continue;
      }

      // Apply velocity
      this.positions[i3] += this.velocities[i3] * delta;
      this.positions[i3 + 1] += this.velocities[i3 + 1] * delta;
      this.positions[i3 + 2] += this.velocities[i3 + 2] * delta;

      // Apply gravity (reduced in water)
      this.velocities[i3 + 1] -= this.config.gravity * delta;

      // Apply water resistance
      this.velocities[i3] *= 0.98;
      this.velocities[i3 + 1] *= 0.98;
      this.velocities[i3 + 2] *= 0.98;

      // Update color based on lifetime (white -> orange -> red)
      const lifeRatio = this.lifetimes[i] / this.maxLifetimes[i];

      if (lifeRatio > 0.6) {
        // White to yellow
        this.colors[i3] = 1.0;
        this.colors[i3 + 1] = 0.7 + lifeRatio * 0.3;
        this.colors[i3 + 2] = lifeRatio;
      } else if (lifeRatio > 0.3) {
        // Yellow to orange
        this.colors[i3] = 1.0;
        this.colors[i3 + 1] = lifeRatio * 1.5;
        this.colors[i3 + 2] = 0;
      } else {
        // Orange to red to dark
        this.colors[i3] = lifeRatio * 3;
        this.colors[i3 + 1] = lifeRatio * 1.5;
        this.colors[i3 + 2] = 0;
      }
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
  }

  /**
   * Check if any particles are still alive
   */
  public isActive(): boolean {
    if (this.emitting) return true;

    for (let i = 0; i < this.config.maxParticles; i++) {
      if (this.lifetimes[i] > 0) return true;
    }
    return false;
  }

  /**
   * Set visibility
   */
  public setVisible(visible: boolean): void {
    this.particles.visible = visible;
  }

  /**
   * Clean up resources
   */
  public dispose(): void {
    this.scene.remove(this.particles);
    this.geometry.dispose();
    this.material.dispose();
  }
}
