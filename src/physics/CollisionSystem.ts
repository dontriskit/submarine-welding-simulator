/**
 * CollisionSystem.ts
 * Simple collision detection for submarine boundaries.
 *
 * CODER-A Task A-MECH-5 (Issue #27)
 */

import * as THREE from 'three';

/** Collision bounds configuration */
export interface CollisionBounds {
  /** Maximum Y position (surface) */
  surfaceY: number;
  /** Minimum Y position (seafloor) */
  seafloorY: number;
  /** Submarine radius for collision buffer */
  submarineRadius: number;
  /** Soft boundary zone where resistance increases */
  softBoundaryZone: number;
}

/** Default collision bounds */
const DEFAULT_BOUNDS: CollisionBounds = {
  surfaceY: 0,
  seafloorY: -50,
  submarineRadius: 0.5, // Half of 1m diameter
  softBoundaryZone: 2.0, // Start slowing 2m before hard boundary
};

/**
 * Collision detection and response system
 */
export class CollisionSystem {
  private bounds: CollisionBounds;

  constructor(bounds?: Partial<CollisionBounds>) {
    this.bounds = { ...DEFAULT_BOUNDS, ...bounds };
  }

  /**
   * Check and resolve collisions for submarine position
   * Returns corrected position and any collision response velocity
   */
  public checkCollision(
    position: THREE.Vector3,
    velocity: THREE.Vector3
  ): { position: THREE.Vector3; velocity: THREE.Vector3; collided: boolean } {
    const correctedPos = position.clone();
    const correctedVel = velocity.clone();
    let collided = false;

    // Calculate effective boundaries (accounting for submarine size)
    const maxY = this.bounds.surfaceY - this.bounds.submarineRadius;
    const minY = this.bounds.seafloorY + this.bounds.submarineRadius;

    // Check surface collision
    if (correctedPos.y > maxY) {
      correctedPos.y = maxY;
      // Bounce back gently
      if (correctedVel.y > 0) {
        correctedVel.y = -correctedVel.y * 0.3;
      }
      collided = true;
    }

    // Check seafloor collision
    if (correctedPos.y < minY) {
      correctedPos.y = minY;
      // Bounce back gently
      if (correctedVel.y < 0) {
        correctedVel.y = -correctedVel.y * 0.3;
      }
      collided = true;
    }

    return { position: correctedPos, velocity: correctedVel, collided };
  }

  /**
   * Calculate resistance force when approaching boundaries
   * Returns a multiplier (0-1) to reduce velocity near boundaries
   */
  public getBoundaryResistance(position: THREE.Vector3): number {
    const maxY = this.bounds.surfaceY - this.bounds.submarineRadius;
    const minY = this.bounds.seafloorY + this.bounds.submarineRadius;
    const zone = this.bounds.softBoundaryZone;

    let resistance = 1.0; // No resistance

    // Near surface
    const distToSurface = maxY - position.y;
    if (distToSurface < zone && distToSurface > 0) {
      resistance = Math.min(resistance, distToSurface / zone);
    }

    // Near seafloor
    const distToFloor = position.y - minY;
    if (distToFloor < zone && distToFloor > 0) {
      resistance = Math.min(resistance, distToFloor / zone);
    }

    return resistance;
  }

  /**
   * Check if position is within safe bounds
   */
  public isInBounds(position: THREE.Vector3): boolean {
    const maxY = this.bounds.surfaceY - this.bounds.submarineRadius;
    const minY = this.bounds.seafloorY + this.bounds.submarineRadius;
    return position.y <= maxY && position.y >= minY;
  }

  /**
   * Get current bounds configuration
   */
  public getBounds(): CollisionBounds {
    return { ...this.bounds };
  }

  /**
   * Update bounds (e.g., for different mission environments)
   */
  public setBounds(bounds: Partial<CollisionBounds>): void {
    this.bounds = { ...this.bounds, ...bounds };
  }
}

// Singleton instance
export const collisionSystem = new CollisionSystem();

export default collisionSystem;
