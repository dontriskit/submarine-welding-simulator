/**
 * Keyboard Controller
 *
 * Handles keyboard input with support for pressed/held/released states.
 * Tracks key states across frames for edge detection.
 */

import { InputAction, type InputState } from '../types/interfaces';
import { EMPTY_INPUT_STATE } from './InputAction';

/** Key state for a single key */
interface KeyState {
  current: boolean;
  previous: boolean;
}

/** Default keyboard bindings for Player 1 (Pilot) */
export const DEFAULT_PILOT_BINDINGS: ReadonlyMap<string, InputAction> = new Map([
  // WASD for movement
  ['KeyW', InputAction.SUB_FORWARD],
  ['KeyS', InputAction.SUB_BACKWARD],
  ['KeyA', InputAction.SUB_LEFT],
  ['KeyD', InputAction.SUB_RIGHT],
  // Space/Shift for vertical
  ['Space', InputAction.SUB_ASCEND],
  ['ShiftLeft', InputAction.SUB_DESCEND],
  // Q/E for roll
  ['KeyQ', InputAction.SUB_ROLL_LEFT],
  ['KeyE', InputAction.SUB_ROLL_RIGHT],
  // System
  ['Escape', InputAction.PAUSE],
  ['KeyC', InputAction.CAMERA_CYCLE],
  ['KeyL', InputAction.TOGGLE_LIGHTS],
]);

/** Default keyboard bindings for Player 2 (Welder) or single player welding */
export const DEFAULT_WELDER_BINDINGS: ReadonlyMap<string, InputAction> = new Map([
  // Arrow keys for arm yaw/pitch
  ['ArrowLeft', InputAction.ARM_YAW_LEFT],
  ['ArrowRight', InputAction.ARM_YAW_RIGHT],
  ['ArrowUp', InputAction.ARM_PITCH_UP],
  ['ArrowDown', InputAction.ARM_PITCH_DOWN],
  // Numpad or other keys for extend/retract
  ['PageUp', InputAction.ARM_EXTEND],
  ['PageDown', InputAction.ARM_RETRACT],
  // Brackets for rotation
  ['BracketLeft', InputAction.ARM_ROTATE_CCW],
  ['BracketRight', InputAction.ARM_ROTATE_CW],
  // Welding controls
  ['Enter', InputAction.WELD_ACTIVATE],
  ['Equal', InputAction.WELD_INTENSITY_UP],
  ['Minus', InputAction.WELD_INTENSITY_DOWN],
]);

export class KeyboardController {
  private keyStates: Map<string, KeyState> = new Map();
  private bindings: Map<string, InputAction>;
  private reverseBindings: Map<InputAction, string[]> = new Map();

  constructor(bindings?: Map<string, InputAction>) {
    this.bindings = bindings ? new Map(bindings) : new Map(DEFAULT_PILOT_BINDINGS);
    this.buildReverseBindings();
    this.setupEventListeners();
  }

  /**
   * Add additional bindings (merges with existing)
   */
  public addBindings(bindings: Map<string, InputAction>): void {
    for (const [key, action] of bindings) {
      this.bindings.set(key, action);
    }
    this.buildReverseBindings();
  }

  /**
   * Get the current state of an action
   */
  public getAction(action: InputAction): InputState {
    const keys = this.reverseBindings.get(action);
    if (!keys || keys.length === 0) {
      return EMPTY_INPUT_STATE;
    }

    // Check all keys bound to this action
    let value = 0;
    let pressed = false;
    let released = false;
    let held = false;

    for (const key of keys) {
      const state = this.keyStates.get(key);
      if (state) {
        if (state.current) {
          value = 1;
          held = true;
          if (!state.previous) {
            pressed = true;
          }
        } else if (state.previous) {
          released = true;
        }
      }
    }

    return { value, pressed, released, held };
  }

  /**
   * Check if a specific key is currently held
   */
  public isKeyHeld(code: string): boolean {
    const state = this.keyStates.get(code);
    return state?.current ?? false;
  }

  /**
   * Update previous states (call at end of frame)
   */
  public endFrame(): void {
    for (const state of this.keyStates.values()) {
      state.previous = state.current;
    }
  }

  /**
   * Clear all key states
   */
  public reset(): void {
    this.keyStates.clear();
  }

  /**
   * Dispose of event listeners
   */
  public dispose(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
  }

  private buildReverseBindings(): void {
    this.reverseBindings.clear();
    for (const [key, action] of this.bindings) {
      if (!this.reverseBindings.has(action)) {
        this.reverseBindings.set(action, []);
      }
      this.reverseBindings.get(action)!.push(key);
    }
  }

  private setupEventListeners(): void {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    // Ignore repeat events
    if (event.repeat) return;

    const code = event.code;
    if (this.bindings.has(code)) {
      event.preventDefault();
      let state = this.keyStates.get(code);
      if (!state) {
        state = { current: false, previous: false };
        this.keyStates.set(code, state);
      }
      state.current = true;
    }
  };

  private handleKeyUp = (event: KeyboardEvent): void => {
    const code = event.code;
    const state = this.keyStates.get(code);
    if (state) {
      state.current = false;
    }
  };

  private handleBlur = (): void => {
    // Release all keys when window loses focus
    for (const state of this.keyStates.values()) {
      state.current = false;
    }
  };
}

export default KeyboardController;
