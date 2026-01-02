# CODER-A TASK QUEUE - FIX PHASE

## Status: Fixing Dark Screen Issue

All original 18 tasks complete. Now fixing rendering bug.

---

## GitHub Issues (Track progress at github.com)

### Phase 1: Get Visible (Priority)
- [ ] **#3** FIX-A1: Add main canvas render pass
  - File: `src/cameras/CameraManager.ts`
  - Add final render to visible canvas after viewport textures
  - Label: `fix`, `coder-a`, `phase-1`

- [ ] **#4** FIX-A2: Add main camera selection
  - File: `src/cameras/CameraManager.ts`
  - Add `setMainCamera()` and `cycleMainCamera()` methods
  - Label: `fix`, `coder-a`, `phase-1`

- [ ] **#6** FIX-A4: Add debug logging
  - File: `src/App.ts`
  - Add frame counter and render confirmation
  - Label: `fix`, `coder-a`, `phase-1`

### Phase 2: Controls Working
- [ ] **#7** FIX-A5: Verify input integration
  - File: `src/App.ts`
  - Ensure input→submarine→physics loop works
  - Label: `fix`, `coder-a`

- [ ] **#8** FIX-A6: Fix welding activation
  - File: `src/App.ts`
  - Ensure Numpad 0 triggers torch activation
  - Label: `fix`, `coder-a`

### Phase 3: Full UI
- [ ] **#5** FIX-A3: Implement camera switching with Tab
  - File: `src/App.ts`
  - Wire Tab key to `cameraManager.cycleMainCamera()`
  - Label: `fix`, `coder-a`

---

## Instructions

1. Work on Phase 1 issues first (#3, #4, #6)
2. After each fix:
   - Test with `npm run dev`
   - Commit with message: `[FIX-A#] description`
   - Close issue with `gh issue close #`
   - Push to dev/coder-a
3. Verify submarine is visible before moving to Phase 2
4. Create PR when all fixes complete

---

## Commands

```bash
# View assigned issues
gh issue list --label coder-a

# Work on issue
git checkout dev/coder-a
# Make changes...
git commit -m "[FIX-A1] Add main canvas render pass"
gh issue close 3
git push origin dev/coder-a

# Test
npm run dev
```

---

## Root Cause Reference

The `CameraManager.render()` method only renders to WebGLRenderTargets (textures) but never renders to the visible canvas. After rendering 4 viewport textures, it sets render target back to `null` without actually rendering anything visible.

**FIX:** Add final render pass after viewport textures:
```typescript
this.renderer.setRenderTarget(null);
this.renderer.render(this.scene, mainCamera);
```
