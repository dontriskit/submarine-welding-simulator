/**
 * Game State Action Creators
 *
 * Type-safe action creator functions for dispatching state changes.
 */

import type {
  GameStateAction,
  GameStateData,
  SubmarineStateData,
  WeldingArmStateData,
  MissionStateData,
} from '../types/interfaces';

/**
 * Set the current game phase
 */
export function setPhase(phase: GameStateData['phase']): GameStateAction {
  return { type: 'SET_PHASE', phase };
}

/**
 * Update submarine state (partial update)
 */
export function updateSubmarine(submarine: Partial<SubmarineStateData>): GameStateAction {
  return { type: 'UPDATE_SUBMARINE', submarine };
}

/**
 * Update welding arm state (partial update)
 */
export function updateWelding(welding: Partial<WeldingArmStateData>): GameStateAction {
  return { type: 'UPDATE_WELDING', welding };
}

/**
 * Add points to score (multiplied by current multiplier)
 */
export function addScore(points: number): GameStateAction {
  return { type: 'ADD_SCORE', points };
}

/**
 * Set the score multiplier
 */
export function setMultiplier(multiplier: number): GameStateAction {
  return { type: 'SET_MULTIPLIER', multiplier };
}

/**
 * Mark an objective as completed
 */
export function completeObjective(objectiveId: string): GameStateAction {
  return { type: 'COMPLETE_OBJECTIVE', objectiveId };
}

/**
 * Update progress on an objective
 */
export function updateObjectiveProgress(objectiveId: string, progress: number): GameStateAction {
  return { type: 'UPDATE_OBJECTIVE_PROGRESS', objectiveId, progress };
}

/**
 * Start a new mission
 */
export function startMission(mission: MissionStateData): GameStateAction {
  return { type: 'START_MISSION', mission };
}

/**
 * End the current mission
 */
export function endMission(success: boolean): GameStateAction {
  return { type: 'END_MISSION', success };
}

/**
 * Tick the mission timer
 */
export function tickTime(delta: number): GameStateAction {
  return { type: 'TICK_TIME', delta };
}

/**
 * Reset all state to initial values
 */
export function reset(): GameStateAction {
  return { type: 'RESET' };
}

// === CONVENIENCE ACTIONS ===

/**
 * Update submarine position
 */
export function setSubmarinePosition(x: number, y: number, z: number): GameStateAction {
  return updateSubmarine({ position: { x, y, z } });
}

/**
 * Update submarine rotation
 */
export function setSubmarineRotation(x: number, y: number, z: number): GameStateAction {
  return updateSubmarine({ rotation: { x, y, z } });
}

/**
 * Update submarine velocity
 */
export function setSubmarineVelocity(x: number, y: number, z: number): GameStateAction {
  return updateSubmarine({ velocity: { x, y, z } });
}

/**
 * Set submarine depth and pressure
 */
export function setSubmarineDepth(depth: number, pressure: number): GameStateAction {
  return updateSubmarine({ depth, pressure });
}

/**
 * Set submarine battery level
 */
export function setSubmarineBattery(battery: number): GameStateAction {
  return updateSubmarine({ battery: Math.max(0, Math.min(100, battery)) });
}

/**
 * Set submarine oxygen level
 */
export function setSubmarineOxygen(oxygen: number): GameStateAction {
  return updateSubmarine({ oxygen: Math.max(0, Math.min(100, oxygen)) });
}

/**
 * Toggle submarine lights
 */
export function setSubmarineLights(lightsOn: boolean): GameStateAction {
  return updateSubmarine({ lightsOn });
}

/**
 * Set welding torch active state
 */
export function setTorchActive(torchActive: boolean): GameStateAction {
  return updateWelding({ torchActive });
}

/**
 * Set welding torch heat
 */
export function setTorchHeat(torchHeat: number): GameStateAction {
  return updateWelding({ torchHeat: Math.max(0, Math.min(100, torchHeat)) });
}

/**
 * Set welding torch intensity
 */
export function setTorchIntensity(torchIntensity: number): GameStateAction {
  return updateWelding({ torchIntensity: Math.max(0, Math.min(1, torchIntensity)) });
}

/**
 * Set arc stability
 */
export function setArcStability(arcStability: number): GameStateAction {
  return updateWelding({ arcStability: Math.max(-1, Math.min(1, arcStability)) });
}

/**
 * Update joint angles
 */
export function setJointAngles(joints: number[]): GameStateAction {
  return updateWelding({ joints });
}

// === ACTION TYPE GUARDS ===

/**
 * Check if an action is a phase change
 */
export function isPhaseAction(action: GameStateAction): action is { type: 'SET_PHASE'; phase: GameStateData['phase'] } {
  return action.type === 'SET_PHASE';
}

/**
 * Check if an action modifies the submarine
 */
export function isSubmarineAction(action: GameStateAction): action is { type: 'UPDATE_SUBMARINE'; submarine: Partial<SubmarineStateData> } {
  return action.type === 'UPDATE_SUBMARINE';
}

/**
 * Check if an action modifies welding state
 */
export function isWeldingAction(action: GameStateAction): action is { type: 'UPDATE_WELDING'; welding: Partial<WeldingArmStateData> } {
  return action.type === 'UPDATE_WELDING';
}

/**
 * Check if an action modifies score
 */
export function isScoreAction(action: GameStateAction): boolean {
  return action.type === 'ADD_SCORE' || action.type === 'SET_MULTIPLIER';
}

/**
 * Check if an action modifies mission state
 */
export function isMissionAction(action: GameStateAction): boolean {
  return (
    action.type === 'START_MISSION' ||
    action.type === 'END_MISSION' ||
    action.type === 'COMPLETE_OBJECTIVE' ||
    action.type === 'UPDATE_OBJECTIVE_PROGRESS' ||
    action.type === 'TICK_TIME'
  );
}
