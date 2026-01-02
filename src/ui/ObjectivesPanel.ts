/**
 * ObjectivesPanel.ts
 * Modular component for displaying mission objectives with progress.
 *
 * CODER-B Task B11
 */

import type { ObjectiveData } from '../types/interfaces';

/**
 * Objectives panel component
 */
export class ObjectivesPanel {
  private container: HTMLElement;
  private listElement: HTMLElement;

  constructor(parentElement: HTMLElement) {
    this.container = document.createElement('div');
    this.container.className = 'objectives-panel';

    this.container.innerHTML = `
      <h3>Objectives</h3>
      <div id="objectives-list"></div>
    `;

    parentElement.appendChild(this.container);
    this.listElement = this.container.querySelector('#objectives-list') as HTMLElement;

    // Initialize with empty state
    this.update(null);
  }

  /**
   * Update objectives display
   */
  public update(objectives: ObjectiveData[] | null): void {
    if (!objectives || objectives.length === 0) {
      this.listElement.innerHTML = '<p style="color: var(--ui-text-dim)">No active mission</p>';
      return;
    }

    this.listElement.innerHTML = objectives
      .map((obj) => `
        <div class="objective-item ${obj.completed ? 'completed' : ''}">
          <div class="checkbox">${obj.completed ? '&#10003;' : ''}</div>
          <span>${obj.name}</span>
          <span class="objective-progress">${obj.progress}/${obj.target}</span>
        </div>
      `)
      .join('');
  }

  /**
   * Get a specific objective element by ID (for animations)
   */
  public getObjectiveElement(objectiveId: string): HTMLElement | null {
    const items = this.listElement.querySelectorAll('.objective-item');
    for (const item of items) {
      if (item.getAttribute('data-id') === objectiveId) {
        return item as HTMLElement;
      }
    }
    return null;
  }

  /**
   * Show the objectives panel
   */
  public show(): void {
    this.container.style.display = 'block';
  }

  /**
   * Hide the objectives panel
   */
  public hide(): void {
    this.container.style.display = 'none';
  }

  /**
   * Clean up the component
   */
  public dispose(): void {
    this.container.remove();
  }
}
