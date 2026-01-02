/**
 * Input Action Definitions
 *
 * Re-exports input types from interfaces for convenient access.
 * Defines all possible input actions and their states.
 */

// Re-export from interfaces
export { InputAction, type InputState } from '../types/interfaces';

/**
 * Default empty input state for unbound/inactive actions
 */
export const EMPTY_INPUT_STATE: Readonly<import('../types/interfaces').InputState> = {
  value: 0,
  pressed: false,
  released: false,
  held: false,
};

/**
 * Create a new input state
 */
export function createInputState(
  value: number = 0,
  pressed: boolean = false,
  released: boolean = false,
  held: boolean = false
): import('../types/interfaces').InputState {
  return { value, pressed, released, held };
}
