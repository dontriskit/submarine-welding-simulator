/**
 * App.ts - Main Application Orchestrator
 *
 * Wires all systems together and manages the game loop.
 * This is the central controller that initializes all subsystems
 * and coordinates their interactions.
 *
 * CODER-A Task A18
 */

import { Engine } from './core/Engine';
import { EventBus } from './core/EventBus';
import { inputManager } from './input/InputManager';
import { InputAction, GameEvents, type WeldQualityResult } from './types/interfaces';
import { gameState } from './state/GameState';
import { setPhase, updateSubmarine, updateWelding, tickTime } from './state/GameStateActions';
import { Submarine } from './entities/Submarine';
import { CameraManager } from './cameras/CameraManager';
import { UnderwaterEnv } from './environment/UnderwaterEnv';
import { UIManager } from './ui/UIManager';
import { weldingSystem } from './systems/WeldingSystem';
import { scoringSystem } from './systems/ScoringSystem';
import { localCoopManager } from './multiplayer/LocalCoopManager';
import { trainingMetrics } from './training/TrainingMetrics';
import { BubbleEffect, SparkEffect, CausticsEffect } from './effects';
import { MissionLoader } from './missions/MissionLoader';
import { SCENARIOS } from './scenarios/index';
import {
  OXYGEN_CONSUMPTION_RATE,
  BATTERY_DRAIN_RATE,
  BATTERY_WELD_DRAIN_RATE,
} from './core/Constants';

/**
 * Main Application class
 */
export class App {
  private engine: Engine | null = null;
  private submarine: Submarine | null = null;
  private cameraManager: CameraManager | null = null;
  private uiManager: UIManager | null = null;
  private missionLoader: MissionLoader | null = null;

  // Effects (FIX: TEST-B3)
  private bubbleEffect: BubbleEffect | null = null;
  private sparkEffect: SparkEffect | null = null;
  private causticsEffect: CausticsEffect | null = null;

  private container: HTMLElement | null = null;
  private isRunning: boolean = false;
  private wasWelding: boolean = false;
  private frameCount: number = 0;

  constructor() {
    // Bind methods
    this.gameLoop = this.gameLoop.bind(this);
    this.onPhaseChanged = this.onPhaseChanged.bind(this);
  }

  /**
   * Initialize and start the application
   */
  public async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('App is already running');
      return;
    }

    console.log('Submarine Welding Simulator starting...');

    // Create container for Three.js canvas
    this.container = this.createContainer();

    // Initialize core engine
    this.engine = new Engine(this.container);

    // Set up underwater environment
    new UnderwaterEnv(this.engine.scene);

    // Create submarine and add to scene
    this.submarine = new Submarine();
    this.engine.scene.add(this.submarine.mesh);

    // Initialize mission loader
    this.missionLoader = new MissionLoader(gameState);

    // Register all scenarios
    for (const scenario of Object.values(SCENARIOS)) {
      this.missionLoader.registerMission(scenario);
    }

    // Load default mission (Pipe Repair)
    this.missionLoader.loadMissionById('pipe-repair-01');
    this.missionLoader.startMission();

    // Position submarine at mission spawn
    const spawn = this.missionLoader.getSpawnPosition();
    this.submarine.mesh.position.set(spawn.x, spawn.y, spawn.z);

    // Initialize camera manager
    this.cameraManager = new CameraManager(this.engine.renderer, this.engine.scene);

    // Initialize UI manager
    this.uiManager = new UIManager('ui-root');
    this.uiManager.setGameState(gameState);
    this.uiManager.initViewports(this.engine.renderer); // FIX: TEST-B2

    // Initialize effects (FIX: TEST-B3)
    this.bubbleEffect = new BubbleEffect(this.engine.scene);
    this.sparkEffect = new SparkEffect(this.engine.scene);
    this.causticsEffect = new CausticsEffect(this.engine.scene);

    // Set up local co-op (default single player)
    localCoopManager.setupSinglePlayer();

    // Subscribe to game events
    this.setupEventListeners();

    // Register game loop with engine
    this.engine.onUpdate(this.gameLoop);

    // Start training session
    trainingMetrics.startSession();

    // Start the engine
    this.engine.start();
    this.isRunning = true;

    // Set initial game phase
    gameState.dispatch(setPhase('playing'));

    console.log('Submarine Welding Simulator started');
  }

  /**
   * Stop the application
   */
  public stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;

    // End training session
    const sessionStats = trainingMetrics.endSession();
    if (sessionStats) {
      console.log('Training session ended:', sessionStats);
    }

    // Stop the engine
    if (this.engine) {
      this.engine.offUpdate(this.gameLoop);
      this.engine.stop();
    }

    console.log('Submarine Welding Simulator stopped');
  }

  /**
   * Full cleanup of all resources
   */
  public dispose(): void {
    this.stop();

    // Dispose systems
    this.engine?.dispose();
    inputManager.dispose();

    // Dispose effects (FIX: TEST-B3)
    this.bubbleEffect?.dispose();
    this.sparkEffect?.dispose();
    this.causticsEffect?.dispose();

    // Remove container
    if (this.container && this.container.parentElement) {
      this.container.parentElement.removeChild(this.container);
    }

    // Unload mission
    this.missionLoader?.unloadMission();

    // Clear references
    this.engine = null;
    this.submarine = null;
    this.cameraManager = null;
    this.uiManager = null;
    this.missionLoader = null;
    this.bubbleEffect = null;
    this.sparkEffect = null;
    this.causticsEffect = null;
    this.container = null;

    console.log('Submarine Welding Simulator disposed');
  }

  /**
   * Create the container element for Three.js
   */
  private createContainer(): HTMLElement {
    let container = document.getElementById('game-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'game-container';
      container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
      `;
      document.body.appendChild(container);
    }
    return container;
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    // Listen for phase changes
    EventBus.on(GameEvents.PHASE_CHANGED, (data: unknown) => {
      const phaseData = data as { previous: string; current: string };
      this.onPhaseChanged(phaseData);
    });

    // Listen for weld quality results
    EventBus.on(GameEvents.WELD_QUALITY, (data: unknown) => {
      const result = data as WeldQualityResult;
      // Show notification with rating
      this.uiManager?.showNotification(`Weld Complete: ${result.rating} (${result.overallScore})`);
    });

    // Listen for weld completion to update mission objectives
    EventBus.on(GameEvents.WELD_COMPLETED, (_data: unknown) => {
      // For now, use first incomplete target (proximity detection in #25)
      if (this.missionLoader) {
        const targets = this.missionLoader.getIncompleteWeldTargets();
        if (targets.length > 0) {
          // Get quality from game state arc stability (approximate)
          const state = gameState.getState();
          const quality = state.welding.arcStability * 100;
          this.missionLoader.completeWeldTarget(targets[0].id, quality);
          console.log(`Mission: Completed weld target ${targets[0].id} with quality ${quality.toFixed(0)}`);
        }
      }
    });
  }

  /**
   * Handle phase changes
   */
  private onPhaseChanged(data: { previous: string; current: string }): void {
    const { current } = data;

    switch (current) {
      case 'playing':
        this.engine?.start();
        break;

      case 'paused':
        this.engine?.stop();
        this.uiManager?.setPauseMenuVisible(true);
        break;

      case 'results':
        this.engine?.stop();
        break;
    }
  }

  /**
   * Main game loop - called every frame
   */
  private gameLoop(delta: number, _elapsed: number): void {
    if (!this.submarine || !this.cameraManager || !this.uiManager) return;

    const state = gameState.getState();

    // Only update gameplay when playing
    if (state.phase !== 'playing') {
      return;
    }

    // Poll input devices
    inputManager.update();

    // Handle input
    this.handleInput(delta);

    // Update submarine
    this.submarine.update(delta);

    // Update welding system
    this.updateWelding(delta);

    // Update scoring system (multiplier decay)
    scoringSystem.update(delta);

    // Update game state time
    gameState.dispatch(tickTime(delta));

    // Update resource depletion (oxygen and battery)
    this.updateResources(delta);

    // Sync submarine state to game state
    this.syncSubmarineState();

    // Check for resource depletion game over
    const currentState = gameState.getState();
    if (currentState.submarine.oxygen <= 0 || currentState.submarine.battery <= 0) {
      this.missionLoader?.endMission(false);
      gameState.dispatch(setPhase('results'));
      console.log('Game Over: Resources depleted');
    }

    // Check mission end conditions
    if (this.missionLoader?.shouldMissionEnd()) {
      const success = this.missionLoader.areAllObjectivesComplete();
      this.missionLoader.endMission(success);
      gameState.dispatch(setPhase('results'));
      console.log(`Mission ended: ${success ? 'SUCCESS' : 'FAILED'}`);
    }

    // Update cameras
    this.cameraManager.update(this.submarine);

    // Update effects (FIX: TEST-B3)
    this.bubbleEffect?.update(delta);
    this.sparkEffect?.update(delta);
    this.causticsEffect?.update(delta);

    // Emit bubbles from submarine occasionally
    if (Math.random() < 0.02) {
      const subPos = this.submarine.position;
      this.bubbleEffect?.emit(subPos, 2);
    }

    // Update UI
    this.uiManager.update();

    // Render all camera viewports
    this.cameraManager.render();

    // Update viewport displays with rendered textures (FIX: TEST-B2)
    this.uiManager.updateViewports(this.cameraManager);

    // Debug logging - log every 60 frames (~1 second at 60fps)
    this.frameCount++;
    if (this.frameCount % 60 === 0) {
      console.log(`Frame ${this.frameCount}, Submarine pos:`, this.submarine.position);
    }

    // End frame for input (update previous states)
    inputManager.endFrame();
  }

  /**
   * Handle player input
   */
  private handleInput(_delta: number): void {
    if (!this.submarine) return;

    const playerId = 1; // Single player or pilot in co-op

    // Get submarine movement input
    const forward = inputManager.getAnalogAxis(
      playerId,
      InputAction.SUB_BACKWARD,
      InputAction.SUB_FORWARD
    );
    const strafe = inputManager.getAnalogAxis(
      playerId,
      InputAction.SUB_LEFT,
      InputAction.SUB_RIGHT
    );
    const vertical = inputManager.getAnalogAxis(
      playerId,
      InputAction.SUB_DESCEND,
      InputAction.SUB_ASCEND
    );
    const roll = inputManager.getAnalogAxis(
      playerId,
      InputAction.SUB_ROLL_LEFT,
      InputAction.SUB_ROLL_RIGHT
    );

    // Debug: Log significant input for verification (Issue #7)
    if (Math.abs(forward) > 0.1 || Math.abs(strafe) > 0.1) {
      console.log(`Input: forward=${forward.toFixed(2)}, strafe=${strafe.toFixed(2)}`);
    }

    // Apply to submarine
    this.submarine.applyInput(forward, strafe, vertical, roll);

    // Get welding arm input (player 1 in single, player 2 in co-op)
    const welderId = localCoopManager.isCoopMode() ? 2 : 1;
    const weldingArm = this.submarine.getWeldingArm();

    const armYaw = inputManager.getAnalogAxis(
      welderId,
      InputAction.ARM_YAW_LEFT,
      InputAction.ARM_YAW_RIGHT
    );
    const armPitch = inputManager.getAnalogAxis(
      welderId,
      InputAction.ARM_PITCH_DOWN,
      InputAction.ARM_PITCH_UP
    );
    const armExtend = inputManager.getAnalogAxis(
      welderId,
      InputAction.ARM_RETRACT,
      InputAction.ARM_EXTEND
    );
    const armRotate = inputManager.getAnalogAxis(
      welderId,
      InputAction.ARM_ROTATE_CCW,
      InputAction.ARM_ROTATE_CW
    );

    weldingArm.applyInput(armYaw, armPitch, armExtend, armRotate);

    // Handle discrete actions
    this.handleDiscreteActions(playerId, welderId);
  }

  /**
   * Handle discrete (button press) actions
   */
  private handleDiscreteActions(pilotId: number, welderId: number): void {
    if (!this.submarine) return;

    const weldingArm = this.submarine.getWeldingArm();
    const torch = weldingArm.getTorch();

    // Toggle lights
    const lightsAction = inputManager.getAction(pilotId, InputAction.TOGGLE_LIGHTS);
    if (lightsAction.pressed) {
      this.submarine.toggleLights();
    }

    // Pause
    const pauseAction = inputManager.getAction(pilotId, InputAction.PAUSE);
    if (pauseAction.pressed) {
      const currentPhase = gameState.getState().phase;
      if (currentPhase === 'playing') {
        gameState.dispatch(setPhase('paused'));
      } else if (currentPhase === 'paused') {
        gameState.dispatch(setPhase('playing'));
        this.uiManager?.setPauseMenuVisible(false);
      }
    }

    // Camera cycle
    const cameraAction = inputManager.getAction(pilotId, InputAction.CAMERA_CYCLE);
    if (cameraAction.pressed) {
      this.cameraManager?.cycleMainCamera();
    }

    // Welding activation
    const weldAction = inputManager.getAction(welderId, InputAction.WELD_ACTIVATE);
    if (weldAction.pressed) {
      torch.activate();
      weldingSystem.startWeld();
      trainingMetrics.onWeldStart();
    } else if (weldAction.released) {
      torch.deactivate();
      const result = weldingSystem.finishWeld();
      scoringSystem.processWeld(result);
      trainingMetrics.recordWeld(result);
    }

    // Weld intensity adjustment
    const intensityUp = inputManager.getAction(welderId, InputAction.WELD_INTENSITY_UP);
    const intensityDown = inputManager.getAction(welderId, InputAction.WELD_INTENSITY_DOWN);
    if (intensityUp.pressed) {
      torch.setIntensity(Math.min(1, torch.intensity + 0.1));
    }
    if (intensityDown.pressed) {
      torch.setIntensity(Math.max(0.3, torch.intensity - 0.1));
    }
  }

  /**
   * Update welding system with sample data
   */
  private updateWelding(_delta: number): void {
    if (!this.submarine) return;

    const weldingArm = this.submarine.getWeldingArm();
    const torch = weldingArm.getTorch();

    // Track welding state changes for state sync
    const isWelding = torch.isActive;

    if (isWelding && weldingSystem.isWelding()) {
      // Collect weld sample
      const tipPosition = weldingArm.getTorchTipPosition();
      const direction = weldingArm.getTorchDirection();

      // Emit sparks at torch position (FIX: TEST-B3)
      this.sparkEffect?.emit(tipPosition, direction, torch.intensity);

      // Calculate approximate values for sample
      // In a full implementation, these would come from physics tracking
      const travelSpeed = 0.15; // Approximate based on arm movement
      const workAngle = 90 - Math.abs(direction.y) * 90; // Simplified
      const travelAngle = 15; // Default travel angle
      const arcLength = 3.0; // Default arc length (mm)

      // Calculate actual distance to nearest weld target
      let distanceToTarget = 0;
      if (this.missionLoader) {
        const targets = this.missionLoader.getIncompleteWeldTargets();
        const proximity = weldingSystem.checkProximityToTarget(tipPosition, targets);
        // Convert from meters to mm for the quality analyzer
        distanceToTarget = proximity.distance * 1000;
      }

      weldingSystem.addSample(
        tipPosition,
        travelSpeed,
        workAngle,
        travelAngle,
        arcLength,
        distanceToTarget
      );
    }

    // Update welding state in game state
    if (isWelding !== this.wasWelding) {
      gameState.dispatch(updateWelding({
        torchActive: isWelding,
        torchHeat: torch.heat,
        torchIntensity: torch.intensity,
        arcStability: weldingSystem.getArcStability(),
      }));
      this.wasWelding = isWelding;
    }
  }

  /**
   * Sync submarine state to game state
   */
  private syncSubmarineState(): void {
    if (!this.submarine) return;

    const pos = this.submarine.position;
    const rot = this.submarine.rotation;

    gameState.dispatch(updateSubmarine({
      position: { x: pos.x, y: pos.y, z: pos.z },
      rotation: { x: rot.x, y: rot.y, z: rot.z },
      depth: Math.abs(pos.y),
    }));
  }

  /**
   * Update resource consumption (oxygen and battery)
   */
  private updateResources(delta: number): void {
    const state = gameState.getState();

    // Oxygen depletes constantly
    const newOxygen = Math.max(0, state.submarine.oxygen - OXYGEN_CONSUMPTION_RATE * delta);

    // Battery drains faster when welding
    const isWelding = state.welding.torchActive;
    const batteryDrain = isWelding ? BATTERY_WELD_DRAIN_RATE : BATTERY_DRAIN_RATE;
    const newBattery = Math.max(0, state.submarine.battery - batteryDrain * delta);

    // Update state with new resource values
    gameState.dispatch(updateSubmarine({
      oxygen: newOxygen,
      battery: newBattery,
    }));
  }
}

// Export singleton for convenience
export const app = new App();

export default App;
