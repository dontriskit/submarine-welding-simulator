# CODER-B TASK QUEUE - FIRST SCENARIO

## Status: Creating Pipeline Welding Scenario

Previous phases complete. Now creating the first playable scenario.

---

## GitHub Issues (Track progress at github.com)

### Critical Path (Do First)
- [ ] **#28** B-SCENE-1: Create modular pipeline geometry
  - Files: `src/environment/UnderwaterEnv.ts` or new `src/environment/PipelineScene.ts`
  - Remove hardcoded pipe, create 6-section pipeline with joints
  - Label: `enhancement`

- [ ] **#29** B-SCENE-2: Add visual weld target markers
  - Files: NEW `src/entities/WeldTarget.ts`, `src/environment/UnderwaterEnv.ts`
  - Glowing rings at weld locations, pulse animation, red→green status
  - Label: `enhancement`

### Secondary (After Critical Path)
- [ ] **#30** B-SCENE-3: Add procedural textures
  - Files: NEW `src/materials/ProceduralMaterials.ts`, `src/environment/UnderwaterEnv.ts`
  - Shader materials: rusted metal, sandy seafloor, damaged welds
  - Label: `enhancement`

- [ ] **#31** B-SCENE-4: Create SinglePipelineScenario definition
  - Files: NEW `src/scenarios/SinglePipelineScenario.ts`, `src/scenarios/index.ts`
  - 6 weld targets, 10 min time limit, spawn position
  - Label: `enhancement`

- [ ] **#32** B-SCENE-5: Integrate scene with mission loader
  - Files: `src/App.ts`, `src/environment/UnderwaterEnv.ts`
  - Wire scene creation to mission data, completion events
  - Label: `enhancement`

---

## Instructions

1. Start with #28 (pipeline geometry) - makes something visible
2. Then #29 (weld targets) - shows where to weld
3. After each task:
   - Test with `npm run dev`
   - Commit with message: `[CODER-B] #XX: description`
   - Push to dev/coder-b
4. Wait for SUPERVISOR merge before next phase

---

## Commands

```bash
# View assigned issues
gh issue list --assignee ""

# Work on issue
git checkout dev/coder-b
git pull origin main
# Make changes...
npm run dev  # Test
npx tsc --noEmit  # Type check
git add -A && git commit -m "[CODER-B] #28: Create pipeline geometry"
git push origin dev/coder-b
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/environment/UnderwaterEnv.ts` | Scene setup - add pipeline here |
| `src/entities/WeldTarget.ts` | NEW - visual weld marker entity |
| `src/materials/ProceduralMaterials.ts` | NEW - shader materials |
| `src/scenarios/SinglePipelineScenario.ts` | NEW - mission definition |
| `src/scenarios/index.ts` | Register new scenario |

---

## Pipeline Design Reference

```
                    [Weld 1]    [Weld 2]    [Weld 3]    [Weld 4]    [Weld 5]    [Weld 6]
                        |           |           |           |           |           |
  ════════════════════════════════════════════════════════════════════════════════════
  |--- Section 1 ---|--- Section 2 ---|--- Section 3 ---|--- Section 4 ---|--- etc ---|

  Total length: ~20m
  Position: y=-16 (depth), z=10 (in front of spawn)
  Submarine spawns at x=-5, y=-15, z=5 (facing pipeline)
```

---

## Completed Tasks

### Original Build (15/15)
- B1-B2: Foundation, Environment
- B3-B5: Entities (Submarine, Arm, Torch)
- B6-B7: Camera System
- B8-B9: UI Foundation
- B10-B12: UI Components
- B13-B14: Missions/Scenarios
- B15: Effects

### Fix Phase
- #9, #10, #11, #12, #13, #14, #15: Viewports, pipe, lighting, hotkeys
