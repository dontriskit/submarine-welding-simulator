/**
 * WeldingArm.ts
 * Articulated 4-joint welding arm entity.
 *
 * CODER-B Task B4
 */

import * as THREE from 'three';
import type { IWeldingArm, IWeldingTorch } from '../types/interfaces';
import { WeldingTorch } from './WeldingTorch';
import {
  ARM_JOINT_COUNT,
  ARM_ROTATION_SPEED,
  ARM_EXTENSION_SPEED,
  ARM_MAX_EXTENSION,
  ARM_MIN_EXTENSION,
  ARM_JOINT_LIMITS,
} from '../core/Constants';

/**
 * Joint configuration for arm segments
 */
interface JointConfig {
  name: string;
  segmentLength: number;
  segmentRadius: number;
  axis: 'x' | 'y' | 'z';
  limits: { min: number; max: number };
}

/**
 * Articulated welding arm with 4 joints and attached torch
 */
export class WeldingArm implements IWeldingArm {
  public readonly mesh: THREE.Group;

  private joints: THREE.Group[] = [];
  private jointAngles: number[] = [];
  private segments: THREE.Mesh[] = [];
  private torch: WeldingTorch;
  private extension: number = ARM_MIN_EXTENSION;

  // Input state for smooth movement
  private targetAngles: number[] = [];

  private readonly jointConfigs: JointConfig[] = [
    {
      name: 'base',
      segmentLength: 0.15,
      segmentRadius: 0.04,
      axis: 'y',
      limits: ARM_JOINT_LIMITS.base,
    },
    {
      name: 'shoulder',
      segmentLength: 0.4,
      segmentRadius: 0.035,
      axis: 'x',
      limits: ARM_JOINT_LIMITS.shoulder,
    },
    {
      name: 'elbow',
      segmentLength: 0.35,
      segmentRadius: 0.03,
      axis: 'x',
      limits: ARM_JOINT_LIMITS.elbow,
    },
    {
      name: 'wrist',
      segmentLength: 0.15,
      segmentRadius: 0.025,
      axis: 'z',
      limits: ARM_JOINT_LIMITS.wrist,
    },
  ];

  constructor() {
    this.mesh = new THREE.Group();
    this.mesh.name = 'WeldingArm';

    // Initialize joint angles
    for (let i = 0; i < ARM_JOINT_COUNT; i++) {
      this.jointAngles.push(0);
      this.targetAngles.push(0);
    }

    // Build arm hierarchy
    this.buildArmStructure();

    // Create and attach torch
    this.torch = new WeldingTorch();
    this.attachTorch();
  }

  /**
   * Build the hierarchical arm structure
   */
  private buildArmStructure(): void {
    let parentGroup = this.mesh;

    for (let i = 0; i < this.jointConfigs.length; i++) {
      const config = this.jointConfigs[i];

      // Create joint group (rotation point)
      const joint = new THREE.Group();
      joint.name = `Joint_${config.name}`;

      // Create arm segment
      const segment = this.createSegment(config);

      // Position segment relative to joint
      if (config.axis === 'y') {
        segment.position.y = config.segmentLength / 2;
      } else {
        segment.position.y = config.segmentLength / 2;
      }

      joint.add(segment);

      // Position joint at end of previous segment
      if (i > 0) {
        const prevConfig = this.jointConfigs[i - 1];
        joint.position.y = prevConfig.segmentLength;
      }

      parentGroup.add(joint);
      this.joints.push(joint);
      this.segments.push(segment);

      // Next segment attaches to this joint
      parentGroup = joint;
    }
  }

  /**
   * Create a single arm segment mesh
   */
  private createSegment(config: JointConfig): THREE.Mesh {
    const geometry = new THREE.CylinderGeometry(
      config.segmentRadius * 0.9,
      config.segmentRadius,
      config.segmentLength,
      8
    );

    const material = new THREE.MeshStandardMaterial({
      color: 0x556677,
      metalness: 0.7,
      roughness: 0.4,
    });

    const segment = new THREE.Mesh(geometry, material);
    segment.name = `Segment_${config.name}`;

    // Add joint connector visual
    const connectorGeometry = new THREE.SphereGeometry(config.segmentRadius * 1.2, 8, 8);
    const connectorMaterial = new THREE.MeshStandardMaterial({
      color: 0x445566,
      metalness: 0.8,
      roughness: 0.3,
    });
    const connector = new THREE.Mesh(connectorGeometry, connectorMaterial);
    connector.position.y = -config.segmentLength / 2;
    segment.add(connector);

    return segment;
  }

  /**
   * Attach torch to the end of the arm
   */
  private attachTorch(): void {
    const lastJoint = this.joints[this.joints.length - 1];
    const lastConfig = this.jointConfigs[this.jointConfigs.length - 1];

    // Position torch at end of last segment
    this.torch.mesh.position.y = lastConfig.segmentLength;
    this.torch.mesh.rotation.x = -Math.PI / 2; // Point outward

    lastJoint.add(this.torch.mesh);
  }

  /**
   * Get current joint angles in radians
   */
  public getJointAngles(): number[] {
    return [...this.jointAngles];
  }

  /**
   * Get the welding torch
   */
  public getTorch(): IWeldingTorch {
    return this.torch;
  }

  /**
   * Get the world position of the torch tip
   */
  public getTorchTipPosition(): THREE.Vector3 {
    return this.torch.getTipWorldPosition();
  }

  /**
   * Get the torch direction vector in world space
   */
  public getTorchDirection(): THREE.Vector3 {
    return this.torch.getTipWorldDirection();
  }

  /**
   * Apply arm control input
   * @param yaw - Base rotation (-1 to 1)
   * @param pitch - Shoulder/elbow pitch (-1 to 1)
   * @param extend - Extension control (-1 to 1)
   * @param rotate - Wrist rotation (-1 to 1)
   */
  public applyInput(yaw: number, pitch: number, extend: number, rotate: number): void {
    // Map inputs to target joint angles
    // Base (index 0): yaw control
    this.targetAngles[0] += yaw * ARM_ROTATION_SPEED * 0.016; // Approximate delta

    // Shoulder (index 1): pitch up
    this.targetAngles[1] += pitch * ARM_ROTATION_SPEED * 0.5 * 0.016;

    // Elbow (index 2): pitch (inverse for natural feel)
    this.targetAngles[2] -= pitch * ARM_ROTATION_SPEED * 0.5 * 0.016;

    // Wrist (index 3): rotation
    this.targetAngles[3] += rotate * ARM_ROTATION_SPEED * 0.016;

    // Extension affects shoulder and elbow together
    this.extension += extend * ARM_EXTENSION_SPEED * 0.016;
    this.extension = Math.max(ARM_MIN_EXTENSION, Math.min(ARM_MAX_EXTENSION, this.extension));

    // Clamp target angles to limits
    for (let i = 0; i < this.jointConfigs.length; i++) {
      const limits = this.jointConfigs[i].limits;
      this.targetAngles[i] = Math.max(limits.min, Math.min(limits.max, this.targetAngles[i]));
    }
  }

  /**
   * Update arm state (called every frame)
   */
  public update(delta: number): void {
    // Smoothly interpolate joint angles toward targets
    const lerpSpeed = 8 * delta;

    for (let i = 0; i < this.joints.length; i++) {
      // Lerp current angle toward target
      this.jointAngles[i] += (this.targetAngles[i] - this.jointAngles[i]) * lerpSpeed;

      // Apply rotation based on joint axis
      const config = this.jointConfigs[i];
      const joint = this.joints[i];

      switch (config.axis) {
        case 'x':
          joint.rotation.x = this.jointAngles[i];
          break;
        case 'y':
          joint.rotation.y = this.jointAngles[i];
          break;
        case 'z':
          joint.rotation.z = this.jointAngles[i];
          break;
      }
    }

    // Update extension by scaling middle segments
    const extensionFactor = this.extension / ((ARM_MAX_EXTENSION + ARM_MIN_EXTENSION) / 2);
    if (this.segments[1]) {
      this.segments[1].scale.y = extensionFactor;
      this.joints[2].position.y = this.jointConfigs[1].segmentLength * extensionFactor;
    }

    // Update torch
    this.torch.update(delta);
  }

  /**
   * Reset arm to default position
   */
  public reset(): void {
    for (let i = 0; i < ARM_JOINT_COUNT; i++) {
      this.jointAngles[i] = 0;
      this.targetAngles[i] = 0;
    }
    this.extension = ARM_MIN_EXTENSION;
  }
}
