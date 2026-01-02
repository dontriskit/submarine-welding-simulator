/**
 * MissionLoader.ts
 * Loads and manages mission lifecycle, integrating with GameState.
 *
 * CODER-B Task B13
 */

import type { IGameState, MissionStateData, ObjectiveData } from '../types/interfaces';
import { startMission, endMission, updateObjectiveProgress, addScore } from '../state/GameStateActions';
import type {
  MissionDefinition,
  WeldTarget,
  Position3D,
  MissionRuntimeState,
} from './MissionDefinition';

/**
 * Mission loader and lifecycle manager
 */
export class MissionLoader {
  private gameState: IGameState;
  private currentMission: MissionDefinition | null = null;
  private runtimeState: MissionRuntimeState | null = null;
  private missionRegistry: Map<string, MissionDefinition> = new Map();

  constructor(gameState: IGameState) {
    this.gameState = gameState;
  }

  /**
   * Register a mission definition in the registry
   */
  public registerMission(definition: MissionDefinition): void {
    this.missionRegistry.set(definition.id, definition);
  }

  /**
   * Register multiple missions at once
   */
  public registerMissions(definitions: MissionDefinition[]): void {
    for (const def of definitions) {
      this.registerMission(def);
    }
  }

  /**
   * Get a mission by ID from the registry
   */
  public getMissionById(id: string): MissionDefinition | null {
    return this.missionRegistry.get(id) ?? null;
  }

  /**
   * List all available missions
   */
  public listMissions(): MissionDefinition[] {
    return Array.from(this.missionRegistry.values());
  }

  /**
   * List missions by category
   */
  public listMissionsByCategory(category: MissionDefinition['category']): MissionDefinition[] {
    return this.listMissions().filter((m) => m.category === category);
  }

  /**
   * Load a mission definition (prepares but doesn't start)
   */
  public loadMission(definition: MissionDefinition): void {
    this.currentMission = definition;

    // Initialize runtime state
    this.runtimeState = {
      definition,
      weldTargets: definition.weldTargets.map((t) => ({ ...t, completed: false })),
      weldsCompleted: 0,
      qualitySum: 0,
      averageQuality: 0,
    };
  }

  /**
   * Load a mission by ID from the registry
   */
  public loadMissionById(id: string): boolean {
    const definition = this.getMissionById(id);
    if (!definition) {
      console.warn(`Mission not found: ${id}`);
      return false;
    }
    this.loadMission(definition);
    return true;
  }

  /**
   * Start the currently loaded mission
   */
  public startMission(): void {
    if (!this.currentMission || !this.runtimeState) {
      console.warn('No mission loaded to start');
      return;
    }

    // Convert to MissionStateData for GameState
    const missionState: MissionStateData = {
      id: this.currentMission.id,
      name: this.currentMission.name,
      timeLimit: this.currentMission.timeLimit,
      timeRemaining: this.currentMission.timeLimit,
      objectives: this.currentMission.objectives.map((obj) => ({
        id: obj.id,
        name: obj.name,
        description: obj.description,
        completed: false,
        progress: 0,
        target: obj.target,
      })),
      completed: false,
      failed: false,
    };

    // Dispatch to GameState
    this.gameState.dispatch(startMission(missionState));
  }

  /**
   * Get the current mission definition
   */
  public getCurrentMission(): MissionDefinition | null {
    return this.currentMission;
  }

  /**
   * Get weld targets for the current mission
   */
  public getWeldTargets(): WeldTarget[] {
    return this.runtimeState?.weldTargets ?? [];
  }

  /**
   * Get incomplete weld targets
   */
  public getIncompleteWeldTargets(): WeldTarget[] {
    return this.getWeldTargets().filter((t) => !t.completed);
  }

  /**
   * Get submarine spawn position
   */
  public getSpawnPosition(): Position3D {
    return this.currentMission?.submarineSpawn ?? { x: 0, y: -10, z: 0 };
  }

  /**
   * Get environment settings
   */
  public getEnvironmentSettings(): MissionDefinition['environmentSettings'] {
    return this.currentMission?.environmentSettings;
  }

  /**
   * Complete a weld target and update objectives
   */
  public completeWeldTarget(targetId: string, qualityScore: number): void {
    if (!this.runtimeState) return;

    // Find and mark target as completed
    const target = this.runtimeState.weldTargets.find((t) => t.id === targetId);
    if (!target || target.completed) return;

    target.completed = true;
    this.runtimeState.weldsCompleted++;
    this.runtimeState.qualitySum += qualityScore;
    this.runtimeState.averageQuality =
      this.runtimeState.qualitySum / this.runtimeState.weldsCompleted;

    // Award points
    const pointsWithQuality = Math.round(target.pointValue * (qualityScore / 100));
    this.gameState.dispatch(addScore(pointsWithQuality));

    // Update weld_count objectives
    this.updateWeldCountObjectives();

    // Update weld_quality objectives
    this.updateWeldQualityObjectives();
  }

  /**
   * Update progress on weld_count type objectives
   */
  private updateWeldCountObjectives(): void {
    if (!this.currentMission || !this.runtimeState) return;

    for (const obj of this.currentMission.objectives) {
      if (obj.type === 'weld_count') {
        this.gameState.dispatch(
          updateObjectiveProgress(obj.id, this.runtimeState.weldsCompleted)
        );
      }
    }
  }

  /**
   * Update progress on weld_quality type objectives
   */
  private updateWeldQualityObjectives(): void {
    if (!this.currentMission || !this.runtimeState) return;

    for (const obj of this.currentMission.objectives) {
      if (obj.type === 'weld_quality') {
        this.gameState.dispatch(
          updateObjectiveProgress(obj.id, Math.round(this.runtimeState.averageQuality))
        );
      }
    }
  }

  /**
   * Check if all objectives are complete
   */
  public areAllObjectivesComplete(): boolean {
    const state = this.gameState.getState();
    if (!state.mission) return false;

    return state.mission.objectives.every((obj: ObjectiveData) => obj.completed);
  }

  /**
   * Check if mission should end (all welds done or time up)
   */
  public shouldMissionEnd(): boolean {
    const state = this.gameState.getState();
    if (!state.mission) return false;

    // Time ran out
    if (state.mission.timeRemaining <= 0) return true;

    // All objectives complete
    if (this.areAllObjectivesComplete()) return true;

    return false;
  }

  /**
   * End the current mission
   */
  public endMission(success: boolean): void {
    if (!this.currentMission) return;

    this.gameState.dispatch(endMission(success));
  }

  /**
   * Clean up current mission
   */
  public unloadMission(): void {
    this.currentMission = null;
    this.runtimeState = null;
  }

  /**
   * Get runtime statistics
   */
  public getStats(): {
    weldsCompleted: number;
    totalWelds: number;
    averageQuality: number;
  } | null {
    if (!this.runtimeState) return null;

    return {
      weldsCompleted: this.runtimeState.weldsCompleted,
      totalWelds: this.runtimeState.weldTargets.length,
      averageQuality: this.runtimeState.averageQuality,
    };
  }
}
