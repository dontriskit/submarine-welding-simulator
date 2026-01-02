/**
 * PipeRepairScenario.ts
 * Pipe repair mission with multiple weld targets.
 *
 * CODER-B Task B14
 */

import type { MissionDefinition } from './ScenarioData';

/**
 * Pipe Repair scenario - Repair damaged underwater pipes
 *
 * Features:
 * - 5 pipe section welds at increasing difficulty
 * - 8 minute time limit
 * - Two objectives: complete welds + achieve quality threshold
 * - Moderate depth with some current
 */
export const PipeRepairScenario: MissionDefinition = {
  id: 'pipe-repair-01',
  name: 'Pipe Repair',
  description:
    'A section of underwater pipeline has developed cracks. Navigate to the repair site and weld all damaged sections before the pressure causes a failure.',
  difficulty: 'normal',
  category: 'mission',
  timeLimit: 480, // 8 minutes

  submarineSpawn: { x: 0, y: -15, z: -5 },

  objectives: [
    {
      id: 'obj-pipe-count',
      name: 'Repair 5 pipe sections',
      description: 'Weld all five damaged pipe sections.',
      type: 'weld_count',
      target: 5,
    },
    {
      id: 'obj-pipe-quality',
      name: 'Achieve 70% quality average',
      description: 'Maintain high weld quality to ensure structural integrity.',
      type: 'weld_quality',
      target: 70,
    },
  ],

  weldTargets: [
    {
      id: 'pipe-section-1',
      position: { x: 5, y: -16, z: 10 },
      rotation: { x: 0, y: 0, z: Math.PI / 2 },
      length: 1.0,
      difficulty: 'medium',
      pointValue: 200,
      description: 'Pipe Section 1 - Minor crack',
    },
    {
      id: 'pipe-section-2',
      position: { x: 8, y: -16, z: 10 },
      rotation: { x: 0, y: 0, z: Math.PI / 2 },
      length: 1.0,
      difficulty: 'medium',
      pointValue: 200,
      description: 'Pipe Section 2 - Minor crack',
    },
    {
      id: 'pipe-section-3',
      position: { x: 11, y: -16, z: 10 },
      rotation: { x: 0, y: 0.2, z: Math.PI / 2 },
      length: 1.0,
      difficulty: 'medium',
      pointValue: 200,
      description: 'Pipe Section 3 - Angled seam',
    },
    {
      id: 'pipe-section-4',
      position: { x: 14, y: -16, z: 10 },
      rotation: { x: 0.1, y: 0, z: Math.PI / 2 },
      length: 1.2,
      difficulty: 'hard',
      pointValue: 300,
      description: 'Pipe Section 4 - Major damage',
    },
    {
      id: 'pipe-section-5',
      position: { x: 17, y: -16, z: 10 },
      rotation: { x: 0, y: -0.1, z: Math.PI / 2 },
      length: 1.2,
      difficulty: 'hard',
      pointValue: 300,
      description: 'Pipe Section 5 - Critical repair',
    },
  ],

  environmentSettings: {
    fogDensity: 0.02, // Moderate fog
    ambientLight: 0.4, // Dimmer at depth
    currentStrength: 0.3, // Light current
    currentDirection: Math.PI / 4, // 45 degrees
    visibility: 40, // 40 meter visibility
  },

  bonusTimePerObjective: 30, // +30 seconds per objective completed
};
