/**
 * BubbleEffect.ts
 * Ambient underwater bubble particle system.
 *
 * CODER-B Task B15
 */

import * as THREE from 'three';

/**
 * Configuration for bubble effect
 */
export interface BubbleEffectConfig {
  /** Maximum number of particles */
  maxParticles?: number;
  /** Minimum bubble size */
  minSize?: number;
  /** Maximum bubble size */
  maxSize?: number;
  /** Base rise speed */
  riseSpeed?: number;
  /** Horizontal wobble amplitude */
  wobbleAmplitude?: number;
  /** Wobble frequency */
  wobbleFrequency?: number;
  /** Maximum height before respawn */
  maxHeight?: number;
  /** Bubble color */
  color?: number;
  /** Bubble opacity */
  opacity?: number;
}

const DEFAULT_CONFIG: Required<BubbleEffectConfig> = {
  maxParticles: 200,
  minSize: 0.02,
  maxSize: 0.12,
  riseSpeed: 0.8,
  wobbleAmplitude: 0.3,
  wobbleFrequency: 2.0,
  maxHeight: 0,
  color: 0xaaccff,
  opacity: 0.6,
};

/**
 * Bubble particle system for underwater ambiance
 */
export class BubbleEffect {
  private scene: THREE.Scene;
  private particles: THREE.Points;
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private config: Required<BubbleEffectConfig>;

  // Particle data
  private positions: Float32Array;
  private velocities: Float32Array;
  private sizes: Float32Array;
  private phases: Float32Array; // For wobble offset
  private lifetimes: Float32Array;

  // Emission
  private emissionOrigin: THREE.Vector3 = new THREE.Vector3(0, -10, 0);
  private emissionRadius: number = 2;
  private time: number = 0;

  constructor(scene: THREE.Scene, config: BubbleEffectConfig = {}) {
    this.scene = scene;
    this.config = { ...DEFAULT_CONFIG, ...config };

    const count = this.config.maxParticles;

    // Initialize arrays
    this.positions = new Float32Array(count * 3);
    this.velocities = new Float32Array(count * 3);
    this.sizes = new Float32Array(count);
    this.phases = new Float32Array(count);
    this.lifetimes = new Float32Array(count);

    // Create geometry
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));

    // Create material with custom size attenuation
    this.material = new THREE.PointsMaterial({
      color: this.config.color,
      size: this.config.maxSize,
      transparent: true,
      opacity: this.config.opacity,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    // Create points
    this.particles = new THREE.Points(this.geometry, this.material);
    this.particles.name = 'BubbleEffect';
    this.particles.frustumCulled = false;

    // Initialize particles
    this.initializeParticles();

    // Add to scene
    this.scene.add(this.particles);
  }

  /**
   * Initialize all particles with random positions
   */
  private initializeParticles(): void {
    const count = this.config.maxParticles;

    for (let i = 0; i < count; i++) {
      this.respawnParticle(i);
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.size.needsUpdate = true;
  }

  /**
   * Respawn a particle at emission origin
   */
  private respawnParticle(index: number): void {
    const i3 = index * 3;

    // Random position around emission origin
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * this.emissionRadius;

    this.positions[i3] = this.emissionOrigin.x + Math.cos(angle) * radius;
    this.positions[i3 + 1] = this.emissionOrigin.y - Math.random() * 5; // Start below
    this.positions[i3 + 2] = this.emissionOrigin.z + Math.sin(angle) * radius;

    // Random velocity (mostly upward)
    this.velocities[i3] = (Math.random() - 0.5) * 0.1;
    this.velocities[i3 + 1] = this.config.riseSpeed * (0.5 + Math.random() * 0.5);
    this.velocities[i3 + 2] = (Math.random() - 0.5) * 0.1;

    // Random size
    this.sizes[index] =
      this.config.minSize +
      Math.random() * (this.config.maxSize - this.config.minSize);

    // Random phase for wobble
    this.phases[index] = Math.random() * Math.PI * 2;

    // Random lifetime
    this.lifetimes[index] = 5 + Math.random() * 10;
  }

  /**
   * Set emission origin point
   */
  public setEmissionOrigin(position: THREE.Vector3): void {
    this.emissionOrigin.copy(position);
  }

  /**
   * Set emission radius
   */
  public setEmissionRadius(radius: number): void {
    this.emissionRadius = radius;
  }

  /**
   * Emit a burst of bubbles at a position
   */
  public emit(position: THREE.Vector3, amount: number = 10): void {
    const count = this.config.maxParticles;
    let emitted = 0;

    for (let i = 0; i < count && emitted < amount; i++) {
      // Find particles that are "dead" (above max height)
      if (this.positions[i * 3 + 1] > this.config.maxHeight) {
        const i3 = i * 3;

        // Spawn at position
        this.positions[i3] = position.x + (Math.random() - 0.5) * 0.5;
        this.positions[i3 + 1] = position.y;
        this.positions[i3 + 2] = position.z + (Math.random() - 0.5) * 0.5;

        // Fast initial rise
        this.velocities[i3] = (Math.random() - 0.5) * 0.2;
        this.velocities[i3 + 1] = this.config.riseSpeed * (1 + Math.random());
        this.velocities[i3 + 2] = (Math.random() - 0.5) * 0.2;

        this.sizes[i] =
          this.config.minSize +
          Math.random() * (this.config.maxSize - this.config.minSize);
        this.phases[i] = Math.random() * Math.PI * 2;

        emitted++;
      }
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.size.needsUpdate = true;
  }

  /**
   * Update particle positions
   */
  public update(delta: number): void {
    this.time += delta;
    const count = this.config.maxParticles;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Update position with velocity
      this.positions[i3] += this.velocities[i3] * delta;
      this.positions[i3 + 1] += this.velocities[i3 + 1] * delta;
      this.positions[i3 + 2] += this.velocities[i3 + 2] * delta;

      // Add wobble
      const wobbleOffset = Math.sin(this.time * this.config.wobbleFrequency + this.phases[i]);
      this.positions[i3] += wobbleOffset * this.config.wobbleAmplitude * delta;

      // Decrease lifetime
      this.lifetimes[i] -= delta;

      // Respawn if above max height or lifetime expired
      if (this.positions[i3 + 1] > this.config.maxHeight || this.lifetimes[i] <= 0) {
        this.respawnParticle(i);
      }

      // Slow down horizontal velocity over time
      this.velocities[i3] *= 0.99;
      this.velocities[i3 + 2] *= 0.99;
    }

    this.geometry.attributes.position.needsUpdate = true;
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
