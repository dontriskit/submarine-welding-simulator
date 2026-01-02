/**
 * Weld Quality Analyzer
 *
 * Analyzes weld samples and generates quality scores with defect detection.
 */

import * as THREE from 'three';
import { type WeldQualityResult } from '../types/interfaces';
import {
  WELD_IDEAL_TRAVEL_SPEED,
  WELD_SPEED_TOLERANCE,
  WELD_IDEAL_WORK_ANGLE,
  WELD_WORK_ANGLE_TOLERANCE,
  WELD_IDEAL_TRAVEL_ANGLE,
  WELD_TRAVEL_ANGLE_TOLERANCE,
  WELD_IDEAL_ARC_LENGTH,
  WELD_ARC_LENGTH_TOLERANCE,
  SCORE_RATING_THRESHOLDS,
} from '../core/Constants';

/**
 * Sample data collected during welding
 */
export interface WeldSample {
  position: THREE.Vector3;
  travelSpeed: number;
  workAngle: number;
  travelAngle: number;
  arcLength: number;
  distanceToTarget: number;
  timestamp: number;
}

/**
 * Defect types that can be detected
 */
type DefectType = 'porosity' | 'undercut' | 'overlap' | 'incomplete_fusion' | 'spatter';
type DefectSeverity = 'minor' | 'moderate' | 'severe';

interface Defect {
  type: DefectType;
  severity: DefectSeverity;
  position: number;
  cause: string;
}

/**
 * Analyze weld samples and generate a quality result
 */
export function analyzeWeldQuality(samples: WeldSample[]): WeldQualityResult {
  if (samples.length < 2) {
    return {
      overallScore: 0,
      rating: 'F',
      speedScore: 0,
      angleScore: 0,
      arcScore: 0,
      accuracyScore: 0,
      consistencyScore: 0,
      feedback: ['Weld too short - insufficient samples collected'],
      defects: [],
    };
  }

  // Calculate individual scores
  const speedScore = calculateSpeedScore(samples);
  const angleScore = calculateAngleScore(samples);
  const arcScore = calculateArcScore(samples);
  const accuracyScore = calculateAccuracyScore(samples);
  const consistencyScore = calculateConsistencyScore(samples);

  // Detect defects
  const defects = detectDefects(samples);

  // Calculate overall score (weighted average)
  const weights = {
    speed: 0.2,
    angle: 0.25,
    arc: 0.2,
    accuracy: 0.2,
    consistency: 0.15,
  };

  let overallScore =
    speedScore * weights.speed +
    angleScore * weights.angle +
    arcScore * weights.arc +
    accuracyScore * weights.accuracy +
    consistencyScore * weights.consistency;

  // Penalty for defects
  const defectPenalty = defects.reduce((penalty, defect) => {
    switch (defect.severity) {
      case 'severe': return penalty + 15;
      case 'moderate': return penalty + 8;
      case 'minor': return penalty + 3;
      default: return penalty;
    }
  }, 0);

  overallScore = Math.max(0, overallScore - defectPenalty);

  // Determine rating
  const rating = getRating(overallScore);

  // Generate feedback
  const feedback = generateFeedback(speedScore, angleScore, arcScore, accuracyScore, consistencyScore, defects);

  return {
    overallScore: Math.round(overallScore),
    rating,
    speedScore: Math.round(speedScore),
    angleScore: Math.round(angleScore),
    arcScore: Math.round(arcScore),
    accuracyScore: Math.round(accuracyScore),
    consistencyScore: Math.round(consistencyScore),
    feedback,
    defects,
  };
}

/**
 * Calculate speed score based on travel speed consistency
 */
function calculateSpeedScore(samples: WeldSample[]): number {
  const speeds = samples.map(s => s.travelSpeed);
  const avgSpeed = average(speeds);

  // Score based on how close average speed is to ideal
  const speedDeviation = Math.abs(avgSpeed - WELD_IDEAL_TRAVEL_SPEED);
  const speedScore = Math.max(0, 100 - (speedDeviation / WELD_SPEED_TOLERANCE) * 50);

  // Penalty for speed variance
  const speedVariance = variance(speeds);
  const variancePenalty = Math.min(20, speedVariance * 1000);

  return Math.max(0, speedScore - variancePenalty);
}

/**
 * Calculate angle score based on work and travel angles
 */
function calculateAngleScore(samples: WeldSample[]): number {
  const workAngles = samples.map(s => s.workAngle);
  const travelAngles = samples.map(s => s.travelAngle);

  // Work angle score (should be close to 90 degrees)
  const avgWorkAngle = average(workAngles);
  const workAngleDeviation = Math.abs(avgWorkAngle - WELD_IDEAL_WORK_ANGLE);
  const workAngleScore = Math.max(0, 100 - (workAngleDeviation / WELD_WORK_ANGLE_TOLERANCE) * 50);

  // Travel angle score
  const avgTravelAngle = average(travelAngles);
  const travelAngleDeviation = Math.abs(avgTravelAngle - WELD_IDEAL_TRAVEL_ANGLE);
  const travelAngleScore = Math.max(0, 100 - (travelAngleDeviation / WELD_TRAVEL_ANGLE_TOLERANCE) * 50);

  // Combined angle score (work angle weighted more heavily)
  return workAngleScore * 0.6 + travelAngleScore * 0.4;
}

/**
 * Calculate arc score based on arc length consistency
 */
function calculateArcScore(samples: WeldSample[]): number {
  const arcLengths = samples.map(s => s.arcLength);
  const avgArcLength = average(arcLengths);

  // Score based on how close average is to ideal
  const arcDeviation = Math.abs(avgArcLength - WELD_IDEAL_ARC_LENGTH);
  const arcScore = Math.max(0, 100 - (arcDeviation / WELD_ARC_LENGTH_TOLERANCE) * 50);

  // Penalty for arc length variance (stability)
  const arcVariance = variance(arcLengths);
  const variancePenalty = Math.min(25, arcVariance * 50);

  return Math.max(0, arcScore - variancePenalty);
}

/**
 * Calculate accuracy score based on distance to target
 */
function calculateAccuracyScore(samples: WeldSample[]): number {
  const distances = samples.map(s => s.distanceToTarget);
  const avgDistance = average(distances);

  // Perfect accuracy = 0 distance, score decreases with distance
  // 0mm = 100, 5mm = 50, 10mm+ = 0
  const accuracyScore = Math.max(0, 100 - avgDistance * 10);

  return accuracyScore;
}

/**
 * Calculate consistency score based on overall sample variance
 */
function calculateConsistencyScore(samples: WeldSample[]): number {
  // Measure how consistent the welding technique was
  const speedVariance = variance(samples.map(s => s.travelSpeed));
  const arcVariance = variance(samples.map(s => s.arcLength));
  const distanceVariance = variance(samples.map(s => s.distanceToTarget));

  // Lower variance = higher consistency
  const speedConsistency = Math.max(0, 100 - speedVariance * 2000);
  const arcConsistency = Math.max(0, 100 - arcVariance * 100);
  const distanceConsistency = Math.max(0, 100 - distanceVariance * 50);

  return (speedConsistency + arcConsistency + distanceConsistency) / 3;
}

/**
 * Detect welding defects based on sample patterns
 */
function detectDefects(samples: WeldSample[]): Defect[] {
  const defects: Defect[] = [];

  for (let i = 0; i < samples.length; i++) {
    const sample = samples[i];
    const position = i / samples.length;

    // Porosity: caused by too fast travel or contamination (simulated by erratic arc)
    if (sample.travelSpeed > WELD_IDEAL_TRAVEL_SPEED * 1.5) {
      const severity = sample.travelSpeed > WELD_IDEAL_TRAVEL_SPEED * 2 ? 'severe' : 'moderate';
      if (!defects.find(d => d.type === 'porosity' && Math.abs(d.position - position) < 0.1)) {
        defects.push({
          type: 'porosity',
          severity,
          position,
          cause: 'Travel speed too fast',
        });
      }
    }

    // Undercut: caused by incorrect work angle or excessive heat
    if (Math.abs(sample.workAngle - WELD_IDEAL_WORK_ANGLE) > WELD_WORK_ANGLE_TOLERANCE * 2) {
      const severity = Math.abs(sample.workAngle - WELD_IDEAL_WORK_ANGLE) > WELD_WORK_ANGLE_TOLERANCE * 3 ? 'severe' : 'minor';
      if (!defects.find(d => d.type === 'undercut' && Math.abs(d.position - position) < 0.1)) {
        defects.push({
          type: 'undercut',
          severity,
          position,
          cause: 'Work angle too steep',
        });
      }
    }

    // Overlap: caused by too slow travel speed
    if (sample.travelSpeed < WELD_IDEAL_TRAVEL_SPEED * 0.5) {
      const severity = sample.travelSpeed < WELD_IDEAL_TRAVEL_SPEED * 0.3 ? 'severe' : 'moderate';
      if (!defects.find(d => d.type === 'overlap' && Math.abs(d.position - position) < 0.1)) {
        defects.push({
          type: 'overlap',
          severity,
          position,
          cause: 'Travel speed too slow',
        });
      }
    }

    // Incomplete fusion: arc too long
    if (sample.arcLength > WELD_IDEAL_ARC_LENGTH + WELD_ARC_LENGTH_TOLERANCE * 2) {
      const severity = sample.arcLength > WELD_IDEAL_ARC_LENGTH + WELD_ARC_LENGTH_TOLERANCE * 3 ? 'severe' : 'moderate';
      if (!defects.find(d => d.type === 'incomplete_fusion' && Math.abs(d.position - position) < 0.1)) {
        defects.push({
          type: 'incomplete_fusion',
          severity,
          position,
          cause: 'Arc length too long',
        });
      }
    }

    // Spatter: arc too short
    if (sample.arcLength < WELD_IDEAL_ARC_LENGTH - WELD_ARC_LENGTH_TOLERANCE * 1.5) {
      if (!defects.find(d => d.type === 'spatter' && Math.abs(d.position - position) < 0.1)) {
        defects.push({
          type: 'spatter',
          severity: 'minor',
          position,
          cause: 'Arc length too short',
        });
      }
    }
  }

  return defects;
}

/**
 * Get rating based on score thresholds
 */
function getRating(score: number): 'S' | 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= SCORE_RATING_THRESHOLDS.S) return 'S';
  if (score >= SCORE_RATING_THRESHOLDS.A) return 'A';
  if (score >= SCORE_RATING_THRESHOLDS.B) return 'B';
  if (score >= SCORE_RATING_THRESHOLDS.C) return 'C';
  if (score >= SCORE_RATING_THRESHOLDS.D) return 'D';
  return 'F';
}

/**
 * Generate feedback messages based on scores
 */
function generateFeedback(
  speedScore: number,
  angleScore: number,
  arcScore: number,
  accuracyScore: number,
  consistencyScore: number,
  defects: Defect[]
): string[] {
  const feedback: string[] = [];

  // Speed feedback
  if (speedScore >= 90) {
    feedback.push('Excellent travel speed control');
  } else if (speedScore < 50) {
    feedback.push('Work on maintaining consistent travel speed');
  }

  // Angle feedback
  if (angleScore >= 90) {
    feedback.push('Great torch angle technique');
  } else if (angleScore < 50) {
    feedback.push('Keep the torch perpendicular to the work surface');
  }

  // Arc feedback
  if (arcScore >= 90) {
    feedback.push('Excellent arc length control');
  } else if (arcScore < 50) {
    feedback.push('Maintain a steady arc length of about 3mm');
  }

  // Accuracy feedback
  if (accuracyScore >= 90) {
    feedback.push('Precise weld placement');
  } else if (accuracyScore < 50) {
    feedback.push('Focus on following the weld line more closely');
  }

  // Consistency feedback
  if (consistencyScore >= 90) {
    feedback.push('Very consistent technique throughout');
  } else if (consistencyScore < 50) {
    feedback.push('Try to maintain a more even rhythm');
  }

  // Defect-specific feedback
  const defectTypes = new Set(defects.map(d => d.type));
  if (defectTypes.has('porosity')) {
    feedback.push('Slow down to reduce porosity');
  }
  if (defectTypes.has('undercut')) {
    feedback.push('Adjust torch angle to prevent undercut');
  }
  if (defectTypes.has('overlap')) {
    feedback.push('Increase travel speed to avoid overlap');
  }
  if (defectTypes.has('incomplete_fusion')) {
    feedback.push('Shorten arc length for better fusion');
  }

  return feedback;
}

// Utility functions
function average(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function variance(arr: number[]): number {
  if (arr.length === 0) return 0;
  const avg = average(arr);
  return arr.reduce((sum, val) => sum + (val - avg) ** 2, 0) / arr.length;
}
