/**
 * Input Manager
 *
 * Central input coordination for single-player and local co-op modes.
 * Implements IInputManager interface from src/types/interfaces.ts
 */

import { InputAction, type InputState, type IInputManager } from '../types/interfaces';
import { KeyboardController, DEFAULT_PILOT_BINDINGS, DEFAULT_WELDER_BINDINGS } from './KeyboardController';
import { GamepadController } from './GamepadController';
import { EMPTY_INPUT_STATE } from './InputAction';

/** Input mode configuration */
export type InputMode = 'single-keyboard' | 'single-gamepad' | 'coop-keyboard' | 'coop-keyboard-gamepad';

/** Player input configuration */
interface PlayerConfig {
  playerId: number;
  keyboard: KeyboardController | null;
  gamepad: GamepadController | null;
  actions: Set<InputAction>;
}

export class InputManager implements IInputManager {
  private mode: InputMode = 'single-keyboard';
  private players: Map<number, PlayerConfig> = new Map();
  private keyboardController: KeyboardController | null = null;
  private gamepadController: GamepadController | null = null;

  constructor() {
    // Start with single player keyboard mode
    this.setupSinglePlayer(false);
  }

  /**
   * Get the current state of an action for a player
   */
  public getAction(playerId: number, action: InputAction): InputState {
    const player = this.players.get(playerId);
    if (!player) {
      return EMPTY_INPUT_STATE;
    }

    // Check if this action is assigned to this player
    if (!player.actions.has(action)) {
      return EMPTY_INPUT_STATE;
    }

    // Try keyboard first
    if (player.keyboard) {
      const state = player.keyboard.getAction(action);
      if (state.held || state.pressed || state.released) {
        return state;
      }
    }

    // Try gamepad
    if (player.gamepad) {
      const state = player.gamepad.getAction(action);
      if (state.held || state.pressed || state.released) {
        return state;
      }
    }

    return EMPTY_INPUT_STATE;
  }

  /**
   * Get analog axis value from two opposing actions (-1 to 1)
   */
  public getAnalogAxis(playerId: number, negativeAction: InputAction, positiveAction: InputAction): number {
    const player = this.players.get(playerId);
    if (!player) {
      return 0;
    }

    let negative = 0;
    let positive = 0;

    // Get values from keyboard
    if (player.keyboard) {
      const negState = player.keyboard.getAction(negativeAction);
      const posState = player.keyboard.getAction(positiveAction);
      negative = Math.max(negative, negState.value);
      positive = Math.max(positive, posState.value);
    }

    // Get values from gamepad (can be analog)
    if (player.gamepad) {
      const negState = player.gamepad.getAction(negativeAction);
      const posState = player.gamepad.getAction(positiveAction);
      negative = Math.max(negative, negState.value);
      positive = Math.max(positive, posState.value);

      // Also check if there's a direct axis mapping
      const axisValue = player.gamepad.getAxisValue(negativeAction, positiveAction);
      if (Math.abs(axisValue) > Math.abs(positive - negative)) {
        return axisValue;
      }
    }

    return positive - negative;
  }

  /**
   * Configure for single player mode
   */
  public setupSinglePlayer(useGamepadForWelding: boolean): void {
    this.dispose();

    if (useGamepadForWelding) {
      this.mode = 'single-gamepad';

      // Keyboard for pilot controls
      this.keyboardController = new KeyboardController(new Map(DEFAULT_PILOT_BINDINGS));

      // Gamepad for welding controls
      this.gamepadController = new GamepadController();

      // Player 1 has all actions
      const allActions = new Set(Object.values(InputAction));
      this.players.set(1, {
        playerId: 1,
        keyboard: this.keyboardController,
        gamepad: this.gamepadController,
        actions: allActions,
      });
    } else {
      this.mode = 'single-keyboard';

      // Single keyboard with both bindings
      this.keyboardController = new KeyboardController(new Map(DEFAULT_PILOT_BINDINGS));
      this.keyboardController.addBindings(new Map(DEFAULT_WELDER_BINDINGS));

      // Also set up gamepad as optional alternative
      this.gamepadController = new GamepadController();

      const allActions = new Set(Object.values(InputAction));
      this.players.set(1, {
        playerId: 1,
        keyboard: this.keyboardController,
        gamepad: this.gamepadController,
        actions: allActions,
      });
    }
  }

  /**
   * Configure for local co-op mode
   */
  public setupLocalCoop(mode: 'keyboard-only' | 'keyboard-gamepad'): void {
    this.dispose();

    // Define pilot and welder action sets
    const pilotActions = new Set<InputAction>([
      InputAction.SUB_FORWARD,
      InputAction.SUB_BACKWARD,
      InputAction.SUB_LEFT,
      InputAction.SUB_RIGHT,
      InputAction.SUB_ASCEND,
      InputAction.SUB_DESCEND,
      InputAction.SUB_ROLL_LEFT,
      InputAction.SUB_ROLL_RIGHT,
      InputAction.PAUSE,
      InputAction.CAMERA_CYCLE,
      InputAction.TOGGLE_LIGHTS,
    ]);

    const welderActions = new Set<InputAction>([
      InputAction.ARM_YAW_LEFT,
      InputAction.ARM_YAW_RIGHT,
      InputAction.ARM_PITCH_UP,
      InputAction.ARM_PITCH_DOWN,
      InputAction.ARM_EXTEND,
      InputAction.ARM_RETRACT,
      InputAction.ARM_ROTATE_CW,
      InputAction.ARM_ROTATE_CCW,
      InputAction.WELD_ACTIVATE,
      InputAction.WELD_INTENSITY_UP,
      InputAction.WELD_INTENSITY_DOWN,
    ]);

    if (mode === 'keyboard-only') {
      this.mode = 'coop-keyboard';

      // Player 1 (Pilot): WASD controls
      const pilotKeyboard = new KeyboardController(new Map(DEFAULT_PILOT_BINDINGS));
      this.players.set(1, {
        playerId: 1,
        keyboard: pilotKeyboard,
        gamepad: null,
        actions: pilotActions,
      });

      // Player 2 (Welder): Arrow keys and numpad
      const welderKeyboard = new KeyboardController(new Map(DEFAULT_WELDER_BINDINGS));
      this.players.set(2, {
        playerId: 2,
        keyboard: welderKeyboard,
        gamepad: null,
        actions: welderActions,
      });

      this.keyboardController = pilotKeyboard;
    } else {
      this.mode = 'coop-keyboard-gamepad';

      // Player 1 (Pilot): Keyboard
      this.keyboardController = new KeyboardController(new Map(DEFAULT_PILOT_BINDINGS));
      this.players.set(1, {
        playerId: 1,
        keyboard: this.keyboardController,
        gamepad: null,
        actions: pilotActions,
      });

      // Player 2 (Welder): Gamepad
      this.gamepadController = new GamepadController();
      this.players.set(2, {
        playerId: 2,
        keyboard: null,
        gamepad: this.gamepadController,
        actions: welderActions,
      });
    }
  }

  /**
   * Poll all input devices (call once per frame)
   */
  public update(): void {
    // Update gamepad (requires polling)
    if (this.gamepadController) {
      this.gamepadController.update();
    }
  }

  /**
   * End frame processing (updates previous states)
   */
  public endFrame(): void {
    for (const player of this.players.values()) {
      if (player.keyboard) {
        player.keyboard.endFrame();
      }
    }
  }

  /**
   * Get current input mode
   */
  public getMode(): InputMode {
    return this.mode;
  }

  /**
   * Check if a gamepad is connected
   */
  public isGamepadConnected(): boolean {
    return this.gamepadController?.isConnected() ?? false;
  }

  /**
   * Dispose of all controllers
   */
  public dispose(): void {
    for (const player of this.players.values()) {
      player.keyboard?.dispose();
    }
    this.gamepadController?.dispose();
    this.players.clear();
    this.keyboardController = null;
    this.gamepadController = null;
  }
}

// Singleton instance
export const inputManager = new InputManager();

export default InputManager;
