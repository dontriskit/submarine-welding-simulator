/**
 * Welding Arm Physics
 *
 * Handles articulated welding arm movement with joint constraints.
 * 4-DOF arm: base yaw, shoulder pitch, elbow pitch, wrist rotation
 * Plus linear extension of the final segment.
 */

import * as THREE from 'three';
import {
  ARM_JOINT_COUNT,
  ARM_MAX_EXTENSION,
  ARM_MIN_EXTENSION,
  ARM_ROTATION_SPEED,
  ARM_EXTENSION_SPEED,
  ARM_JOINT_LIMITS,
} from '../core/Constants';

/** Segment lengths in meters */
const SEGMENT_LENGTHS = {
  base: 0.3,      // Base mount
  upper: 0.8,     // Upper arm
  lower: 0.6,     // Lower arm (forearm)
  wrist: 0.2,     // Wrist joint
};

export interface ArmJointState {
  base: number;     // Yaw rotation (radians)
  shoulder: number; // Pitch rotation (radians)
  elbow: number;    // Pitch rotation (radians)
  wrist: number;    // Roll rotation (radians)
}

export class WeldingArmPhysics {
  // Joint angles (radians)
  private joints: ArmJointState = {
    base: 0,
    shoulder: 0,
    elbow: -Math.PI * 0.25, // Start slightly bent
    wrist: 0,
  };

  // Joint velocities (rad/s)
  private jointVelocities: ArmJointState = {
    base: 0,
    shoulder: 0,
    elbow: 0,
    wrist: 0,
  };

  // Extension (meters)
  private extension: number = ARM_MIN_EXTENSION + (ARM_MAX_EXTENSION - ARM_MIN_EXTENSION) * 0.5;
  private extensionVelocity: number = 0;

  // Input accumulators
  private yawInput: number = 0;
  private pitchInput: number = 0;
  private extendInput: number = 0;
  private rotateInput: number = 0;

  // Damping factor for smooth stops
  private readonly DAMPING = 5.0;

  constructor() {
    // Initialize to default pose
    this.reset();
  }

  /**
   * Apply control input
   * @param yaw - Base yaw input (-1 to 1)
   * @param pitch - Shoulder/elbow pitch input (-1 to 1)
   * @param extend - Extension input (-1 to 1)
   * @param rotate - Wrist rotation input (-1 to 1)
   */
  public applyInput(yaw: number, pitch: number, extend: number, rotate: number): void {
    this.yawInput = yaw;
    this.pitchInput = pitch;
    this.extendInput = extend;
    this.rotateInput = rotate;
  }

  /**
   * Update arm physics
   * @param delta - Time step in seconds
   */
  public update(delta: number): void {
    const dt = Math.min(delta, 0.1);

    // Update joint velocities based on input
    this.updateJointVelocities(dt);

    // Integrate joint angles
    this.integrateJoints(dt);

    // Update extension
    this.updateExtension(dt);

    // Clear inputs
    this.yawInput = 0;
    this.pitchInput = 0;
    this.extendInput = 0;
    this.rotateInput = 0;
  }

  private updateJointVelocities(dt: number): void {
    // Target velocities from input
    const targetBaseVel = this.yawInput * ARM_ROTATION_SPEED;
    const targetShoulderVel = this.pitchInput * ARM_ROTATION_SPEED * 0.7;
    const targetElbowVel = this.pitchInput * ARM_ROTATION_SPEED;
    const targetWristVel = this.rotateInput * ARM_ROTATION_SPEED * 1.5;

    // Smooth velocity changes (simple damping)
    const smoothing = 1 - Math.exp(-this.DAMPING * dt);

    this.jointVelocities.base += (targetBaseVel - this.jointVelocities.base) * smoothing;
    this.jointVelocities.shoulder += (targetShoulderVel - this.jointVelocities.shoulder) * smoothing;
    this.jointVelocities.elbow += (targetElbowVel - this.jointVelocities.elbow) * smoothing;
    this.jointVelocities.wrist += (targetWristVel - this.jointVelocities.wrist) * smoothing;

    // Extension velocity
    const targetExtVel = this.extendInput * ARM_EXTENSION_SPEED;
    this.extensionVelocity += (targetExtVel - this.extensionVelocity) * smoothing;
  }

  private integrateJoints(dt: number): void {
    // Integrate base (yaw)
    this.joints.base += this.jointVelocities.base * dt;
    this.joints.base = this.clampJoint(this.joints.base, ARM_JOINT_LIMITS.base);

    // Integrate shoulder (pitch)
    this.joints.shoulder += this.jointVelocities.shoulder * dt;
    this.joints.shoulder = this.clampJoint(this.joints.shoulder, ARM_JOINT_LIMITS.shoulder);

    // Integrate elbow (pitch)
    this.joints.elbow += this.jointVelocities.elbow * dt;
    this.joints.elbow = this.clampJoint(this.joints.elbow, ARM_JOINT_LIMITS.elbow);

    // Integrate wrist (roll)
    this.joints.wrist += this.jointVelocities.wrist * dt;
    this.joints.wrist = this.clampJoint(this.joints.wrist, ARM_JOINT_LIMITS.wrist);

    // Stop velocity at limits
    if (this.joints.base <= ARM_JOINT_LIMITS.base.min || this.joints.base >= ARM_JOINT_LIMITS.base.max) {
      this.jointVelocities.base = 0;
    }
    if (this.joints.shoulder <= ARM_JOINT_LIMITS.shoulder.min || this.joints.shoulder >= ARM_JOINT_LIMITS.shoulder.max) {
      this.jointVelocities.shoulder = 0;
    }
    if (this.joints.elbow <= ARM_JOINT_LIMITS.elbow.min || this.joints.elbow >= ARM_JOINT_LIMITS.elbow.max) {
      this.jointVelocities.elbow = 0;
    }
    if (this.joints.wrist <= ARM_JOINT_LIMITS.wrist.min || this.joints.wrist >= ARM_JOINT_LIMITS.wrist.max) {
      this.jointVelocities.wrist = 0;
    }
  }

  private updateExtension(dt: number): void {
    this.extension += this.extensionVelocity * dt;
    this.extension = THREE.MathUtils.clamp(this.extension, ARM_MIN_EXTENSION, ARM_MAX_EXTENSION);

    // Stop velocity at limits
    if (this.extension <= ARM_MIN_EXTENSION || this.extension >= ARM_MAX_EXTENSION) {
      this.extensionVelocity = 0;
    }
  }

  private clampJoint(angle: number, limits: { min: number; max: number }): number {
    return THREE.MathUtils.clamp(angle, limits.min, limits.max);
  }

  // === GETTERS ===

  /**
   * Get current joint angles as array [base, shoulder, elbow, wrist]
   */
  public getJointAngles(): number[] {
    return [
      this.joints.base,
      this.joints.shoulder,
      this.joints.elbow,
      this.joints.wrist,
    ];
  }

  /**
   * Get joint state object
   */
  public getJointState(): ArmJointState {
    return { ...this.joints };
  }

  /**
   * Get current extension in meters
   */
  public getExtension(): number {
    return this.extension;
  }

  /**
   * Calculate torch tip position in local arm space
   * Origin is at the arm mount point
   */
  public getTipPositionLocal(): THREE.Vector3 {
    const tip = new THREE.Vector3();

    // Start at base
    let x = 0, y = SEGMENT_LENGTHS.base, z = 0;

    // Apply base rotation (yaw around Y)
    const cosBase = Math.cos(this.joints.base);
    const sinBase = Math.sin(this.joints.base);

    // Shoulder position (rotated by base yaw)
    // Shoulder pitch rotates around local X axis
    const shoulderAngle = this.joints.shoulder;
    const cosShoulder = Math.cos(shoulderAngle);
    const sinShoulder = Math.sin(shoulderAngle);

    // Upper arm extends from shoulder
    const upperY = SEGMENT_LENGTHS.upper * cosShoulder;
    const upperZ = SEGMENT_LENGTHS.upper * sinShoulder;

    // Apply base yaw to upper arm offset
    z += upperZ * cosBase;
    x += upperZ * sinBase;
    y += upperY;

    // Elbow pitch (cumulative with shoulder)
    const elbowAngle = this.joints.shoulder + this.joints.elbow;
    const cosElbow = Math.cos(elbowAngle);
    const sinElbow = Math.sin(elbowAngle);

    // Lower arm extends from elbow
    const lowerY = SEGMENT_LENGTHS.lower * cosElbow;
    const lowerZ = SEGMENT_LENGTHS.lower * sinElbow;

    // Apply base yaw to lower arm offset
    z += lowerZ * cosBase;
    x += lowerZ * sinBase;
    y += lowerY;

    // Extension (along the final segment direction)
    const extensionY = this.extension * cosElbow;
    const extensionZ = this.extension * sinElbow;

    z += extensionZ * cosBase;
    x += extensionZ * sinBase;
    y += extensionY;

    tip.set(x, y, z);
    return tip;
  }

  /**
   * Calculate torch tip position in world space
   * @param basePosition - World position of arm mount
   * @param baseRotation - World rotation of submarine
   */
  public getTipPosition(basePosition: THREE.Vector3, baseRotation: THREE.Quaternion): THREE.Vector3 {
    const localTip = this.getTipPositionLocal();
    localTip.applyQuaternion(baseRotation);
    localTip.add(basePosition);
    return localTip;
  }

  /**
   * Get torch direction vector in local space
   */
  public getTorchDirectionLocal(): THREE.Vector3 {
    // Direction is along the final segment
    const totalAngle = this.joints.shoulder + this.joints.elbow;
    const dir = new THREE.Vector3(0, Math.cos(totalAngle), Math.sin(totalAngle));

    // Apply base yaw
    const cosBase = Math.cos(this.joints.base);
    const sinBase = Math.sin(this.joints.base);
    const z = dir.z;
    dir.z = z * cosBase;
    dir.x = z * sinBase;

    return dir.normalize();
  }

  /**
   * Get torch direction in world space
   */
  public getTorchDirection(baseRotation: THREE.Quaternion): THREE.Vector3 {
    const localDir = this.getTorchDirectionLocal();
    localDir.applyQuaternion(baseRotation);
    return localDir;
  }

  // === SETTERS ===

  /**
   * Set joint angles directly
   */
  public setJointAngles(angles: number[]): void {
    if (angles.length >= ARM_JOINT_COUNT) {
      this.joints.base = this.clampJoint(angles[0], ARM_JOINT_LIMITS.base);
      this.joints.shoulder = this.clampJoint(angles[1], ARM_JOINT_LIMITS.shoulder);
      this.joints.elbow = this.clampJoint(angles[2], ARM_JOINT_LIMITS.elbow);
      this.joints.wrist = this.clampJoint(angles[3], ARM_JOINT_LIMITS.wrist);
    }
  }

  /**
   * Set extension directly
   */
  public setExtension(ext: number): void {
    this.extension = THREE.MathUtils.clamp(ext, ARM_MIN_EXTENSION, ARM_MAX_EXTENSION);
  }

  /**
   * Reset arm to default pose
   */
  public reset(): void {
    this.joints = {
      base: 0,
      shoulder: 0,
      elbow: -Math.PI * 0.25,
      wrist: 0,
    };
    this.jointVelocities = {
      base: 0,
      shoulder: 0,
      elbow: 0,
      wrist: 0,
    };
    this.extension = ARM_MIN_EXTENSION + (ARM_MAX_EXTENSION - ARM_MIN_EXTENSION) * 0.5;
    this.extensionVelocity = 0;
  }
}

export default WeldingArmPhysics;
