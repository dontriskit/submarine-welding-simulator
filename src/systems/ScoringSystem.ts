/**
 * Scoring System
 *
 * Awards points and manages the score multiplier.
 * Implements IScoringSystem interface from src/types/interfaces.ts
 */

import { type IScoringSystem, type WeldQualityResult, GameEvents } from '../types/interfaces';
import { EventBus } from '../core/EventBus';
import { gameState } from '../state/GameState';
import { addScore, setMultiplier } from '../state/GameStateActions';
import {
  SCORE_BASE_POINTS,
  SCORE_MAX_MULTIPLIER,
  SCORE_MULTIPLIER_INCREMENT,
  SCORE_MULTIPLIER_DECAY,
} from '../core/Constants';

export class ScoringSystem implements IScoringSystem {
  private multiplier: number = 1;
  private comboActive: boolean = false;

  constructor() {
    // Initialize
  }

  /**
   * Process a completed weld and award points
   */
  public processWeld(result: WeldQualityResult): void {
    // Calculate base points from weld quality
    // overallScore is 0-100, scale to percentage
    const qualityMultiplier = result.overallScore / 100;
    const basePoints = SCORE_BASE_POINTS * qualityMultiplier;

    // Apply rating bonus
    const ratingBonus = this.getRatingBonus(result.rating);
    const pointsBeforeMultiplier = basePoints * ratingBonus;

    // Apply multiplier and dispatch to state
    const finalPoints = Math.round(pointsBeforeMultiplier * this.multiplier);
    gameState.dispatch(addScore(finalPoints));

    // Update multiplier based on weld quality
    this.updateMultiplier(result);

    // Activate combo
    this.comboActive = true;

    // Emit score event
    EventBus.emit(GameEvents.SCORE_UPDATED, {
      points: finalPoints,
      basePoints: Math.round(pointsBeforeMultiplier),
      multiplier: this.multiplier,
      rating: result.rating,
      total: gameState.getState().score.total,
    });
  }

  /**
   * Get current multiplier
   */
  public getMultiplier(): number {
    return this.multiplier;
  }

  /**
   * Update system (call every frame for combo decay)
   */
  public update(delta: number): void {
    if (!this.comboActive) return;

    // Decay multiplier over time
    const previousMultiplier = this.multiplier;

    this.multiplier -= SCORE_MULTIPLIER_DECAY * delta;

    // Clamp to minimum of 1
    if (this.multiplier < 1) {
      this.multiplier = 1;
      this.comboActive = false;
    }

    // Update state if multiplier changed significantly
    if (Math.abs(previousMultiplier - this.multiplier) > 0.01) {
      gameState.dispatch(setMultiplier(this.multiplier));

      // Emit multiplier change event
      EventBus.emit(GameEvents.MULTIPLIER_CHANGED, {
        multiplier: this.multiplier,
        decaying: this.comboActive,
      });
    }
  }

  /**
   * Reset the scoring system
   */
  public reset(): void {
    this.multiplier = 1;
    this.comboActive = false;
    gameState.dispatch(setMultiplier(1));
  }

  /**
   * Get rating bonus multiplier
   */
  private getRatingBonus(rating: WeldQualityResult['rating']): number {
    switch (rating) {
      case 'S': return 2.0;
      case 'A': return 1.5;
      case 'B': return 1.2;
      case 'C': return 1.0;
      case 'D': return 0.8;
      case 'F': return 0.5;
      default: return 1.0;
    }
  }

  /**
   * Update multiplier based on weld quality
   */
  private updateMultiplier(result: WeldQualityResult): void {
    const previousMultiplier = this.multiplier;

    // Good welds (B or better) increase multiplier
    if (result.rating === 'S' || result.rating === 'A' || result.rating === 'B') {
      const increase = SCORE_MULTIPLIER_INCREMENT;

      // Bonus for excellent welds
      if (result.rating === 'S') {
        this.multiplier += increase * 2;
      } else if (result.rating === 'A') {
        this.multiplier += increase * 1.5;
      } else {
        this.multiplier += increase;
      }

      // Cap at max
      this.multiplier = Math.min(this.multiplier, SCORE_MAX_MULTIPLIER);
    }
    // Poor welds reduce multiplier
    else if (result.rating === 'D' || result.rating === 'F') {
      this.multiplier -= SCORE_MULTIPLIER_INCREMENT;
      this.multiplier = Math.max(1, this.multiplier);
    }
    // C rating maintains current multiplier

    // Update state
    gameState.dispatch(setMultiplier(this.multiplier));

    // Emit event if changed
    if (Math.abs(previousMultiplier - this.multiplier) > 0.01) {
      EventBus.emit(GameEvents.MULTIPLIER_CHANGED, {
        multiplier: this.multiplier,
        previousMultiplier,
        reason: result.rating,
      });
    }
  }

  /**
   * Get combo status
   */
  public isComboActive(): boolean {
    return this.comboActive;
  }

  /**
   * Force set multiplier (for testing/debugging)
   */
  public setMultiplierValue(value: number): void {
    this.multiplier = Math.max(1, Math.min(value, SCORE_MAX_MULTIPLIER));
    this.comboActive = this.multiplier > 1;
    gameState.dispatch(setMultiplier(this.multiplier));
  }
}

// Singleton instance
export const scoringSystem = new ScoringSystem();

export default scoringSystem;
