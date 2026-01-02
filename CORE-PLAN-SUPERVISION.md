# SUPERVISOR GUIDE - PR Review & Integration

## Your Role

You are the **SUPERVISOR** responsible for:
1. Reviewing PRs from CODER-A and CODER-B
2. Merging code to `main` branch
3. Running integration tests at each merge point
4. Resolving conflicts between coders
5. Maintaining project quality and consistency

---

## MERGE POINT CHECKLIST

### MERGE 1: Project Foundation
**After:** A1 (Project Setup), B1 (Asset Structure)

```markdown
## PR Review Checklist - MERGE 1

### CODER-A PR (merge first)
- [ ] package.json has correct dependencies (three, typescript, vite)
- [ ] vite.config.ts properly configured
- [ ] tsconfig.json has strict mode enabled
- [ ] index.html has canvas element with id="game"
- [ ] .gitignore includes node_modules, dist

### CODER-B PR (merge second)
- [ ] public/models/ directory exists
- [ ] public/textures/ directory exists
- [ ] src/ folder structure matches CORE-PLAN.md
- [ ] No conflicts with CODER-A files

### Integration Test
```bash
cd /home/mhm/Documents/submarine-welding-simulator
uv run npm install
uv run npm run dev
# Verify: Page loads without errors
# Verify: Console shows no errors
```

### Post-Merge
- [ ] Both coders notified to pull main
- [ ] CORE-PLAN.md updated: MERGE 1 = [x]
```

---

### MERGE 2: Core + Environment
**After:** A2-A4 (Engine, EventBus, Constants), B2 (UnderwaterEnv)

```markdown
## PR Review Checklist - MERGE 2

### CODER-A PR (merge first)
- [ ] Engine.ts exports IEngine interface
- [ ] Engine.ts creates WebGLRenderer with correct settings
- [ ] EventBus.ts has on/off/emit methods
- [ ] Constants.ts has physics values from CORE-PLAN.md
- [ ] All files compile: `uv run tsc --noEmit`

### CODER-B PR (merge second)
- [ ] UnderwaterEnv.ts imports Engine correctly
- [ ] Fog and lighting match spec (blue tint, 0.015 fog density)
- [ ] No hardcoded values (uses Constants.ts)
- [ ] Renders without errors

### Integration Test
```bash
uv run npm run dev
# Verify: Blue underwater scene renders
# Verify: Fog visible
# Verify: Console shows "Engine started" or similar
```

### Post-Merge
- [ ] Both coders notified to pull main
- [ ] CORE-PLAN.md updated: MERGE 2 = [x]
```

---

### MERGE 3: Input + Entities
**After:** A5-A8 (Input System), B3-B5 (Submarine, Arm, Torch)

```markdown
## PR Review Checklist - MERGE 3

### CODER-A PR (merge first)
- [ ] InputAction.ts has all actions from CORE-PLAN.md
- [ ] KeyboardController.ts handles keydown/keyup
- [ ] GamepadController.ts has deadzone handling
- [ ] InputManager.ts supports all control modes
- [ ] Default bindings match CORE-PLAN.md control scheme

### CODER-B PR (merge second)
- [ ] Submarine.ts creates THREE.Group with hull
- [ ] WeldingArm.ts has 4 joint segments
- [ ] WeldingTorch.ts has emissive material
- [ ] Entities added to scene correctly
- [ ] No import errors from CODER-A files

### Integration Test
```bash
uv run npm run dev
# Verify: Submarine visible in scene
# Verify: WASD moves submarine (or logs input)
# Verify: Arrow keys move welding arm (or logs input)
# Verify: Gamepad detected if connected
```

### Post-Merge
- [ ] Both coders notified to pull main
- [ ] CORE-PLAN.md updated: MERGE 3 = [x]
```

---

### MERGE 4: Physics + Cameras
**After:** A9-A10 (Physics), B6-B7 (Cameras)

```markdown
## PR Review Checklist - MERGE 4

### CODER-A PR (merge first)
- [ ] SubmarinePhysics.ts has buoyancy, drag
- [ ] Physics uses Constants.ts values
- [ ] WeldingArmPhysics.ts has joint constraints
- [ ] Physics integrates with InputManager

### CODER-B PR (merge second)
- [ ] CameraRig.ts supports perspective and orthographic
- [ ] CameraManager.ts renders to 4 textures
- [ ] Render targets are 256x160 pixels
- [ ] Cameras track submarine correctly

### Integration Test
```bash
uv run npm run dev
# Verify: Submarine moves with physics (inertia, drag)
# Verify: 4 camera views render (check textures exist)
# Verify: Welding arm moves with constraints
# Verify: Cameras follow submarine
```

### Post-Merge
- [ ] Both coders notified to pull main
- [ ] CORE-PLAN.md updated: MERGE 4 = [x]
```

---

### MERGE 5: State + UI
**After:** A11-A12 (GameState), B8-B9 (Dashboard, UIManager)

```markdown
## PR Review Checklist - MERGE 5

### CODER-A PR (merge first)
- [ ] GameState.ts has reducer pattern
- [ ] All state properties from CORE-PLAN.md present
- [ ] GameStateActions.ts has action types
- [ ] State subscribable for UI updates

### CODER-B PR (merge second)
- [ ] Dashboard.css has grid layout matching spec
- [ ] UIManager.ts binds to GameState
- [ ] Camera viewports display render textures
- [ ] Status bars (battery, O2, heat) work

### Integration Test
```bash
uv run npm run dev
# Verify: Dashboard renders over 3D scene
# Verify: 4 camera viewports visible
# Verify: Status values update when state changes
# Verify: Hotkey hints visible at bottom
```

### Post-Merge
- [ ] Both coders notified to pull main
- [ ] CORE-PLAN.md updated: MERGE 5 = [x]
```

---

### MERGE 6: Systems + UI Components
**After:** A13-A15 (Welding/Scoring), B10-B12 (UI Components)

```markdown
## PR Review Checklist - MERGE 6

### CODER-A PR (merge first)
- [ ] WeldingSystem.ts samples weld parameters
- [ ] WeldQualityAnalyzer.ts scores S/A/B/C/D/F
- [ ] Defect detection works (porosity, undercut, etc.)
- [ ] ScoringSystem.ts has combo/multiplier logic

### CODER-B PR (merge second)
- [ ] HotkeyHints.ts shows correct keys per mode
- [ ] ObjectivesPanel.ts displays mission goals
- [ ] WeldingGauge.ts shows arc stability
- [ ] All components update from state

### Integration Test
```bash
uv run npm run dev
# Verify: Welding torch activates on Num0
# Verify: Arc stability gauge moves
# Verify: Score increases while welding
# Verify: Quality rating appears after weld
```

### Post-Merge
- [ ] Both coders notified to pull main
- [ ] CORE-PLAN.md updated: MERGE 6 = [x]
```

---

### MERGE 7: Multiplayer + Missions
**After:** A16-A17 (Co-op, Metrics), B13-B14 (Missions, Scenarios)

```markdown
## PR Review Checklist - MERGE 7

### CODER-A PR (merge first)
- [ ] LocalCoopManager.ts handles player slots
- [ ] Role assignment (pilot/welder) works
- [ ] TrainingMetrics.ts tracks session data
- [ ] Multiplayer input routing works

### CODER-B PR (merge second)
- [ ] MissionLoader.ts parses JSON missions
- [ ] At least 1 mission per scenario type exists
- [ ] Scenarios have weld targets placed
- [ ] Mission objectives integrate with state

### Integration Test
```bash
uv run npm run dev
# Verify: Can start single player
# Verify: Can start 2-player keyboard co-op
# Verify: Can start keyboard+gamepad co-op
# Verify: Mission loads and objectives display
# Verify: Completing objectives updates UI
```

### Post-Merge
- [ ] Both coders notified to pull main
- [ ] CORE-PLAN.md updated: MERGE 7 = [x]
```

---

### FINAL MERGE: Full Integration
**After:** A18 (App.ts), B15 (Effects)

```markdown
## PR Review Checklist - FINAL MERGE

### CODER-A PR (merge first)
- [ ] App.ts wires all systems together
- [ ] Game loop properly orchestrated
- [ ] All managers initialized in correct order
- [ ] Error handling for missing components

### CODER-B PR (merge second)
- [ ] Bubbles particle system works
- [ ] Weld sparks render at torch tip
- [ ] Caustic shader visible on surfaces
- [ ] Effects don't impact performance badly

### Full Integration Test
```bash
uv run npm run dev
# Complete test scenario:
1. Start single player mode
2. Navigate to pipeline
3. Position welding arm
4. Complete a weld, check quality rating
5. Verify score updates
6. Check all 4 camera views
7. Pause and resume
8. Complete mission objectives
9. View results screen

# Co-op test:
10. Restart in 2-player mode
11. Verify split controls work
12. Complete weld with cooperation
```

### Post-Merge
- [ ] Tag release: v0.1.0
- [ ] CORE-PLAN.md updated: ALL COMPLETE
- [ ] Celebrate! 🎉
```

---

## PR REVIEW COMMANDS

### Quick Review Script
```bash
# Fetch PR branch
git fetch origin pull/<PR_NUMBER>/head:pr-<PR_NUMBER>
git checkout pr-<PR_NUMBER>

# Check it compiles
uv run tsc --noEmit

# Check it runs
uv run npm run dev

# Return to main
git checkout main
```

### Merge Commands
```bash
# After approving PR
git checkout main
git merge --no-ff dev/coder-a -m "MERGE-X: [tasks] from CODER-A"
git push origin main

# Then for CODER-B (after A merged)
git merge --no-ff dev/coder-b -m "MERGE-X: [tasks] from CODER-B"
git push origin main
```

---

## CONFLICT RESOLUTION PROTOCOL

### If PRs Conflict

1. **Identify conflicting files**
   ```bash
   git merge --no-commit dev/coder-b
   # See which files conflict
   git merge --abort
   ```

2. **Determine owner** (see COLLABORATION-RULES.md)

3. **Have owner fix**
   - If CODER-A's file: CODER-A rebases and fixes
   - If CODER-B's file: CODER-B rebases and fixes
   - If shared file: You (SUPERVISOR) mediate

4. **Re-review after fix**

---

## QUALITY GATES

### Code Standards
- [ ] No `any` types (unless absolutely necessary)
- [ ] All public methods have JSDoc comments
- [ ] No console.log in production code (use debug utility)
- [ ] Constants in UPPER_SNAKE_CASE
- [ ] Interfaces prefixed with I (IEngine, IGameState)

### Performance Standards
- [ ] No memory leaks (dispose Three.js objects)
- [ ] Render targets properly sized (256x160)
- [ ] Object pooling for particles
- [ ] RequestAnimationFrame for game loop

### Integration Standards
- [ ] All imports resolve
- [ ] No circular dependencies
- [ ] Event names documented
- [ ] Interface contracts honored

---

## DAILY SUPERVISOR CHECKLIST

```markdown
## Daily Check - [DATE]

### Morning
- [ ] Check for new PRs
- [ ] Review CORE-PLAN.md for status updates
- [ ] Check BLOCKERS section for issues

### During Day
- [ ] Review submitted PRs within 2 hours
- [ ] Run integration tests for pending merges
- [ ] Update CORE-PLAN.md progress summary

### End of Day
- [ ] Merge any approved PRs
- [ ] Notify coders of merges
- [ ] Update project progress tracking
```

---

## ESCALATION PROCEDURES

### If Coder is Blocked
1. Check if it's a dependency issue (waiting for merge)
2. Check if interface contract needs clarification
3. Provide guidance or adjust task assignment

### If Integration Fails
1. Identify which component broke
2. Revert merge if necessary: `git revert -m 1 <merge>`
3. Have responsible coder fix
4. Re-merge after fix verified

### If Behind Schedule
1. Identify critical path blockers
2. Consider parallel task reassignment
3. Simplify scope if necessary (mark tasks as "v2")

---

## PROGRESS DASHBOARD

Update this section after each merge:

```
PHASE 1: ████████████████████ 100% [MERGE 1 ✓]
PHASE 2: ████████████████████ 100% [MERGE 2 ✓]
PHASE 3: ░░░░░░░░░░░░░░░░░░░░   0% [MERGE 3 pending]
PHASE 4: ░░░░░░░░░░░░░░░░░░░░   0% [MERGE 4 pending]
PHASE 5: ░░░░░░░░░░░░░░░░░░░░   0% [MERGE 5 pending]
PHASE 6: ░░░░░░░░░░░░░░░░░░░░   0% [MERGE 6 pending]
PHASE 7: ░░░░░░░░░░░░░░░░░░░░   0% [MERGE 7 pending]
PHASE 8: ░░░░░░░░░░░░░░░░░░░░   0% [FINAL pending]

OVERALL: ██░░░░░░░░░░░░░░░░░░  10%
```

---

## QUICK REFERENCE

```
╔═══════════════════════════════════════════════════════════════╗
║  MERGE ORDER: Always CODER-A first, then CODER-B              ║
╠═══════════════════════════════════════════════════════════════╣
║  MERGE 1: A1 + B1      → Project compiles                     ║
║  MERGE 2: A2-4 + B2    → Scene renders                        ║
║  MERGE 3: A5-8 + B3-5  → Submarine moves                      ║
║  MERGE 4: A9-10 + B6-7 → Physics + cameras work               ║
║  MERGE 5: A11-12 + B8-9 → UI displays state                   ║
║  MERGE 6: A13-15 + B10-12 → Welding scores                    ║
║  MERGE 7: A16-17 + B13-14 → Missions playable                 ║
║  FINAL:   A18 + B15    → Full game works                      ║
╚═══════════════════════════════════════════════════════════════╝
```
