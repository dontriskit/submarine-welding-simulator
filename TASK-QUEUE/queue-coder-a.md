# CODER-A TASK QUEUE

## Active Sprint Tasks

### Phase 1: Foundation
- [x] **A1**: Initialize project with Vite + TypeScript + Three.js
  ```
  Files: package.json, vite.config.ts, tsconfig.json, index.html, .gitignore
  Commands: npm init -y, npm install three vite typescript @types/three
  Commit: [CODER-A] A1: Initialize Vite + TypeScript + Three.js project
  ```

### Phase 2: Core Systems
- [x] **A2**: Create Engine.ts with Three.js renderer
  ```
  File: src/core/Engine.ts
  Implements: IEngine interface
  Features: WebGLRenderer, Scene, Clock, render loop, resize handling
  Commit: [CODER-A] A2: Implement Engine with renderer and scene
  ```

- [x] **A3**: Create EventBus.ts for global events
  ```
  File: src/core/EventBus.ts
  Implements: IEventBus interface
  Features: on, off, emit, once methods
  Commit: [CODER-A] A3: Add EventBus for decoupled communication
  ```

- [x] **A4**: Create Constants.ts with physics values
  ```
  File: src/core/Constants.ts
  Content: SUBMARINE_MASS, DRAG_COEFFICIENT, MAX_SPEED, etc.
  Values: From CORE-PLAN.md physics section
  Commit: [CODER-A] A4: Define physics and game constants
  ```

### Phase 3: Input System
- [x] **A5**: Create InputAction.ts enum
  ```
  File: src/input/InputAction.ts
  Content: Copy enum from src/types/interfaces.ts
  Commit: [CODER-A] A5: Define all input actions
  ```

- [x] **A6**: Create KeyboardController.ts
  ```
  File: src/input/KeyboardController.ts
  Features: keydown/keyup tracking, getValue for bindings
  Commit: [CODER-A] A6: Implement keyboard input controller
  ```

- [x] **A7**: Create GamepadController.ts
  ```
  File: src/input/GamepadController.ts
  Features: Gamepad API polling, deadzone, axis scaling
  Commit: [CODER-A] A7: Implement gamepad controller with VJOY support
  ```

- [x] **A8**: Create InputManager.ts
  ```
  File: src/input/InputManager.ts
  Implements: IInputManager interface
  Features: Coordinate keyboard/gamepad, mode switching, player routing
  Commit: [CODER-A] A8: Create central input manager
  ```

---

## Waiting (Blocked on Merge)

### Phase 4: Physics (After MERGE-3)
- [x] **A9**: Create SubmarinePhysics.ts
- [x] **A10**: Create WeldingArmPhysics.ts

### Phase 5: State (After MERGE-4)
- [ ] **A11**: Create GameState.ts
- [ ] **A12**: Create GameStateActions.ts

---

## Instructions

1. Execute tasks top-to-bottom
2. After completing each task:
   - Commit with proper message format
   - Change `[ ]` to `[x]` in this file
   - Push to dev/coder-a
3. When Phase 1-3 complete, create PR for MERGE-3
4. Wait for SUPERVISOR to merge before continuing to Phase 4

---

## Log Completed Tasks
<!-- Append completion timestamps here -->
