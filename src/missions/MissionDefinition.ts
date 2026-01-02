/**
 * MissionDefinition.ts
 * Type definitions for missions, objectives, and weld targets.
 *
 * CODER-B Task B13
 */

/**
 * 3D position coordinates
 */
export interface Position3D {
  x: number;
  y: number;
  z: number;
}

/**
 * 3D rotation (Euler angles in radians)
 */
export interface Rotation3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Weld target difficulty levels
 */
export type WeldDifficulty = 'easy' | 'medium' | 'hard';

/**
 * Mission difficulty levels
 */
export type MissionDifficulty = 'easy' | 'normal' | 'hard';

/**
 * Objective types
 */
export type ObjectiveType = 'weld_count' | 'weld_quality' | 'time_remaining' | 'custom';

/**
 * Weld target in 3D space
 */
export interface WeldTarget {
  /** Unique identifier for this target */
  id: string;

  /** World position of the weld target */
  position: Position3D;

  /** Orientation of the weld seam */
  rotation: Rotation3D;

  /** Length of the weld seam in meters */
  length: number;

  /** Difficulty of this weld */
  difficulty: WeldDifficulty;

  /** Points awarded for completing this weld */
  pointValue: number;

  /** Optional description shown to player */
  description?: string;

  /** Whether this target has been completed */
  completed?: boolean;
}

/**
 * Objective definition (static data)
 */
export interface ObjectiveDefinition {
  /** Unique identifier for this objective */
  id: string;

  /** Display name */
  name: string;

  /** Detailed description */
  description: string;

  /** Type of objective */
  type: ObjectiveType;

  /** Target value to complete (e.g., 5 welds, 80% quality) */
  target: number;
}

/**
 * Environment settings for a mission
 */
export interface MissionEnvironment {
  /** Fog density (default: 0.015) */
  fogDensity?: number;

  /** Ambient light intensity (0-1, default: 0.5) */
  ambientLight?: number;

  /** Water current strength (0-1, default: 0) */
  currentStrength?: number;

  /** Current direction in radians (default: 0) */
  currentDirection?: number;

  /** Visibility range in meters (default: 50) */
  visibility?: number;
}

/**
 * Mission definition (static data loaded from scenarios)
 */
export interface MissionDefinition {
  /** Unique identifier */
  id: string;

  /** Display name */
  name: string;

  /** Mission briefing description */
  description: string;

  /** Overall difficulty */
  difficulty: MissionDifficulty;

  /** Time limit in seconds */
  timeLimit: number;

  /** List of objectives to complete */
  objectives: ObjectiveDefinition[];

  /** Weld targets in the scene */
  weldTargets: WeldTarget[];

  /** Submarine spawn position */
  submarineSpawn: Position3D;

  /** Optional environment overrides */
  environmentSettings?: MissionEnvironment;

  /** Category for mission selection UI */
  category?: 'tutorial' | 'training' | 'mission' | 'challenge';

  /** Minimum score required for completion (optional) */
  minScore?: number;

  /** Bonus time awarded per completed objective (optional) */
  bonusTimePerObjective?: number;
}

/**
 * Runtime mission state (extends MissionStateData from interfaces.ts)
 */
export interface MissionRuntimeState {
  /** Current mission definition */
  definition: MissionDefinition;

  /** Weld targets with completion status */
  weldTargets: WeldTarget[];

  /** Number of welds completed */
  weldsCompleted: number;

  /** Sum of weld quality scores */
  qualitySum: number;

  /** Average weld quality */
  averageQuality: number;
}
