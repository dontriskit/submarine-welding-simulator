/**
 * Game State Store
 *
 * Redux-like central state management for the game.
 * Implements IGameState interface from src/types/interfaces.ts
 */

import {
  type IGameState,
  type GameStateData,
  type GameStateAction,
  type SubmarineStateData,
  type WeldingArmStateData,
  type ScoreStateData,
  GameEvents,
} from '../types/interfaces';
import { EventBus } from '../core/EventBus';
import {
  MAX_BATTERY,
  MAX_OXYGEN,
  WELD_INTENSITY_DEFAULT,
  ARM_JOINT_COUNT,
} from '../core/Constants';

/** Subscriber callback type */
type Subscriber = (state: GameStateData) => void;

/**
 * Create default initial state
 */
function createInitialState(): GameStateData {
  return {
    phase: 'menu',
    missionResult: null,
    submarine: createInitialSubmarineState(),
    welding: createInitialWeldingState(),
    score: createInitialScoreState(),
    mission: null,
    settings: {
      difficulty: 'normal',
      soundVolume: 0.8,
      musicVolume: 0.5,
      invertY: false,
    },
  };
}

function createInitialSubmarineState(): SubmarineStateData {
  return {
    position: { x: 0, y: -10, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
    depth: 10,
    pressure: 101.325 + 10 * 10.1, // ~202 kPa at 10m
    battery: MAX_BATTERY,
    oxygen: MAX_OXYGEN,
    lightsOn: true,
  };
}

function createInitialWeldingState(): WeldingArmStateData {
  return {
    joints: new Array(ARM_JOINT_COUNT).fill(0),
    torchActive: false,
    torchHeat: 0,
    torchIntensity: WELD_INTENSITY_DEFAULT,
    arcStability: 0,
  };
}

function createInitialScoreState(): ScoreStateData {
  return {
    total: 0,
    multiplier: 1,
    weldQualitySum: 0,
    weldCount: 0,
    accuracy: 0,
    timeBonus: 0,
  };
}

/**
 * Deep clone an object (simple implementation for state objects)
 */
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Game state reducer
 */
function reducer(state: GameStateData, action: GameStateAction): GameStateData {
  switch (action.type) {
    case 'SET_PHASE': {
      return {
        ...state,
        phase: action.phase,
      };
    }

    case 'SET_MISSION_RESULT': {
      return {
        ...state,
        missionResult: action.result,
      };
    }

    case 'UPDATE_SUBMARINE': {
      return {
        ...state,
        submarine: {
          ...state.submarine,
          ...action.submarine,
        },
      };
    }

    case 'UPDATE_WELDING': {
      return {
        ...state,
        welding: {
          ...state.welding,
          ...action.welding,
        },
      };
    }

    case 'ADD_SCORE': {
      const newTotal = state.score.total + Math.round(action.points * state.score.multiplier);
      return {
        ...state,
        score: {
          ...state.score,
          total: newTotal,
        },
      };
    }

    case 'SET_MULTIPLIER': {
      return {
        ...state,
        score: {
          ...state.score,
          multiplier: Math.max(1, action.multiplier),
        },
      };
    }

    case 'COMPLETE_OBJECTIVE': {
      if (!state.mission) return state;

      const objectives = state.mission.objectives.map(obj =>
        obj.id === action.objectiveId
          ? { ...obj, completed: true, progress: obj.target }
          : obj
      );

      const allComplete = objectives.every(obj => obj.completed);

      return {
        ...state,
        mission: {
          ...state.mission,
          objectives,
          completed: allComplete,
        },
      };
    }

    case 'UPDATE_OBJECTIVE_PROGRESS': {
      if (!state.mission) return state;

      const objectives = state.mission.objectives.map(obj => {
        if (obj.id !== action.objectiveId) return obj;

        const newProgress = Math.min(action.progress, obj.target);
        return {
          ...obj,
          progress: newProgress,
          completed: newProgress >= obj.target,
        };
      });

      const allComplete = objectives.every(obj => obj.completed);

      return {
        ...state,
        mission: {
          ...state.mission,
          objectives,
          completed: allComplete,
        },
      };
    }

    case 'START_MISSION': {
      return {
        ...state,
        phase: 'playing',
        mission: action.mission,
        score: createInitialScoreState(),
      };
    }

    case 'END_MISSION': {
      if (!state.mission) return state;

      return {
        ...state,
        phase: 'results',
        mission: {
          ...state.mission,
          completed: action.success,
          failed: !action.success,
        },
      };
    }

    case 'TICK_TIME': {
      if (!state.mission || state.phase !== 'playing') return state;

      const newTimeRemaining = Math.max(0, state.mission.timeRemaining - action.delta);
      const failed = newTimeRemaining <= 0 && !state.mission.completed;

      return {
        ...state,
        mission: {
          ...state.mission,
          timeRemaining: newTimeRemaining,
          failed: state.mission.failed || failed,
        },
        phase: failed ? 'results' : state.phase,
      };
    }

    case 'RESET': {
      return createInitialState();
    }

    default: {
      // Exhaustive check - TypeScript will error if we miss a case
      const exhaustiveCheck: never = action;
      throw new Error(`Unhandled action: ${exhaustiveCheck}`);
    }
  }
}

/**
 * Game State Store implementation
 */
class GameStateStore implements IGameState {
  private state: GameStateData;
  private subscribers: Set<Subscriber> = new Set();

  constructor() {
    this.state = createInitialState();
  }

  /**
   * Get current state (read-only snapshot)
   */
  public getState(): GameStateData {
    return deepClone(this.state);
  }

  /**
   * Dispatch an action to modify state
   */
  public dispatch(action: GameStateAction): void {
    const previousPhase = this.state.phase;
    this.state = reducer(this.state, action);

    // Notify subscribers
    const stateCopy = this.getState();
    for (const subscriber of this.subscribers) {
      try {
        subscriber(stateCopy);
      } catch (error) {
        console.error('Error in state subscriber:', error);
      }
    }

    // Emit events
    EventBus.emit(GameEvents.STATE_CHANGED, stateCopy);

    if (this.state.phase !== previousPhase) {
      EventBus.emit(GameEvents.PHASE_CHANGED, {
        previous: previousPhase,
        current: this.state.phase,
      });
    }
  }

  /**
   * Subscribe to state changes, returns unsubscribe function
   */
  public subscribe(callback: Subscriber): () => void {
    this.subscribers.add(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Get raw state reference (for internal use only - be careful!)
   */
  public _getStateRef(): GameStateData {
    return this.state;
  }
}

// Singleton instance
export const gameState = new GameStateStore();

export default gameState;
export { GameStateStore, createInitialState };
