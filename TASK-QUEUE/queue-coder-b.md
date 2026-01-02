# CODER-B TASK QUEUE

## Active Sprint Tasks

### Phase 1: Foundation
- [x] **B1**: Create folder structure and asset directories
  ```
  Directories: src/{entities,cameras,ui,effects,environment,scenarios,missions,shaders}
               public/{models,textures,audio,fonts}
  Commit: [CODER-B] B1: Create project folder structure
  ```

### Phase 2: Environment
- [x] **B2**: Create UnderwaterEnv.ts
  ```
  File: src/environment/UnderwaterEnv.ts
  Features: FogExp2 (0x001a33, 0.015), ambient light (0x3366aa),
            directional light (filtered sun), scene background
  Commit: [CODER-B] B2: Implement underwater environment with fog and lighting
  ```

---

## Waiting (After MERGE-2)

### Phase 3: Entities
- [x] **B3**: Create Submarine.ts entity
  ```
  File: src/entities/Submarine.ts
  Implements: ISubmarine interface
  Features: THREE.Group, hull geometry, lights, propeller
  Commit: [CODER-B] B3: Create Submarine entity with hull geometry
  ```

- [x] **B4**: Create WeldingArm.ts
  ```
  File: src/entities/WeldingArm.ts
  Implements: IWeldingArm interface
  Features: 4 joint segments, articulation, parent to submarine
  Commit: [CODER-B] B4: Implement articulated welding arm
  ```

- [x] **B5**: Create WeldingTorch.ts
  ```
  File: src/entities/WeldingTorch.ts
  Implements: IWeldingTorch interface
  Features: Torch mesh, emissive tip, heat tracking, activate/deactivate
  Commit: [CODER-B] B5: Add welding torch with activation state
  ```

---

## Waiting (After MERGE-3)

### Phase 4: Cameras
- [x] **B6**: Create CameraRig.ts
- [x] **B7**: Create CameraManager.ts

### Phase 5: UI
- [x] **B8**: Create dashboard.css
- [x] **B9**: Create UIManager.ts

### Phase 6: UI Components
- [x] **B10**: Create HotkeyHints.ts
  ```
  File: src/ui/HotkeyHints.ts
  Features: Modular hotkey hints panel, mode switching (single/coop)
  Commit: [CODER-B] B10-B12: Add HotkeyHints, ObjectivesPanel, WeldingGauge components
  ```

- [x] **B11**: Create ObjectivesPanel.ts
  ```
  File: src/ui/ObjectivesPanel.ts
  Features: Modular objectives display, progress tracking
  Commit: [CODER-B] B10-B12: Add HotkeyHints, ObjectivesPanel, WeldingGauge components
  ```

- [x] **B12**: Create WeldingGauge.ts
  ```
  File: src/ui/WeldingGauge.ts
  Features: Torch heat/intensity gauges, visual bars, warning states
  Commit: [CODER-B] B10-B12: Add HotkeyHints, ObjectivesPanel, WeldingGauge components
  ```

---

## Instructions

1. Execute tasks top-to-bottom
2. After completing each task:
   - Commit with proper message format
   - Change `[ ]` to `[x]` in this file
   - Push to dev/coder-b
3. When B1-B2 complete, create PR for MERGE-2
4. Wait for SUPERVISOR to merge before continuing

---

## Log Completed Tasks
<!-- Append completion timestamps here -->
- [x] B1: 2026-01-02 - Folder structure created
- [x] B2: 2026-01-02 - UnderwaterEnv.ts implemented
- [x] B3: 2026-01-02 - Submarine.ts entity implemented
- [x] B4: 2026-01-02 - WeldingArm.ts entity implemented
- [x] B5: 2026-01-02 - WeldingTorch.ts entity implemented
- [x] B6: 2026-01-02 - CameraRig.ts implemented
- [x] B7: 2026-01-02 - CameraManager.ts implemented
- [x] B8: 2026-01-02 - dashboard.css implemented
- [x] B9: 2026-01-02 - UIManager.ts implemented
- [x] B10: 2026-01-02 - HotkeyHints.ts implemented
- [x] B11: 2026-01-02 - ObjectivesPanel.ts implemented
- [x] B12: 2026-01-02 - WeldingGauge.ts implemented
