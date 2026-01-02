# CODER-B TASK QUEUE - FIX PHASE

## Status: Fixing Dark Screen Issue

All original 15 tasks complete. Now fixing scene visibility and UI viewport display.

---

## GitHub Issues (Track progress at github.com)

### Phase 1: Get Visible (Priority)
- [ ] **#11** FIX-B3: Add seafloor plane
  - File: `src/environment/UnderwaterEnv.ts`
  - Add visible ground reference at y=-50
  - Label: `fix`, `coder-b`, `phase-1`

- [ ] **#13** FIX-B5: Boost lighting
  - File: `src/environment/UnderwaterEnv.ts`
  - Increase ambient from 0.4→0.8, sun from 0.3→0.6
  - Label: `fix`, `coder-b`, `phase-1`

### Phase 2: Controls Working
- [ ] **#12** FIX-B4: Add pipe structure
  - File: `src/environment/UnderwaterEnv.ts`
  - Add weld target pipe for testing
  - Label: `fix`, `coder-b`

- [ ] **#14** FIX-B6: Enhance submarine lights
  - File: `src/entities/Submarine.ts`
  - Make headlights more visible
  - Label: `fix`, `coder-b`

### Phase 3: Full UI
- [ ] **#9** FIX-B1: Create ViewportDisplay component
  - File: `src/ui/ViewportDisplay.ts` (NEW)
  - Component to render WebGLRenderTarget textures to UI canvases
  - Label: `fix`, `coder-b`

- [ ] **#10** FIX-B2: Wire viewport displays to UI
  - File: `src/ui/UIManager.ts`
  - Connect ViewportDisplay to viewport panels
  - Label: `fix`, `coder-b`

---

## Instructions

1. Work on Phase 1 issues first (#11, #13)
2. After each fix:
   - Test with `npm run dev`
   - Commit with message: `[FIX-B#] description`
   - Close issue with `gh issue close #`
   - Push to dev/coder-b
3. Verify seafloor visible before moving to Phase 2
4. Create PR when all fixes complete

---

## Commands

```bash
# View assigned issues
gh issue list --label coder-b

# Work on issue
git checkout dev/coder-b
# Make changes...
git commit -m "[FIX-B3] Add seafloor plane"
gh issue close 11
git push origin dev/coder-b

# Test
npm run dev
```

---

## Key Fixes Reference

### FIX-B3: Seafloor
```typescript
const floorGeometry = new THREE.PlaneGeometry(200, 200);
const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0x2a1a0a,
  roughness: 0.9
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -50;
this.scene.add(floor);
```

### FIX-B5: Lighting
```typescript
this.ambientLight = new THREE.AmbientLight(0x4488bb, 0.8);
this.sunLight = new THREE.DirectionalLight(0xaaccee, 0.6);
```

---

## Completed Tasks (Original Phase)

All B1-B15 tasks from original build are complete:
- B1-B2: Foundation + Environment
- B3-B5: Entities (Submarine, Arm, Torch)
- B6-B7: Cameras
- B8-B9: UI Foundation
- B10-B12: UI Components
- B13-B14: Missions/Scenarios
- B15: Effects
