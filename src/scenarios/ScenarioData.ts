/**
 * ScenarioData.ts
 * Re-exports mission types and defines scenario-specific types.
 *
 * CODER-B Task B14
 */

// Re-export all mission types for scenario use
export type {
  MissionDefinition,
  MissionDifficulty,
  MissionEnvironment,
  ObjectiveDefinition,
  ObjectiveType,
  Position3D,
  Rotation3D,
  WeldDifficulty,
  WeldTarget,
} from '../missions/MissionDefinition';

/**
 * Scenario categories for UI organization
 */
export type ScenarioCategory = 'tutorial' | 'training' | 'mission' | 'challenge';

/**
 * Scenario metadata for mission selection
 */
export interface ScenarioMeta {
  id: string;
  name: string;
  description: string;
  category: ScenarioCategory;
  difficulty: 'easy' | 'normal' | 'hard';
  estimatedTime: number; // minutes
  thumbnailUrl?: string;
  unlocked: boolean;
  highScore?: number;
  bestRating?: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
}
