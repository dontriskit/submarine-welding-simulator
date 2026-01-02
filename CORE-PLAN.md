# SUBMARINE WELDING SIMULATOR - CORE DEVELOPMENT PLAN

## Development Team Structure
| Role | Branch | Focus Area |
|------|--------|------------|
| **CODER-A** | `dev/coder-a` | Core systems, Input, State, Physics |
| **CODER-B** | `dev/coder-b` | Entities, UI, Cameras, Rendering |
| **SUPERVISOR** | `main` | PR reviews, Integration, Testing |

---

## TECH TREE - Critical Path Visualization

```
PHASE 1: FOUNDATION (PARALLEL START)
═══════════════════════════════════════════════════════════════════

[A1] Project Setup ──────────────────┐
     package.json, vite.config.ts    │
     tsconfig.json, index.html       │
     ████████████░░ CODER-A          │
                                     ├──► [MERGE POINT 1]
[B1] Asset Structure ────────────────┤
     public/models/, textures/       │
     src/ folder structure           │
     ████████████░░ CODER-B          │
                                     │
                                     ▼
PHASE 2: CORE SYSTEMS (AFTER MERGE 1)
═══════════════════════════════════════════════════════════════════

[A2] Engine.ts ──────────────────────┐
     Three.js renderer, scene        │
     Clock, render loop              │     [B2] UnderwaterEnv.ts ────┐
     ████████░░░░░░ CODER-A          │          Fog, lighting        │
              │                      │          Caustics setup       │
              │                      │          ████████░░░░░░ CODER-B
              ▼                      │                   │
[A3] EventBus.ts                     │                   │
     Global event system             │                   │
     Subscribe/emit pattern          │                   │
     ████░░░░░░░░░░ CODER-A          │                   │
              │                      │                   │
              ▼                      │                   ▼
[A4] Constants.ts ───────────────────┼──► [MERGE POINT 2] ◄─────────┘
     Physics constants               │
     Game parameters                 │
     ████░░░░░░░░░░ CODER-A          │
                                     │
                                     ▼
PHASE 3: INPUT & ENTITIES (AFTER MERGE 2)
═══════════════════════════════════════════════════════════════════

[A5] InputAction.ts ─────────────────┐
     Action enum definitions         │
     ████░░░░░░░░░░ CODER-A          │     [B3] Submarine.ts ────────┐
              │                      │          Hull geometry        │
              ▼                      │          Basic mesh           │
[A6] KeyboardController.ts           │          ████░░░░░░░░░░ CODER-B
     Key state tracking              │                   │
     ████░░░░░░░░░░ CODER-A          │                   ▼
              │                      │     [B4] WeldingArm.ts
              ▼                      │          Joint hierarchy
[A7] GamepadController.ts            │          Arm segments
     VJOY/Gamepad support            │          ████░░░░░░░░░░ CODER-B
     Deadzone, scaling               │                   │
     ████░░░░░░░░░░ CODER-A          │                   ▼
              │                      │     [B5] WeldingTorch.ts
              ▼                      │          Torch mesh
[A8] InputManager.ts                 │          Particle emitter
     Coordinate all input            │          ████░░░░░░░░░░ CODER-B
     Mode switching                  │                   │
     ████░░░░░░░░░░ CODER-A ─────────┼──► [MERGE POINT 3] ◄─────────┘
                                     │
                                     ▼
PHASE 4: PHYSICS & CAMERAS (AFTER MERGE 3)
═══════════════════════════════════════════════════════════════════

[A9] SubmarinePhysics.ts ────────────┐
     Buoyancy, drag, inertia         │
     Movement integration            │     [B6] CameraRig.ts ────────┐
     ████░░░░░░░░░░ CODER-A          │          Perspective/Ortho    │
              │                      │          Parent tracking      │
              ▼                      │          ████░░░░░░░░░░ CODER-B
[A10] WeldingArmPhysics.ts           │                   │
      Joint constraints              │                   ▼
      IK solver                      │     [B7] CameraManager.ts
      ████░░░░░░░░░░ CODER-A         │          Multi-cam render
                                     │          Render targets
                                     │          ████░░░░░░░░░░ CODER-B
                                     │                   │
                                     ├──► [MERGE POINT 4] ◄─────────┘
                                     │
                                     ▼
PHASE 5: STATE & UI (AFTER MERGE 4)
═══════════════════════════════════════════════════════════════════

[A11] GameState.ts ──────────────────┐
      Central state store            │
      Reducer pattern                │     [B8] Dashboard.css ───────┐
      ████░░░░░░░░░░ CODER-A         │          Grid layout          │
              │                      │          Status panels        │
              ▼                      │          ████░░░░░░░░░░ CODER-B
[A12] GameStateActions.ts            │                   │
      Action creators                │                   ▼
      Reducers                       │     [B9] UIManager.ts
      ████░░░░░░░░░░ CODER-A         │          Component lifecycle
                                     │          Data binding
                                     │          ████░░░░░░░░░░ CODER-B
                                     │                   │
                                     ├──► [MERGE POINT 5] ◄─────────┘
                                     │
                                     ▼
PHASE 6: SYSTEMS & SCORING (AFTER MERGE 5)
═══════════════════════════════════════════════════════════════════

[A13] WeldingSystem.ts ──────────────┐
      Quality tracking               │
      Parameter sampling             │     [B10] HotkeyHints.ts ─────┐
      ████░░░░░░░░░░ CODER-A         │           Always-visible UI   │
              │                      │           Mode-aware          │
              ▼                      │           ████░░░░░░░░░░ CODER-B
[A14] WeldQualityAnalyzer.ts         │                   │
      Scoring algorithm              │                   ▼
      Defect detection               │     [B11] ObjectivesPanel.ts
      ████░░░░░░░░░░ CODER-A         │           Mission goals UI
              │                      │           Progress display
              ▼                      │           ████░░░░░░░░░░ CODER-B
[A15] ScoringSystem.ts               │                   │
      Points, combos                 │                   ▼
      Multipliers                    │     [B12] WeldingGauge.ts
      ████░░░░░░░░░░ CODER-A         │           Arc stability viz
                                     │           Real-time feedback
                                     │           ████░░░░░░░░░░ CODER-B
                                     │                   │
                                     ├──► [MERGE POINT 6] ◄─────────┘
                                     │
                                     ▼
PHASE 7: MULTIPLAYER & MISSIONS (AFTER MERGE 6)
═══════════════════════════════════════════════════════════════════

[A16] LocalCoopManager.ts ───────────┐
      Player slots                   │
      Role assignment                │     [B13] MissionLoader.ts ───┐
      ████░░░░░░░░░░ CODER-A         │           JSON parsing        │
              │                      │           Validation          │
              ▼                      │           ████░░░░░░░░░░ CODER-B
[A17] TrainingMetrics.ts             │                   │
      Session tracking               │                   ▼
      Skill analytics                │     [B14] Scenarios/
      ████░░░░░░░░░░ CODER-A         │           Pipeline env
                                     │           Platform env
                                     │           Hull env
                                     │           ████░░░░░░░░░░ CODER-B
                                     │                   │
                                     ├──► [MERGE POINT 7] ◄─────────┘
                                     │
                                     ▼
PHASE 8: INTEGRATION & POLISH (FINAL)
═══════════════════════════════════════════════════════════════════

[A18] App.ts ────────────────────────┐
      Main orchestrator              │
      System wiring                  │     [B15] Effects/
      ████░░░░░░░░░░ CODER-A         │           Bubbles particles
                                     │           Weld sparks
                                     │           Caustic shader
                                     │           ████░░░░░░░░░░ CODER-B
                                     │
                                     ├──► [FINAL MERGE] ◄───────────┘
                                     │
                                     ▼
                              🎮 RELEASE 🎮
```

---

## TASK REGISTRY - Status Tracking

### Legend
- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete
- `[!]` Blocked
- `[?]` Needs review

---

## CODER-A TASKS (Core/Input/State/Physics)

### Phase 1 - Foundation
| ID | Task | File | Status | Depends On | Est. |
|----|------|------|--------|------------|------|
| A1 | Project initialization | `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html` | [ ] | - | 15m |

### Phase 2 - Core Systems
| ID | Task | File | Status | Depends On | Est. |
|----|------|------|--------|------------|------|
| A2 | Three.js Engine | `src/core/Engine.ts` | [ ] | A1 | 30m |
| A3 | Event Bus | `src/core/EventBus.ts` | [ ] | A1 | 20m |
| A4 | Game Constants | `src/core/Constants.ts` | [ ] | A1 | 15m |

### Phase 3 - Input System
| ID | Task | File | Status | Depends On | Est. |
|----|------|------|--------|------------|------|
| A5 | Input Actions | `src/input/InputAction.ts` | [ ] | A3 | 15m |
| A6 | Keyboard Controller | `src/input/KeyboardController.ts` | [ ] | A5 | 25m |
| A7 | Gamepad Controller | `src/input/GamepadController.ts` | [ ] | A5 | 30m |
| A8 | Input Manager | `src/input/InputManager.ts` | [ ] | A6, A7 | 35m |

### Phase 4 - Physics
| ID | Task | File | Status | Depends On | Est. |
|----|------|------|--------|------------|------|
| A9 | Submarine Physics | `src/physics/SubmarinePhysics.ts` | [ ] | A4, MERGE3 | 45m |
| A10 | Welding Arm Physics | `src/physics/WeldingArmPhysics.ts` | [ ] | A4 | 40m |

### Phase 5 - State Management
| ID | Task | File | Status | Depends On | Est. |
|----|------|------|--------|------------|------|
| A11 | Game State Store | `src/state/GameState.ts` | [ ] | A3 | 35m |
| A12 | State Actions | `src/state/GameStateActions.ts` | [ ] | A11 | 25m |

### Phase 6 - Welding Systems
| ID | Task | File | Status | Depends On | Est. |
|----|------|------|--------|------------|------|
| A13 | Welding System | `src/systems/WeldingSystem.ts` | [ ] | A11, MERGE5 | 40m |
| A14 | Quality Analyzer | `src/training/WeldQualityAnalyzer.ts` | [ ] | A13 | 50m |
| A15 | Scoring System | `src/systems/ScoringSystem.ts` | [ ] | A14 | 35m |

### Phase 7 - Multiplayer
| ID | Task | File | Status | Depends On | Est. |
|----|------|------|--------|------------|------|
| A16 | Local Co-op Manager | `src/multiplayer/LocalCoopManager.ts` | [ ] | A8, A11 | 40m |
| A17 | Training Metrics | `src/training/TrainingMetrics.ts` | [ ] | A14, A15 | 35m |

### Phase 8 - Integration
| ID | Task | File | Status | Depends On | Est. |
|----|------|------|--------|------------|------|
| A18 | App Orchestrator | `src/App.ts` | [ ] | ALL A-tasks | 45m |

---

## CODER-B TASKS (Entities/UI/Cameras/Rendering)

### Phase 1 - Foundation
| ID | Task | File | Status | Depends On | Est. |
|----|------|------|--------|------------|------|
| B1 | Asset & Folder Structure | `public/`, `src/` directories | [ ] | - | 10m |

### Phase 2 - Environment
| ID | Task | File | Status | Depends On | Est. |
|----|------|------|--------|------------|------|
| B2 | Underwater Environment | `src/environment/UnderwaterEnv.ts` | [ ] | B1 | 35m |

### Phase 3 - Entities
| ID | Task | File | Status | Depends On | Est. |
|----|------|------|--------|------------|------|
| B3 | Submarine Entity | `src/entities/Submarine.ts` | [ ] | MERGE2 | 40m |
| B4 | Welding Arm Entity | `src/entities/WeldingArm.ts` | [ ] | B3 | 45m |
| B5 | Welding Torch | `src/entities/WeldingTorch.ts` | [ ] | B4 | 35m |

### Phase 4 - Cameras
| ID | Task | File | Status | Depends On | Est. |
|----|------|------|--------|------------|------|
| B6 | Camera Rig | `src/cameras/CameraRig.ts` | [ ] | MERGE3 | 30m |
| B7 | Camera Manager | `src/cameras/CameraManager.ts` | [ ] | B6 | 45m |

### Phase 5 - UI Foundation
| ID | Task | File | Status | Depends On | Est. |
|----|------|------|--------|------------|------|
| B8 | Dashboard CSS | `src/ui/styles/dashboard.css` | [ ] | B1 | 40m |
| B9 | UI Manager | `src/ui/UIManager.ts` | [ ] | B8, MERGE4 | 45m |

### Phase 6 - UI Components
| ID | Task | File | Status | Depends On | Est. |
|----|------|------|--------|------------|------|
| B10 | Hotkey Hints | `src/ui/components/HotkeyHints.ts` | [ ] | B9 | 25m |
| B11 | Objectives Panel | `src/ui/components/ObjectivesPanel.ts` | [ ] | B9 | 30m |
| B12 | Welding Gauge | `src/ui/components/WeldingGauge.ts` | [ ] | B9 | 35m |

### Phase 7 - Scenarios
| ID | Task | File | Status | Depends On | Est. |
|----|------|------|--------|------------|------|
| B13 | Mission Loader | `src/missions/MissionLoader.ts` | [ ] | MERGE6 | 30m |
| B14 | Scenario Environments | `src/scenarios/*.ts` | [ ] | B2, B13 | 60m |

### Phase 8 - Effects
| ID | Task | File | Status | Depends On | Est. |
|----|------|------|--------|------------|------|
| B15 | Visual Effects | `src/effects/*.ts` | [ ] | B5, MERGE7 | 50m |

---

## MERGE POINTS - Synchronization Gates

| Merge | After Tasks | Integrates | Supervisor Action |
|-------|-------------|------------|-------------------|
| **MERGE 1** | A1, B1 | Project structure | Verify build works |
| **MERGE 2** | A2-A4, B2 | Core + Environment | Test scene renders |
| **MERGE 3** | A5-A8, B3-B5 | Input + Entities | Test submarine moves |
| **MERGE 4** | A9-A10, B6-B7 | Physics + Cameras | Test multi-camera |
| **MERGE 5** | A11-A12, B8-B9 | State + UI | Test data binding |
| **MERGE 6** | A13-A15, B10-B12 | Systems + UI | Test welding flow |
| **MERGE 7** | A16-A17, B13-B14 | Multiplayer + Missions | Test co-op mode |
| **FINAL** | A18, B15 | Full integration | Release testing |

---

## CRITICAL PATH (Longest dependency chain)

```
A1 → A2 → A3 → A5 → A6 → A8 → [MERGE3] → A9 → [MERGE4] → A11 → A13 → A14 → A15 → [MERGE6] → A16 → [MERGE7] → A18
     └─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                          CRITICAL PATH: ~8 hours
```

---

## INTERFACE CONTRACTS

These interfaces MUST be agreed upon before parallel work begins:

### IEngine (A2 exports, B2/B3 imports)
```typescript
interface IEngine {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  clock: THREE.Clock;
  onUpdate(callback: (delta: number) => void): void;
  start(): void;
  stop(): void;
}
```

### IEventBus (A3 exports, ALL import)
```typescript
interface IEventBus {
  on(event: string, handler: Function): void;
  off(event: string, handler: Function): void;
  emit(event: string, data?: any): void;
}
```

### IInputManager (A8 exports, B3/A16 imports)
```typescript
interface IInputManager {
  getAction(playerId: number, action: InputAction): InputState;
  getAnalogAxis(playerId: number, neg: InputAction, pos: InputAction): number;
  setupSinglePlayer(useGamepad: boolean): void;
  setupLocalCoop(mode: 'keyboard-only' | 'keyboard-gamepad'): void;
}
```

### IGameState (A11 exports, B9/A13-A16 imports)
```typescript
interface IGameState {
  getState(): GameStateData;
  dispatch(action: GameStateAction): void;
  subscribe(callback: (state: GameStateData) => void): () => void;
}
```

### ISubmarine (B3 exports, A9/B6/B7 imports)
```typescript
interface ISubmarine {
  mesh: THREE.Group;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  getWeldingArm(): IWeldingArm;
  update(delta: number): void;
}
```

### ICameraManager (B7 exports, B9/A18 imports)
```typescript
interface ICameraManager {
  getViewportTexture(id: string): THREE.Texture | null;
  update(submarine: ISubmarine): void;
  render(): void;
}
```

---

## DAILY STANDUP TEMPLATE

```markdown
## Standup - [DATE]

### CODER-A
- Yesterday: [completed tasks]
- Today: [planned tasks]
- Blockers: [any blockers]
- Next merge ready: [yes/no]

### CODER-B
- Yesterday: [completed tasks]
- Today: [planned tasks]
- Blockers: [any blockers]
- Next merge ready: [yes/no]

### SUPERVISOR
- PRs reviewed: [list]
- Integration issues: [any issues]
- Next merge: [which one]
```

---

## PROGRESS SUMMARY

| Phase | CODER-A | CODER-B | Merged |
|-------|---------|---------|--------|
| 1. Foundation | 0/1 | 0/1 | [ ] |
| 2. Core Systems | 0/3 | 0/1 | [ ] |
| 3. Input/Entities | 0/4 | 0/3 | [ ] |
| 4. Physics/Cameras | 0/2 | 0/2 | [ ] |
| 5. State/UI | 0/2 | 0/2 | [ ] |
| 6. Systems/Components | 0/3 | 0/3 | [ ] |
| 7. Multiplayer/Missions | 0/2 | 0/2 | [ ] |
| 8. Integration | 0/1 | 0/1 | [ ] |
| **TOTAL** | 0/18 | 0/15 | 0/8 |
