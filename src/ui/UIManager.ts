/**
 * UIManager.ts
 * Manages all UI elements, notifications, and pause menu.
 *
 * CODER-B Task B9
 * Updated with B10-B12 component integration
 */

import type { IUIManager, IGameState, GameStateData } from '../types/interfaces';
import { HotkeyHints, HotkeyMode } from './HotkeyHints';
import { ObjectivesPanel } from './ObjectivesPanel';
import { WeldingGauge } from './WeldingGauge';
import './dashboard.css';

/**
 * UI Manager - handles all DOM-based UI elements
 */
export class UIManager implements IUIManager {
  private gameState: IGameState | null = null;
  private container: HTMLElement;
  private elements: {
    topBar: HTMLElement;
    depthValue: HTMLElement;
    batteryValue: HTMLElement;
    oxygenValue: HTMLElement;
    scoreValue: HTMLElement;
    multiplierValue: HTMLElement;
    timerValue: HTMLElement;
    notificationContainer: HTMLElement;
    pauseOverlay: HTMLElement;
    hotkeyHintsContainer: HTMLElement;
    objectivesPanelContainer: HTMLElement;
    weldingGaugeContainer: HTMLElement;
  };

  // Modular UI components (B10-B12)
  private hotkeyHintsComponent: HotkeyHints | null = null;
  private objectivesPanelComponent: ObjectivesPanel | null = null;
  private weldingGaugeComponent: WeldingGauge | null = null;

  private notifications: HTMLElement[] = [];

  constructor(containerId: string = 'ui-root') {
    // Create or get container
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      document.body.appendChild(container);
    }
    this.container = container;

    // Build UI structure
    this.elements = this.createUIStructure();

    // Initialize with default hotkeys
    this.updateHotkeyHints('single');
  }

  /**
   * Set the game state to subscribe to
   */
  public setGameState(gameState: IGameState): void {
    this.gameState = gameState;

    // Subscribe to state changes
    gameState.subscribe((state) => {
      this.onStateChange(state);
    });
  }

  /**
   * Create all UI DOM elements
   */
  private createUIStructure(): typeof this.elements {
    this.container.innerHTML = `
      <div class="dashboard">
        <!-- Top Bar -->
        <div class="top-bar">
          <div class="status-panel">
            <div class="status-item" id="depth-status">
              <span class="label">Depth</span>
              <span class="value" id="depth-value">0m</span>
            </div>
            <div class="status-item" id="battery-status">
              <span class="label">Battery</span>
              <span class="value" id="battery-value">100%</span>
            </div>
            <div class="status-item" id="oxygen-status">
              <span class="label">O2</span>
              <span class="value" id="oxygen-value">100%</span>
            </div>
          </div>
          <div class="score-panel">
            <span class="multiplier" id="multiplier-value">x1.0</span>
            <span class="score-display" id="score-value">0</span>
            <div class="timer" id="timer-value">5:00</div>
          </div>
        </div>

        <!-- Notification Container -->
        <div class="notification-container" id="notification-container"></div>

        <!-- Hotkey Hints Container (B10 component) -->
        <div id="hotkey-hints-container"></div>

        <!-- Welding Gauge Container (B12 component) -->
        <div id="welding-gauge-container"></div>

        <!-- Bottom Panels -->
        <div class="bottom-panels">
          <div class="viewport-panel" id="welding-viewport">
            <span class="viewport-label">Welding Cam</span>
          </div>
          <div class="viewport-panel" id="external-viewport">
            <span class="viewport-label">External</span>
          </div>
          <!-- Objectives Panel Container (B11 component) -->
          <div id="objectives-panel-container"></div>
        </div>

        <!-- Pause Overlay -->
        <div class="pause-overlay" id="pause-overlay">
          <div class="pause-menu">
            <h2>PAUSED</h2>
            <button class="menu-item" id="resume-btn">Resume</button>
            <button class="menu-item" id="settings-btn">Settings</button>
            <button class="menu-item" id="quit-btn">Quit Mission</button>
          </div>
        </div>
      </div>
    `;

    // Setup pause menu buttons
    const resumeBtn = document.getElementById('resume-btn');
    if (resumeBtn) {
      resumeBtn.addEventListener('click', () => this.setPauseMenuVisible(false));
    }

    const elements = {
      topBar: document.querySelector('.top-bar') as HTMLElement,
      depthValue: document.getElementById('depth-value') as HTMLElement,
      batteryValue: document.getElementById('battery-value') as HTMLElement,
      oxygenValue: document.getElementById('oxygen-value') as HTMLElement,
      scoreValue: document.getElementById('score-value') as HTMLElement,
      multiplierValue: document.getElementById('multiplier-value') as HTMLElement,
      timerValue: document.getElementById('timer-value') as HTMLElement,
      notificationContainer: document.getElementById('notification-container') as HTMLElement,
      pauseOverlay: document.getElementById('pause-overlay') as HTMLElement,
      hotkeyHintsContainer: document.getElementById('hotkey-hints-container') as HTMLElement,
      objectivesPanelContainer: document.getElementById('objectives-panel-container') as HTMLElement,
      weldingGaugeContainer: document.getElementById('welding-gauge-container') as HTMLElement,
    };

    // Initialize modular components (B10-B12)
    this.hotkeyHintsComponent = new HotkeyHints(elements.hotkeyHintsContainer);
    this.objectivesPanelComponent = new ObjectivesPanel(elements.objectivesPanelContainer);
    this.weldingGaugeComponent = new WeldingGauge(elements.weldingGaugeContainer);

    return elements;
  }

  /**
   * Handle state changes from GameState
   */
  private onStateChange(state: GameStateData): void {
    this.updateStatusIndicators(state);
    this.updateScore(state);
    this.updateTimer(state);
    this.updateObjectives(state);
    this.updateWeldingGauge(state);
  }

  /**
   * Update status indicators (depth, battery, oxygen)
   */
  private updateStatusIndicators(state: GameStateData): void {
    const { submarine } = state;

    // Depth
    this.elements.depthValue.textContent = `${Math.round(submarine.depth)}m`;

    // Battery
    const battery = Math.round(submarine.battery);
    this.elements.batteryValue.textContent = `${battery}%`;
    this.setStatusLevel('battery-status', battery);

    // Oxygen
    const oxygen = Math.round(submarine.oxygen);
    this.elements.oxygenValue.textContent = `${oxygen}%`;
    this.setStatusLevel('oxygen-status', oxygen);
  }

  /**
   * Set status item warning/danger classes based on value
   */
  private setStatusLevel(elementId: string, value: number): void {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.classList.remove('warning', 'danger');
    if (value < 20) {
      element.classList.add('danger');
    } else if (value < 40) {
      element.classList.add('warning');
    }
  }

  /**
   * Update score display
   */
  private updateScore(state: GameStateData): void {
    const { score } = state;
    this.elements.scoreValue.textContent = score.total.toLocaleString();
    this.elements.multiplierValue.textContent = `x${score.multiplier.toFixed(1)}`;
  }

  /**
   * Update timer display
   */
  private updateTimer(state: GameStateData): void {
    const { mission } = state;
    if (!mission) {
      this.elements.timerValue.textContent = '--:--';
      return;
    }

    const time = Math.max(0, mission.timeRemaining);
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    this.elements.timerValue.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Warning classes
    const timerEl = this.elements.timerValue;
    timerEl.classList.remove('warning', 'danger');
    if (time < 30) {
      timerEl.classList.add('danger');
    } else if (time < 60) {
      timerEl.classList.add('warning');
    }
  }

  /**
   * Update objectives list (delegates to ObjectivesPanel component)
   */
  private updateObjectives(state: GameStateData): void {
    if (this.objectivesPanelComponent) {
      this.objectivesPanelComponent.update(state.mission?.objectives ?? null);
    }
  }

  /**
   * Update welding gauge display (delegates to WeldingGauge component)
   */
  private updateWeldingGauge(state: GameStateData): void {
    if (this.weldingGaugeComponent) {
      const { welding } = state;
      this.weldingGaugeComponent.update(welding.torchHeat, welding.torchIntensity);
    }
  }

  /**
   * Update UI with current state (call every frame)
   */
  public update(): void {
    if (this.gameState) {
      this.onStateChange(this.gameState.getState());
    }
  }

  /**
   * Show a notification toast
   */
  public showNotification(message: string, duration: number = 3000): void {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    this.elements.notificationContainer.appendChild(notification);
    this.notifications.push(notification);

    // Auto-remove after duration
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => {
        notification.remove();
        const index = this.notifications.indexOf(notification);
        if (index > -1) {
          this.notifications.splice(index, 1);
        }
      }, 300);
    }, duration);
  }

  /**
   * Show notification with type (success, warning, error)
   */
  public showTypedNotification(message: string, type: 'success' | 'warning' | 'error', duration: number = 3000): void {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    this.elements.notificationContainer.appendChild(notification);
    this.notifications.push(notification);

    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => {
        notification.remove();
        const index = this.notifications.indexOf(notification);
        if (index > -1) {
          this.notifications.splice(index, 1);
        }
      }, 300);
    }, duration);
  }

  /**
   * Show/hide pause menu
   */
  public setPauseMenuVisible(visible: boolean): void {
    if (visible) {
      this.elements.pauseOverlay.classList.add('visible');
    } else {
      this.elements.pauseOverlay.classList.remove('visible');
    }
  }

  /**
   * Check if pause menu is visible
   */
  public isPauseMenuVisible(): boolean {
    return this.elements.pauseOverlay.classList.contains('visible');
  }

  /**
   * Update hotkey hints based on input mode (delegates to HotkeyHints component)
   */
  public updateHotkeyHints(mode: 'single' | 'coop-keyboard' | 'coop-gamepad'): void {
    if (this.hotkeyHintsComponent) {
      this.hotkeyHintsComponent.setMode(mode as HotkeyMode);
    }
  }

  /**
   * Get viewport element for rendering camera texture
   */
  public getViewportElement(id: 'welding' | 'external'): HTMLElement | null {
    return document.getElementById(`${id}-viewport`);
  }

  /**
   * Get the welding gauge component for direct access
   */
  public getWeldingGauge(): WeldingGauge | null {
    return this.weldingGaugeComponent;
  }

  /**
   * Get the hotkey hints component for direct access
   */
  public getHotkeyHints(): HotkeyHints | null {
    return this.hotkeyHintsComponent;
  }

  /**
   * Get the objectives panel component for direct access
   */
  public getObjectivesPanel(): ObjectivesPanel | null {
    return this.objectivesPanelComponent;
  }

  /**
   * Clean up UI
   */
  public dispose(): void {
    // Dispose modular components
    this.hotkeyHintsComponent?.dispose();
    this.objectivesPanelComponent?.dispose();
    this.weldingGaugeComponent?.dispose();

    this.hotkeyHintsComponent = null;
    this.objectivesPanelComponent = null;
    this.weldingGaugeComponent = null;

    this.container.innerHTML = '';
    this.notifications = [];
  }
}
