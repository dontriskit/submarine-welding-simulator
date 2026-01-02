/**
 * Submarine.ts
 * Main submarine entity with hull, lights, propeller, and welding arm.
 *
 * CODER-B Task B3
 */

import * as THREE from 'three';
import type { ISubmarine, IWeldingArm } from '../types/interfaces';
import { WeldingArm } from './WeldingArm';
import {
  SUBMARINE_MASS,
  DRAG_COEFFICIENT,
  MAX_SPEED,
  MAX_ROTATION_SPEED,
  THRUSTER_FORCE,
  VERTICAL_THRUSTER_FORCE,
} from '../core/Constants';

/**
 * Main submarine vehicle with attached welding arm
 */
export class Submarine implements ISubmarine {
  public readonly mesh: THREE.Group;

  private weldingArm: WeldingArm;
  private propeller: THREE.Mesh;
  private lights: THREE.SpotLight[] = [];
  private lightsOn: boolean = true;

  // Physics state
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private angularVelocity: THREE.Vector3 = new THREE.Vector3();

  // Input state
  private inputForward: number = 0;
  private inputStrafe: number = 0;
  private inputVertical: number = 0;
  private inputRoll: number = 0;

  constructor() {
    this.mesh = new THREE.Group();
    this.mesh.name = 'Submarine';

    // Build submarine components
    this.createHull();
    this.createCockpit();
    this.propeller = this.createPropeller();
    this.createLights();
    this.createDetails();

    // Create and attach welding arm
    this.weldingArm = new WeldingArm();
    this.attachWeldingArm();
  }

  get position(): THREE.Vector3 {
    return this.mesh.position;
  }

  get rotation(): THREE.Euler {
    return this.mesh.rotation;
  }

  /**
   * Create the main hull body
   */
  private createHull(): void {
    // Main body - elongated capsule shape using merged geometries
    const bodyGroup = new THREE.Group();
    bodyGroup.name = 'Hull';

    // Central cylinder
    const cylinderGeom = new THREE.CylinderGeometry(0.5, 0.5, 3, 16);
    const hullMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a4858,
      metalness: 0.6,
      roughness: 0.4,
    });
    const cylinder = new THREE.Mesh(cylinderGeom, hullMaterial);
    cylinder.rotation.z = Math.PI / 2;
    bodyGroup.add(cylinder);

    // Front dome
    const frontDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      hullMaterial
    );
    frontDome.rotation.z = -Math.PI / 2;
    frontDome.position.x = 1.5;
    bodyGroup.add(frontDome);

    // Rear dome
    const rearDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      hullMaterial
    );
    rearDome.rotation.z = Math.PI / 2;
    rearDome.position.x = -1.5;
    bodyGroup.add(rearDome);

    this.mesh.add(bodyGroup);
  }

  /**
   * Create the glass cockpit dome
   */
  private createCockpit(): void {
    const cockpitGeom = new THREE.SphereGeometry(0.35, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const cockpitMaterial = new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      metalness: 0.1,
      roughness: 0.1,
      transparent: true,
      opacity: 0.6,
    });
    const cockpit = new THREE.Mesh(cockpitGeom, cockpitMaterial);
    cockpit.position.set(0.8, 0.4, 0);
    cockpit.rotation.x = 0;
    cockpit.name = 'Cockpit';
    this.mesh.add(cockpit);

    // Cockpit rim
    const rimGeom = new THREE.TorusGeometry(0.35, 0.03, 8, 24);
    const rimMaterial = new THREE.MeshStandardMaterial({
      color: 0x334455,
      metalness: 0.8,
      roughness: 0.3,
    });
    const rim = new THREE.Mesh(rimGeom, rimMaterial);
    rim.position.set(0.8, 0.4, 0);
    rim.rotation.x = Math.PI / 2;
    this.mesh.add(rim);
  }

  /**
   * Create the rear propeller
   */
  private createPropeller(): THREE.Mesh {
    const propGroup = new THREE.Group();
    propGroup.name = 'Propeller';

    // Hub
    const hubGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.1, 8);
    const metalMaterial = new THREE.MeshStandardMaterial({
      color: 0x666666,
      metalness: 0.9,
      roughness: 0.2,
    });
    const hub = new THREE.Mesh(hubGeom, metalMaterial);
    hub.rotation.z = Math.PI / 2;
    propGroup.add(hub);

    // Blades
    const bladeGeom = new THREE.BoxGeometry(0.02, 0.25, 0.08);
    for (let i = 0; i < 4; i++) {
      const blade = new THREE.Mesh(bladeGeom, metalMaterial);
      blade.position.y = 0.15;
      blade.rotation.x = (i * Math.PI) / 2;

      const bladeHolder = new THREE.Group();
      bladeHolder.add(blade);
      bladeHolder.rotation.x = (i * Math.PI) / 2;
      propGroup.add(bladeHolder);
    }

    propGroup.position.x = -1.8;
    this.mesh.add(propGroup);

    return hub; // Return hub for rotation animation
  }

  /**
   * Create front spotlights
   */
  private createLights(): void {
    const lightPositions = [
      { x: 1.6, y: 0.2, z: 0.3 },
      { x: 1.6, y: 0.2, z: -0.3 },
    ];

    lightPositions.forEach((pos, index) => {
      // Light housing
      const housingGeom = new THREE.CylinderGeometry(0.06, 0.08, 0.1, 8);
      const housingMaterial = new THREE.MeshStandardMaterial({
        color: 0x444444,
        metalness: 0.8,
        roughness: 0.3,
      });
      const housing = new THREE.Mesh(housingGeom, housingMaterial);
      housing.position.set(pos.x, pos.y, pos.z);
      housing.rotation.z = -Math.PI / 2;
      housing.name = `LightHousing_${index}`;
      this.mesh.add(housing);

      // Spotlight
      const spotlight = new THREE.SpotLight(0xffffee, 2, 30, Math.PI / 6, 0.5);
      spotlight.position.set(pos.x + 0.05, pos.y, pos.z);
      spotlight.target.position.set(pos.x + 10, pos.y, pos.z);
      spotlight.name = `Spotlight_${index}`;

      this.mesh.add(spotlight);
      this.mesh.add(spotlight.target);
      this.lights.push(spotlight);

      // Lens glow
      const lensGeom = new THREE.CircleGeometry(0.05, 16);
      const lensMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffaa,
        emissive: 0xffffaa,
        emissiveIntensity: 0.5,
      });
      const lens = new THREE.Mesh(lensGeom, lensMaterial);
      lens.position.set(pos.x + 0.05, pos.y, pos.z);
      lens.rotation.y = Math.PI / 2;
      this.mesh.add(lens);
    });
  }

  /**
   * Create additional details (fins, vents, etc.)
   */
  private createDetails(): void {
    const detailMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a5868,
      metalness: 0.5,
      roughness: 0.5,
    });

    // Vertical stabilizer (dorsal fin)
    const dorsalGeom = new THREE.BoxGeometry(0.4, 0.3, 0.02);
    const dorsal = new THREE.Mesh(dorsalGeom, detailMaterial);
    dorsal.position.set(-1.0, 0.6, 0);
    this.mesh.add(dorsal);

    // Side fins
    const finGeom = new THREE.BoxGeometry(0.3, 0.02, 0.2);
    [-1, 1].forEach((side) => {
      const fin = new THREE.Mesh(finGeom, detailMaterial);
      fin.position.set(-1.2, 0, side * 0.55);
      this.mesh.add(fin);
    });

    // Thruster housings
    const thrusterGeom = new THREE.CylinderGeometry(0.1, 0.12, 0.15, 8);
    const positions = [
      { x: 0, y: 0.55, z: 0 }, // Top
      { x: 0, y: -0.55, z: 0 }, // Bottom
      { x: 0, y: 0, z: 0.55 }, // Right
      { x: 0, y: 0, z: -0.55 }, // Left
    ];
    positions.forEach((pos) => {
      const thruster = new THREE.Mesh(thrusterGeom, detailMaterial);
      thruster.position.set(pos.x, pos.y, pos.z);
      if (pos.z !== 0) thruster.rotation.x = Math.PI / 2;
      this.mesh.add(thruster);
    });
  }

  /**
   * Attach welding arm to submarine
   */
  private attachWeldingArm(): void {
    // Mount point on right side, slightly forward
    this.weldingArm.mesh.position.set(0.5, -0.3, 0.5);
    this.weldingArm.mesh.rotation.z = Math.PI / 4; // Angle outward
    this.mesh.add(this.weldingArm.mesh);
  }

  /**
   * Get the welding arm
   */
  public getWeldingArm(): IWeldingArm {
    return this.weldingArm;
  }

  /**
   * Apply movement input
   */
  public applyInput(forward: number, strafe: number, vertical: number, rollInput: number): void {
    this.inputForward = forward;
    this.inputStrafe = strafe;
    this.inputVertical = vertical;
    this.inputRoll = rollInput;
  }

  /**
   * Toggle lights on/off
   */
  public toggleLights(): void {
    this.lightsOn = !this.lightsOn;
    this.lights.forEach((light) => {
      light.visible = this.lightsOn;
    });
  }

  /**
   * Update submarine state (called every frame)
   */
  public update(delta: number): void {
    // Calculate forces
    const thrustForce = new THREE.Vector3(
      this.inputForward * THRUSTER_FORCE,
      this.inputVertical * VERTICAL_THRUSTER_FORCE,
      this.inputStrafe * THRUSTER_FORCE * 0.5
    );

    // Transform thrust to world space based on submarine orientation
    thrustForce.applyQuaternion(this.mesh.quaternion);

    // Apply acceleration (F = ma)
    const acceleration = thrustForce.divideScalar(SUBMARINE_MASS);
    this.velocity.add(acceleration.multiplyScalar(delta));

    // Apply drag
    const dragForce = this.velocity.clone().multiplyScalar(-DRAG_COEFFICIENT);
    this.velocity.add(dragForce.multiplyScalar(delta));

    // Clamp velocity
    if (this.velocity.length() > MAX_SPEED) {
      this.velocity.normalize().multiplyScalar(MAX_SPEED);
    }

    // Apply velocity to position
    this.mesh.position.add(this.velocity.clone().multiplyScalar(delta));

    // Angular movement (roll)
    this.angularVelocity.z = this.inputRoll * MAX_ROTATION_SPEED;

    // Apply angular drag
    this.angularVelocity.multiplyScalar(1 - delta * 2);

    // Apply angular velocity
    this.mesh.rotation.z += this.angularVelocity.z * delta;

    // Propeller animation (speed based on thrust)
    const propSpeed = Math.abs(this.inputForward) * 20 + 2;
    this.propeller.parent!.rotation.x += propSpeed * delta;

    // Update welding arm
    this.weldingArm.update(delta);
  }

  /**
   * Get current velocity
   */
  public getVelocity(): THREE.Vector3 {
    return this.velocity.clone();
  }

  /**
   * Get current depth (negative Y is deeper)
   */
  public getDepth(): number {
    return -this.mesh.position.y;
  }

  /**
   * Check if lights are on
   */
  public areLightsOn(): boolean {
    return this.lightsOn;
  }
}
