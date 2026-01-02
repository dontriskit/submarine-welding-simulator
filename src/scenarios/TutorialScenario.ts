/**
 * TutorialScenario.ts
 * Basic welding tutorial mission.
 *
 * CODER-B Task B14
 */

import type { MissionDefinition } from './ScenarioData';

/**
 * Tutorial scenario - Learn the basics of underwater welding
 *
 * Features:
 * - 3 easy weld targets arranged in a triangle pattern
 * - Generous 5 minute time limit
 * - Single objective: complete all welds
 * - Shallow depth, good visibility
 */
export const TutorialScenario: MissionDefinition = {
  id: 'tutorial-01',
  name: 'Basic Welding',
  description:
    'Learn the fundamentals of underwater welding. Practice your technique on simple flat seams in calm, shallow waters.',
  difficulty: 'easy',
  category: 'tutorial',
  timeLimit: 300, // 5 minutes

  submarineSpawn: { x: 0, y: -5, z: 0 },

  objectives: [
    {
      id: 'obj-weld-count',
      name: 'Complete 3 welds',
      description: 'Weld all three practice seams to complete the tutorial.',
      type: 'weld_count',
      target: 3,
    },
  ],

  weldTargets: [
    {
      id: 'wt-tutorial-1',
      position: { x: 2, y: -6, z: 5 },
      rotation: { x: 0, y: 0, z: 0 },
      length: 0.5,
      difficulty: 'easy',
      pointValue: 100,
      description: 'Practice Seam 1',
    },
    {
      id: 'wt-tutorial-2',
      position: { x: -2, y: -6, z: 5 },
      rotation: { x: 0, y: 0.5, z: 0 },
      length: 0.5,
      difficulty: 'easy',
      pointValue: 100,
      description: 'Practice Seam 2',
    },
    {
      id: 'wt-tutorial-3',
      position: { x: 0, y: -4, z: 8 },
      rotation: { x: 0.3, y: 0, z: 0 },
      length: 0.5,
      difficulty: 'easy',
      pointValue: 100,
      description: 'Practice Seam 3',
    },
  ],

  environmentSettings: {
    fogDensity: 0.01, // Light fog, good visibility
    ambientLight: 0.6, // Bright ambient light
    currentStrength: 0, // No current
    visibility: 60, // 60 meter visibility
  },
};
