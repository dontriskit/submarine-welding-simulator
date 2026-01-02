/**
 * WeldingGauge.ts
 * Display torch heat and intensity with visual gauge bars.
 *
 * CODER-B Task B12
 */

/**
 * Welding gauge component for torch status display
 */
export class WeldingGauge {
  private container: HTMLElement;
  private heatFill: HTMLElement;
  private intensityFill: HTMLElement;
  private heatLabel: HTMLElement;
  private intensityLabel: HTMLElement;

  constructor(parentElement: HTMLElement) {
    this.container = document.createElement('div');
    this.container.className = 'welding-gauge';
    this.container.id = 'welding-gauge';

    this.container.innerHTML = `
      <h4>Torch</h4>
      <div class="gauge-label">
        <span>Heat</span>
        <span id="heat-label">0%</span>
      </div>
      <div class="gauge-bar heat">
        <div class="fill" id="heat-fill" style="width: 0%"></div>
      </div>
      <div class="gauge-label">
        <span>Intensity</span>
        <span id="intensity-label">0.0</span>
      </div>
      <div class="gauge-bar intensity">
        <div class="fill" id="intensity-fill" style="width: 0%"></div>
      </div>
    `;

    parentElement.appendChild(this.container);

    // Cache element references
    this.heatFill = this.container.querySelector('#heat-fill') as HTMLElement;
    this.intensityFill = this.container.querySelector('#intensity-fill') as HTMLElement;
    this.heatLabel = this.container.querySelector('#heat-label') as HTMLElement;
    this.intensityLabel = this.container.querySelector('#intensity-label') as HTMLElement;
  }

  /**
   * Update the gauge displays
   * @param heat Heat level (0-100)
   * @param intensity Intensity level (0-1)
   */
  public update(heat: number, intensity: number): void {
    // Clamp values
    const clampedHeat = Math.max(0, Math.min(100, heat));
    const clampedIntensity = Math.max(0, Math.min(1, intensity));

    // Update heat gauge
    this.heatFill.style.width = `${clampedHeat}%`;
    this.heatLabel.textContent = `${Math.round(clampedHeat)}%`;

    // Update intensity gauge
    const intensityPercent = clampedIntensity * 100;
    this.intensityFill.style.width = `${intensityPercent}%`;
    this.intensityLabel.textContent = clampedIntensity.toFixed(1);

    // Add warning class for high heat
    if (clampedHeat >= 80) {
      this.container.classList.add('danger');
      this.container.classList.remove('warning');
    } else if (clampedHeat >= 60) {
      this.container.classList.add('warning');
      this.container.classList.remove('danger');
    } else {
      this.container.classList.remove('warning', 'danger');
    }
  }

  /**
   * Show or hide the gauge
   */
  public setVisible(visible: boolean): void {
    this.container.style.display = visible ? 'block' : 'none';
  }

  /**
   * Check if gauge is visible
   */
  public isVisible(): boolean {
    return this.container.style.display !== 'none';
  }

  /**
   * Get current heat value for external use
   */
  public getHeat(): number {
    return parseFloat(this.heatLabel.textContent || '0');
  }

  /**
   * Get current intensity value for external use
   */
  public getIntensity(): number {
    return parseFloat(this.intensityLabel.textContent || '0');
  }

  /**
   * Clean up the component
   */
  public dispose(): void {
    this.container.remove();
  }
}
