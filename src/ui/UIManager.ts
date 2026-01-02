/**
 * UIManager.ts
 * Manages all UI elements, notifications, and pause menu.
 *
 * CODER-B Task B9
 */

import type { IUIManager, IGameState, GameStateData } from '../types/interfaces';
import './dashboard.css';

/**
 * Hotkey hint configuration
 */
interface HotkeyHint {
  key: string;
  action: string;
}

/**
 * Hotkey configurations for different input modes
 */
const HOTKEY_CONFIGS: Record<'single' | 'coop-keyboard' | 'coop-gamepad', HotkeyHint[]> = {
  single: [
    { key: 'WASD', action: 'Move Sub' },
    { key: 'QE', action: 'Ascend/Descend' },
    { key: 'IJKL', action: 'Arm Control' },
    { key: 'Space', action: 'Weld' },
    { key: 'L', action: 'Lights' },
    { key: 'Esc', action: 'Pause' },
  ],
  'coop-keyboard': [
    { key: 'P1: WASD', action: 'Move Sub' },
    { key: 'P1: QE', action: 'Ascend/Descend' },
    { key: 'P2: IJKL', action: 'Arm Control' },
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
    hotkeyHints: HTMLElement;
    objectivesList: HTMLElement;
  };

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

        <!-- Hotkey Hints -->
        <div class="hotkey-hints" id="hotkey-hints">
          <h4>Controls</h4>
          <div id="hotkey-list"></div>
        </div>

        <!-- Bottom Panels -->
        <div class="bottom-panels">
          <div class="viewport-panel" id="welding-viewport">
            <span class="viewport-label">Welding Cam</span>
          </div>
          <div class="viewport-panel" id="external-viewport">
            <span class="viewport-label">External</span>
          </div>
          <div class="objectives-panel">
            <h3>Objectives</h3>
            <div id="objectives-list"></div>
          </div>
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

    return {
      topBar: document.querySelector('.top-bar') as HTMLElement,
      depthValue: document.getElementById('depth-value') as HTMLElement,
      batteryValue: document.getElementById('battery-value') as HTMLElement,
      oxygenValue: document.getElementById('oxygen-value') as HTMLElement,
      scoreValue: document.getElementById('score-value') as HTMLElement,
      multiplierValue: document.getElementById('multiplier-value') as HTMLElement,
      timerValue: document.getElementById('timer-value') as HTMLElement,
      notificationContainer: document.getElementById('notification-container') as HTMLElement,
      pauseOverlay: document.getElementById('pause-overlay') as HTMLElement,
      hotkeyHints: document.getElementById('hotkey-hints') as HTMLElement,
      objectivesList: document.getElementById('objectives-list') as HTMLElement,
    };
  }

  /**
   * Handle state changes from GameState
   */
  private onStateChange(state: GameStateData): void {
    this.updateStatusIndicators(state);
    this.updateScore(state);
    this.updateTimer(state);
    this.updateObjectives(state);
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
   * Update objectives list
   */
  private updateObjectives(state: GameStateData): void {
    const { mission } = state;
    if (!mission) {
      this.elements.objectivesList.innerHTML = '<p style="color: var(--ui-text-dim)">No active mission</p>';
      return;
    }

    this.elements.objectivesList.innerHTML = mission.objectives
      .map((obj) => `
        <div class="objective-item ${obj.completed ? 'completed' : ''}">
          <div class="checkbox">${obj.completed ? '✓' : ''}</div>
          <span>${obj.name}</span>
          <span class="objective-progress">${obj.progress}/${obj.target}</span>
        </div>
      `)
      .join('');
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
   * Update hotkey hints based on input mode
   */
  public updateHotkeyHints(mode: 'single' | 'coop-keyboard' | 'coop-gamepad'): void {
    const hints = HOTKEY_CONFIGS[mode];
    const hotkeyList = document.getElementById('hotkey-list');

    if (hotkeyList) {
      hotkeyList.innerHTML = hints
        .map((hint) => `
          <div class="hotkey-item">
            <span class="key">${hint.key}</span>
            <span class="action">${hint.action}</span>
          </div>
        `)
        .join('');
    }
  }

  /**
   * Get viewport element for rendering camera texture
   */
  public getViewportElement(id: 'welding' | 'external'): HTMLElement | null {
    return document.getElementById(`${id}-viewport`);
  }

  /**
   * Clean up UI
   */
  public dispose(): void {
    this.container.innerHTML = '';
    this.notifications = [];
  }
}
