# COLLABORATION RULES - Parallel Development Protocol

## Team Structure

```
┌─────────────────────────────────────────────────────────────┐
│                        SUPERVISOR                           │
│                     Branch: main                            │
│            Reviews PRs, Merges, Integration Tests           │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
┌───────────────────┐     ┌───────────────────┐
│     CODER-A       │     │     CODER-B       │
│  Branch: dev/a    │     │  Branch: dev/b    │
│  Core, Input,     │     │  Entities, UI,    │
│  State, Physics   │     │  Cameras, Effects │
└───────────────────┘     └───────────────────┘
```

---

## BRANCH STRATEGY

### Branch Naming
```
main                    # Production-ready, supervisor-controlled
dev/coder-a             # CODER-A's working branch
dev/coder-b             # CODER-B's working branch
feature/a-<task-id>     # CODER-A feature branches (optional)
feature/b-<task-id>     # CODER-B feature branches (optional)
```

### Branch Rules
| Branch | Push Allowed | Merge From | Merge To |
|--------|--------------|------------|----------|
| `main` | SUPERVISOR only | `dev/coder-a`, `dev/coder-b` | - |
| `dev/coder-a` | CODER-A only | `main` | `main` via PR |
| `dev/coder-b` | CODER-B only | `main` | `main` via PR |

---

## FILE OWNERSHIP - Conflict Prevention

### EXCLUSIVE OWNERSHIP (No overlap allowed)

**CODER-A owns these directories:**
```
src/core/Engine.ts
src/core/EventBus.ts
src/core/Constants.ts
src/input/*
src/state/*
src/physics/*
src/systems/WeldingSystem.ts
src/systems/ScoringSystem.ts
src/training/WeldQualityAnalyzer.ts
src/training/TrainingMetrics.ts
src/multiplayer/*
src/App.ts
```

**CODER-B owns these directories:**
```
src/environment/*
src/entities/*
src/cameras/*
src/ui/*
src/effects/*
src/scenarios/*
src/missions/*
src/shaders/*
public/*
```

### SHARED FILES (Coordination Required)

These files require coordination - ONLY edit during merge points:
```
package.json          # Add dependencies at merge points
index.html            # Modify together at MERGE 1
src/main.ts           # Final integration at MERGE 7
tsconfig.json         # Config changes at merge points
vite.config.ts        # Config changes at merge points
CORE-PLAN.md          # Status updates only (your section)
```

### INTERFACE FILES (Contract files - edit only by agreement)

```
src/types/interfaces.ts   # Shared interface definitions
                          # Both can READ, changes need SUPERVISOR approval
```

---

## COMMIT PROTOCOL

### Commit Message Format
```
[CODER-A|CODER-B] <task-id>: <description>

Examples:
[CODER-A] A2: Implement Engine.ts with renderer and scene
[CODER-B] B3: Create Submarine entity with hull geometry
[CODER-A] A5-A6: Add InputAction enum and KeyboardController
```

### Commit Frequency
| Situation | Commit Strategy |
|-----------|-----------------|
| Task complete | Commit immediately with task ID |
| Mid-task checkpoint | Commit with "WIP:" prefix |
| Before break | Always commit current state |
| Before merge point | Squash WIP commits, clean history |

### Atomic Commits
Each commit should:
- Complete ONE logical unit of work
- Pass TypeScript compilation (`uv run tsc --noEmit`)
- Not break imports (even if functionality incomplete)

---

## MERGE POINT PROTOCOL

### Before Requesting Merge

**CODER-A checklist:**
```markdown
- [ ] All assigned tasks for this phase complete
- [ ] Code compiles without errors
- [ ] Updated task status in CORE-PLAN.md (your section only)
- [ ] Pulled latest from main, resolved any conflicts
- [ ] Pushed to dev/coder-a
- [ ] Created PR with title: "MERGE-X: [A tasks] - CODER-A"
```

**CODER-B checklist:**
```markdown
- [ ] All assigned tasks for this phase complete
- [ ] Code compiles without errors
- [ ] Updated task status in CORE-PLAN.md (your section only)
- [ ] Pulled latest from main, resolved any conflicts
- [ ] Pushed to dev/coder-b
- [ ] Created PR with title: "MERGE-X: [B tasks] - CODER-B"
```

### Merge Order (IMPORTANT)
At each merge point, SUPERVISOR merges in this order:
1. **CODER-A first** (core systems are dependencies)
2. **CODER-B second** (depends on CODER-A's exports)

### Post-Merge Actions
Both coders MUST:
```bash
git checkout dev/coder-X
git pull origin main
git push origin dev/coder-X
```

---

## SYNCHRONIZATION POINTS

### Daily Sync (If working same day)
```
TIME: Start of session
DURATION: 5 minutes
FORMAT: Update CORE-PLAN.md status, check for blockers
```

### Merge Point Sync (Required)
```
TRIGGER: Both coders ready for same merge point
DURATION: 15-30 minutes
FORMAT:
  1. SUPERVISOR reviews both PRs
  2. CODER-A PR merged first
  3. Both coders pull main
  4. CODER-B PR merged (may need rebase)
  5. Both coders pull main again
  6. Integration test together
```

---

## DEPENDENCY HANDLING

### When CODER-B needs CODER-A's interface:

1. **Check CORE-PLAN.md** for interface contract
2. **Create stub/mock** if interface not yet implemented:
   ```typescript
   // TEMPORARY: Remove when A8 complete
   const inputManager: IInputManager = {
     getAction: () => ({ value: 0, pressed: false, held: false, released: false }),
     // ... mock implementation
   };
   ```
3. **Mark file with TODO:**
   ```typescript
   // TODO(MERGE-3): Replace mock with real InputManager
   ```

### When CODER-A needs CODER-B's entity:

1. **Use interface type only** - don't import implementation
2. **Create placeholder geometry:**
   ```typescript
   // TEMPORARY: Remove when B3 complete
   const submarinePlaceholder = new THREE.BoxGeometry(2, 1, 4);
   ```

---

## CONFLICT RESOLUTION

### If Git Conflict Occurs

1. **STOP** - Don't force push or auto-resolve
2. **Identify owner** - Check FILE OWNERSHIP section
3. **Owner resolves** - File owner makes the fix
4. **If shared file** - SUPERVISOR mediates

### Conflict Prevention Rules

1. **Never edit files you don't own**
2. **Never edit CORE-PLAN.md outside your section**
3. **Add dependencies in package.json only at merge points**
4. **Communicate before touching shared files**

---

## COMMUNICATION PROTOCOL

### Status Updates (In CORE-PLAN.md)
Update your task status as you work:
```markdown
| A5 | Input Actions | `src/input/InputAction.ts` | [x] | A3 | 15m |
                                                    ^^^
                                            Update this column
```

### Blockers
If blocked, add to CORE-PLAN.md:
```markdown
## BLOCKERS
- [CODER-A] Blocked on A8: Need interface clarification for IGameState
- [CODER-B] Blocked on B6: Waiting for MERGE-3 to get Engine
```

### Questions
For quick questions, add to CORE-PLAN.md:
```markdown
## QUESTIONS
- [CODER-A → CODER-B] What's the submarine mesh hierarchy?
- [CODER-B → CODER-A] What events does EventBus emit for input?
```

---

## WORKFLOW SUMMARY

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. CHECK CORE-PLAN.md for your next task                       │
│ 2. CREATE/CHECKOUT your branch: dev/coder-X                    │
│ 3. IMPLEMENT task following file ownership rules               │
│ 4. COMMIT with proper format: [CODER-X] ID: description        │
│ 5. UPDATE status in CORE-PLAN.md (your section)                │
│ 6. REPEAT until merge point reached                            │
│ 7. CREATE PR when all phase tasks complete                     │
│ 8. WAIT for supervisor merge                                   │
│ 9. PULL main after merge                                       │
│ 10. CONTINUE to next phase                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## EMERGENCY PROCEDURES

### If You Accidentally Edit Wrong File
```bash
git checkout -- <file>  # Discard changes
git stash               # Or stash if mixed with good changes
```

### If You Need to Undo a Commit
```bash
git revert <commit-hash>  # Safe revert
# NEVER use: git reset --hard (destroys history)
```

### If Merge Breaks Everything
```bash
# SUPERVISOR action:
git revert -m 1 <merge-commit>  # Revert the merge
# Then investigate and re-merge properly
```

---

## QUICK REFERENCE CARD

```
╔═══════════════════════════════════════════════════════════════╗
║  CODER-A                    ║  CODER-B                        ║
╠═══════════════════════════════════════════════════════════════╣
║  Branch: dev/coder-a        ║  Branch: dev/coder-b            ║
║  Files: src/core/*          ║  Files: src/entities/*          ║
║         src/input/*         ║         src/ui/*                ║
║         src/state/*         ║         src/cameras/*           ║
║         src/physics/*       ║         src/effects/*           ║
║         src/systems/*       ║         src/environment/*       ║
║         src/multiplayer/*   ║         src/scenarios/*         ║
║         src/training/*      ║         src/missions/*          ║
║         src/App.ts          ║         public/*                ║
╠═══════════════════════════════════════════════════════════════╣
║  Commit: [CODER-A] ID: msg  ║  Commit: [CODER-B] ID: msg      ║
║  PR: MERGE-X: [...] CODER-A ║  PR: MERGE-X: [...] CODER-B     ║
╚═══════════════════════════════════════════════════════════════╝
```
