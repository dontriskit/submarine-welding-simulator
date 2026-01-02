/**
 * CausticsEffect.ts
 * Animated underwater light caustic patterns.
 *
 * CODER-B Task B15
 */

import * as THREE from 'three';

/**
 * Vertex shader for caustics
 */
const vertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Fragment shader for caustics
 */
const fragmentShader = `
  uniform float time;
  uniform float intensity;
  uniform vec3 color;
  uniform float scale;

  varying vec2 vUv;
  varying vec3 vPosition;

  // Simplex-like noise for caustic pattern
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // Caustic pattern generator
  float caustic(vec2 uv, float t) {
    float c = 0.0;

    // Layer 1: large slow waves
    vec2 uv1 = uv * scale + t * 0.05;
    c += sin(uv1.x * 8.0 + sin(uv1.y * 6.0 + t * 0.5)) * 0.5 + 0.5;

    // Layer 2: medium waves
    vec2 uv2 = uv * scale * 1.5 + t * 0.08;
    c += sin(uv2.y * 10.0 + sin(uv2.x * 8.0 + t * 0.7)) * 0.5 + 0.5;

    // Layer 3: small fast ripples
    vec2 uv3 = uv * scale * 2.0 + t * 0.12;
    c += sin(uv3.x * 12.0 + cos(uv3.y * 10.0 + t)) * 0.5 + 0.5;

    // Add noise for more organic look
    c += noise(uv * scale * 3.0 + t * 0.1) * 0.3;

    // Normalize and apply threshold for light bands
    c = c / 3.3;
    c = smoothstep(0.3, 0.7, c);

    return c;
  }

  void main() {
    // Calculate caustic pattern
    float c = caustic(vUv, time);

    // Apply intensity and color
    vec3 finalColor = color * c * intensity;

    // Output with alpha based on caustic intensity
    gl_FragColor = vec4(finalColor, c * intensity * 0.8);
  }
`;

/**
 * Configuration for caustics effect
 */
export interface CausticsEffectConfig {
  /** Size of the caustics plane */
  size?: number;
  /** Light color */
  color?: number;
  /** Effect intensity (0-1) */
  intensity?: number;
  /** Pattern scale */
  scale?: number;
  /** Animation speed multiplier */
  speed?: number;
}

const DEFAULT_CONFIG: Required<CausticsEffectConfig> = {
  size: 100,
  color: 0x88ccff,
  intensity: 0.4,
  scale: 1.0,
  speed: 1.0,
};

/**
 * Underwater caustic light effect
 */
export class CausticsEffect {
  private scene: THREE.Scene;
  private mesh: THREE.Mesh;
  private material: THREE.ShaderMaterial;
  private config: Required<CausticsEffectConfig>;
  private time: number = 0;

  constructor(scene: THREE.Scene, config: CausticsEffectConfig = {}) {
    this.scene = scene;
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Create plane geometry
    const geometry = new THREE.PlaneGeometry(this.config.size, this.config.size, 1, 1);

    // Convert color to vec3
    const colorVec = new THREE.Color(this.config.color);

    // Create shader material
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        intensity: { value: this.config.intensity },
        color: { value: new THREE.Vector3(colorVec.r, colorVec.g, colorVec.b) },
        scale: { value: this.config.scale },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    // Create mesh
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.name = 'CausticsEffect';
    this.mesh.rotation.x = -Math.PI / 2; // Horizontal plane
    this.mesh.position.y = -20; // Below water surface

    // Add to scene
    this.scene.add(this.mesh);
  }

  /**
   * Update animation
   */
  public update(delta: number): void {
    this.time += delta * this.config.speed;
    this.material.uniforms.time.value = this.time;
  }

  /**
   * Set position of caustics plane
   */
  public setPosition(x: number, y: number, z: number): void {
    this.mesh.position.set(x, y, z);
  }

  /**
   * Move to follow a target (e.g., submarine)
   */
  public followTarget(target: THREE.Vector3): void {
    this.mesh.position.x = target.x;
    this.mesh.position.z = target.z;
    // Keep Y position fixed (on the floor)
  }

  /**
   * Set intensity based on depth (dimmer at deeper levels)
   */
  public setIntensity(intensity: number): void {
    this.material.uniforms.intensity.value = Math.max(0, Math.min(1, intensity));
  }

  /**
   * Set intensity based on depth (dimmer at deeper levels)
   */
  public setDepthBasedIntensity(depth: number): void {
    // At surface (0m) = full intensity, at 50m = minimal
    const depthFactor = Math.max(0, 1 - Math.abs(depth) / 50);
    this.setIntensity(this.config.intensity * depthFactor);
  }

  /**
   * Set caustics color
   */
  public setColor(color: number): void {
    const colorVec = new THREE.Color(color);
    this.material.uniforms.color.value.set(colorVec.r, colorVec.g, colorVec.b);
  }

  /**
   * Set pattern scale
   */
  public setScale(scale: number): void {
    this.material.uniforms.scale.value = scale;
  }

  /**
   * Set visibility
   */
  public setVisible(visible: boolean): void {
    this.mesh.visible = visible;
  }

  /**
   * Get the mesh for external positioning
   */
  public getMesh(): THREE.Mesh {
    return this.mesh;
  }

  /**
   * Clean up resources
   */
  public dispose(): void {
    this.scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
