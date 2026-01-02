/**
 * Training Metrics
 *
 * Tracks session performance and skill analytics for training mode.
 * Provides insights into player improvement over time.
 */

import { type WeldQualityResult } from '../types/interfaces';

/**
 * Session statistics summary
 */
export interface SessionStats {
  totalWelds: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  ratingDistribution: Record<WeldQualityResult['rating'], number>;
  totalTime: number;
  weldingTime: number;
  defectCounts: Record<string, number>;
}

/**
 * Skill profile breakdown
 */
export interface SkillProfile {
  speed: number;
  angle: number;
  arc: number;
  accuracy: number;
  consistency: number;
  overall: number;
}

/**
 * Historical data for persistence
 */
interface HistoricalData {
  sessions: number;
  totalWelds: number;
  bestOverallScore: number;
  bestSkillScores: SkillProfile;
  averageScores: SkillProfile;
  lastUpdated: number;
}

/**
 * Session weld record
 */
interface WeldRecord {
  result: WeldQualityResult;
  timestamp: number;
}

const STORAGE_KEY = 'submarine-welding-metrics';

export class TrainingMetrics {
  private sessionActive: boolean = false;
  private sessionStartTime: number = 0;
  private welds: WeldRecord[] = [];
  private weldingStartTime: number = 0;
  private totalWeldingTime: number = 0;
  private historical: HistoricalData | null = null;

  constructor() {
    this.loadHistoricalData();
  }

  /**
   * Start a new training session
   */
  public startSession(): void {
    this.sessionActive = true;
    this.sessionStartTime = performance.now();
    this.welds = [];
    this.totalWeldingTime = 0;
    this.weldingStartTime = 0;
  }

  /**
   * End the current session and return summary
   */
  public endSession(): SessionStats | null {
    if (!this.sessionActive) {
      return null;
    }

    this.sessionActive = false;
    const stats = this.getSessionStats();

    // Update historical data
    this.updateHistoricalData(stats);

    return stats;
  }

  /**
   * Record a completed weld
   */
  public recordWeld(result: WeldQualityResult): void {
    if (!this.sessionActive) {
      return;
    }

    this.welds.push({
      result,
      timestamp: performance.now() - this.sessionStartTime,
    });

    // Track welding time
    if (this.weldingStartTime > 0) {
      this.totalWeldingTime += performance.now() - this.weldingStartTime;
      this.weldingStartTime = 0;
    }
  }

  /**
   * Mark welding start (for time tracking)
   */
  public onWeldStart(): void {
    if (this.sessionActive) {
      this.weldingStartTime = performance.now();
    }
  }

  /**
   * Get current session statistics
   */
  public getSessionStats(): SessionStats {
    const scores = this.welds.map(w => w.result.overallScore);

    const ratingDistribution: Record<WeldQualityResult['rating'], number> = {
      S: 0,
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      F: 0,
    };

    const defectCounts: Record<string, number> = {};

    for (const weld of this.welds) {
      // Count ratings
      ratingDistribution[weld.result.rating]++;

      // Count defects
      for (const defect of weld.result.defects) {
        defectCounts[defect.type] = (defectCounts[defect.type] || 0) + 1;
      }
    }

    const totalTime = this.sessionActive
      ? performance.now() - this.sessionStartTime
      : this.welds.length > 0
        ? this.welds[this.welds.length - 1].timestamp
        : 0;

    return {
      totalWelds: this.welds.length,
      averageScore: scores.length > 0 ? average(scores) : 0,
      bestScore: scores.length > 0 ? Math.max(...scores) : 0,
      worstScore: scores.length > 0 ? Math.min(...scores) : 0,
      ratingDistribution,
      totalTime,
      weldingTime: this.totalWeldingTime,
      defectCounts,
    };
  }

  /**
   * Get skill profile from current session
   */
  public getSkillProfile(): SkillProfile {
    if (this.welds.length === 0) {
      return {
        speed: 0,
        angle: 0,
        arc: 0,
        accuracy: 0,
        consistency: 0,
        overall: 0,
      };
    }

    const speedScores = this.welds.map(w => w.result.speedScore);
    const angleScores = this.welds.map(w => w.result.angleScore);
    const arcScores = this.welds.map(w => w.result.arcScore);
    const accuracyScores = this.welds.map(w => w.result.accuracyScore);
    const consistencyScores = this.welds.map(w => w.result.consistencyScore);
    const overallScores = this.welds.map(w => w.result.overallScore);

    return {
      speed: average(speedScores),
      angle: average(angleScores),
      arc: average(arcScores),
      accuracy: average(accuracyScores),
      consistency: average(consistencyScores),
      overall: average(overallScores),
    };
  }

  /**
   * Identify weakest skill areas
   */
  public getWeakestAreas(): Array<{ skill: string; score: number }> {
    const profile = this.getSkillProfile();

    const skills = [
      { skill: 'Travel Speed', score: profile.speed },
      { skill: 'Torch Angle', score: profile.angle },
      { skill: 'Arc Length', score: profile.arc },
      { skill: 'Accuracy', score: profile.accuracy },
      { skill: 'Consistency', score: profile.consistency },
    ];

    // Sort by score ascending (weakest first)
    return skills.sort((a, b) => a.score - b.score);
  }

  /**
   * Get improvement suggestions based on performance
   */
  public getImprovementSuggestions(): string[] {
    const weakest = this.getWeakestAreas();
    const suggestions: string[] = [];

    if (weakest.length === 0) {
      return suggestions;
    }

    // Focus on the two weakest areas
    for (let i = 0; i < Math.min(2, weakest.length); i++) {
      const area = weakest[i];
      if (area.score < 70) {
        suggestions.push(this.getSuggestionForSkill(area.skill, area.score));
      }
    }

    return suggestions;
  }

  /**
   * Get historical best scores
   */
  public getHistoricalBest(): SkillProfile | null {
    return this.historical?.bestSkillScores ?? null;
  }

  /**
   * Get total sessions count
   */
  public getTotalSessions(): number {
    return this.historical?.sessions ?? 0;
  }

  /**
   * Check if current session has new personal bests
   */
  public getNewPersonalBests(): string[] {
    if (!this.historical || this.welds.length === 0) {
      return [];
    }

    const profile = this.getSkillProfile();
    const bests: string[] = [];

    if (profile.speed > this.historical.bestSkillScores.speed) {
      bests.push('Speed');
    }
    if (profile.angle > this.historical.bestSkillScores.angle) {
      bests.push('Angle');
    }
    if (profile.arc > this.historical.bestSkillScores.arc) {
      bests.push('Arc Length');
    }
    if (profile.accuracy > this.historical.bestSkillScores.accuracy) {
      bests.push('Accuracy');
    }
    if (profile.consistency > this.historical.bestSkillScores.consistency) {
      bests.push('Consistency');
    }
    if (profile.overall > this.historical.bestOverallScore) {
      bests.push('Overall Score');
    }

    return bests;
  }

  /**
   * Check if session is active
   */
  public isSessionActive(): boolean {
    return this.sessionActive;
  }

  /**
   * Get session duration in milliseconds
   */
  public getSessionDuration(): number {
    if (!this.sessionActive) return 0;
    return performance.now() - this.sessionStartTime;
  }

  /**
   * Reset all historical data
   */
  public resetHistoricalData(): void {
    this.historical = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage not available
    }
  }

  /**
   * Load historical data from localStorage
   */
  private loadHistoricalData(): void {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        this.historical = JSON.parse(data);
      }
    } catch {
      // localStorage not available or data corrupted
      this.historical = null;
    }
  }

  /**
   * Update and save historical data
   */
  private updateHistoricalData(stats: SessionStats): void {
    const profile = this.getSkillProfile();

    if (!this.historical) {
      // First session
      this.historical = {
        sessions: 1,
        totalWelds: stats.totalWelds,
        bestOverallScore: stats.bestScore,
        bestSkillScores: { ...profile },
        averageScores: { ...profile },
        lastUpdated: Date.now(),
      };
    } else {
      // Update existing historical data
      this.historical.sessions++;
      this.historical.totalWelds += stats.totalWelds;
      this.historical.lastUpdated = Date.now();

      // Update best scores
      if (stats.bestScore > this.historical.bestOverallScore) {
        this.historical.bestOverallScore = stats.bestScore;
      }

      this.historical.bestSkillScores.speed = Math.max(
        this.historical.bestSkillScores.speed,
        profile.speed
      );
      this.historical.bestSkillScores.angle = Math.max(
        this.historical.bestSkillScores.angle,
        profile.angle
      );
      this.historical.bestSkillScores.arc = Math.max(
        this.historical.bestSkillScores.arc,
        profile.arc
      );
      this.historical.bestSkillScores.accuracy = Math.max(
        this.historical.bestSkillScores.accuracy,
        profile.accuracy
      );
      this.historical.bestSkillScores.consistency = Math.max(
        this.historical.bestSkillScores.consistency,
        profile.consistency
      );
      this.historical.bestSkillScores.overall = Math.max(
        this.historical.bestSkillScores.overall,
        profile.overall
      );

      // Update running averages (weighted)
      const weight = 1 / this.historical.sessions;
      const prevWeight = 1 - weight;
      this.historical.averageScores.speed =
        this.historical.averageScores.speed * prevWeight + profile.speed * weight;
      this.historical.averageScores.angle =
        this.historical.averageScores.angle * prevWeight + profile.angle * weight;
      this.historical.averageScores.arc =
        this.historical.averageScores.arc * prevWeight + profile.arc * weight;
      this.historical.averageScores.accuracy =
        this.historical.averageScores.accuracy * prevWeight + profile.accuracy * weight;
      this.historical.averageScores.consistency =
        this.historical.averageScores.consistency * prevWeight + profile.consistency * weight;
      this.historical.averageScores.overall =
        this.historical.averageScores.overall * prevWeight + profile.overall * weight;
    }

    // Save to localStorage
    this.saveHistoricalData();
  }

  /**
   * Save historical data to localStorage
   */
  private saveHistoricalData(): void {
    if (!this.historical) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.historical));
    } catch {
      // localStorage not available or quota exceeded
    }
  }

  /**
   * Get improvement suggestion for a specific skill
   */
  private getSuggestionForSkill(skill: string, score: number): string {
    const severity = score < 50 ? 'significantly' : 'slightly';

    switch (skill) {
      case 'Travel Speed':
        return `Your travel speed needs ${severity} more practice. Focus on maintaining a steady, consistent pace.`;
      case 'Torch Angle':
        return `Your torch angle control needs ${severity} more work. Keep the torch perpendicular to the surface.`;
      case 'Arc Length':
        return `Your arc length needs ${severity} more attention. Aim for about 3mm distance from the work.`;
      case 'Accuracy':
        return `Your weld placement accuracy needs ${severity} more improvement. Follow the weld line more closely.`;
      case 'Consistency':
        return `Your overall consistency needs ${severity} more practice. Focus on maintaining an even rhythm.`;
      default:
        return `Continue practicing to improve your ${skill.toLowerCase()} score.`;
    }
  }
}

// Utility function
function average(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// Singleton instance
export const trainingMetrics = new TrainingMetrics();

export default trainingMetrics;
