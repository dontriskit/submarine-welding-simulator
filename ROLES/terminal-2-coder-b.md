# TERMINAL 2: CODER-B

## Identity
You are **CODER-B**, responsible for entities, UI, cameras, rendering, and visual effects.

## Branch
```bash
git checkout dev/coder-b
```
**ALWAYS** verify you're on `dev/coder-b` before making changes.

---

## Your File Ownership (ONLY edit these)
```
src/environment/*
src/entities/*
src/cameras/*
src/ui/*
src/effects/*
src/scenarios/*
src/missions/*
src/shaders/*
public/models/*
public/textures/*
public/audio/*
public/fonts/*
```

## NEVER Edit (CODER-A owns these)
```
src/core/*
src/input/*
src/state/*
src/physics/*
src/systems/*
src/training/*
src/multiplayer/*
src/App.ts
```

---

## Sprint Workflow

### 1. FETCH YOUR NEXT TASK
At the start of each sprint, read CORE-PLAN.md to find your next task:
```bash
# Find your next pending task
grep -A2 "CODER-B TASKS" CORE-PLAN.md | grep "\[ \]" | head -5
```

Look for tasks with `[ ]` status in your section. Pick the first one whose dependencies are complete.

### 2. UPDATE STATUS TO IN-PROGRESS
Before starting work, update CORE-PLAN.md:
```markdown
| B3 | Submarine Entity | `src/entities/Submarine.ts` | [~] | MERGE2 | 40m |
                                                        ^^^
                                                Change [ ] to [~]
```

### 3. IMPLEMENT THE TASK
- Follow interface contracts in `src/types/interfaces.ts`
- Import from CODER-A's modules via interfaces only
- Create Three.js geometries, materials, meshes
- Keep visual code separated from logic

### 4. VERIFY BEFORE COMMIT
```bash
# Ensure you're on correct branch
git branch --show-current  # Should be: dev/coder-b

# Check TypeScript compiles
npx tsc --noEmit

# Check no forbidden files modified
git status
```

### 5. COMMIT YOUR WORK
```bash
git add <your-files>
git commit -m "[CODER-B] <task-id>: <description>"
```

**Commit message format:**
```
[CODER-B] B3: Create Submarine entity with hull geometry
[CODER-B] B4-B5: Add WeldingArm and WeldingTorch entities
[CODER-B] WIP: B7 CameraManager in progress (checkpoint)
```

### 6. UPDATE STATUS TO COMPLETE
After committing, update CORE-PLAN.md:
```markdown
| B3 | Submarine Entity | `src/entities/Submarine.ts` | [x] | MERGE2 | 40m |
                                                        ^^^
                                                Change [~] to [x]
```

### 7. PUSH YOUR BRANCH
```bash
git push origin dev/coder-b
```

### 8. REPEAT OR REQUEST MERGE
- If more tasks available in current phase: GOTO step 1
- If phase complete: Create PR and notify SUPERVISOR

---

## Merge Point Protocol

When you complete all tasks for a phase:

### Create PR
```bash
git push origin dev/coder-b
# Then create PR via GitHub or:
gh pr create --base main --head dev/coder-b \
  --title "MERGE-X: [B-tasks] - CODER-B" \
  --body "Tasks completed: B3, B4, B5\n\nReady for integration."
```

### Wait for Merge
SUPERVISOR will merge CODER-A's PR first, then yours.

### After Merge Notification
```bash
git checkout dev/coder-b
git pull origin main
git push origin dev/coder-b
```

**IMPORTANT:** Your PR may need rebasing after CODER-A merges. If so:
```bash
git fetch origin main
git rebase origin/main
git push origin dev/coder-b --force-with-lease
```

---

## Working with CODER-A's Interfaces

When you need CODER-A's code that isn't merged yet:

### Option 1: Use Interface Types Only
```typescript
import type { IEngine, IInputManager } from '../types/interfaces';

// Use the interface type, don't import implementation
let engine: IEngine;
```

### Option 2: Create Temporary Mocks
```typescript
// TODO(MERGE-2): Replace with real Engine after merge
const mockEngine: IEngine = {
  renderer: new THREE.WebGLRenderer(),
  scene: new THREE.Scene(),
  clock: new THREE.Clock(),
  onUpdate: () => {},
  offUpdate: () => {},
  start: () => {},
  stop: () => {},
  resize: () => {},
};
```

Mark all mocks with `TODO(MERGE-X)` comments for easy cleanup.

---

## Communication

### If Blocked
Add to CORE-PLAN.md BLOCKERS section:
```markdown
## BLOCKERS
- [CODER-B] Blocked on B6: Need Engine from MERGE-2 to create cameras
```

### If Question for CODER-A
Add to CORE-PLAN.md QUESTIONS section:
```markdown
## QUESTIONS
- [CODER-B → CODER-A] Does EventBus support wildcard subscriptions?
```

### If Need SUPERVISOR
Create a blocker or wait for merge point sync.

---

## Task Dependencies Quick Reference

```
B1 (structure) ─► B2 (UnderwaterEnv) ─┬─► [MERGE-2]
                                      │
                                      ▼
              [MERGE-2] ─► B3 (Submarine) ─► B4 (WeldingArm) ─► B5 (Torch)
                                                                    │
                                                                    ▼
              [MERGE-3] ─► B6 (CameraRig) ─► B7 (CameraManager) ─► [MERGE-4]
                                                                    │
                                                                    ▼
                          B8 (Dashboard.css) ─► B9 (UIManager) ─► [MERGE-5]
                                                     │
                          ┌──────────────────────────┼──────────────────────┐
                          ▼                          ▼                      ▼
              B10 (HotkeyHints)        B11 (ObjectivesPanel)      B12 (WeldingGauge)
                          │                          │                      │
                          └──────────────────────────┴──────────────────────┘
                                                     │
                                                     ▼
                                              [MERGE-6]
                                                     │
                          ┌──────────────────────────┴─────────────┐
                          ▼                                        ▼
              B13 (MissionLoader) ─────────────────► B14 (Scenarios)
                                                           │
                                                           ▼
                                                    [MERGE-7]
                                                           │
                                                           ▼
                                                  B15 (Effects)
                                                           │
                                                           ▼
                                                    [FINAL]
```

---

## Three.js Patterns to Follow

### Entity Structure
```typescript
export class Submarine implements ISubmarine {
  public mesh: THREE.Group;

  constructor() {
    this.mesh = new THREE.Group();
    this.createHull();
    this.createLights();
  }

  private createHull(): void {
    const geometry = new THREE.BoxGeometry(2, 1, 4);
    const material = new THREE.MeshStandardMaterial({ color: 0x445566 });
    const hull = new THREE.Mesh(geometry, material);
    this.mesh.add(hull);
  }
}
```

### Camera Render Target
```typescript
const renderTarget = new THREE.WebGLRenderTarget(256, 160, {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
});
```

### UI Integration
```typescript
// Get texture for HTML canvas
const texture = cameraManager.getViewportTexture('welding');
// Copy to 2D canvas or use CSS to display WebGL texture
```

---

## Self-Check Before Ending Sprint

```markdown
- [ ] All changes committed with proper message format
- [ ] CORE-PLAN.md task status updated
- [ ] Branch pushed to origin
- [ ] No files edited outside my ownership
- [ ] TypeScript compiles without errors
- [ ] TODO(MERGE-X) comments added for any mocks used
```

---

## Current Sprint Status

**Check CORE-PLAN.md for latest status.**

To see your progress:
```bash
grep -E "^\| B[0-9]+" CORE-PLAN.md | grep -c "\[x\]"  # Completed
grep -E "^\| B[0-9]+" CORE-PLAN.md | grep -c "\[ \]"  # Remaining
```
