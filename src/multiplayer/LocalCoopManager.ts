/**
 * Local Co-op Manager
 *
 * Manages player slots and role assignment for local co-op gameplay.
 * Implements ILocalCoopManager interface from src/types/interfaces.ts
 */

import {
  type ILocalCoopManager,
  type PlayerSlot,
  type PlayerRole,
  type CoopMode,
  GameEvents,
} from '../types/interfaces';
import { EventBus } from '../core/EventBus';
import { inputManager } from '../input/InputManager';

export class LocalCoopManager implements ILocalCoopManager {
  private mode: CoopMode = 'single';
  private players: Map<number, PlayerSlot> = new Map();

  constructor() {
    // Start with single player mode
    this.setupSinglePlayer();
  }

  /**
   * Get current co-op configuration
   */
  public getMode(): CoopMode {
    return this.mode;
  }

  /**
   * Get player by ID
   */
  public getPlayer(id: number): PlayerSlot | undefined {
    return this.players.get(id);
  }

  /**
   * Get player by role
   */
  public getPlayerByRole(role: PlayerRole): PlayerSlot | undefined {
    for (const player of this.players.values()) {
      if (player.role === role || player.role === 'both') {
        return player;
      }
    }
    return undefined;
  }

  /**
   * Setup single player mode
   */
  public setupSinglePlayer(): void {
    const previousMode = this.mode;
    const previousPlayers = [...this.players.values()];

    // Clear existing players
    this.players.clear();
    this.mode = 'single';

    // Create single player slot with both roles
    const player: PlayerSlot = {
      id: 1,
      role: 'both',
      inputDevice: 'keyboard',
      isActive: true,
      name: 'Player 1',
    };
    this.players.set(1, player);

    // Configure input manager
    inputManager.setupSinglePlayer(false);

    // Emit events
    this.emitConfigurationEvents(previousMode, previousPlayers);
  }

  /**
   * Setup keyboard-only co-op (split keyboard)
   */
  public setupKeyboardCoop(): void {
    const previousMode = this.mode;
    const previousPlayers = [...this.players.values()];

    // Clear existing players
    this.players.clear();
    this.mode = 'keyboard-split';

    // Player 1: Pilot (WASD)
    const pilot: PlayerSlot = {
      id: 1,
      role: 'pilot',
      inputDevice: 'keyboard',
      isActive: true,
      name: 'Pilot',
    };
    this.players.set(1, pilot);

    // Player 2: Welder (Arrow keys / numpad)
    const welder: PlayerSlot = {
      id: 2,
      role: 'welder',
      inputDevice: 'keyboard',
      isActive: true,
      name: 'Welder',
    };
    this.players.set(2, welder);

    // Configure input manager
    inputManager.setupLocalCoop('keyboard-only');

    // Emit events
    this.emitConfigurationEvents(previousMode, previousPlayers);
  }

  /**
   * Setup keyboard + gamepad co-op
   */
  public setupKeyboardGamepadCoop(): void {
    const previousMode = this.mode;
    const previousPlayers = [...this.players.values()];

    // Clear existing players
    this.players.clear();
    this.mode = 'keyboard-gamepad';

    // Player 1: Pilot (Keyboard)
    const pilot: PlayerSlot = {
      id: 1,
      role: 'pilot',
      inputDevice: 'keyboard',
      isActive: true,
      name: 'Pilot',
    };
    this.players.set(1, pilot);

    // Player 2: Welder (Gamepad)
    const welder: PlayerSlot = {
      id: 2,
      role: 'welder',
      inputDevice: 'gamepad',
      gamepadIndex: 0,
      isActive: true,
      name: 'Welder',
    };
    this.players.set(2, welder);

    // Configure input manager
    inputManager.setupLocalCoop('keyboard-gamepad');

    // Emit events
    this.emitConfigurationEvents(previousMode, previousPlayers);
  }

  /**
   * Swap roles between players
   */
  public swapRoles(): void {
    if (this.mode === 'single') {
      // No role swapping in single player
      return;
    }

    const player1 = this.players.get(1);
    const player2 = this.players.get(2);

    if (!player1 || !player2) {
      return;
    }

    // Swap roles
    const tempRole = player1.role;
    player1.role = player2.role;
    player2.role = tempRole;

    // Swap names
    const tempName = player1.name;
    player1.name = player2.name;
    player2.name = tempName;

    // Emit swap event
    EventBus.emit(GameEvents.COOP_ROLES_SWAPPED, {
      player1: player1,
      player2: player2,
    });
  }

  /**
   * Get all active players
   */
  public getActivePlayers(): PlayerSlot[] {
    return [...this.players.values()].filter(p => p.isActive);
  }

  /**
   * Get player count
   */
  public getPlayerCount(): number {
    return this.players.size;
  }

  /**
   * Check if in co-op mode
   */
  public isCoopMode(): boolean {
    return this.mode !== 'single';
  }

  /**
   * Get the pilot player
   */
  public getPilot(): PlayerSlot | undefined {
    return this.getPlayerByRole('pilot');
  }

  /**
   * Get the welder player
   */
  public getWelder(): PlayerSlot | undefined {
    return this.getPlayerByRole('welder');
  }

  /**
   * Emit configuration change events
   */
  private emitConfigurationEvents(
    previousMode: CoopMode,
    previousPlayers: PlayerSlot[]
  ): void {
    // Find players who left
    const currentIds = new Set(this.players.keys());
    for (const player of previousPlayers) {
      if (!currentIds.has(player.id)) {
        EventBus.emit(GameEvents.COOP_PLAYER_LEFT, { player });
      }
    }

    // Find players who joined
    const previousIds = new Set(previousPlayers.map(p => p.id));
    for (const player of this.players.values()) {
      if (!previousIds.has(player.id)) {
        EventBus.emit(GameEvents.COOP_PLAYER_JOINED, { player });
      }
    }

    // Emit mode change if different
    if (previousMode !== this.mode) {
      EventBus.emit(GameEvents.COOP_CONFIGURED, {
        previousMode,
        currentMode: this.mode,
        players: this.getActivePlayers(),
      });
    }
  }
}

// Singleton instance
export const localCoopManager = new LocalCoopManager();

export default localCoopManager;
