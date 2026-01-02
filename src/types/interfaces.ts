/**
 * SHARED INTERFACE CONTRACTS
 *
 * This file defines the interfaces that both CODER-A and CODER-B must implement.
 * Changes to this file require SUPERVISOR approval.
 *
 * CODER-A implements: IEngine, IEventBus, IInputManager, IGameState, IWeldingSystem, IScoringSystem
 * CODER-B implements: ISubmarine, IWeldingArm, IWeldingTorch, ICameraManager, IUIManager
 */

import * as THREE from 'three';

// ============================================================================
// CORE INTERFACES (CODER-A implements)
// ============================================================================

/**
 * Core Three.js engine wrapper
 * Implemented in: src/core/Engine.ts
 */
export interface IEngine {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  clock: THREE.Clock;

  /** Register a callback to be called every frame */
  onUpdate(callback: (delta: number, elapsed: number) => void): void;

  /** Remove an update callback */
  offUpdate(callback: (delta: number, elapsed: number) => void): void;

  /** Start the render loop */
  start(): void;

  /** Stop the render loop */
  stop(): void;

  /** Resize the renderer */
  resize(width: number, height: number): void;
}

/**
 * Global event bus for decoupled communication
 * Implemented in: src/core/EventBus.ts
 */
export interface IEventBus {
  /** Subscribe to an event */
  on(event: string, handler: (...args: any[]) => void): void;

  /** Unsubscribe from an event */
  off(event: string, handler: (...args: any[]) => void): void;

  /** Emit an event with optional data */
  emit(event: string, data?: any): void;

  /** Subscribe to an event, automatically unsubscribe after first call */
  once(event: string, handler: (...args: any[]) => void): void;
}

// ============================================================================
// INPUT INTERFACES (CODER-A implements)
// ============================================================================

/**
 * All possible input actions in the game
 */
export enum InputAction {
  // Submarine navigation
  SUB_FORWARD = 'sub_forward',
  SUB_BACKWARD = 'sub_backward',
  SUB_LEFT = 'sub_left',
  SUB_RIGHT = 'sub_right',
  SUB_ASCEND = 'sub_ascend',
  SUB_DESCEND = 'sub_descend',
  SUB_ROLL_LEFT = 'sub_roll_left',
  SUB_ROLL_RIGHT = 'sub_roll_right',

  // Welding arm
  ARM_YAW_LEFT = 'arm_yaw_left',
  ARM_YAW_RIGHT = 'arm_yaw_right',
  ARM_PITCH_UP = 'arm_pitch_up',
  ARM_PITCH_DOWN = 'arm_pitch_down',
  ARM_EXTEND = 'arm_extend',
  ARM_RETRACT = 'arm_retract',
  ARM_ROTATE_CW = 'arm_rotate_cw',
  ARM_ROTATE_CCW = 'arm_rotate_ccw',

  // Welding actions
  WELD_ACTIVATE = 'weld_activate',
  WELD_INTENSITY_UP = 'weld_intensity_up',
  WELD_INTENSITY_DOWN = 'weld_intensity_down',

  // System
  PAUSE = 'pause',
  CAMERA_CYCLE = 'camera_cycle',
  TOGGLE_LIGHTS = 'toggle_lights',
}

/**
 * State of a single input action
 */
export interface InputState {
  /** Raw value (0-1 for analog, 0 or 1 for digital) */
  value: number;
  /** True only on the frame the input was first pressed */
  pressed: boolean;
  /** True only on the frame the input was released */
  released: boolean;
  /** True while the input is held down */
  held: boolean;
}

/**
 * Central input management
 * Implemented in: src/input/InputManager.ts
 */
export interface IInputManager {
  /** Get the current state of an action for a player */
  getAction(playerId: number, action: InputAction): InputState;

  /** Get analog axis value from two opposing actions (-1 to 1) */
  getAnalogAxis(playerId: number, negativeAction: InputAction, positiveAction: InputAction): number;

  /** Configure for single player mode */
  setupSinglePlayer(useGamepadForWelding: boolean): void;

  /** Configure for local co-op mode */
  setupLocalCoop(mode: 'keyboard-only' | 'keyboard-gamepad'): void;

  /** Poll all input devices (call once per frame) */
  update(): void;
}

// ============================================================================
// STATE INTERFACES (CODER-A implements)
// ============================================================================

/**
 * Submarine state data
 */
export interface SubmarineStateData {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  depth: number;
  pressure: number;
  battery: number;
  oxygen: number;
  lightsOn: boolean;
}

/**
 * Welding arm state data
 */
export interface WeldingArmStateData {
  joints: number[];
  torchActive: boolean;
  torchHeat: number;
  torchIntensity: number;
  arcStability: number;
}

/**
 * Score state data
 */
export interface ScoreStateData {
  total: number;
  multiplier: number;
  weldQualitySum: number;
  weldCount: number;
  accuracy: number;
  timeBonus: number;
}

/**
 * Mission objective data
 */
export interface ObjectiveData {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  progress: number;
  target: number;
}

/**
 * Mission state data
 */
export interface MissionStateData {
  id: string;
  name: string;
  timeLimit: number;
  timeRemaining: number;
  objectives: ObjectiveData[];
  completed: boolean;
  failed: boolean;
}

/**
 * Complete game state
 */
export interface GameStateData {
  phase: 'menu' | 'briefing' | 'playing' | 'paused' | 'results';
  missionResult: 'success' | 'failure' | null;
  submarine: SubmarineStateData;
  welding: WeldingArmStateData;
  score: ScoreStateData;
  mission: MissionStateData | null;
  settings: {
    difficulty: 'easy' | 'normal' | 'hard';
    soundVolume: number;
    musicVolume: number;
    invertY: boolean;
  };
}

/**
 * State action types
 */
export type GameStateAction =
  | { type: 'SET_PHASE'; phase: GameStateData['phase'] }
  | { type: 'SET_MISSION_RESULT'; result: 'success' | 'failure' | null }
  | { type: 'UPDATE_SUBMARINE'; submarine: Partial<SubmarineStateData> }
  | { type: 'UPDATE_WELDING'; welding: Partial<WeldingArmStateData> }
  | { type: 'ADD_SCORE'; points: number }
  | { type: 'SET_MULTIPLIER'; multiplier: number }
  | { type: 'COMPLETE_OBJECTIVE'; objectiveId: string }
  | { type: 'UPDATE_OBJECTIVE_PROGRESS'; objectiveId: string; progress: number }
  | { type: 'START_MISSION'; mission: MissionStateData }
  | { type: 'END_MISSION'; success: boolean }
  | { type: 'TICK_TIME'; delta: number }
  | { type: 'RESET' };

/**
 * Central game state store
 * Implemented in: src/state/GameState.ts
 */
export interface IGameState {
  /** Get current state (read-only snapshot) */
  getState(): GameStateData;

  /** Dispatch an action to modify state */
  dispatch(action: GameStateAction): void;

  /** Subscribe to state changes, returns unsubscribe function */
  subscribe(callback: (state: GameStateData) => void): () => void;
}

// ============================================================================
// ENTITY INTERFACES (CODER-B implements)
// ============================================================================

/**
 * Main submarine entity
 * Implemented in: src/entities/Submarine.ts
 */
export interface ISubmarine {
  /** The Three.js group containing the submarine */
  mesh: THREE.Group;

  /** Current world position */
  readonly position: THREE.Vector3;

  /** Current rotation */
  readonly rotation: THREE.Euler;

  /** Get the welding arm attached to this submarine */
  getWeldingArm(): IWeldingArm;

  /** Update submarine (called every frame) */
  update(delta: number): void;

  /** Apply movement input */
  applyInput(forward: number, strafe: number, vertical: number, rollInput: number): void;

  /** Toggle lights on/off */
  toggleLights(): void;
}

/**
 * Articulated welding arm
 * Implemented in: src/entities/WeldingArm.ts
 */
export interface IWeldingArm {
  /** The Three.js group containing the arm */
  mesh: THREE.Group;

  /** Get current joint angles (radians) */
  getJointAngles(): number[];

  /** Get the welding torch at the end of the arm */
  getTorch(): IWeldingTorch;

  /** Get the world position of the torch tip */
  getTorchTipPosition(): THREE.Vector3;

  /** Get the torch direction vector */
  getTorchDirection(): THREE.Vector3;

  /** Update arm (called every frame) */
  update(delta: number): void;

  /** Apply arm control input */
  applyInput(yaw: number, pitch: number, extend: number, rotate: number): void;
}

/**
 * Welding torch with particle effects
 * Implemented in: src/entities/WeldingTorch.ts
 */
export interface IWeldingTorch {
  /** The Three.js group containing the torch */
  mesh: THREE.Group;

  /** Whether the torch is currently active */
  readonly isActive: boolean;

  /** Current heat level (0-100) */
  readonly heat: number;

  /** Current intensity (0-1) */
  readonly intensity: number;

  /** Activate the welding torch */
  activate(): void;

  /** Deactivate the welding torch */
  deactivate(): void;

  /** Adjust intensity */
  setIntensity(intensity: number): void;

  /** Update torch (called every frame) */
  update(delta: number): void;
}

// ============================================================================
// CAMERA INTERFACES (CODER-B implements)
// ============================================================================

/**
 * Multi-camera management with render-to-texture
 * Implemented in: src/cameras/CameraManager.ts
 */
export interface ICameraManager {
  /** Get the texture for a viewport (for UI display) */
  getViewportTexture(id: 'welding' | 'external' | 'navigation' | 'minimap'): THREE.Texture | null;

  /** Get the render target for a viewport (for reading pixels) */
  getRenderTarget(id: string): THREE.WebGLRenderTarget | null;

  /** Get the main camera */
  getMainCamera(): THREE.Camera;

  /** Update camera positions (call before render) */
  update(submarine: ISubmarine): void;

  /** Render all viewports to their targets */
  render(): void;

  /** Cycle the main view to next camera */
  cycleMainCamera(): void;

  /** Handle window resize */
  resize(width: number, height: number): void;
}

// ============================================================================
// UI INTERFACES (CODER-B implements)
// ============================================================================

/**
 * UI management
 * Implemented in: src/ui/UIManager.ts
 */
export interface IUIManager {
  /** Update UI with current state (call every frame) */
  update(): void;

  /** Show a notification toast */
  showNotification(message: string, duration?: number): void;

  /** Show/hide pause menu */
  setPauseMenuVisible(visible: boolean): void;

  /** Update hotkey hints based on current input mode */
  updateHotkeyHints(mode: 'single' | 'coop-keyboard' | 'coop-gamepad'): void;
}

// ============================================================================
// SYSTEM INTERFACES (CODER-A implements)
// ============================================================================

/**
 * Weld quality result
 */
export interface WeldQualityResult {
  overallScore: number;
  rating: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  speedScore: number;
  angleScore: number;
  arcScore: number;
  accuracyScore: number;
  consistencyScore: number;
  feedback: string[];
  defects: Array<{
    type: 'porosity' | 'undercut' | 'overlap' | 'incomplete_fusion' | 'spatter';
    severity: 'minor' | 'moderate' | 'severe';
    position: number;
    cause: string;
  }>;
}

/**
 * Welding system for tracking weld quality
 * Implemented in: src/systems/WeldingSystem.ts
 */
export interface IWeldingSystem {
  /** Start tracking a new weld */
  startWeld(): void;

  /** Add a sample point during welding */
  addSample(
    position: THREE.Vector3,
    travelSpeed: number,
    workAngle: number,
    travelAngle: number,
    arcLength: number,
    distanceToTarget: number
  ): void;

  /** Finish weld and get quality result */
  finishWeld(): WeldQualityResult;

  /** Check if currently welding */
  isWelding(): boolean;

  /** Get current arc stability (-1 to 1) */
  getArcStability(): number;
}

/**
 * Scoring system
 * Implemented in: src/systems/ScoringSystem.ts
 */
export interface IScoringSystem {
  /** Process a completed weld and award points */
  processWeld(result: WeldQualityResult): void;

  /** Get current multiplier */
  getMultiplier(): number;

  /** Update system (call every frame for combo decay) */
  update(delta: number): void;
}

// ============================================================================
// MULTIPLAYER INTERFACES (CODER-A implements)
// ============================================================================

export type PlayerRole = 'pilot' | 'welder' | 'both';
export type CoopMode = 'single' | 'keyboard-split' | 'keyboard-gamepad';

/**
 * Player slot information
 */
export interface PlayerSlot {
  id: number;
  role: PlayerRole;
  inputDevice: 'keyboard' | 'gamepad';
  gamepadIndex?: number;
  isActive: boolean;
  name: string;
}

/**
 * Local co-op management
 * Implemented in: src/multiplayer/LocalCoopManager.ts
 */
export interface ILocalCoopManager {
  /** Get current co-op configuration */
  getMode(): CoopMode;

  /** Get player by ID */
  getPlayer(id: number): PlayerSlot | undefined;

  /** Get player by role */
  getPlayerByRole(role: PlayerRole): PlayerSlot | undefined;

  /** Setup single player mode */
  setupSinglePlayer(): void;

  /** Setup keyboard-only co-op */
  setupKeyboardCoop(): void;

  /** Setup keyboard + gamepad co-op */
  setupKeyboardGamepadCoop(): void;

  /** Swap roles between players */
  swapRoles(): void;
}

// ============================================================================
// EVENT NAMES (for EventBus)
// ============================================================================

/**
 * Standard event names used across the application
 */
export const GameEvents = {
  // Input events
  GAMEPAD_CONNECTED: 'gamepad:connected',
  GAMEPAD_DISCONNECTED: 'gamepad:disconnected',

  // Game state events
  STATE_CHANGED: 'state:changed',
  PHASE_CHANGED: 'phase:changed',

  // Welding events
  WELD_STARTED: 'weld:started',
  WELD_COMPLETED: 'weld:completed',
  WELD_QUALITY: 'weld:quality',

  // Score events
  SCORE_UPDATED: 'score:updated',
  MULTIPLIER_CHANGED: 'multiplier:changed',

  // Mission events
  OBJECTIVE_COMPLETED: 'objective:completed',
  MISSION_COMPLETED: 'mission:completed',
  MISSION_FAILED: 'mission:failed',

  // Co-op events
  COOP_CONFIGURED: 'coop:configured',
  COOP_PLAYER_JOINED: 'coop:player-joined',
  COOP_PLAYER_LEFT: 'coop:player-left',
  COOP_ROLES_SWAPPED: 'coop:roles-swapped',
} as const;
