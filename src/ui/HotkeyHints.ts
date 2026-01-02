/**
 * HotkeyHints.ts
 * Modular component for displaying control hints based on input mode.
 *
 * CODER-B Task B10
 */

/**
 * Hotkey hint configuration
 */
interface HotkeyHint {
  key: string;
  action: string;
}

/**
 * Input modes for hotkey configurations
 */
export type HotkeyMode = 'single' | 'coop-keyboard' | 'coop-gamepad';

/**
 * Hotkey configurations for different input modes
 */
const HOTKEY_CONFIGS: Record<HotkeyMode, HotkeyHint[]> = {
  single: [
    { key: 'WASD', action: 'Move Sub' },
    { key: 'QE', action: 'Ascend/Descend' },
    { key: 'Arrows', action: 'Arm Control' },
    { key: 'Space', action: 'Weld' },
    { key: 'L', action: 'Lights' },
    { key: 'Esc', action: 'Pause' },
  ],
  'coop-keyboard': [
    { key: 'P1: WASD', action: 'Move Sub' },
    { key: 'P1: QE', action: 'Ascend/Descend' },
    { key: 'P2: Arrows', action: 'Arm Control' },
    { key: 'P2: Space', action: 'Weld' },
    { key: 'Esc', action: 'Pause' },
  ],
  'coop-gamepad': [
    { key: 'KB: WASD', action: 'Move Sub' },
    { key: 'GP: Sticks', action: 'Arm Control' },
    { key: 'GP: RT', action: 'Weld' },
    { key: 'Esc', action: 'Pause' },
  ],
};

/**
 * Hotkey hints panel component
 */
export class HotkeyHints {
  private container: HTMLElement;
  private listElement: HTMLElement;
  private currentMode: HotkeyMode = 'single';

  constructor(parentElement: HTMLElement) {
    this.container = document.createElement('div');
    this.container.className = 'hotkey-hints';
    this.container.id = 'hotkey-hints';

    this.container.innerHTML = `
      <h4>Controls</h4>
      <div id="hotkey-list"></div>
    `;

    parentElement.appendChild(this.container);
    this.listElement = this.container.querySelector('#hotkey-list') as HTMLElement;

    // Initialize with default mode
    this.setMode('single');
  }

  /**
   * Set the input mode and update hints display
   */
  public setMode(mode: HotkeyMode): void {
    this.currentMode = mode;
    const hints = HOTKEY_CONFIGS[mode];

    this.listElement.innerHTML = hints
      .map((hint) => `
        <div class="hotkey-item">
          <span class="key">${hint.key}</span>
          <span class="action">${hint.action}</span>
        </div>
      `)
      .join('');
  }

  /**
   * Get current input mode
   */
  public getMode(): HotkeyMode {
    return this.currentMode;
  }

  /**
   * Show the hotkey hints panel
   */
  public show(): void {
    this.container.style.display = 'block';
  }

  /**
   * Hide the hotkey hints panel
   */
  public hide(): void {
    this.container.style.display = 'none';
  }

  /**
   * Check if panel is visible
   */
  public isVisible(): boolean {
    return this.container.style.display !== 'none';
  }

  /**
   * Clean up the component
   */
  public dispose(): void {
    this.container.remove();
  }
}
