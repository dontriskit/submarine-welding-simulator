/**
 * Submarine Physics
 *
 * Handles submarine movement physics including buoyancy, drag, and thruster forces.
 * Uses semi-implicit Euler integration for stability.
 */

import * as THREE from 'three';
import {
  SUBMARINE_MASS,
  WATER_DENSITY,
  GRAVITY,
  BUOYANCY_FORCE,
  DRAG_COEFFICIENT,
  ANGULAR_DRAG,
  MAX_SPEED,
  MAX_ROTATION_SPEED,
  MAX_DEPTH,
  THRUSTER_FORCE,
  VERTICAL_THRUSTER_FORCE,
} from '../core/Constants';

/** Submarine volume in cubic meters (for buoyancy) */
const SUBMARINE_VOLUME = SUBMARINE_MASS / (WATER_DENSITY * BUOYANCY_FORCE);

/** Pressure coefficient (Pa per meter of depth) */
const PRESSURE_COEFFICIENT = WATER_DENSITY * GRAVITY;

export class SubmarinePhysics {
  // Position and rotation
  private position: THREE.Vector3 = new THREE.Vector3(0, -10, 0);
  private rotation: THREE.Euler = new THREE.Euler(0, 0, 0, 'YXZ');
  private quaternion: THREE.Quaternion = new THREE.Quaternion();

  // Velocity
  private linearVelocity: THREE.Vector3 = new THREE.Vector3();
  private angularVelocity: THREE.Vector3 = new THREE.Vector3();

  // Accumulated forces for this frame
  private thrustInput: THREE.Vector3 = new THREE.Vector3();
  private rollInput: number = 0;

  // Temporary vectors for calculations (reused to avoid allocations)
  private tempVec3: THREE.Vector3 = new THREE.Vector3();
  private tempForce: THREE.Vector3 = new THREE.Vector3();

  constructor(initialPosition?: THREE.Vector3) {
    if (initialPosition) {
      this.position.copy(initialPosition);
    }
  }

  /**
   * Apply thrust input from controls
   * @param forward - Forward/backward thrust (-1 to 1)
   * @param strafe - Left/right thrust (-1 to 1)
   * @param vertical - Up/down thrust (-1 to 1)
   * @param roll - Roll input (-1 to 1)
   */
  public applyThrust(forward: number, strafe: number, vertical: number, roll: number): void {
    this.thrustInput.set(strafe, vertical, -forward); // Z is forward in Three.js
    this.rollInput = roll;
  }

  /**
   * Update physics simulation
   * @param delta - Time step in seconds
   */
  public update(delta: number): void {
    // Clamp delta to prevent instability
    const dt = Math.min(delta, 0.1);

    // Update quaternion from rotation
    this.quaternion.setFromEuler(this.rotation);

    // Calculate forces
    this.calculateForces(dt);

    // Integrate velocity
    this.integrateVelocity(dt);

    // Integrate position
    this.integratePosition(dt);

    // Update rotation from quaternion
    this.rotation.setFromQuaternion(this.quaternion);

    // Clear thrust input for next frame
    this.thrustInput.set(0, 0, 0);
    this.rollInput = 0;
  }

  private calculateForces(dt: number): void {
    // === LINEAR FORCES ===

    // 1. Buoyancy force (always upward)
    const buoyancyMagnitude = WATER_DENSITY * SUBMARINE_VOLUME * GRAVITY * BUOYANCY_FORCE;
    const gravityForce = SUBMARINE_MASS * GRAVITY;
    const netBuoyancy = buoyancyMagnitude - gravityForce;

    // 2. Thruster force (in local space, transform to world)
    this.tempForce.copy(this.thrustInput);
    this.tempForce.x *= THRUSTER_FORCE;
    this.tempForce.y *= VERTICAL_THRUSTER_FORCE;
    this.tempForce.z *= THRUSTER_FORCE;
    this.tempForce.applyQuaternion(this.quaternion);

    // 3. Drag force (opposes velocity)
    const speed = this.linearVelocity.length();
    if (speed > 0.001) {
      // Quadratic drag: F = -0.5 * rho * Cd * A * v^2
      // Simplified: F = -k * v^2 in direction of -v
      const dragMagnitude = DRAG_COEFFICIENT * speed * speed;
      this.tempVec3.copy(this.linearVelocity).normalize().multiplyScalar(-dragMagnitude);
      this.tempForce.add(this.tempVec3);
    }

    // 4. Apply net buoyancy
    this.tempForce.y += netBuoyancy;

    // Convert force to acceleration and apply to velocity
    this.tempForce.divideScalar(SUBMARINE_MASS);
    this.linearVelocity.addScaledVector(this.tempForce, dt);

    // === ANGULAR FORCES ===

    // Yaw from strafe component (turning)
    const yawTorque = -this.thrustInput.x * 0.5;

    // Pitch from vertical component
    const pitchTorque = this.thrustInput.y * 0.3;

    // Roll from roll input
    const rollTorque = this.rollInput * MAX_ROTATION_SPEED;

    // Apply torques
    this.angularVelocity.x += pitchTorque * dt;
    this.angularVelocity.y += yawTorque * dt;
    this.angularVelocity.z += rollTorque * dt;

    // Angular drag
    this.angularVelocity.multiplyScalar(1 - ANGULAR_DRAG * dt);
  }

  private integrateVelocity(_dt: number): void {
    // Clamp linear velocity
    const speed = this.linearVelocity.length();
    if (speed > MAX_SPEED) {
      this.linearVelocity.multiplyScalar(MAX_SPEED / speed);
    }

    // Clamp angular velocity
    this.angularVelocity.x = THREE.MathUtils.clamp(
      this.angularVelocity.x,
      -MAX_ROTATION_SPEED,
      MAX_ROTATION_SPEED
    );
    this.angularVelocity.y = THREE.MathUtils.clamp(
      this.angularVelocity.y,
      -MAX_ROTATION_SPEED,
      MAX_ROTATION_SPEED
    );
    this.angularVelocity.z = THREE.MathUtils.clamp(
      this.angularVelocity.z,
      -MAX_ROTATION_SPEED,
      MAX_ROTATION_SPEED
    );
  }

  private integratePosition(dt: number): void {
    // Update position
    this.position.addScaledVector(this.linearVelocity, dt);

    // Clamp depth (y should be negative for underwater)
    if (this.position.y > 0) {
      this.position.y = 0;
      this.linearVelocity.y = Math.min(0, this.linearVelocity.y);
    }
    if (this.position.y < -MAX_DEPTH) {
      this.position.y = -MAX_DEPTH;
      this.linearVelocity.y = Math.max(0, this.linearVelocity.y);
    }

    // Update rotation via quaternion
    const angularDelta = this.tempVec3.copy(this.angularVelocity).multiplyScalar(dt);
    const deltaQuat = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(angularDelta.x, angularDelta.y, angularDelta.z, 'YXZ')
    );
    this.quaternion.multiply(deltaQuat);
    this.quaternion.normalize();
  }

  // === GETTERS ===

  /**
   * Get current position
   */
  public getPosition(): THREE.Vector3 {
    return this.position.clone();
  }

  /**
   * Get current rotation
   */
  public getRotation(): THREE.Euler {
    return this.rotation.clone();
  }

  /**
   * Get current quaternion
   */
  public getQuaternion(): THREE.Quaternion {
    return this.quaternion.clone();
  }

  /**
   * Get current linear velocity
   */
  public getVelocity(): THREE.Vector3 {
    return this.linearVelocity.clone();
  }

  /**
   * Get current angular velocity
   */
  public getAngularVelocity(): THREE.Vector3 {
    return this.angularVelocity.clone();
  }

  /**
   * Get current speed (magnitude of velocity)
   */
  public getSpeed(): number {
    return this.linearVelocity.length();
  }

  /**
   * Get current depth (positive value, meters below surface)
   */
  public getDepth(): number {
    return Math.max(0, -this.position.y);
  }

  /**
   * Get current pressure in kPa
   */
  public getPressure(): number {
    const depth = this.getDepth();
    // Atmospheric pressure + water pressure
    return 101.325 + (PRESSURE_COEFFICIENT * depth) / 1000;
  }

  // === SETTERS ===

  /**
   * Set position directly (for teleporting/respawn)
   */
  public setPosition(position: THREE.Vector3): void {
    this.position.copy(position);
    this.linearVelocity.set(0, 0, 0);
  }

  /**
   * Set rotation directly
   */
  public setRotation(rotation: THREE.Euler): void {
    this.rotation.copy(rotation);
    this.quaternion.setFromEuler(rotation);
    this.angularVelocity.set(0, 0, 0);
  }

  /**
   * Reset physics state
   */
  public reset(position?: THREE.Vector3): void {
    this.position.set(0, -10, 0);
    if (position) {
      this.position.copy(position);
    }
    this.rotation.set(0, 0, 0);
    this.quaternion.identity();
    this.linearVelocity.set(0, 0, 0);
    this.angularVelocity.set(0, 0, 0);
  }
}

export default SubmarinePhysics;
