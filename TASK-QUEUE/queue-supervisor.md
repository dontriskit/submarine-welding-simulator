# SUPERVISOR TASK QUEUE

## Active Sprint Tasks

### Initial Setup
- [ ] **S1**: Verify project structure after CODER-A/B complete Phase 1
  ```
  Check: package.json exists, npm install works, folders created
  Action: Review and prepare for MERGE-1
  ```

### Merge Point Reviews
- [ ] **M1**: Review and merge Phase 1 (Foundation)
  ```
  PRs: CODER-A (A1), CODER-B (B1)
  Test: npm install && npm run dev (should start without error)
  Order: Merge A first, then B
  ```

- [ ] **M2**: Review and merge Phase 2 (Core + Environment)
  ```
  PRs: CODER-A (A2-A4), CODER-B (B2)
  Test: Scene renders with underwater fog
  Order: Merge A first, then B
  ```

- [ ] **M3**: Review and merge Phase 3 (Input + Entities)
  ```
  PRs: CODER-A (A5-A8), CODER-B (B3-B5)
  Test: Submarine visible, input responds
  Order: Merge A first, then B
  ```

---

## Monitoring Tasks (Continuous)

- [ ] **MON-1**: Check TASK-QUEUE/blocked.log for blockers
  ```
  Command: tail -f TASK-QUEUE/blocked.log
  Action: Resolve or escalate blockers
  ```

- [ ] **MON-2**: Check TASK-QUEUE/human-request.log for questions
  ```
  Command: tail -f TASK-QUEUE/human-request.log
  Action: Answer or escalate to human operator
  ```

- [ ] **MON-3**: Monitor coder progress
  ```
  Command: Watch queue files for [x] completions
  Action: Prepare merge when phase complete
  ```

---

## Human Communication Tasks

- [ ] **H1**: Provide status update when requested
  ```
  Read: CORE-PLAN.md progress, queue files
  Format: Summary with % complete, blockers, next milestone
  ```

---

## Instructions

1. Monitor queue files and logs continuously
2. When both coders complete a phase, perform merge
3. Always merge CODER-A first, then CODER-B
4. Run integration tests after each merge
5. Notify coders to pull main after merge
6. Update CORE-PLAN.md merge checkboxes

---

## Merge Commands Quick Reference

```bash
# Pull latest
git checkout main && git pull origin main

# Merge CODER-A
git merge --no-ff origin/dev/coder-a -m "MERGE-X: [tasks] from CODER-A"
git push origin main

# Merge CODER-B (after A)
git merge --no-ff origin/dev/coder-b -m "MERGE-X: [tasks] from CODER-B"
git push origin main

# Notify coders
echo "MERGE-X complete. Pull main."
```

---

## Log Actions
<!-- Append actions here -->
