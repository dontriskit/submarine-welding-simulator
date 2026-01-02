/**
 * Welding System
 *
 * Tracks weld quality during welding operations.
 * Implements IWeldingSystem interface from src/types/interfaces.ts
 */

import * as THREE from 'three';
import { type IWeldingSystem, type WeldQualityResult, GameEvents } from '../types/interfaces';
import { EventBus } from '../core/EventBus';
import { analyzeWeldQuality, type WeldSample } from '../training/WeldQualityAnalyzer';
import type { WeldTarget } from '../missions/MissionDefinition';

export class WeldingSystem implements IWeldingSystem {
  private welding: boolean = false;
  private samples: WeldSample[] = [];
  private startTime: number = 0;
  private arcStability: number = 0;

  // Running statistics for arc stability calculation
  private recentArcLengths: number[] = [];
  private readonly ARC_STABILITY_WINDOW = 20; // Number of samples to consider

  constructor() {
    // Initialize
  }

  /**
   * Start tracking a new weld
   */
  public startWeld(): void {
    if (this.welding) {
      console.warn('WeldingSystem: Already welding, finishing previous weld');
      this.finishWeld();
    }

    this.welding = true;
    this.samples = [];
    this.recentArcLengths = [];
    this.arcStability = 0;
    this.startTime = performance.now();

    EventBus.emit(GameEvents.WELD_STARTED, {
      timestamp: this.startTime,
    });
  }

  /**
   * Add a sample point during welding
   */
  public addSample(
    position: THREE.Vector3,
    travelSpeed: number,
    workAngle: number,
    travelAngle: number,
    arcLength: number,
    distanceToTarget: number
  ): void {
    if (!this.welding) {
      return;
    }

    const timestamp = performance.now() - this.startTime;

    this.samples.push({
      position: position.clone(),
      travelSpeed,
      workAngle,
      travelAngle,
      arcLength,
      distanceToTarget,
      timestamp,
    });

    // Update arc stability
    this.updateArcStability(arcLength);
  }

  /**
   * Finish weld and get quality result
   */
  public finishWeld(): WeldQualityResult {
    if (!this.welding) {
      // Return a default failed result if not welding
      return {
        overallScore: 0,
        rating: 'F',
        speedScore: 0,
        angleScore: 0,
        arcScore: 0,
        accuracyScore: 0,
        consistencyScore: 0,
        feedback: ['No weld was in progress'],
        defects: [],
      };
    }

    this.welding = false;
    const duration = performance.now() - this.startTime;

    // Analyze the collected samples
    const result = analyzeWeldQuality(this.samples);

    // Emit events
    EventBus.emit(GameEvents.WELD_COMPLETED, {
      duration,
      sampleCount: this.samples.length,
    });

    EventBus.emit(GameEvents.WELD_QUALITY, result);

    // Clear samples
    this.samples = [];
    this.recentArcLengths = [];

    return result;
  }

  /**
   * Check if currently welding
   */
  public isWelding(): boolean {
    return this.welding;
  }

  /**
   * Get current arc stability (-1 to 1)
   * Positive = stable, negative = unstable
   */
  public getArcStability(): number {
    return this.arcStability;
  }

  /**
   * Get the current sample count
   */
  public getSampleCount(): number {
    return this.samples.length;
  }

  /**
   * Get weld duration in milliseconds
   */
  public getWeldDuration(): number {
    if (!this.welding) return 0;
    return performance.now() - this.startTime;
  }

  /**
   * Update arc stability based on recent arc length variance
   */
  private updateArcStability(arcLength: number): void {
    this.recentArcLengths.push(arcLength);

    // Keep only recent samples
    if (this.recentArcLengths.length > this.ARC_STABILITY_WINDOW) {
      this.recentArcLengths.shift();
    }

    if (this.recentArcLengths.length < 3) {
      this.arcStability = 0;
      return;
    }

    // Calculate variance
    const mean = this.recentArcLengths.reduce((a, b) => a + b, 0) / this.recentArcLengths.length;
    const variance = this.recentArcLengths.reduce((sum, val) => sum + (val - mean) ** 2, 0) / this.recentArcLengths.length;
    const stdDev = Math.sqrt(variance);

    // Convert to stability score (-1 to 1)
    // Lower variance = higher stability
    // stdDev of 0 = perfect stability (1.0)
    // stdDev of 2mm or more = unstable (-1.0)
    const normalizedStdDev = Math.min(stdDev / 2, 1);
    this.arcStability = 1 - normalizedStdDev * 2;
  }

  /**
   * Check proximity of torch position to nearest weld target
   * Returns the nearest target and distance in meters
   */
  public checkProximityToTarget(
    torchPosition: THREE.Vector3,
    targets: WeldTarget[]
  ): { target: WeldTarget | null; distance: number } {
    if (targets.length === 0) {
      return { target: null, distance: Infinity };
    }

    let nearestTarget: WeldTarget | null = null;
    let nearestDistance = Infinity;

    for (const target of targets) {
      // Convert target position to Vector3
      const targetPos = new THREE.Vector3(
        target.position.x,
        target.position.y,
        target.position.z
      );

      // Calculate distance from torch to target center
      const distance = torchPosition.distanceTo(targetPos);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestTarget = target;
      }
    }

    return { target: nearestTarget, distance: nearestDistance };
  }

  /**
   * Cancel current weld without generating a result
   */
  public cancelWeld(): void {
    if (this.welding) {
      this.welding = false;
      this.samples = [];
      this.recentArcLengths = [];
      this.arcStability = 0;
    }
  }
}

// Singleton instance
export const weldingSystem = new WeldingSystem();

export default weldingSystem;
