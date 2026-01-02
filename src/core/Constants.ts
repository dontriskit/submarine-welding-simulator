/**
 * Game Constants
 *
 * Physics constants, game parameters, and configuration values.
 * Centralized for easy tuning and consistency across systems.
 */

// ============================================================================
// SUBMARINE PHYSICS - Realistic Underwater Feel
// ============================================================================

/** Submarine mass in kg (heavy = sluggish response) */
export const SUBMARINE_MASS = 8000;

/** Water density in kg/m³ */
export const WATER_DENSITY = 1025;

/** Gravitational acceleration m/s² */
export const GRAVITY = 9.81;

/** Buoyancy force multiplier */
export const BUOYANCY_FORCE = 1.02;

/** Linear drag coefficient (higher = more water resistance) */
export const DRAG_COEFFICIENT = 2.5;

/** Quadratic drag coefficient (drag increases with speed squared) */
export const DRAG_QUADRATIC = 0.8;

/** Angular drag coefficient */
export const ANGULAR_DRAG = 3.0;

/** Maximum linear speed in m/s (slower for realism) */
export const MAX_SPEED = 4.0;

/** Maximum rotation speed in rad/s */
export const MAX_ROTATION_SPEED = 0.3;

/** Maximum depth in meters */
export const MAX_DEPTH = 200;

/** Thruster force in Newtons */
export const THRUSTER_FORCE = 20000;

/** Vertical thruster force in Newtons */
export const VERTICAL_THRUSTER_FORCE = 16000;

/** Input smoothing factor (0-1, lower = more sluggish) */
export const INPUT_SMOOTHING = 0.08;

/** Velocity damping when no input (coasting) */
export const COAST_DAMPING = 0.985;

/** Rotation damping for heavy feel */
export const ROTATION_DAMPING = 0.92;

// ============================================================================
// WELDING ARM PHYSICS
// ============================================================================

/** Number of arm joints */
export const ARM_JOINT_COUNT = 4;

/** Maximum extension length in meters */
export const ARM_MAX_EXTENSION = 3.0;

/** Minimum extension length in meters */
export const ARM_MIN_EXTENSION = 0.5;

/** Joint rotation speed in rad/s */
export const ARM_ROTATION_SPEED = 1.5;

/** Extension speed in m/s */
export const ARM_EXTENSION_SPEED = 0.8;

/** Joint angle limits (radians) */
export const ARM_JOINT_LIMITS = {
  base: { min: -Math.PI * 0.75, max: Math.PI * 0.75 },
  shoulder: { min: -Math.PI * 0.5, max: Math.PI * 0.25 },
  elbow: { min: -Math.PI * 0.75, max: 0 },
  wrist: { min: -Math.PI, max: Math.PI },
};

// ============================================================================
// WELDING PARAMETERS
// ============================================================================

/** Ideal travel speed in m/s */
export const WELD_IDEAL_TRAVEL_SPEED = 0.15;

/** Travel speed tolerance +/- */
export const WELD_SPEED_TOLERANCE = 0.05;

/** Ideal work angle in degrees (perpendicular) */
export const WELD_IDEAL_WORK_ANGLE = 90;

/** Work angle tolerance in degrees */
export const WELD_WORK_ANGLE_TOLERANCE = 15;

/** Ideal travel angle in degrees */
export const WELD_IDEAL_TRAVEL_ANGLE = 15;

/** Travel angle tolerance in degrees */
export const WELD_TRAVEL_ANGLE_TOLERANCE = 10;

/** Ideal arc length in mm */
export const WELD_IDEAL_ARC_LENGTH = 3.0;

/** Arc length tolerance in mm */
export const WELD_ARC_LENGTH_TOLERANCE = 1.0;

/** Maximum torch heat (overheat threshold) */
export const WELD_MAX_HEAT = 100;

/** Heat buildup rate per second */
export const WELD_HEAT_RATE = 20;

/** Heat dissipation rate per second */
export const WELD_COOL_RATE = 15;

/** Torch intensity range */
export const WELD_INTENSITY_MIN = 0.3;
export const WELD_INTENSITY_MAX = 1.0;
export const WELD_INTENSITY_DEFAULT = 0.7;
export const WELD_INTENSITY_STEP = 0.1;

// ============================================================================
// SCORING PARAMETERS
// ============================================================================

/** Base points per weld */
export const SCORE_BASE_POINTS = 100;

/** Maximum multiplier */
export const SCORE_MAX_MULTIPLIER = 5.0;

/** Multiplier increase per good weld */
export const SCORE_MULTIPLIER_INCREMENT = 0.25;

/** Multiplier decay rate per second */
export const SCORE_MULTIPLIER_DECAY = 0.1;

/** Rating thresholds (0-100) */
export const SCORE_RATING_THRESHOLDS = {
  S: 95,
  A: 85,
  B: 70,
  C: 55,
  D: 40,
  F: 0,
};

// ============================================================================
// INPUT PARAMETERS
// ============================================================================

/** Gamepad deadzone threshold */
export const INPUT_DEADZONE = 0.15;

/** Gamepad axis sensitivity */
export const INPUT_SENSITIVITY = 1.0;

/** Key repeat delay in ms */
export const INPUT_KEY_REPEAT_DELAY = 500;

/** Key repeat rate in ms */
export const INPUT_KEY_REPEAT_RATE = 50;

// ============================================================================
// GAME PARAMETERS
// ============================================================================

/** Default mission time limit in seconds */
export const DEFAULT_TIME_LIMIT = 300;

/** Maximum battery level */
export const MAX_BATTERY = 100;

/** Battery drain rate per second while moving */
export const BATTERY_DRAIN_RATE = 0.1;

/** Battery drain rate while welding */
export const BATTERY_WELD_DRAIN_RATE = 0.5;

/** Maximum oxygen level */
export const MAX_OXYGEN = 100;

/** Oxygen consumption rate per second */
export const OXYGEN_CONSUMPTION_RATE = 0.05;

// ============================================================================
// RENDER PARAMETERS
// ============================================================================

/** Camera field of view in degrees */
export const CAMERA_FOV = 75;

/** Camera near plane */
export const CAMERA_NEAR = 0.1;

/** Camera far plane */
export const CAMERA_FAR = 1000;

/** Fog density for underwater effect */
export const FOG_DENSITY = 0.015;
