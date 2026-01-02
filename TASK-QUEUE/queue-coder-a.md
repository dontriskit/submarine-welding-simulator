# CODER-A TASK QUEUE - GAME MECHANICS

## Status: Implementing Core Game Mechanics

Previous phases complete. Now implementing gameplay mechanics.

---

## GitHub Issues (Track progress at github.com)

### Critical Path (Do First)
- [ ] **#26** A-MECH-4: Connect mission system to gameplay
  - Files: `src/App.ts`, `src/missions/MissionLoader.ts`
  - Load mission on start, position submarine, track objectives
  - Label: `enhancement`

- [ ] **#25** A-MECH-3: Implement weld target proximity detection
  - Files: `src/systems/WeldingSystem.ts`, `src/App.ts`
  - Calculate actual distance from torch to targets (currently hardcoded as 0)
  - Label: `enhancement`

### Secondary (After Critical Path)
- [ ] **#23** A-MECH-1: Implement oxygen/battery depletion
  - Files: `src/App.ts`, `src/state/GameStateActions.ts`, `src/core/Constants.ts`
  - Drain resources over time, game over when depleted
  - Label: `enhancement`

- [ ] **#24** A-MECH-2: Add win/lose conditions
  - Files: `src/App.ts`, `src/state/GameState.ts`
  - Add missionResult state, check win/lose conditions
  - Label: `enhancement`

### Low Priority
- [ ] **#27** A-MECH-5: Add basic collision detection
  - Files: NEW `src/physics/CollisionSystem.ts`, `src/App.ts`
  - Prevent submarine from passing through seafloor/surface
  - Label: `enhancement`

---

## Instructions

1. Start with #26 (mission system) - enables everything else
2. Then #25 (proximity) - enables accurate scoring
3. After each task:
   - Test with `npm run dev`
   - Commit with message: `[CODER-A] #XX: description`
   - Push to dev/coder-a
4. Wait for SUPERVISOR merge before next phase

---

## Commands

```bash
# View assigned issues
gh issue list --assignee ""

# Work on issue
git checkout dev/coder-a
git pull origin main
# Make changes...
npm run dev  # Test
npx tsc --noEmit  # Type check
git add -A && git commit -m "[CODER-A] #26: Connect mission system to gameplay"
git push origin dev/coder-a
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/App.ts` | Main orchestrator - add mission/resource logic here |
| `src/missions/MissionLoader.ts` | Already has load/start/complete methods |
| `src/systems/WeldingSystem.ts` | Add proximity check method |
| `src/state/GameState.ts` | Add missionResult field |
| `src/core/Constants.ts` | Has OXYGEN/BATTERY drain rates |

---

## Completed Tasks

### Original Build (18/18)
- A1-A4: Foundation, Core
- A5-A8: Input System
- A9-A10: Physics
- A11-A12: State Management
- A13-A15: Welding/Scoring Systems
- A16-A17: Multiplayer/Metrics
- A18: App Orchestrator

### Fix Phase
- #3, #4, #5, #6, #7, #8: Rendering and input fixes
