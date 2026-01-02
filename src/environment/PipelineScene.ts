/**
 * PipelineScene.ts
 * Modular pipeline geometry system with pipe sections, joints, and support structures.
 *
 * CODER-B Task B-SCENE-1 (Issue #28)
 */

import * as THREE from 'three';
import type { WeldTarget } from '../missions/MissionDefinition';

/**
 * Configuration for pipeline construction
 */
export interface PipelineConfig {
  /** Radius of pipe sections (default: 0.5) */
  pipeRadius: number;
  /** Length of each pipe section (default: 3) */
  sectionLength: number;
  /** Number of pipe sections (default: 6) */
  sectionCount: number;
  /** Starting position of the pipeline */
  startPosition: THREE.Vector3;
  /** Pipeline direction (normalized, default: +X) */
  direction: THREE.Vector3;
  /** Y position for support bracket anchors */
  anchorY: number;
}

/**
 * Default pipeline configuration matching PipeRepairScenario
 */
const DEFAULT_CONFIG: PipelineConfig = {
  pipeRadius: 0.5,
  sectionLength: 3,
  sectionCount: 6,
  startPosition: new THREE.Vector3(3.5, -16, 10),
  direction: new THREE.Vector3(1, 0, 0),
  anchorY: -20,
};

/**
 * Manages modular pipeline geometry with sections, joints, and supports
 */
export class PipelineScene {
  private scene: THREE.Scene;
  private config: PipelineConfig;

  // Geometry groups
  private pipelineGroup: THREE.Group;
  private pipeSections: THREE.Mesh[] = [];
  private joints: THREE.Group[] = [];
  private supports: THREE.Group[] = [];
  private damageMarkers: THREE.Mesh[] = [];

  // Materials
  private pipeMaterial: THREE.MeshStandardMaterial;
  private jointMaterial: THREE.MeshStandardMaterial;
  private flangeMaterial: THREE.MeshStandardMaterial;
  private supportMaterial: THREE.MeshStandardMaterial;
  private damageMaterial: THREE.MeshStandardMaterial;

  constructor(scene: THREE.Scene, config: Partial<PipelineConfig> = {}) {
    this.scene = scene;
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Initialize materials
    this.pipeMaterial = this.createPipeMaterial();
    this.jointMaterial = this.createJointMaterial();
    this.flangeMaterial = this.createFlangeMaterial();
    this.supportMaterial = this.createSupportMaterial();
    this.damageMaterial = this.createDamageMaterial();

    // Create pipeline group
    this.pipelineGroup = new THREE.Group();
    this.pipelineGroup.name = 'Pipeline';

    // Build pipeline
    this.createPipeSections();
    this.createSupportStructures();

    // Add to scene
    this.scene.add(this.pipelineGroup);
  }

  /**
   * Create pipe section material (gray metallic)
   */
  private createPipeMaterial(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.6,
      metalness: 0.8,
    });
  }

  /**
   * Create joint ring material (darker)
   */
  private createJointMaterial(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0x555555,
      roughness: 0.4,
      metalness: 0.9,
    });
  }

  /**
   * Create flange material (slightly different)
   */
  private createFlangeMaterial(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0x666666,
      roughness: 0.5,
      metalness: 0.85,
    });
  }

  /**
   * Create support bracket material
   */
  private createSupportMaterial(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0x444444,
      roughness: 0.7,
      metalness: 0.6,
    });
  }

  /**
   * Create damage/corrosion marker material (rusty orange-brown)
   */
  private createDamageMaterial(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.9,
      metalness: 0.3,
      emissive: 0x331100,
      emissiveIntensity: 0.2,
    });
  }

  /**
   * Create pipe sections with joints between them
   */
  private createPipeSections(): void {
    const { pipeRadius, sectionLength, sectionCount, startPosition, direction } = this.config;

    // Pipe section geometry (reused)
    const pipeGeometry = new THREE.CylinderGeometry(
      pipeRadius,
      pipeRadius,
      sectionLength,
      16
    );

    // Joint torus geometry
    const jointGeometry = new THREE.TorusGeometry(
      pipeRadius + 0.05,
      0.08,
      8,
      24
    );

    // Flange cylinder geometry
    const flangeGeometry = new THREE.CylinderGeometry(
      pipeRadius + 0.2,
      pipeRadius + 0.2,
      0.15,
      16
    );

    for (let i = 0; i < sectionCount; i++) {
      // Calculate section center position
      const sectionCenter = startPosition.clone().add(
        direction.clone().multiplyScalar(i * sectionLength + sectionLength / 2)
      );

      // Create pipe section
      const pipe = new THREE.Mesh(pipeGeometry, this.pipeMaterial);
      pipe.position.copy(sectionCenter);
      pipe.rotation.z = Math.PI / 2; // Make horizontal (cylinder is vertical by default)
      pipe.castShadow = true;
      pipe.receiveShadow = true;
      pipe.name = `pipe-section-${i + 1}`;

      this.pipeSections.push(pipe);
      this.pipelineGroup.add(pipe);

      // Create joint at the START of each section (except first)
      if (i > 0) {
        const jointPosition = startPosition.clone().add(
          direction.clone().multiplyScalar(i * sectionLength)
        );

        const jointGroup = new THREE.Group();
        jointGroup.name = `joint-${i}`;

        // Torus ring
        const torus = new THREE.Mesh(jointGeometry, this.jointMaterial);
        torus.rotation.y = Math.PI / 2; // Align with pipe direction
        jointGroup.add(torus);

        // Flange (larger cylinder ring)
        const flange = new THREE.Mesh(flangeGeometry, this.flangeMaterial);
        flange.rotation.z = Math.PI / 2;
        jointGroup.add(flange);

        jointGroup.position.copy(jointPosition);
        this.joints.push(jointGroup);
        this.pipelineGroup.add(jointGroup);
      }
    }
  }

  /**
   * Create support structures (brackets at every other joint)
   */
  private createSupportStructures(): void {
    const { pipeRadius, sectionLength, startPosition, direction, anchorY } = this.config;

    // Create supports at joints 1, 3, 5 (indices 0, 2, 4 in joints array)
    const supportPositions = [1, 3, 5]; // Joint numbers (section boundaries)

    for (const jointNum of supportPositions) {
      const supportPosition = startPosition.clone().add(
        direction.clone().multiplyScalar(jointNum * sectionLength)
      );

      const supportGroup = new THREE.Group();
      supportGroup.name = `support-${jointNum}`;

      // Vertical post
      const postHeight = supportPosition.y - anchorY;
      const postGeometry = new THREE.BoxGeometry(0.15, postHeight, 0.15);
      const post = new THREE.Mesh(postGeometry, this.supportMaterial);
      post.position.y = -postHeight / 2;
      post.castShadow = true;
      supportGroup.add(post);

      // Bracket clamp (curved around pipe)
      const bracketGeometry = new THREE.TorusGeometry(
        pipeRadius + 0.1,
        0.06,
        8,
        16,
        Math.PI // Half torus
      );
      const bracket = new THREE.Mesh(bracketGeometry, this.supportMaterial);
      bracket.rotation.y = Math.PI / 2;
      bracket.rotation.x = -Math.PI / 2; // Face upward, wrap bottom of pipe
      bracket.position.y = -pipeRadius - 0.1;
      supportGroup.add(bracket);

      // Anchor plate at bottom
      const plateGeometry = new THREE.BoxGeometry(0.4, 0.05, 0.4);
      const plate = new THREE.Mesh(plateGeometry, this.supportMaterial);
      plate.position.y = -postHeight;
      plate.receiveShadow = true;
      supportGroup.add(plate);

      supportGroup.position.copy(supportPosition);
      this.supports.push(supportGroup);
      this.pipelineGroup.add(supportGroup);
    }
  }

  /**
   * Set weld targets and mark damaged areas
   */
  public setWeldTargets(targets: WeldTarget[]): void {
    // Clear existing damage markers
    for (const marker of this.damageMarkers) {
      this.pipelineGroup.remove(marker);
      marker.geometry.dispose();
    }
    this.damageMarkers = [];

    // Create damage markers at each weld target
    for (const target of targets) {
      const damageGeometry = new THREE.TorusGeometry(
        this.config.pipeRadius + 0.02,
        0.1,
        8,
        24
      );
      const damage = new THREE.Mesh(damageGeometry, this.damageMaterial);
      damage.position.set(target.position.x, target.position.y, target.position.z);
      damage.rotation.y = Math.PI / 2;
      damage.name = `damage-${target.id}`;

      this.damageMarkers.push(damage);
      this.pipelineGroup.add(damage);
    }
  }

  /**
   * Get pipeline group for external manipulation
   */
  public getGroup(): THREE.Group {
    return this.pipelineGroup;
  }

  /**
   * Get specific pipe section mesh
   */
  public getPipeSection(index: number): THREE.Mesh | undefined {
    return this.pipeSections[index];
  }

  /**
   * Get specific joint group
   */
  public getJoint(index: number): THREE.Group | undefined {
    return this.joints[index];
  }

  /**
   * Clean up all resources
   */
  public dispose(): void {
    // Remove from scene
    this.scene.remove(this.pipelineGroup);

    // Dispose pipe sections
    for (const pipe of this.pipeSections) {
      pipe.geometry.dispose();
    }

    // Dispose joints
    for (const joint of this.joints) {
      joint.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
        }
      });
    }

    // Dispose supports
    for (const support of this.supports) {
      support.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
        }
      });
    }

    // Dispose damage markers
    for (const marker of this.damageMarkers) {
      marker.geometry.dispose();
    }

    // Dispose materials
    this.pipeMaterial.dispose();
    this.jointMaterial.dispose();
    this.flangeMaterial.dispose();
    this.supportMaterial.dispose();
    this.damageMaterial.dispose();

    // Clear arrays
    this.pipeSections = [];
    this.joints = [];
    this.supports = [];
    this.damageMarkers = [];
  }
}
