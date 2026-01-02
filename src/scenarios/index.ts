/**
 * Scenario Registry
 * Central export point for all scenario definitions.
 *
 * CODER-B Task B14
 */

import type { MissionDefinition } from '../missions/MissionDefinition';
import type { ScenarioCategory, ScenarioMeta } from './ScenarioData';
import { TutorialScenario } from './TutorialScenario';
import { PipeRepairScenario } from './PipeRepairScenario';

/**
 * Registry of all available scenarios
 */
export const SCENARIOS: Record<string, MissionDefinition> = {
  'tutorial-01': TutorialScenario,
  'pipe-repair-01': PipeRepairScenario,
};

/**
 * Get a scenario by ID
 */
export function getScenario(id: string): MissionDefinition | null {
  return SCENARIOS[id] ?? null;
}

/**
 * List all available scenarios
 */
export function listScenarios(): MissionDefinition[] {
  return Object.values(SCENARIOS);
}

/**
 * List scenarios by category
 */
export function listScenariosByCategory(category: ScenarioCategory): MissionDefinition[] {
  return listScenarios().filter((s) => s.category === category);
}

/**
 * List scenarios by difficulty
 */
export function listScenariosByDifficulty(
  difficulty: MissionDefinition['difficulty']
): MissionDefinition[] {
  return listScenarios().filter((s) => s.difficulty === difficulty);
}

/**
 * Get scenario metadata for mission selection UI
 */
export function getScenarioMeta(id: string): ScenarioMeta | null {
  const scenario = getScenario(id);
  if (!scenario) return null;

  return {
    id: scenario.id,
    name: scenario.name,
    description: scenario.description,
    category: scenario.category ?? 'mission',
    difficulty: scenario.difficulty,
    estimatedTime: Math.ceil(scenario.timeLimit / 60),
    unlocked: true, // TODO: implement unlock system
  };
}

/**
 * Get all scenario metadata for mission selection
 */
export function getAllScenarioMeta(): ScenarioMeta[] {
  return listScenarios()
    .map((s) => getScenarioMeta(s.id))
    .filter((m): m is ScenarioMeta => m !== null);
}

// Re-export individual scenarios
export { TutorialScenario } from './TutorialScenario';
export { PipeRepairScenario } from './PipeRepairScenario';

// Re-export types
export type { ScenarioCategory, ScenarioMeta } from './ScenarioData';
