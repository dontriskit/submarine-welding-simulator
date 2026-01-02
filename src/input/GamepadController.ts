/**
 * Gamepad Controller
 *
 * Handles gamepad/joystick input with support for VJOY and standard controllers.
 * Includes deadzone handling, axis scaling, and button state tracking.
 */

import { InputAction, type InputState } from '../types/interfaces';
import { EventBus } from '../core/EventBus';
import { GameEvents } from '../types/interfaces';
import { INPUT_DEADZONE, INPUT_SENSITIVITY } from '../core/Constants';
import { EMPTY_INPUT_STATE } from './InputAction';

/** Gamepad axis mapping */
export interface AxisMapping {
  axisIndex: number;
  inverted: boolean;
  positiveAction: InputAction;
  negativeAction: InputAction;
}

/** Gamepad button mapping */
export interface ButtonMapping {
  buttonIndex: number;
  action: InputAction;
}

/** Default gamepad mappings (standard layout) */
export const DEFAULT_AXIS_MAPPINGS: AxisMapping[] = [
  // Left stick - submarine movement
  { axisIndex: 0, inverted: false, positiveAction: InputAction.SUB_RIGHT, negativeAction: InputAction.SUB_LEFT },
  { axisIndex: 1, inverted: true, positiveAction: InputAction.SUB_FORWARD, negativeAction: InputAction.SUB_BACKWARD },
  // Right stick - arm control
  { axisIndex: 2, inverted: false, positiveAction: InputAction.ARM_YAW_RIGHT, negativeAction: InputAction.ARM_YAW_LEFT },
  { axisIndex: 3, inverted: true, positiveAction: InputAction.ARM_PITCH_UP, negativeAction: InputAction.ARM_PITCH_DOWN },
];

export const DEFAULT_BUTTON_MAPPINGS: ButtonMapping[] = [
  // Face buttons
  { buttonIndex: 0, action: InputAction.WELD_ACTIVATE },      // A/X
  { buttonIndex: 1, action: InputAction.TOGGLE_LIGHTS },      // B/Circle
  { buttonIndex: 2, action: InputAction.CAMERA_CYCLE },       // X/Square
  { buttonIndex: 3, action: InputAction.PAUSE },              // Y/Triangle
  // Bumpers
  { buttonIndex: 4, action: InputAction.ARM_ROTATE_CCW },     // LB
  { buttonIndex: 5, action: InputAction.ARM_ROTATE_CW },      // RB
  // Triggers (as buttons, value 0-1)
  { buttonIndex: 6, action: InputAction.SUB_DESCEND },        // LT
  { buttonIndex: 7, action: InputAction.SUB_ASCEND },         // RT
  // D-pad
  { buttonIndex: 12, action: InputAction.ARM_EXTEND },        // D-Up
  { buttonIndex: 13, action: InputAction.ARM_RETRACT },       // D-Down
  { buttonIndex: 14, action: InputAction.WELD_INTENSITY_DOWN }, // D-Left
  { buttonIndex: 15, action: InputAction.WELD_INTENSITY_UP }, // D-Right
];

/** Button state for tracking pressed/released */
interface ButtonState {
  current: number;
  previous: number;
}

export class GamepadController {
  private gamepadIndex: number | null = null;
  private axisMappings: AxisMapping[];
  private buttonMappings: ButtonMapping[];
  private buttonStates: Map<number, ButtonState> = new Map();
  private axisValues: Map<InputAction, number> = new Map();
  private deadzone: number;
  private sensitivity: number;

  constructor(
    axisMappings?: AxisMapping[],
    buttonMappings?: ButtonMapping[],
    deadzone: number = INPUT_DEADZONE,
    sensitivity: number = INPUT_SENSITIVITY
  ) {
    this.axisMappings = axisMappings ?? [...DEFAULT_AXIS_MAPPINGS];
    this.buttonMappings = buttonMappings ?? [...DEFAULT_BUTTON_MAPPINGS];
    this.deadzone = deadzone;
    this.sensitivity = sensitivity;

    this.setupEventListeners();
    this.detectExistingGamepads();
  }

  /**
   * Update gamepad state (must be called every frame)
   */
  public update(): void {
    if (this.gamepadIndex === null) return;

    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[this.gamepadIndex];
    if (!gamepad) return;

    // Update button states
    for (const mapping of this.buttonMappings) {
      const button = gamepad.buttons[mapping.buttonIndex];
      if (button) {
        let state = this.buttonStates.get(mapping.buttonIndex);
        if (!state) {
          state = { current: 0, previous: 0 };
          this.buttonStates.set(mapping.buttonIndex, state);
        }
        state.previous = state.current;
        state.current = button.value;
      }
    }

    // Update axis values
    this.axisValues.clear();
    for (const mapping of this.axisMappings) {
      const rawValue = gamepad.axes[mapping.axisIndex] ?? 0;
      const value = this.applyDeadzone(mapping.inverted ? -rawValue : rawValue);

      if (value > 0) {
        this.axisValues.set(mapping.positiveAction, value);
      } else if (value < 0) {
        this.axisValues.set(mapping.negativeAction, -value);
      }
    }
  }

  /**
   * Get the current state of an action
   */
  public getAction(action: InputAction): InputState {
    // Check button mappings first
    for (const mapping of this.buttonMappings) {
      if (mapping.action === action) {
        const state = this.buttonStates.get(mapping.buttonIndex);
        if (state) {
          const held = state.current > 0.5;
          const wasHeld = state.previous > 0.5;
          return {
            value: state.current,
            pressed: held && !wasHeld,
            released: !held && wasHeld,
            held,
          };
        }
      }
    }

    // Check axis mappings
    const axisValue = this.axisValues.get(action);
    if (axisValue !== undefined && axisValue > 0) {
      return {
        value: axisValue,
        pressed: false, // Axes don't have pressed/released
        released: false,
        held: true,
      };
    }

    return EMPTY_INPUT_STATE;
  }

  /**
   * Get raw axis value for an action pair
   */
  public getAxisValue(negativeAction: InputAction, positiveAction: InputAction): number {
    const negative = this.axisValues.get(negativeAction) ?? 0;
    const positive = this.axisValues.get(positiveAction) ?? 0;
    return positive - negative;
  }

  /**
   * Check if a gamepad is connected
   */
  public isConnected(): boolean {
    return this.gamepadIndex !== null;
  }

  /**
   * Get the connected gamepad index
   */
  public getGamepadIndex(): number | null {
    return this.gamepadIndex;
  }

  /**
   * Set deadzone threshold
   */
  public setDeadzone(value: number): void {
    this.deadzone = Math.max(0, Math.min(1, value));
  }

  /**
   * Set sensitivity multiplier
   */
  public setSensitivity(value: number): void {
    this.sensitivity = Math.max(0.1, Math.min(2, value));
  }

  /**
   * Dispose of event listeners
   */
  public dispose(): void {
    window.removeEventListener('gamepadconnected', this.handleGamepadConnected);
    window.removeEventListener('gamepaddisconnected', this.handleGamepadDisconnected);
  }

  private applyDeadzone(value: number): number {
    const absValue = Math.abs(value);
    if (absValue < this.deadzone) {
      return 0;
    }
    // Rescale from deadzone to 1
    const rescaled = (absValue - this.deadzone) / (1 - this.deadzone);
    return Math.sign(value) * Math.min(1, rescaled * this.sensitivity);
  }

  private setupEventListeners(): void {
    window.addEventListener('gamepadconnected', this.handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', this.handleGamepadDisconnected);
  }

  private detectExistingGamepads(): void {
    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        this.gamepadIndex = i;
        EventBus.emit(GameEvents.GAMEPAD_CONNECTED, { index: i, id: gamepads[i]!.id });
        break;
      }
    }
  }

  private handleGamepadConnected = (event: GamepadEvent): void => {
    if (this.gamepadIndex === null) {
      this.gamepadIndex = event.gamepad.index;
      EventBus.emit(GameEvents.GAMEPAD_CONNECTED, {
        index: event.gamepad.index,
        id: event.gamepad.id,
      });
    }
  };

  private handleGamepadDisconnected = (event: GamepadEvent): void => {
    if (this.gamepadIndex === event.gamepad.index) {
      EventBus.emit(GameEvents.GAMEPAD_DISCONNECTED, {
        index: event.gamepad.index,
      });
      this.gamepadIndex = null;
      this.buttonStates.clear();
      this.axisValues.clear();
    }
  };
}

export default GamepadController;
